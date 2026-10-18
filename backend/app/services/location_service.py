from datetime import datetime, timedelta
import re
from app.models.base import db
from app.models.location import Location
from app.models.category import Category
from app.models.tag import Tag
from app.services.audit_service import audit_service
from app.services.tag_service import tag_service

class LocationService:
    def get_locations(
        self,
        category: str = None,
        subcategory: str = None,
        search_query: str = None,
        tags: list = None,
        area: str = None,
        status: str = "ACTIVE",
        verification_status: str = None,
        needs_verification: bool = False,
        pdf_only: bool = False,
        limit: int = 100,
        offset: int = 0,
    ):
        query = Location.query

        # Status filter
        if status and status != "ALL":
            if status == "ACTIVE":
                query = query.filter((Location.status == "ACTIVE") | (Location.status == "PUBLISHED"))
            else:
                query = query.filter_by(status=status)

        # Category filter
        if category and category != "ALL":
            query = query.filter_by(category_id=category)

        # Subcategory filter
        if subcategory and subcategory != "ALL":
            query = query.filter_by(subcategory=subcategory)

        # Area filter
        if area and area != "ALL":
            query = query.filter(Location.area.ilike(f"%{area.strip()}%"))

        # Verification filter
        if verification_status and verification_status != "ALL":
            query = query.filter_by(verification_status=verification_status)

        # Needs verification / Freshness filter (>180 days or unverified)
        if needs_verification:
            cutoff = datetime.utcnow() - timedelta(days=180)
            query = query.filter(
                (Location.verification_status != "VERIFIED")
                | (Location.last_verified_at == None)
                | (Location.last_verified_at < cutoff)
                | (Location.verification_status == "NEEDS_REVERIFICATION")
            )

        # PDF only legacy filter
        if pdf_only:
            query = query.filter_by(is_pdf_authoritative=True)

        # Tags filter
        if tags:
            tag_list = tags if isinstance(tags, list) else [t.strip() for t in str(tags).split(",") if t.strip()]
            for t_str in tag_list:
                tag_pat = f"%{t_str}%"
                query = query.filter(Location.tags_json.ilike(tag_pat))

        # Search query
        if search_query and search_query.strip():
            q = f"%{search_query.strip()}%"
            query = query.filter(
                (Location.name.ilike(q))
                | (Location.short_name.ilike(q))
                | (Location.kannada_name.ilike(q))
                | (Location.subcategory.ilike(q))
                | (Location.summary.ilike(q))
                | (Location.full_description.ilike(q))
                | (Location.address.ilike(q))
                | (Location.area.ilike(q))
                | (Location.landmark.ilike(q))
                | (Location.contact_phone.ilike(q))
                | (Location.contact_authority.ilike(q))
                | (Location.tags_json.ilike(q))
            )

        total = query.count()
        items = query.order_by(Location.name.asc()).offset(offset).limit(limit).all()
        return [item.to_dict() for item in items], total

    def get_location_by_id(self, location_id: str, allow_any_status: bool = False) -> Location:
        query = Location.query.filter_by(id=location_id)
        if not allow_any_status:
            query = query.filter((Location.status == "ACTIVE") | (Location.status == "PUBLISHED"))
        loc = query.first()
        if not loc:
            raise ValueError(f"Location with ID '{location_id}' not found.")
        return loc

    def get_map_markers(self, category: str = None, search_query: str = None):
        """Returns lightweight coordinates data for the public map."""
        locations, _ = self.get_locations(
            category=category,
            search_query=search_query,
            status="ACTIVE",
            limit=300,
        )
        return [
            {
                "id": loc["id"],
                "name": loc["name"],
                "shortName": loc.get("shortName") or loc["name"],
                "category": loc["category"],
                "subcategory": loc.get("subcategory", ""),
                "coordinates": [loc["coordinates"]["latitude"], loc["coordinates"]["longitude"]],
                "summary": loc["summary"],
                "area": loc.get("area", ""),
                "address": loc.get("address", ""),
                "elevationMeters": loc["coordinates"].get("elevationMeters"),
                "primaryPhotoUrl": loc.get("primaryPhotoUrl"),
                "status": loc.get("status"),
                "verification": loc.get("verification"),
            }
            for loc in locations
            if loc["coordinates"]["latitude"] is not None and loc["coordinates"]["longitude"] is not None
        ]

    def check_duplicate(self, name: str, category_id: str = None, area: str = None, exclude_id: str = None) -> list:
        """Finds existing places with similar name/category/area to alert the admin."""
        if not name or len(name.strip()) < 3:
            return []

        clean_name = name.strip()
        tokens = [t.lower() for t in re.findall(r"\w+", clean_name) if len(t) > 2]
        if not tokens:
            return []

        query = Location.query
        if exclude_id:
            query = query.filter(Location.id != exclude_id)

        candidates = query.all()
        duplicates = []

        for item in candidates:
            item_name_lower = item.name.lower()
            item_tokens = set(re.findall(r"\w+", item_name_lower))

            # Exact match or substring
            is_exact = clean_name.lower() == item_name_lower
            is_substr = clean_name.lower() in item_name_lower or item_name_lower in clean_name.lower()

            # Token overlap
            token_overlap = len(set(tokens).intersection(item_tokens))
            overlap_ratio = token_overlap / max(len(tokens), 1)

            if is_exact or is_substr or overlap_ratio >= 0.5:
                duplicates.append({
                    "id": item.id,
                    "code": item.code,
                    "name": item.name,
                    "category": item.category_id,
                    "subcategory": item.subcategory or "",
                    "area": item.area or "",
                    "address": item.address,
                    "status": item.status,
                    "isExactMatch": is_exact,
                    "similarity": 100 if is_exact else int(overlap_ratio * 100),
                })

        duplicates.sort(key=lambda x: x["similarity"], reverse=True)
        return duplicates[:5]

    def get_data_freshness_stats(self) -> dict:
        """Calculates freshness overview across all registered locations."""
        total = Location.query.count()
        cutoff = datetime.utcnow() - timedelta(days=180)

        verified = Location.query.filter(
            Location.verification_status == "VERIFIED",
            Location.last_verified_at != None,
            Location.last_verified_at >= cutoff
        ).count()

        stale = Location.query.filter(
            Location.verification_status == "VERIFIED",
            Location.last_verified_at != None,
            Location.last_verified_at < cutoff
        ).count()

        pending = Location.query.filter(
            (Location.verification_status == "PENDING")
            | (Location.verification_status == "NOT_VERIFIED")
            | (Location.verification_status == None)
        ).count()

        needs_reverification = Location.query.filter_by(verification_status="NEEDS_REVERIFICATION").count()

        freshness_pct = round((verified / total * 100), 1) if total > 0 else 0

        return {
            "totalRecords": total,
            "verifiedFresh": verified,
            "staleRecords": stale,
            "pendingVerification": pending,
            "needsReverification": needs_reverification,
            "totalNeedingAttention": stale + pending + needs_reverification,
            "freshnessPercent": freshness_pct,
        }

    def verify_location(
        self,
        location_id: str,
        verification_status: str,
        source: str,
        verified_by: str,
        notes: str = None,
        admin_email: str = "admin",
        ip: str = ""
    ) -> Location:
        location = Location.query.get(location_id)
        if not location:
            raise ValueError(f"Location with ID '{location_id}' not found.")

        old_values = location.to_dict()
        location.verification_status = verification_status or "VERIFIED"
        location.last_verified_at = datetime.utcnow()
        location.verified_by = verified_by or admin_email
        location.verification_source = source or "Official Verification"
        if notes:
            location.verification_notes = notes

        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="VERIFY",
            entity_type="Location",
            entity_id=location.id,
            old_values=old_values,
            new_values=location.to_dict(),
            ip_address=ip,
        )

        return location

    def create_location(self, data: dict, admin_email: str, ip: str = "") -> Location:
        name = data.get("name", "").strip()
        if not name:
            raise ValueError("Location name is required.")

        category_id = data.get("category") or data.get("category_id")
        if not category_id:
            raise ValueError("Category is required.")

        # Ensure category exists
        cat = Category.query.get(category_id)
        if not cat:
            # If not in DB, create category placeholder or check fallback
            cat = Category(
                id=category_id,
                name=category_id.replace("_", " ").title(),
                short_code=category_id[:4].upper(),
            )
            db.session.add(cat)
            db.session.commit()

        # Generate id and code if not supplied
        loc_id = data.get("id") or re.sub(r"[^a-zA-Z0-9]+", "-", name.lower()).strip("-")
        existing_id = Location.query.get(loc_id)
        if existing_id:
            loc_id = f"{loc_id}-{Location.query.count() + 1}"

        loc_code = data.get("code") or f"PVG-LOC-{Location.query.count() + 1:02d}"

        # Coordinates validation
        coords = data.get("coordinates") or {}
        lat = coords.get("latitude", data.get("latitude", 14.1025))
        lng = coords.get("longitude", data.get("longitude", 77.2798))

        try:
            lat = float(lat)
            lng = float(lng)
        except (ValueError, TypeError):
            lat = 14.1025
            lng = 77.2798

        contact = data.get("contact") or {}
        hours = data.get("hours") or {}
        category_data = data.get("categoryData") or data.get("category_data") or {}
        verification = data.get("verification") or {}

        # Status handling: support PUBLISHED, DRAFT, ACTIVE, TEMPORARILY_CLOSED, INACTIVE, ARCHIVED
        status = data.get("status", "ACTIVE")
        if status == "PUBLISHED":
            status = "ACTIVE"

        location = Location(
            id=loc_id,
            code=loc_code,
            name=name,
            short_name=data.get("shortName") or data.get("short_name") or name,
            kannada_name=data.get("kannadaName") or data.get("kannada_name") or "",
            category_id=category_id,
            subcategory=data.get("subcategory") or "",
            summary=data.get("summary", ""),
            full_description=data.get("fullDescription") or data.get("full_description", "") or data.get("summary", ""),
            address=data.get("address", "Pavagada Town, Karnataka 561202"),
            area=data.get("area") or "Pavagada Town",
            pincode=data.get("pincode") or "561202",
            landmark=data.get("landmark") or "",
            map_reference=data.get("mapReference") or "",
            latitude=lat,
            longitude=lng,
            elevation_meters=coords.get("elevationMeters", data.get("elevation_meters")),
            contact_authority=contact.get("authority", data.get("contact_authority", "")),
            contact_phone=contact.get("phone", data.get("contact_phone", "")),
            contact_website=contact.get("website", data.get("contact_website", "")),
            open_time=hours.get("open", data.get("open_time", "")),
            close_time=hours.get("close", data.get("close_time", "")),
            operating_days=hours.get("days", data.get("operating_days", "")),
            hours_notes=hours.get("notes", data.get("hours_notes", "")),
            verified_source=verification.get("source") or data.get("verifiedSource") or data.get("verified_source", ""),
            is_pdf_authoritative=bool(data.get("isPdfAuthoritative", data.get("is_pdf_authoritative", False))),
            primary_photo_url=data.get("primaryPhotoUrl") or data.get("primary_photo_url", ""),
            verification_status=verification.get("status") or data.get("verification_status", "PENDING"),
            verified_by=verification.get("verifiedBy") or admin_email,
            verification_source=verification.get("source") or "Direct Administrative Entry",
            verification_notes=verification.get("notes") or "",
            status=status,
        )

        if verification.get("status") == "VERIFIED":
            location.last_verified_at = datetime.utcnow()

        # Structured JSON columns
        location.contact_details = contact
        location.operating_hours = hours
        location.category_data = category_data
        location.key_attributes = data.get("keyAttributes", data.get("key_attributes", []))

        # Handle tags
        raw_tags = data.get("tags", [])
        tag_names = [t.strip() for t in raw_tags if isinstance(t, str) and t.strip()]
        location.tags = tag_names

        # Link to central Tag objects
        tag_objs = []
        for t_name in tag_names:
            try:
                t_obj = tag_service.find_or_create_tag(t_name)
                tag_objs.append(t_obj)
            except Exception:
                pass
        location.tag_objects = tag_objs

        db.session.add(location)
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="CREATE",
            entity_type="Location",
            entity_id=location.id,
            new_values=location.to_dict(),
            ip_address=ip,
        )

        return location

    def update_location(self, location_id: str, data: dict, admin_email: str, ip: str = "") -> Location:
        location = Location.query.get(location_id)
        if not location:
            raise ValueError(f"Location '{location_id}' not found.")

        old_values = location.to_dict()

        if "name" in data:
            location.name = data["name"].strip()
        if "shortName" in data or "short_name" in data:
            location.short_name = data.get("shortName", data.get("short_name"))
        if "kannadaName" in data or "kannada_name" in data:
            location.kannada_name = data.get("kannadaName", data.get("kannada_name"))
        if "category" in data or "category_id" in data:
            cat_id = data.get("category", data.get("category_id"))
            if cat_id:
                location.category_id = cat_id
        if "subcategory" in data:
            location.subcategory = data["subcategory"]
        if "summary" in data:
            location.summary = data["summary"]
        if "fullDescription" in data or "full_description" in data:
            location.full_description = data.get("fullDescription", data.get("full_description"))
        if "address" in data:
            location.address = data["address"]
        if "area" in data:
            location.area = data["area"]
        if "pincode" in data:
            location.pincode = data["pincode"]
        if "landmark" in data:
            location.landmark = data["landmark"]
        if "mapReference" in data:
            location.map_reference = data["mapReference"]

        # Coordinates
        if "coordinates" in data:
            coords = data["coordinates"]
            if "latitude" in coords:
                location.latitude = float(coords["latitude"])
            if "longitude" in coords:
                location.longitude = float(coords["longitude"])
            if "elevationMeters" in coords:
                location.elevation_meters = coords["elevationMeters"]
        else:
            if "latitude" in data and data["latitude"] is not None:
                location.latitude = float(data["latitude"])
            if "longitude" in data and data["longitude"] is not None:
                location.longitude = float(data["longitude"])
            if "elevation_meters" in data:
                location.elevation_meters = data["elevation_meters"]

        # Contact
        if "contact" in data:
            c = data["contact"]
            location.contact_authority = c.get("authority", location.contact_authority)
            location.contact_phone = c.get("phone", location.contact_phone)
            location.contact_website = c.get("website", location.contact_website)
            location.contact_details = c

        # Hours
        if "hours" in data:
            h = data["hours"]
            location.open_time = h.get("open", location.open_time)
            location.close_time = h.get("close", location.close_time)
            location.operating_days = h.get("days", location.operating_days)
            location.hours_notes = h.get("notes", location.hours_notes)
            location.operating_hours = h

        # Category Data
        if "categoryData" in data or "category_data" in data:
            location.category_data = data.get("categoryData", data.get("category_data"))

        # Verification
        if "verification" in data:
            v = data["verification"]
            if "status" in v:
                location.verification_status = v["status"]
                if v["status"] == "VERIFIED":
                    location.last_verified_at = datetime.utcnow()
            if "source" in v:
                location.verification_source = v["source"]
            if "verifiedBy" in v:
                location.verified_by = v["verifiedBy"]
            if "notes" in v:
                location.verification_notes = v["notes"]

        # Tags
        if "tags" in data:
            raw_tags = data["tags"]
            tag_names = [t.strip() for t in raw_tags if isinstance(t, str) and t.strip()]
            location.tags = tag_names

            tag_objs = []
            for t_name in tag_names:
                try:
                    t_obj = tag_service.find_or_create_tag(t_name)
                    tag_objs.append(t_obj)
                except Exception:
                    pass
            location.tag_objects = tag_objs

        if "keyAttributes" in data or "key_attributes" in data:
            location.key_attributes = data.get("keyAttributes", data.get("key_attributes"))
        if "verifiedSource" in data or "verified_source" in data:
            location.verified_source = data.get("verifiedSource", data.get("verified_source"))
        if "isPdfAuthoritative" in data or "is_pdf_authoritative" in data:
            location.is_pdf_authoritative = bool(data.get("isPdfAuthoritative", data.get("is_pdf_authoritative")))
        if "primaryPhotoUrl" in data or "primary_photo_url" in data:
            location.primary_photo_url = data.get("primaryPhotoUrl", data.get("primary_photo_url"))
        if "status" in data:
            st = data["status"]
            if st == "PUBLISHED":
                st = "ACTIVE"
            location.status = st

        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="UPDATE",
            entity_type="Location",
            entity_id=location.id,
            old_values=old_values,
            new_values=location.to_dict(),
            ip_address=ip,
        )

        return location

    def set_status(self, location_id: str, new_status: str, admin_email: str, ip: str = "") -> Location:
        location = Location.query.get(location_id)
        if not location:
            raise ValueError(f"Location '{location_id}' not found.")

        old_status = location.status
        st = new_status
        if st == "PUBLISHED":
            st = "ACTIVE"
        location.status = st
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="STATUS_CHANGE",
            entity_type="Location",
            entity_id=location.id,
            old_values={"status": old_status},
            new_values={"status": st},
            ip_address=ip,
        )
        return location

    def duplicate_location(self, location_id: str, admin_email: str, ip: str = "") -> Location:
        """Duplicates an existing location as a DRAFT for rapid data entry."""
        original = Location.query.get(location_id)
        if not original:
            raise ValueError(f"Source location '{location_id}' not found.")

        data = original.to_dict()
        data["name"] = f"{original.name} (Copy)"
        data["shortName"] = f"{original.short_name or original.name} (Copy)"
        data["status"] = "DRAFT"
        data.pop("id", None)
        data.pop("code", None)
        if "verification" in data:
            data["verification"]["status"] = "PENDING"
            data["verification"]["lastVerifiedAt"] = None

        return self.create_location(data, admin_email=admin_email, ip=ip)

location_service = LocationService()

import re
from app.models.base import db
from app.models.location import Location
from app.models.category import Category
from app.services.audit_service import audit_service

class LocationService:
    def get_locations(
        self,
        category: str = None,
        search_query: str = None,
        status: str = "ACTIVE",
        pdf_only: bool = False,
        limit: int = 100,
        offset: int = 0,
    ):
        query = Location.query

        if status and status != "ALL":
            query = query.filter_by(status=status)

        if category and category != "ALL":
            query = query.filter_by(category_id=category)

        if pdf_only:
            query = query.filter_by(is_pdf_authoritative=True)

        if search_query and search_query.strip():
            q = f"%{search_query.strip()}%"
            query = query.filter(
                (Location.name.ilike(q))
                | (Location.kannada_name.ilike(q))
                | (Location.summary.ilike(q))
                | (Location.address.ilike(q))
                | (Location.tags_json.ilike(q))
            )

        total = query.count()
        items = query.order_by(Location.code.asc()).offset(offset).limit(limit).all()
        return [item.to_dict() for item in items], total

    def get_location_by_id(self, location_id: str, allow_any_status: bool = False) -> Location:
        query = Location.query.filter_by(id=location_id)
        if not allow_any_status:
            query = query.filter_by(status="ACTIVE")
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
            limit=200,
        )
        return [
            {
                "id": loc["id"],
                "name": loc["name"],
                "category": loc["category"],
                "coordinates": [loc["coordinates"]["latitude"], loc["coordinates"]["longitude"]],
                "summary": loc["summary"],
                "elevationMeters": loc["coordinates"].get("elevationMeters"),
                "primaryPhotoUrl": loc.get("primaryPhotoUrl"),
            }
            for loc in locations
            if loc["coordinates"]["latitude"] is not None and loc["coordinates"]["longitude"] is not None
        ]

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
            raise ValueError(f"Category '{category_id}' does not exist.")

        # Generate id and code if not supplied
        loc_id = data.get("id") or re.sub(r"[^a-zA-Z0-9]+", "-", name.lower()).strip("-")
        existing_id = Location.query.get(loc_id)
        if existing_id:
            loc_id = f"{loc_id}-{Location.query.count() + 1}"

        loc_code = data.get("code") or f"PVG-LOC-{Location.query.count() + 1:02d}"

        # Coordinates validation
        coords = data.get("coordinates") or {}
        lat = coords.get("latitude", data.get("latitude"))
        lng = coords.get("longitude", data.get("longitude"))
        if lat is None or lng is None:
            raise ValueError("Latitude and Longitude are required coordinates.")

        try:
            lat = float(lat)
            lng = float(lng)
        except (ValueError, TypeError):
            raise ValueError("Latitude and Longitude must be valid numbers.")

        hist = data.get("historicalContext") or {}
        contact = data.get("contact") or {}
        hours = data.get("hours") or {}

        location = Location(
            id=loc_id,
            code=loc_code,
            name=name,
            kannada_name=data.get("kannadaName") or data.get("kannada_name"),
            category_id=category_id,
            summary=data.get("summary", ""),
            full_description=data.get("fullDescription") or data.get("full_description", ""),
            address=data.get("address", "Pavagada, Karnataka"),
            latitude=lat,
            longitude=lng,
            elevation_meters=coords.get("elevationMeters", data.get("elevation_meters")),
            era=hist.get("era", data.get("era")),
            built_year_or_century=hist.get("builtYearOrCentury", data.get("built_year_or_century")),
            patron_ruler=hist.get("patronRuler", data.get("patron_ruler")),
            architectural_style=hist.get("architecturalStyle", data.get("architectural_style")),
            pdf_source_doc=hist.get("pdfSourceDoc", data.get("pdf_source_doc")),
            conservation_priority=hist.get("conservationPriority", data.get("conservation_priority")),
            contact_authority=contact.get("authority", data.get("contact_authority")),
            contact_phone=contact.get("phone", data.get("contact_phone")),
            contact_website=contact.get("website", data.get("contact_website")),
            open_time=hours.get("open", data.get("open_time")),
            close_time=hours.get("close", data.get("close_time")),
            operating_days=hours.get("days", data.get("operating_days")),
            hours_notes=hours.get("notes", data.get("hours_notes")),
            verified_source=data.get("verifiedSource") or data.get("verified_source"),
            is_pdf_authoritative=bool(data.get("isPdfAuthoritative", data.get("is_pdf_authoritative", False))),
            primary_photo_url=data.get("primaryPhotoUrl") or data.get("primary_photo_url"),
            status=data.get("status", "ACTIVE"),
        )

        location.tags = data.get("tags", [])
        location.key_attributes = data.get("keyAttributes", data.get("key_attributes", []))

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
        if "kannadaName" in data or "kannada_name" in data:
            location.kannada_name = data.get("kannadaName", data.get("kannada_name"))
        if "category" in data or "category_id" in data:
            cat_id = data.get("category", data.get("category_id"))
            if cat_id:
                location.category_id = cat_id
        if "summary" in data:
            location.summary = data["summary"]
        if "fullDescription" in data or "full_description" in data:
            location.full_description = data.get("fullDescription", data.get("full_description"))
        if "address" in data:
            location.address = data["address"]

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

        # Historical context
        if "historicalContext" in data:
            hc = data["historicalContext"]
            location.era = hc.get("era", location.era)
            location.built_year_or_century = hc.get("builtYearOrCentury", location.built_year_or_century)
            location.patron_ruler = hc.get("patronRuler", location.patron_ruler)
            location.architectural_style = hc.get("architecturalStyle", location.architectural_style)
            location.pdf_source_doc = hc.get("pdfSourceDoc", location.pdf_source_doc)
            location.conservation_priority = hc.get("conservationPriority", location.conservation_priority)

        # Contact
        if "contact" in data:
            c = data["contact"]
            location.contact_authority = c.get("authority", location.contact_authority)
            location.contact_phone = c.get("phone", location.contact_phone)
            location.contact_website = c.get("website", location.contact_website)

        # Hours
        if "hours" in data:
            h = data["hours"]
            location.open_time = h.get("open", location.open_time)
            location.close_time = h.get("close", location.close_time)
            location.operating_days = h.get("days", location.operating_days)
            location.hours_notes = h.get("notes", location.hours_notes)

        if "tags" in data:
            location.tags = data["tags"]
        if "keyAttributes" in data or "key_attributes" in data:
            location.key_attributes = data.get("keyAttributes", data.get("key_attributes"))
        if "verifiedSource" in data or "verified_source" in data:
            location.verified_source = data.get("verifiedSource", data.get("verified_source"))
        if "isPdfAuthoritative" in data or "is_pdf_authoritative" in data:
            location.is_pdf_authoritative = bool(data.get("isPdfAuthoritative", data.get("is_pdf_authoritative")))
        if "primaryPhotoUrl" in data or "primary_photo_url" in data:
            location.primary_photo_url = data.get("primaryPhotoUrl", data.get("primary_photo_url"))
        if "status" in data:
            location.status = data["status"]

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
        location.status = new_status
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="STATUS_CHANGE",
            entity_type="Location",
            entity_id=location.id,
            old_values={"status": old_status},
            new_values={"status": new_status},
            ip_address=ip,
        )
        return location

location_service = LocationService()

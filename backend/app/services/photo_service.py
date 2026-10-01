from app.models.base import db
from app.models.photo import Photo
from app.models.location import Location
from app.models.hospital import Hospital
from app.models.bus_route import BusRoute
from app.models.theatre import Theatre
from app.models.education import EducationalInstitution
from app.models.historical_place import HistoricalPlace
from app.services.s3_service import s3_service
from app.services.audit_service import audit_service

RECOMMENDED_PHOTO_TYPES = {
    "location": ["Main Photo", "Entrance / Gate", "Interior / Details", "Surrounding Area / Panorama"],
    "hospital": ["Exterior & Entrance", "Emergency & Casualty Desk", "Inpatient Ward / Facility"],
    "theatre": ["Building Exterior", "Screen / Auditorium", "Ticket Counter"],
    "school": ["Campus Gate & Building", "Classroom / Laboratory", "Playground / Assembly"],
    "college": ["Main College Building", "Library / Lab Facility", "Campus View"],
    "historical_place": ["Panoramic Angle", "Detail Masonry / Carving", "Inscribed Tablet / Gateway"],
    "bus_route": ["Main Bus Stand Entrance", "Bus Platform & Bay", "Station Signboard"],
}

class PhotoService:
    def get_photos_for_entity(self, entity_type: str, entity_id: str):
        photos = (
            Photo.query.filter_by(entity_type=entity_type, entity_id=str(entity_id), status="ACTIVE")
            .order_by(Photo.is_primary.desc(), Photo.display_order.asc(), Photo.created_at.desc())
            .all()
        )
        return [p.to_dict() for p in photos]

    def upload_photo(
        self,
        file_storage,
        entity_type: str,
        entity_id: str,
        photo_type: str = "Main Photo",
        caption: str = "",
        alt_text: str = "",
        is_primary: bool = False,
        admin_email: str = "",
        ip: str = "",
    ) -> Photo:
        # Upload via S3Service (with fallback)
        res = s3_service.upload_file(file_storage, folder=entity_type)

        # If designated as primary, unset other primaries for this entity
        if is_primary:
            Photo.query.filter_by(entity_type=entity_type, entity_id=str(entity_id)).update({"is_primary": False})

        # Calculate display order
        max_order = (
            db.session.query(db.func.max(Photo.display_order))
            .filter_by(entity_type=entity_type, entity_id=str(entity_id))
            .scalar()
            or 0
        )

        photo = Photo(
            entity_type=entity_type,
            entity_id=str(entity_id),
            s3_key=res["s3_key"],
            url=res["url"],
            alt_text=alt_text or f"{entity_type} {entity_id} {photo_type}",
            caption=caption,
            photo_type=photo_type,
            display_order=max_order + 1,
            is_primary=is_primary,
            file_size_bytes=res["file_size"],
            mime_type=res["mime_type"],
            status="ACTIVE",
        )
        db.session.add(photo)
        db.session.commit()

        # Also update primary_photo_url on parent entity if marked primary
        if is_primary:
            self._update_parent_primary_url(entity_type, entity_id, res["url"])

        audit_service.log_action(
            admin_email=admin_email,
            action="UPLOAD_PHOTO",
            entity_type="Photo",
            entity_id=str(photo.id),
            new_values=photo.to_dict(),
            ip_address=ip,
        )

        return photo

    def set_primary(self, photo_id: int, admin_email: str, ip: str = "") -> Photo:
        photo = Photo.query.get(photo_id)
        if not photo:
            raise ValueError(f"Photo '{photo_id}' not found.")

        # Reset other primaries
        Photo.query.filter_by(entity_type=photo.entity_type, entity_id=photo.entity_id).update({"is_primary": False})
        photo.is_primary = True
        db.session.commit()

        self._update_parent_primary_url(photo.entity_type, photo.entity_id, photo.url)

        audit_service.log_action(
            admin_email=admin_email,
            action="SET_PRIMARY_PHOTO",
            entity_type="Photo",
            entity_id=str(photo.id),
            new_values=photo.to_dict(),
            ip_address=ip,
        )
        return photo

    def update_photo(self, photo_id: int, data: dict, admin_email: str, ip: str = "") -> Photo:
        photo = Photo.query.get(photo_id)
        if not photo:
            raise ValueError(f"Photo '{photo_id}' not found.")

        old_val = photo.to_dict()
        if "caption" in data:
            photo.caption = data["caption"]
        if "altText" in data or "alt_text" in data:
            photo.alt_text = data.get("altText", data.get("alt_text"))
        if "photoType" in data or "photo_type" in data:
            photo.photo_type = data.get("photoType", data.get("photo_type"))
        if "displayOrder" in data or "display_order" in data:
            photo.display_order = int(data.get("displayOrder", data.get("display_order", 0)))

        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="UPDATE_PHOTO",
            entity_type="Photo",
            entity_id=str(photo.id),
            old_values=old_val,
            new_values=photo.to_dict(),
            ip_address=ip,
        )
        return photo

    def delete_photo(self, photo_id: int, admin_email: str, ip: str = "") -> bool:
        photo = Photo.query.get(photo_id)
        if not photo:
            raise ValueError(f"Photo '{photo_id}' not found.")

        old_val = photo.to_dict()
        s3_service.delete_file(photo.s3_key)
        db.session.delete(photo)
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="DELETE_PHOTO",
            entity_type="Photo",
            entity_id=str(photo_id),
            old_values=old_val,
            ip_address=ip,
        )
        return True

    def get_missing_photo_requests(self) -> list:
        """
        Photo Request Workflow:
        Audits all main entities and generates a structured list of missing recommended photos
        so the project owner can supply authentic local photographs.
        """
        items = []

        # 1. Locations
        locations = Location.query.filter_by(status="ACTIVE").all()
        for loc in locations:
            uploaded = Photo.query.filter_by(entity_type="location", entity_id=loc.id, status="ACTIVE").all()
            uploaded_types = [p.photo_type for p in uploaded]
            has_primary = any(p.is_primary for p in uploaded) or bool(loc.primary_photo_url)
            rec_types = RECOMMENDED_PHOTO_TYPES["location"]
            missing = [t for t in rec_types if t not in uploaded_types]

            items.append({
                "entityType": "location",
                "entityId": loc.id,
                "entityName": loc.name,
                "category": loc.category_id,
                "hasPrimary": has_primary,
                "uploadedCount": len(uploaded),
                "uploadedTypes": uploaded_types,
                "missingRecommended": missing,
                "isComplete": len(missing) == 0 and has_primary,
            })

        # 2. Hospitals
        hospitals = Hospital.query.filter_by(status="ACTIVE").all()
        for hosp in hospitals:
            uploaded = Photo.query.filter_by(entity_type="hospital", entity_id=hosp.id, status="ACTIVE").all()
            uploaded_types = [p.photo_type for p in uploaded]
            has_primary = any(p.is_primary for p in uploaded) or bool(hosp.primary_photo_url)
            rec_types = RECOMMENDED_PHOTO_TYPES["hospital"]
            missing = [t for t in rec_types if t not in uploaded_types]

            items.append({
                "entityType": "hospital",
                "entityId": hosp.id,
                "entityName": hosp.name,
                "category": "HEALTHCARE",
                "hasPrimary": has_primary,
                "uploadedCount": len(uploaded),
                "uploadedTypes": uploaded_types,
                "missingRecommended": missing,
                "isComplete": len(missing) == 0 and has_primary,
            })

        # 3. Theatres
        theatres = Theatre.query.filter_by(status="ACTIVE").all()
        for th in theatres:
            uploaded = Photo.query.filter_by(entity_type="theatre", entity_id=th.id, status="ACTIVE").all()
            uploaded_types = [p.photo_type for p in uploaded]
            has_primary = any(p.is_primary for p in uploaded) or bool(th.primary_photo_url)
            rec_types = RECOMMENDED_PHOTO_TYPES["theatre"]
            missing = [t for t in rec_types if t not in uploaded_types]

            items.append({
                "entityType": "theatre",
                "entityId": th.id,
                "entityName": th.name,
                "category": "ENTERTAINMENT",
                "hasPrimary": has_primary,
                "uploadedCount": len(uploaded),
                "uploadedTypes": uploaded_types,
                "missingRecommended": missing,
                "isComplete": len(missing) == 0 and has_primary,
            })

        return items

    def _update_parent_primary_url(self, entity_type: str, entity_id: str, url: str):
        try:
            if entity_type == "location":
                loc = Location.query.get(entity_id)
                if loc:
                    loc.primary_photo_url = url
            elif entity_type == "hospital":
                hosp = Hospital.query.get(entity_id)
                if hosp:
                    hosp.primary_photo_url = url
            elif entity_type == "theatre":
                th = Theatre.query.get(entity_id)
                if th:
                    th.primary_photo_url = url
            elif entity_type in ("school", "college"):
                edu = EducationalInstitution.query.get(entity_id)
                if edu:
                    edu.primary_photo_url = url
            elif entity_type == "historical_place":
                hp = HistoricalPlace.query.get(entity_id)
                if hp:
                    hp.primary_photo_url = url
            db.session.commit()
        except Exception:
            pass

photo_service = PhotoService()

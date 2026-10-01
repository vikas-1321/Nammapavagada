import re
from app.models.base import db
from app.models.education import EducationalInstitution
from app.services.audit_service import audit_service

class EducationService:
    def get_institutions(self, inst_type: str = None, status: str = "ACTIVE", search_query: str = None):
        query = EducationalInstitution.query
        if status and status != "ALL":
            query = query.filter_by(status=status)
        if inst_type and inst_type != "ALL":
            query = query.filter_by(institution_type=inst_type)
        if search_query and search_query.strip():
            q = f"%{search_query.strip()}%"
            query = query.filter(
                (EducationalInstitution.name.ilike(q))
                | (EducationalInstitution.address.ilike(q))
                | (EducationalInstitution.courses_json.ilike(q))
            )
        institutions = query.order_by(EducationalInstitution.name.asc()).all()
        return [inst.to_dict() for inst in institutions]

    def get_institution_by_id(self, inst_id: str) -> EducationalInstitution:
        inst = EducationalInstitution.query.get(inst_id)
        if not inst:
            raise ValueError(f"Institution '{inst_id}' not found.")
        return inst

    def create_institution(self, data: dict, admin_email: str, ip: str = "") -> EducationalInstitution:
        name = data.get("name", "").strip()
        if not name:
            raise ValueError("Institution name is required.")

        inst_id = data.get("id") or f"edu-{re.sub(r'[^a-zA-Z0-9]+', '-', name.lower()).strip('-')}"
        if EducationalInstitution.query.get(inst_id):
            inst_id = f"{inst_id}-{EducationalInstitution.query.count() + 1}"

        institution = EducationalInstitution(
            id=inst_id,
            name=name,
            kannada_name=data.get("kannadaName") or data.get("kannada_name"),
            institution_type=data.get("institutionType") or data.get("institution_type", "COLLEGE"),
            description=data.get("description"),
            address=data.get("address", "Pavagada, Karnataka"),
            latitude=float(data["latitude"]) if data.get("latitude") is not None else None,
            longitude=float(data["longitude"]) if data.get("longitude") is not None else None,
            phone=data.get("phone"),
            website=data.get("website"),
            opening_hours=data.get("openingHours") or data.get("opening_hours"),
            affiliation=data.get("affiliation"),
            primary_photo_url=data.get("primaryPhotoUrl") or data.get("primary_photo_url"),
            status=data.get("status", "ACTIVE"),
        )
        institution.courses = data.get("courses", [])
        institution.facilities = data.get("facilities", [])

        db.session.add(institution)
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="CREATE",
            entity_type="EducationalInstitution",
            entity_id=institution.id,
            new_values=institution.to_dict(),
            ip_address=ip,
        )
        return institution

    def update_institution(self, inst_id: str, data: dict, admin_email: str, ip: str = "") -> EducationalInstitution:
        inst = self.get_institution_by_id(inst_id)
        old_val = inst.to_dict()

        if "name" in data:
            inst.name = data["name"].strip()
        if "kannadaName" in data or "kannada_name" in data:
            inst.kannada_name = data.get("kannadaName", data.get("kannada_name"))
        if "institutionType" in data or "institution_type" in data:
            inst.institution_type = data.get("institutionType", data.get("institution_type"))
        if "description" in data:
            inst.description = data["description"]
        if "address" in data:
            inst.address = data["address"]
        if "latitude" in data and data["latitude"] is not None:
            inst.latitude = float(data["latitude"])
        if "longitude" in data and data["longitude"] is not None:
            inst.longitude = float(data["longitude"])
        if "phone" in data:
            inst.phone = data["phone"]
        if "website" in data:
            inst.website = data["website"]
        if "courses" in data:
            inst.courses = data["courses"]
        if "facilities" in data:
            inst.facilities = data["facilities"]
        if "openingHours" in data or "opening_hours" in data:
            inst.opening_hours = data.get("openingHours", data.get("opening_hours"))
        if "affiliation" in data:
            inst.affiliation = data["affiliation"]
        if "primaryPhotoUrl" in data or "primary_photo_url" in data:
            inst.primary_photo_url = data.get("primaryPhotoUrl", data.get("primary_photo_url"))
        if "status" in data:
            inst.status = data["status"]

        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="UPDATE",
            entity_type="EducationalInstitution",
            entity_id=inst.id,
            old_values=old_val,
            new_values=inst.to_dict(),
            ip_address=ip,
        )
        return inst

education_service = EducationService()

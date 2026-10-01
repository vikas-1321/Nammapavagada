import re
from app.models.base import db
from app.models.hospital import Hospital
from app.services.audit_service import audit_service

class HospitalService:
    def get_hospitals(self, status: str = "ACTIVE", search_query: str = None):
        query = Hospital.query
        if status and status != "ALL":
            query = query.filter_by(status=status)
        if search_query and search_query.strip():
            q = f"%{search_query.strip()}%"
            query = query.filter(
                (Hospital.name.ilike(q))
                | (Hospital.address.ilike(q))
                | (Hospital.services_json.ilike(q))
            )
        hospitals = query.order_by(Hospital.name.asc()).all()
        return [h.to_dict() for h in hospitals]

    def get_hospital_by_id(self, hospital_id: str) -> Hospital:
        h = Hospital.query.get(hospital_id)
        if not h:
            raise ValueError(f"Hospital '{hospital_id}' not found.")
        return h

    def create_hospital(self, data: dict, admin_email: str, ip: str = "") -> Hospital:
        name = data.get("name", "").strip()
        if not name:
            raise ValueError("Hospital name is required.")

        h_id = data.get("id") or f"hosp-{re.sub(r'[^a-zA-Z0-9]+', '-', name.lower()).strip('-')}"
        if Hospital.query.get(h_id):
            h_id = f"{h_id}-{Hospital.query.count() + 1}"

        hospital = Hospital(
            id=h_id,
            name=name,
            kannada_name=data.get("kannadaName") or data.get("kannada_name"),
            description=data.get("description"),
            address=data.get("address", "Pavagada, Karnataka"),
            latitude=float(data["latitude"]) if data.get("latitude") is not None else None,
            longitude=float(data["longitude"]) if data.get("longitude") is not None else None,
            phone=data.get("phone"),
            emergency_phone=data.get("emergencyPhone") or data.get("emergency_phone"),
            opening_hours=data.get("openingHours") or data.get("opening_hours", "24/7 Casualty & Inpatient"),
            website=data.get("website"),
            primary_photo_url=data.get("primaryPhotoUrl") or data.get("primary_photo_url"),
            status=data.get("status", "ACTIVE"),
        )
        hospital.services = data.get("services", [])
        hospital.departments = data.get("departments", [])

        db.session.add(hospital)
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="CREATE",
            entity_type="Hospital",
            entity_id=hospital.id,
            new_values=hospital.to_dict(),
            ip_address=ip,
        )
        return hospital

    def update_hospital(self, hospital_id: str, data: dict, admin_email: str, ip: str = "") -> Hospital:
        hospital = self.get_hospital_by_id(hospital_id)
        old_val = hospital.to_dict()

        if "name" in data:
            hospital.name = data["name"].strip()
        if "kannadaName" in data or "kannada_name" in data:
            hospital.kannada_name = data.get("kannadaName", data.get("kannada_name"))
        if "description" in data:
            hospital.description = data["description"]
        if "address" in data:
            hospital.address = data["address"]
        if "latitude" in data and data["latitude"] is not None:
            hospital.latitude = float(data["latitude"])
        if "longitude" in data and data["longitude"] is not None:
            hospital.longitude = float(data["longitude"])
        if "phone" in data:
            hospital.phone = data["phone"]
        if "emergencyPhone" in data or "emergency_phone" in data:
            hospital.emergency_phone = data.get("emergencyPhone", data.get("emergency_phone"))
        if "openingHours" in data or "opening_hours" in data:
            hospital.opening_hours = data.get("openingHours", data.get("opening_hours"))
        if "services" in data:
            hospital.services = data["services"]
        if "departments" in data:
            hospital.departments = data["departments"]
        if "website" in data:
            hospital.website = data["website"]
        if "primaryPhotoUrl" in data or "primary_photo_url" in data:
            hospital.primary_photo_url = data.get("primaryPhotoUrl", data.get("primary_photo_url"))
        if "status" in data:
            hospital.status = data["status"]

        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="UPDATE",
            entity_type="Hospital",
            entity_id=hospital.id,
            old_values=old_val,
            new_values=hospital.to_dict(),
            ip_address=ip,
        )
        return hospital

hospital_service = HospitalService()

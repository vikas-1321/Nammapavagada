import json
from app.models.base import db, TimestampMixin

class Hospital(db.Model, TimestampMixin):
    __tablename__ = "hospitals"

    id = db.Column(db.String(80), primary_key=True) # e.g. hosp-pvg-taluk-gen
    name = db.Column(db.String(200), nullable=False, index=True)
    kannada_name = db.Column(db.String(250), nullable=True)
    description = db.Column(db.Text, nullable=True)
    address = db.Column(db.Text, nullable=False)

    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    phone = db.Column(db.String(50), nullable=True)
    emergency_phone = db.Column(db.String(50), nullable=True)
    opening_hours = db.Column(db.String(100), default="24/7 Casualty & Inpatient Desk")
    services_json = db.Column(db.Text, default="[]", nullable=False)
    departments_json = db.Column(db.Text, default="[]", nullable=False)
    website = db.Column(db.String(250), nullable=True)
    primary_photo_url = db.Column(db.String(500), nullable=True)

    @property
    def services(self):
        try:
            return json.loads(self.services_json) if self.services_json else []
        except Exception:
            return []

    @services.setter
    def services(self, val):
        self.services_json = json.dumps(val if isinstance(val, list) else [])

    @property
    def departments(self):
        try:
            return json.loads(self.departments_json) if self.departments_json else []
        except Exception:
            return []

    @departments.setter
    def departments(self, val):
        self.departments_json = json.dumps(val if isinstance(val, list) else [])

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "kannadaName": self.kannada_name or "",
            "description": self.description or "",
            "address": self.address,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "phone": self.phone or "",
            "emergencyPhone": self.emergency_phone or "",
            "openingHours": self.opening_hours or "",
            "services": self.services,
            "departments": self.departments,
            "website": self.website or "",
            "primaryPhotoUrl": self.primary_photo_url or "",
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

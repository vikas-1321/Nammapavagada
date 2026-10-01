import json
from app.models.base import db, TimestampMixin

class EducationalInstitution(db.Model, TimestampMixin):
    __tablename__ = "educational_institutions"

    id = db.Column(db.String(80), primary_key=True) # e.g. inst-govt-first-grade-college
    name = db.Column(db.String(200), nullable=False, index=True)
    kannada_name = db.Column(db.String(250), nullable=True)
    institution_type = db.Column(db.String(50), nullable=False, default="COLLEGE") # SCHOOL, COLLEGE, POLYTECHNIC, PU_COLLEGE
    description = db.Column(db.Text, nullable=True)
    address = db.Column(db.Text, nullable=False)

    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    phone = db.Column(db.String(50), nullable=True)
    website = db.Column(db.String(250), nullable=True)
    courses_json = db.Column(db.Text, default="[]", nullable=False)
    facilities_json = db.Column(db.Text, default="[]", nullable=False)
    opening_hours = db.Column(db.String(100), default="09:30 AM – 04:30 PM (Mon–Sat)")
    affiliation = db.Column(db.String(150), nullable=True)
    primary_photo_url = db.Column(db.String(500), nullable=True)

    @property
    def courses(self):
        try:
            return json.loads(self.courses_json) if self.courses_json else []
        except Exception:
            return []

    @courses.setter
    def courses(self, val):
        self.courses_json = json.dumps(val if isinstance(val, list) else [])

    @property
    def facilities(self):
        try:
            return json.loads(self.facilities_json) if self.facilities_json else []
        except Exception:
            return []

    @facilities.setter
    def facilities(self, val):
        self.facilities_json = json.dumps(val if isinstance(val, list) else [])

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "kannadaName": self.kannada_name or "",
            "institutionType": self.institution_type,
            "description": self.description or "",
            "address": self.address,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "phone": self.phone or "",
            "website": self.website or "",
            "courses": self.courses,
            "facilities": self.facilities,
            "openingHours": self.opening_hours or "",
            "affiliation": self.affiliation or "",
            "primaryPhotoUrl": self.primary_photo_url or "",
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

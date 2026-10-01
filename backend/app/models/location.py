from app.models.base import db, TimestampMixin
import json

class Location(db.Model, TimestampMixin):
    __tablename__ = "locations"

    id = db.Column(db.String(80), primary_key=True) # e.g. pavagada-fort-apex
    code = db.Column(db.String(30), unique=True, nullable=False, index=True) # e.g. PVG-LOC-01
    name = db.Column(db.String(200), nullable=False, index=True)
    kannada_name = db.Column(db.String(250), nullable=True)
    category_id = db.Column(db.String(50), db.ForeignKey("categories.id"), nullable=False, index=True)

    summary = db.Column(db.Text, nullable=False)
    full_description = db.Column(db.Text, nullable=True)
    address = db.Column(db.Text, nullable=False)

    # Coordinates
    latitude = db.Column(db.Float, nullable=False, index=True)
    longitude = db.Column(db.Float, nullable=False, index=True)
    elevation_meters = db.Column(db.Integer, nullable=True)

    # Historical Context
    era = db.Column(db.String(150), nullable=True)
    built_year_or_century = db.Column(db.String(100), nullable=True)
    patron_ruler = db.Column(db.String(200), nullable=True)
    architectural_style = db.Column(db.String(200), nullable=True)
    pdf_source_doc = db.Column(db.String(250), nullable=True)
    conservation_priority = db.Column(db.String(80), nullable=True)

    # Contact Info
    contact_authority = db.Column(db.String(150), nullable=True)
    contact_phone = db.Column(db.String(50), nullable=True)
    contact_website = db.Column(db.String(250), nullable=True)

    # Operating Hours
    open_time = db.Column(db.String(30), nullable=True)
    close_time = db.Column(db.String(30), nullable=True)
    operating_days = db.Column(db.String(100), nullable=True)
    hours_notes = db.Column(db.Text, nullable=True)

    # JSON fields
    tags_json = db.Column(db.Text, default="[]", nullable=False)
    key_attributes_json = db.Column(db.Text, default="[]", nullable=False)

    # Verification & Citations
    verified_source = db.Column(db.String(250), nullable=True)
    is_pdf_authoritative = db.Column(db.Boolean, default=False)
    primary_photo_url = db.Column(db.String(500), nullable=True)

    # Relationships
    category = db.relationship("Category", back_populates="locations")

    @property
    def tags(self):
        try:
            return json.loads(self.tags_json) if self.tags_json else []
        except Exception:
            return []

    @tags.setter
    def tags(self, value):
        self.tags_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def key_attributes(self):
        try:
            return json.loads(self.key_attributes_json) if self.key_attributes_json else []
        except Exception:
            return []

    @key_attributes.setter
    def key_attributes(self, value):
        self.key_attributes_json = json.dumps(value if isinstance(value, list) else [])

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "kannadaName": self.kannada_name or "",
            "category": self.category_id,
            "summary": self.summary,
            "fullDescription": self.full_description or self.summary,
            "address": self.address,
            "coordinates": {
                "latitude": self.latitude,
                "longitude": self.longitude,
                "elevationMeters": self.elevation_meters,
            },
            "historicalContext": {
                "era": self.era or "",
                "builtYearOrCentury": self.built_year_or_century or "",
                "patronRuler": self.patron_ruler or "",
                "architecturalStyle": self.architectural_style or "",
                "pdfSourceDoc": self.pdf_source_doc or "",
                "conservationPriority": self.conservation_priority or "",
            },
            "contact": {
                "authority": self.contact_authority or "",
                "phone": self.contact_phone or "",
                "website": self.contact_website or "",
            },
            "hours": {
                "open": self.open_time or "",
                "close": self.close_time or "",
                "days": self.operating_days or "",
                "notes": self.hours_notes or "",
            },
            "tags": self.tags,
            "keyAttributes": self.key_attributes,
            "verifiedSource": self.verified_source or "",
            "isPdfAuthoritative": self.is_pdf_authoritative,
            "primaryPhotoUrl": self.primary_photo_url or "",
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

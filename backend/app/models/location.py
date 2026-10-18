from app.models.base import db, TimestampMixin
from datetime import datetime, timedelta
import json

class Location(db.Model, TimestampMixin):
    __tablename__ = "locations"

    id = db.Column(db.String(80), primary_key=True) # e.g. pavagada-fort-apex
    code = db.Column(db.String(30), unique=True, nullable=False, index=True) # e.g. PVG-LOC-01
    name = db.Column(db.String(200), nullable=False, index=True)
    short_name = db.Column(db.String(150), nullable=True)
    kannada_name = db.Column(db.String(250), nullable=True)
    category_id = db.Column(db.String(50), db.ForeignKey("categories.id"), nullable=False, index=True)
    subcategory = db.Column(db.String(100), nullable=True, index=True)

    summary = db.Column(db.Text, nullable=False)
    full_description = db.Column(db.Text, nullable=True)
    address = db.Column(db.Text, nullable=False)
    area = db.Column(db.String(150), nullable=True, index=True)
    pincode = db.Column(db.String(20), default="561202", nullable=True)
    landmark = db.Column(db.String(250), nullable=True)
    map_reference = db.Column(db.String(500), nullable=True)

    # Coordinates
    latitude = db.Column(db.Float, nullable=False, index=True)
    longitude = db.Column(db.Float, nullable=False, index=True)
    elevation_meters = db.Column(db.Integer, nullable=True)

    # Historical Context (legacy & cultural)
    era = db.Column(db.String(150), nullable=True)
    built_year_or_century = db.Column(db.String(100), nullable=True)
    patron_ruler = db.Column(db.String(200), nullable=True)
    architectural_style = db.Column(db.String(200), nullable=True)
    pdf_source_doc = db.Column(db.String(250), nullable=True)
    conservation_priority = db.Column(db.String(80), nullable=True)

    # Contact Info (legacy flat columns + structured json)
    contact_authority = db.Column(db.String(150), nullable=True)
    contact_phone = db.Column(db.String(50), nullable=True)
    contact_website = db.Column(db.String(250), nullable=True)
    contact_details_json = db.Column(db.Text, default="{}", nullable=False)

    # Operating Hours (legacy flat columns + structured weekly slots json)
    open_time = db.Column(db.String(30), nullable=True)
    close_time = db.Column(db.String(30), nullable=True)
    operating_days = db.Column(db.String(100), nullable=True)
    hours_notes = db.Column(db.Text, nullable=True)
    operating_hours_json = db.Column(db.Text, default="{}", nullable=False)

    # Category Specific Dynamic Attributes
    category_data_json = db.Column(db.Text, default="{}", nullable=False)

    # JSON fields
    tags_json = db.Column(db.Text, default="[]", nullable=False)
    key_attributes_json = db.Column(db.Text, default="[]", nullable=False)

    # Verification System
    verification_status = db.Column(db.String(50), default="PENDING", nullable=False, index=True) # NOT_VERIFIED, PENDING, VERIFIED, NEEDS_REVERIFICATION
    last_verified_at = db.Column(db.DateTime, nullable=True)
    verified_by = db.Column(db.String(150), nullable=True)
    verification_source = db.Column(db.String(100), nullable=True) # Official Website, Official Office, Staff / Manager, Phone Verification, Physical Visit, User Submitted, Other
    verification_notes = db.Column(db.Text, nullable=True)

    # Citations & Media
    verified_source = db.Column(db.String(250), nullable=True)
    is_pdf_authoritative = db.Column(db.Boolean, default=False)
    primary_photo_url = db.Column(db.String(500), nullable=True)

    # Relationships
    category = db.relationship("Category", back_populates="locations")
    tag_objects = db.relationship("Tag", secondary="place_tags", back_populates="places", lazy="select")

    @property
    def tags(self):
        # Prefer relational tags if assigned, otherwise fallback to tags_json
        if self.tag_objects:
            return [t.name for t in self.tag_objects]
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

    @property
    def contact_details(self):
        try:
            return json.loads(self.contact_details_json) if self.contact_details_json else {}
        except Exception:
            return {}

    @contact_details.setter
    def contact_details(self, val):
        self.contact_details_json = json.dumps(val if isinstance(val, dict) else {})

    @property
    def operating_hours(self):
        try:
            return json.loads(self.operating_hours_json) if self.operating_hours_json else {}
        except Exception:
            return {}

    @operating_hours.setter
    def operating_hours(self, val):
        self.operating_hours_json = json.dumps(val if isinstance(val, dict) else {})

    @property
    def category_data(self):
        try:
            return json.loads(self.category_data_json) if self.category_data_json else {}
        except Exception:
            return {}

    @category_data.setter
    def category_data(self, val):
        self.category_data_json = json.dumps(val if isinstance(val, dict) else {})

    def is_fresh(self) -> bool:
        """Determines if the record was verified within 180 days (6 months)."""
        if self.verification_status != "VERIFIED" or not self.last_verified_at:
            return False
        cutoff = datetime.utcnow() - timedelta(days=180)
        return self.last_verified_at >= cutoff

    def to_dict(self):
        contact_dict = self.contact_details
        hours_dict = self.operating_hours
        cat_data = self.category_data

        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "shortName": self.short_name or self.name,
            "kannadaName": self.kannada_name or "",
            "category": self.category_id,
            "categoryName": self.category.name if self.category else self.category_id,
            "subcategory": self.subcategory or "",
            "summary": self.summary,
            "fullDescription": self.full_description or self.summary,
            "address": self.address,
            "area": self.area or "Pavagada Town",
            "pincode": self.pincode or "561202",
            "landmark": self.landmark or "",
            "mapReference": self.map_reference or "",
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
                "phone": self.contact_phone or contact_dict.get("primaryPhone", ""),
                "alternatePhone": contact_dict.get("alternatePhone", ""),
                "whatsapp": contact_dict.get("whatsapp", ""),
                "email": contact_dict.get("email", ""),
                "website": self.contact_website or contact_dict.get("website", ""),
                "onlineServiceUrl": contact_dict.get("onlineServiceUrl", ""),
                "customContacts": contact_dict.get("customContacts", []),
            },
            "hours": {
                "open": self.open_time or "",
                "close": self.close_time or "",
                "days": self.operating_days or "",
                "notes": self.hours_notes or "",
                "is24Hours": hours_dict.get("is24Hours", False),
                "isClosed": hours_dict.get("isClosed", False),
                "schedule": hours_dict.get("schedule", {}),
            },
            "categoryData": cat_data,
            "tags": self.tags,
            "tagDetails": [t.to_dict() for t in self.tag_objects] if self.tag_objects else [],
            "keyAttributes": self.key_attributes,
            "verification": {
                "status": self.verification_status or "PENDING",
                "lastVerifiedAt": self.last_verified_at.isoformat() if self.last_verified_at else None,
                "verifiedBy": self.verified_by or "",
                "source": self.verification_source or "",
                "notes": self.verification_notes or "",
                "isFresh": self.is_fresh(),
            },
            "verifiedSource": self.verified_source or "",
            "isPdfAuthoritative": self.is_pdf_authoritative,
            "primaryPhotoUrl": self.primary_photo_url or "",
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

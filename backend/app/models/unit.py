from datetime import datetime
import json
from app.models.base import db, TimestampMixin

class Unit(db.Model, TimestampMixin):
    __tablename__ = "building_units"

    id = db.Column(db.String(80), primary_key=True) # e.g. unt_4f5e6d7c
    building_id = db.Column(db.String(80), db.ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False, index=True)
    floor_id = db.Column(db.String(80), db.ForeignKey("building_floors.id", ondelete="CASCADE"), nullable=False, index=True)

    unit_number = db.Column(db.String(50), nullable=False, index=True) # e.g. "Shop 001", "Office 102", "Room 3"
    unit_name = db.Column(db.String(200), nullable=True) # e.g. "Shri Krishna Provisions" or "Vacant Store"
    unit_type = db.Column(db.String(80), default="Retail Shop", nullable=False)
    # Retail Shop, Office, Restaurant, Warehouse, Residential Unit, Clinic, Workshop, Service Centre, Other
    usage = db.Column(db.String(80), default="Commercial", nullable=False)
    # Commercial, Residential, Storage, Mixed
    occupancy_status = db.Column(db.String(50), default="Occupied", nullable=False)
    # Occupied, Vacant, Under Renovation, Reserved
    size_sqft = db.Column(db.Float, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    photos_json = db.Column(db.Text, default="[]", nullable=False) # JSON list of image URLs

    # Relationships
    businesses = db.relationship("Business", backref="unit", lazy="dynamic", cascade="all, delete-orphan")

    @property
    def photos(self):
        try:
            return json.loads(self.photos_json) if self.photos_json else []
        except Exception:
            return []

    @photos.setter
    def photos(self, value):
        self.photos_json = json.dumps(value if isinstance(value, list) else [])

    def to_dict(self, include_business: bool = False) -> dict:
        data = {
            "id": self.id,
            "buildingId": self.building_id,
            "floorId": self.floor_id,
            "floorName": self.floor.floor_name if self.floor else None,
            "unitNumber": self.unit_number,
            "unitName": self.unit_name,
            "unitType": self.unit_type,
            "usage": self.usage,
            "occupancyStatus": self.occupancy_status,
            "sizeSqft": self.size_sqft,
            "notes": self.notes,
            "photos": self.photos,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_business:
            b_list = self.businesses.all()
            data["businesses"] = [b.to_dict(include_restricted=False) for b in b_list]
            data["activeBusiness"] = b_list[0].to_dict(include_restricted=False) if b_list else None
        return data

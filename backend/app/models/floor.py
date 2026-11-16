from datetime import datetime
from app.models.base import db, TimestampMixin

class Floor(db.Model, TimestampMixin):
    __tablename__ = "building_floors"

    id = db.Column(db.String(80), primary_key=True) # e.g. flr_019a2b3c
    building_id = db.Column(db.String(80), db.ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False, index=True)
    floor_level = db.Column(db.Integer, default=0, nullable=False) # 0 for Ground, 1 for 1st, -1 for Basement
    floor_name = db.Column(db.String(100), nullable=False) # e.g. "Ground Floor", "First Floor", "Basement"
    floor_usage = db.Column(db.String(80), default="Commercial", nullable=False) # Commercial, Residential, Mixed, Parking, Storage
    units_count = db.Column(db.Integer, default=0, nullable=False)
    notes = db.Column(db.Text, nullable=True)

    # Relationships
    units = db.relationship("Unit", backref="floor", lazy="dynamic", cascade="all, delete-orphan", order_by="Unit.unit_number")

    def to_dict(self, include_units: bool = False) -> dict:
        data = {
            "id": self.id,
            "buildingId": self.building_id,
            "floorLevel": self.floor_level,
            "floorName": self.floor_name,
            "floorUsage": self.floor_usage,
            "unitsCount": self.units_count,
            "notes": self.notes,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_units:
            data["units"] = [u.to_dict(include_business=True) for u in self.units.all()]
        return data

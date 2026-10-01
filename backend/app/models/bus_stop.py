from app.models.base import db, TimestampMixin

class BusStop(db.Model, TimestampMixin):
    __tablename__ = "bus_stops"

    id = db.Column(db.String(80), primary_key=True) # e.g. stop-pvg-ksrtc-stand
    stop_name = db.Column(db.String(150), nullable=False, index=True)
    kannada_name = db.Column(db.String(200), nullable=True)
    location_area = db.Column(db.String(150), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    description = db.Column(db.Text, nullable=True)

    # Relationships
    route_stops = db.relationship("RouteStop", back_populates="stop")

    def to_dict(self):
        return {
            "id": self.id,
            "stopName": self.stop_name,
            "kannadaName": self.kannada_name or "",
            "locationArea": self.location_area or "",
            "latitude": self.latitude,
            "longitude": self.longitude,
            "description": self.description or "",
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

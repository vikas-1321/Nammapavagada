import json
from app.models.base import db, TimestampMixin

class BusRoute(db.Model, TimestampMixin):
    __tablename__ = "bus_routes"

    id = db.Column(db.String(80), primary_key=True) # e.g. route-bengaluru-express
    route_code = db.Column(db.String(50), unique=True, nullable=False, index=True) # e.g. PVG-BLR-01
    source = db.Column(db.String(150), nullable=False)
    destination = db.Column(db.String(150), nullable=False)
    via_json = db.Column(db.Text, default="[]", nullable=False)
    operator = db.Column(db.String(80), default="KSRTC", nullable=False) # KSRTC, APSRTC, PRIVATE, INDIAN_RAILWAYS
    frequency_note = db.Column(db.Text, nullable=True)
    status_note = db.Column(db.Text, nullable=True)
    is_timetable_live = db.Column(db.Boolean, default=False)

    # Relationships
    route_stops = db.relationship("RouteStop", back_populates="route", cascade="all, delete-orphan", order_by="RouteStop.stop_sequence")
    timings = db.relationship("BusTiming", back_populates="route", cascade="all, delete-orphan")

    @property
    def via(self):
        try:
            return json.loads(self.via_json) if self.via_json else []
        except Exception:
            return []

    @via.setter
    def via(self, value):
        self.via_json = json.dumps(value if isinstance(value, list) else [])

    def to_dict(self, include_details=True):
        data = {
            "id": self.id,
            "routeCode": self.route_code,
            "source": self.source,
            "destination": self.destination,
            "via": self.via,
            "operator": self.operator,
            "frequencyNote": self.frequency_note or "",
            "statusNote": self.status_note or "",
            "isTimetableLive": self.is_timetable_live,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_details:
            data["stops"] = [rs.to_dict() for rs in self.route_stops]
            data["timings"] = [bt.to_dict() for bt in self.timings]
        return data

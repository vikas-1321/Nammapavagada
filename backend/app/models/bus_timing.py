from app.models.base import db, TimestampMixin

class BusTiming(db.Model, TimestampMixin):
    __tablename__ = "bus_timings"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    route_id = db.Column(db.String(80), db.ForeignKey("bus_routes.id"), nullable=False, index=True)
    stop_id = db.Column(db.String(80), db.ForeignKey("bus_stops.id"), nullable=True, index=True)

    departure_time = db.Column(db.String(30), nullable=False) # e.g. "06:00 AM"
    arrival_time = db.Column(db.String(30), nullable=True)   # e.g. "08:15 AM"
    day_type = db.Column(db.String(30), default="DAILY", nullable=False) # DAILY, MON_SAT, MON_FRI, SUNDAY, HOLIDAY
    bus_type = db.Column(db.String(50), default="ORDINARY", nullable=True) # EXPRESS, ORDINARY, RAJAHAMSA, SLEEPER
    remarks = db.Column(db.String(255), nullable=True)

    # Relationships
    route = db.relationship("BusRoute", back_populates="timings")
    stop = db.relationship("BusStop")

    def to_dict(self):
        return {
            "id": self.id,
            "routeId": self.route_id,
            "stopId": self.stop_id,
            "stopName": self.stop.stop_name if self.stop else None,
            "departureTime": self.departure_time,
            "arrivalTime": self.arrival_time,
            "dayType": self.day_type,
            "busType": self.bus_type,
            "remarks": self.remarks or "",
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

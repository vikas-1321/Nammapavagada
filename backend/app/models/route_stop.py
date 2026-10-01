from datetime import datetime
from app.models.base import db

class RouteStop(db.Model):
    __tablename__ = "route_stops"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    route_id = db.Column(db.String(80), db.ForeignKey("bus_routes.id"), nullable=False, index=True)
    stop_id = db.Column(db.String(80), db.ForeignKey("bus_stops.id"), nullable=False, index=True)
    stop_sequence = db.Column(db.Integer, nullable=False, default=1)
    is_major_stop = db.Column(db.Boolean, default=False)
    arrival_estimate_minutes = db.Column(db.Integer, nullable=True) # minutes from route start
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    route = db.relationship("BusRoute", back_populates="route_stops")
    stop = db.relationship("BusStop", back_populates="route_stops")

    def to_dict(self):
        return {
            "id": self.id,
            "routeId": self.route_id,
            "stopId": self.stop_id,
            "stopName": self.stop.stop_name if self.stop else "",
            "kannadaName": self.stop.kannada_name if self.stop else "",
            "sequence": self.stop_sequence,
            "isMajorStop": self.is_major_stop,
            "arrivalEstimateMinutes": self.arrival_estimate_minutes,
            "latitude": self.stop.latitude if self.stop else None,
            "longitude": self.stop.longitude if self.stop else None,
        }

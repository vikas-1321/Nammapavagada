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

    # Official Timetable source metadata & audit fields
    serial_number = db.Column(db.Integer, nullable=True, index=True)
    source_origin = db.Column(db.String(150), nullable=True)
    source_destination = db.Column(db.String(150), nullable=True)
    service_class = db.Column(db.String(50), nullable=True) # Express, Non-Stop, Ordinary
    via_place = db.Column(db.String(150), nullable=True)
    source_doc = db.Column(db.String(100), default="Pavagada.pdf", nullable=True)
    source_page = db.Column(db.Integer, nullable=True)
    route_classification = db.Column(db.String(50), default="DEPARTING", nullable=True) # DEPARTING, PASSING_THROUGH
    verification_status = db.Column(db.String(50), default="OFFICIAL_TIMETABLE", nullable=True) # OFFICIAL_TIMETABLE, OFFICIAL_UNVERIFIED_PASSING

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
            "serialNumber": self.serial_number,
            "sourceOrigin": self.source_origin,
            "sourceDestination": self.source_destination,
            "serviceClass": self.service_class,
            "viaPlace": self.via_place,
            "sourceDoc": self.source_doc,
            "sourcePage": self.source_page,
            "routeClassification": self.route_classification or "DEPARTING",
            "verificationStatus": self.verification_status or "OFFICIAL_TIMETABLE",
            "remarks": self.remarks or "",
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

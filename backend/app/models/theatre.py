import json
from app.models.base import db, TimestampMixin

class Theatre(db.Model, TimestampMixin):
    __tablename__ = "theatres"

    id = db.Column(db.String(80), primary_key=True) # e.g. theatre-sri-venkateshwara
    name = db.Column(db.String(200), nullable=False, index=True)
    kannada_name = db.Column(db.String(250), nullable=True)
    address = db.Column(db.Text, nullable=False)

    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    phone = db.Column(db.String(50), nullable=True)
    website = db.Column(db.String(250), nullable=True)
    screens_count = db.Column(db.Integer, default=1)

    current_movies_json = db.Column(db.Text, default="[]", nullable=False)
    show_timings_json = db.Column(db.Text, default="[]", nullable=False)
    ticket_info_json = db.Column(db.Text, default="{}", nullable=False)
    primary_photo_url = db.Column(db.String(500), nullable=True)

    @property
    def current_movies(self):
        try:
            return json.loads(self.current_movies_json) if self.current_movies_json else []
        except Exception:
            return []

    @current_movies.setter
    def current_movies(self, val):
        self.current_movies_json = json.dumps(val if isinstance(val, list) else [])

    @property
    def show_timings(self):
        try:
            return json.loads(self.show_timings_json) if self.show_timings_json else []
        except Exception:
            return []

    @show_timings.setter
    def show_timings(self, val):
        self.show_timings_json = json.dumps(val if isinstance(val, list) else [])

    @property
    def ticket_info(self):
        try:
            return json.loads(self.ticket_info_json) if self.ticket_info_json else {}
        except Exception:
            return {}

    @ticket_info.setter
    def ticket_info(self, val):
        self.ticket_info_json = json.dumps(val if isinstance(val, dict) else {})

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "kannadaName": self.kannada_name or "",
            "address": self.address,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "phone": self.phone or "",
            "website": self.website or "",
            "screensCount": self.screens_count,
            "currentMovies": self.current_movies,
            "showTimings": self.show_timings,
            "ticketInfo": self.ticket_info,
            "primaryPhotoUrl": self.primary_photo_url or "",
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

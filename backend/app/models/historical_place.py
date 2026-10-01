from app.models.base import db, TimestampMixin

class HistoricalPlace(db.Model, TimestampMixin):
    __tablename__ = "historical_places"

    id = db.Column(db.String(80), primary_key=True) # e.g. apex-battery-bastion
    name = db.Column(db.String(200), nullable=False, index=True)
    kannada_name = db.Column(db.String(250), nullable=True)
    era_id = db.Column(db.String(80), nullable=True)
    classification = db.Column(db.String(50), default="DEFENSE", nullable=False) # DEFENSE, RELIGIOUS, ROYAL
    description = db.Column(db.Text, nullable=False)
    pdf_source = db.Column(db.String(250), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    elevation_meters = db.Column(db.Integer, nullable=True)
    primary_photo_url = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "kannadaName": self.kannada_name or "",
            "eraId": self.era_id or "",
            "classification": self.classification,
            "description": self.description,
            "pdfSource": self.pdf_source,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "elevationMeters": self.elevation_meters,
            "primaryPhotoUrl": self.primary_photo_url or "",
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

from app.models.base import db, TimestampMixin

class Photo(db.Model, TimestampMixin):
    __tablename__ = "photos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    entity_type = db.Column(db.String(50), nullable=False, index=True) # location, bus_route, hospital, school, college, theatre, history, general
    entity_id = db.Column(db.String(80), nullable=False, index=True)

    s3_key = db.Column(db.String(500), nullable=False)
    url = db.Column(db.String(800), nullable=False)
    alt_text = db.Column(db.String(255), nullable=True)
    caption = db.Column(db.String(500), nullable=True)
    photo_type = db.Column(db.String(80), nullable=True) # e.g. "Main entrance", "Interior", "Surrounding area", "Facade"

    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_primary = db.Column(db.Boolean, default=False, nullable=False)
    file_size_bytes = db.Column(db.Integer, nullable=True)
    mime_type = db.Column(db.String(80), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "entityType": self.entity_type,
            "entityId": self.entity_id,
            "s3Key": self.s3_key,
            "url": self.url,
            "altText": self.alt_text or "",
            "caption": self.caption or "",
            "photoType": self.photo_type or "General",
            "displayOrder": self.display_order,
            "isPrimary": self.is_primary,
            "fileSizeBytes": self.file_size_bytes,
            "mimeType": self.mime_type or "",
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

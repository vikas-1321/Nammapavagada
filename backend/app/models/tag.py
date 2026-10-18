from app.models.base import db, TimestampMixin
import re

place_tags = db.Table(
    "place_tags",
    db.Column("place_id", db.String(80), db.ForeignKey("locations.id", ondelete="CASCADE"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

class Tag(db.Model, TimestampMixin):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    slug = db.Column(db.String(120), unique=True, nullable=False, index=True)
    category = db.Column(db.String(50), nullable=False, default="SERVICE", index=True)
    description = db.Column(db.String(255), nullable=True)

    # Relationships
    places = db.relationship("Location", secondary=place_tags, back_populates="tag_objects", lazy="select")

    @staticmethod
    def slugify(text: str) -> str:
        s = text.lower().strip()
        s = re.sub(r"[^\w\s-]", "", s)
        s = re.sub(r"[\s_-]+", "-", s)
        return s.strip("-")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "category": self.category,
            "description": self.description or "",
            "placesCount": len(self.places) if self.places else 0,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

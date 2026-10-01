from app.models.base import db, TimestampMixin

class Category(db.Model, TimestampMixin):
    __tablename__ = "categories"

    id = db.Column(db.String(50), primary_key=True) # e.g. FORT_HERITAGE, HEALTHCARE
    name = db.Column(db.String(100), nullable=False)
    short_code = db.Column(db.String(20), nullable=False)
    badge_color_class = db.Column(db.String(100), default="bg-forest-green text-white")
    border_class = db.Column(db.String(100), default="border-forest-green")
    description = db.Column(db.Text, nullable=True)
    is_future_module = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, default=0)

    # Relationships
    locations = db.relationship("Location", back_populates="category", lazy="select")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "shortCode": self.short_code,
            "badgeColorClass": self.badge_color_class,
            "borderClass": self.border_class,
            "description": self.description or "",
            "isFutureModule": self.is_future_module,
            "displayOrder": self.display_order,
            "status": self.status,
            "locationsCount": len(self.locations) if self.locations else 0,
        }

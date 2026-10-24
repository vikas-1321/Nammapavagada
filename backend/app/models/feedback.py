import uuid
from datetime import datetime
from app.models.base import db

class Feedback(db.Model):
    __tablename__ = "feedback"

    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(120), nullable=True)
    email = db.Column(db.String(150), nullable=True)
    category = db.Column(db.String(50), nullable=False, index=True)
    message = db.Column(db.Text, nullable=False)
    page_path = db.Column(db.String(300), nullable=False, default="/")
    
    # Optional contextual association
    related_entity_type = db.Column(db.String(80), nullable=True, index=True)
    related_entity_id = db.Column(db.String(100), nullable=True, index=True)
    related_entity_name = db.Column(db.String(200), nullable=True)
    
    # Review workflow
    status = db.Column(db.String(30), nullable=False, default="PENDING", index=True)
    admin_notes = db.Column(db.Text, nullable=True)
    
    # Security & diagnostics
    ip_address = db.Column(db.String(60), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    VALID_CATEGORIES = {
        "GENERAL": "General Feedback",
        "INCORRECT_INFO": "Incorrect Information",
        "MISSING_PLACE_OR_SERVICE": "Missing Place or Service",
        "WEBSITE_BUG": "Website Bug",
        "SUGGESTION": "Suggestion",
        "OTHER": "Other",
    }

    VALID_STATUSES = {
        "PENDING": "Pending",
        "UNDER_REVIEW": "Under Review",
        "RESOLVED": "Resolved",
        "REJECTED": "Rejected",
    }

    def __init__(self, **kwargs):
        if not kwargs.get("id"):
            kwargs["id"] = f"fb_{uuid.uuid4().hex[:12]}"
        super().__init__(**kwargs)

    def to_dict(self, include_admin: bool = False):
        data = {
            "id": self.id,
            "name": self.name or "",
            "email": self.email or "",
            "category": self.category,
            "categoryLabel": self.VALID_CATEGORIES.get(self.category, self.category),
            "message": self.message,
            "pagePath": self.page_path,
            "relatedEntityType": self.related_entity_type or None,
            "relatedEntityId": self.related_entity_id or None,
            "relatedEntityName": self.related_entity_name or None,
            "status": self.status,
            "statusLabel": self.VALID_STATUSES.get(self.status, self.status),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_admin:
            data["adminNotes"] = self.admin_notes or ""
            data["ipAddress"] = self.ip_address or ""
            data["userAgent"] = self.user_agent or ""
        return data

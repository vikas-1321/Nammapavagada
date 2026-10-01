import json
from datetime import datetime
from app.models.base import db

class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    admin_id = db.Column(db.Integer, nullable=True)
    admin_email = db.Column(db.String(120), nullable=False)
    action = db.Column(db.String(50), nullable=False, index=True) # CREATE, UPDATE, DELETE, STATUS_CHANGE, LOGIN, LOGOUT
    entity_type = db.Column(db.String(80), nullable=False, index=True) # Location, BusRoute, Hospital, etc.
    entity_id = db.Column(db.String(100), nullable=False, index=True)

    previous_value_json = db.Column(db.Text, nullable=True)
    new_value_json = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(60), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    @property
    def previous_value(self):
        try:
            return json.loads(self.previous_value_json) if self.previous_value_json else None
        except Exception:
            return self.previous_value_json

    @previous_value.setter
    def previous_value(self, val):
        self.previous_value_json = json.dumps(val) if val is not None else None

    @property
    def new_value(self):
        try:
            return json.loads(self.new_value_json) if self.new_value_json else None
        except Exception:
            return self.new_value_json

    @new_value.setter
    def new_value(self, val):
        self.new_value_json = json.dumps(val) if val is not None else None

    def to_dict(self):
        return {
            "id": self.id,
            "adminId": self.admin_id,
            "adminEmail": self.admin_email,
            "action": self.action,
            "entityType": self.entity_type,
            "entityId": self.entity_id,
            "previousValue": self.previous_value,
            "newValue": self.new_value,
            "ipAddress": self.ip_address or "",
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }

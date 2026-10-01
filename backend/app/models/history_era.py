import json
from app.models.base import db, TimestampMixin

class HistoryEra(db.Model, TimestampMixin):
    __tablename__ = "history_eras"

    id = db.Column(db.String(80), primary_key=True) # e.g. megalithic, aravidu-foundation
    era_name = db.Column(db.String(200), nullable=False)
    kannada_title = db.Column(db.String(250), nullable=True)
    time_range = db.Column(db.String(100), nullable=False)
    primary_rulers_json = db.Column(db.Text, default="[]", nullable=False)
    key_events_json = db.Column(db.Text, default="[]", nullable=False)
    summary = db.Column(db.Text, nullable=False)
    pdf_evidence = db.Column(db.Text, nullable=False)
    display_order = db.Column(db.Integer, default=0, nullable=False)

    @property
    def primary_rulers(self):
        try:
            return json.loads(self.primary_rulers_json) if self.primary_rulers_json else []
        except Exception:
            return []

    @primary_rulers.setter
    def primary_rulers(self, val):
        self.primary_rulers_json = json.dumps(val if isinstance(val, list) else [])

    @property
    def key_events(self):
        try:
            return json.loads(self.key_events_json) if self.key_events_json else []
        except Exception:
            return []

    @key_events.setter
    def key_events(self, val):
        self.key_events_json = json.dumps(val if isinstance(val, list) else [])

    def to_dict(self):
        return {
            "id": self.id,
            "eraName": self.era_name,
            "kannadaTitle": self.kannada_title or "",
            "timeRange": self.time_range,
            "primaryRulers": self.primary_rulers,
            "keyEvents": self.key_events,
            "summary": self.summary,
            "pdfEvidence": self.pdf_evidence,
            "displayOrder": self.display_order,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

from datetime import datetime
import json
from app.models.base import db, TimestampMixin

class SurveyorProfile(db.Model, TimestampMixin):
    __tablename__ = "surveyor_profiles"

    id = db.Column(db.Integer, primary_key=True) # Linked to AdminUser id or unique surveyor id
    admin_id = db.Column(db.Integer, db.ForeignKey("admin_users.id"), unique=True, nullable=False, index=True)
    display_name = db.Column(db.String(150), nullable=False)

    total_points = db.Column(db.Integer, default=0, nullable=False)
    level_number = db.Column(db.Integer, default=1, nullable=False)
    level_title = db.Column(db.String(100), default="Local Explorer", nullable=False)

    buildings_mapped_count = db.Column(db.Integer, default=0, nullable=False)
    shops_registered_count = db.Column(db.Integer, default=0, nullable=False)
    photos_uploaded_count = db.Column(db.Integer, default=0, nullable=False)
    surveys_completed_count = db.Column(db.Integer, default=0, nullable=False)
    verifications_completed_count = db.Column(db.Integer, default=0, nullable=False)

    badges_json = db.Column(db.Text, default="[]", nullable=False) # list of badge objects or keys
    last_active_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    @property
    def badges(self):
        try:
            return json.loads(self.badges_json) if self.badges_json else []
        except Exception:
            return []

    @badges.setter
    def badges(self, value):
        self.badges_json = json.dumps(value if isinstance(value, list) else [])

    def recalculate_level(self):
        """Updates level based on total points."""
        pts = self.total_points
        if pts >= 3000:
            self.level_number = 5
            self.level_title = "Pavagada Community Mapper"
        elif pts >= 1500:
            self.level_number = 4
            self.level_title = "Market Analyst"
        elif pts >= 750:
            self.level_number = 3
            self.level_title = "Business Researcher"
        elif pts >= 250:
            self.level_number = 2
            self.level_title = "Building Mapper"
        else:
            self.level_number = 1
            self.level_title = "Local Explorer"

    def to_dict(self) -> dict:
        pts = self.total_points
        # Next level thresholds
        level_thresholds = [0, 250, 750, 1500, 3000]
        curr_idx = min(self.level_number - 1, len(level_thresholds) - 1)
        next_target = level_thresholds[curr_idx + 1] if curr_idx < len(level_thresholds) - 1 else 3000
        curr_base = level_thresholds[curr_idx]
        progress_pct = 100 if curr_idx == len(level_thresholds) - 1 else min(100, max(0, int(((pts - curr_base) / max(1, next_target - curr_base)) * 100)))

        return {
            "id": self.id,
            "adminId": self.admin_id,
            "displayName": self.display_name,
            "totalPoints": self.total_points,
            "levelNumber": self.level_number,
            "levelTitle": self.level_title,
            "nextLevelTarget": next_target,
            "levelProgressPct": progress_pct,
            "buildingsMappedCount": self.buildings_mapped_count,
            "shopsRegisteredCount": self.shops_registered_count,
            "photosUploadedCount": self.photos_uploaded_count,
            "surveysCompletedCount": self.surveys_completed_count,
            "verificationsCompletedCount": self.verifications_completed_count,
            "badges": self.badges,
            "lastActiveDate": self.last_active_date.isoformat() if self.last_active_date else None,
        }


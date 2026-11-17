import json
from datetime import datetime
from app.models.base import db
from app.models.surveyor_gamification import SurveyorProfile

BADGES_CATALOG = [
    {
        "id": "first_building",
        "title": "First Building Mapped",
        "description": "Mapped your first physical building in Pavagada",
        "icon": "🏛️",
        "condition": lambda p: p.buildings_mapped_count >= 1,
    },
    {
        "id": "building_explorer",
        "title": "Building Explorer",
        "description": "Mapped 5 or more buildings across the taluk",
        "icon": "🧭",
        "condition": lambda p: p.buildings_mapped_count >= 5,
    },
    {
        "id": "first_shop",
        "title": "First Shop Registered",
        "description": "Documented your first local commercial enterprise",
        "icon": "🏪",
        "condition": lambda p: p.shops_registered_count >= 1,
    },
    {
        "id": "local_business_mapper",
        "title": "Local Business Mapper",
        "description": "Registered 10+ local businesses in Pavagada market",
        "icon": "🛍️",
        "condition": lambda p: p.shops_registered_count >= 10,
    },
    {
        "id": "product_researcher",
        "title": "Product Researcher",
        "description": "Detailed 20+ products and local services",
        "icon": "📦",
        "condition": lambda p: p.surveys_completed_count >= 5,
    },
    {
        "id": "market_observer",
        "title": "Market Observer",
        "description": "Completed footfall and commercial street analysis",
        "icon": "👥",
        "condition": lambda p: p.photos_uploaded_count >= 5,
    },
    {
        "id": "verified_data_champion",
        "title": "Verified Data Champion",
        "description": "Completed and ground-truth verified 5+ records",
        "icon": "🏆",
        "condition": lambda p: p.verifications_completed_count >= 5,
    },
]

class SurveyGamificationService:
    def get_or_create_profile(self, admin_id: int, display_name: str = "Admin Surveyor") -> SurveyorProfile:
        profile = SurveyorProfile.query.filter_by(admin_id=admin_id).first()
        if not profile:
            profile = SurveyorProfile(
                admin_id=admin_id,
                display_name=display_name or f"Surveyor #{admin_id}",
                total_points=0,
                level_number=1,
                level_title="Local Explorer",
                badges_json="[]",
            )
            db.session.add(profile)
            db.session.commit()
        return profile

    def award_points(
        self,
        admin_id: int,
        display_name: str,
        points: int,
        action_type: str,
        photos_count: int = 0,
        shops_count: int = 0,
        verified: bool = False,
    ) -> dict:
        """Award points, update counters, and evaluate milestone badges."""
        if not admin_id:
            return {}

        profile = self.get_or_create_profile(admin_id, display_name)
        profile.total_points += points
        profile.last_active_date = datetime.utcnow()

        if action_type == "BUILDING_MAPPED":
            profile.buildings_mapped_count += 1
        elif action_type == "BUSINESS_REGISTERED":
            profile.shops_registered_count += max(1, shops_count)
            profile.surveys_completed_count += 1
        elif action_type == "RECORD_VERIFIED":
            profile.verifications_completed_count += 1

        if photos_count > 0:
            profile.photos_uploaded_count += photos_count

        profile.recalculate_level()

        # Check badges
        earned_badge_ids = {b.get("id") if isinstance(b, dict) else b for b in profile.badges}
        newly_unlocked = []

        for badge in BADGES_CATALOG:
            if badge["id"] not in earned_badge_ids and badge["condition"](profile):
                new_badge_obj = {
                    "id": badge["id"],
                    "title": badge["title"],
                    "description": badge["description"],
                    "icon": badge["icon"],
                    "unlockedAt": datetime.utcnow().isoformat(),
                }
                newly_unlocked.append(new_badge_obj)

        if newly_unlocked:
            current_badges = profile.badges
            current_badges.extend(newly_unlocked)
            profile.badges = current_badges

        db.session.commit()
        return {
            "pointsAwarded": points,
            "totalPoints": profile.total_points,
            "levelNumber": profile.level_number,
            "levelTitle": profile.level_title,
            "newlyUnlockedBadges": newly_unlocked,
        }

    def get_dashboard_stats(self, admin_id: int = None) -> dict:
        from app.models.building import Building
        from app.models.business import Business

        total_buildings = Building.query.filter_by(status="ACTIVE").count()
        total_shops = Business.query.filter_by(status="ACTIVE").count()
        commercial_buildings = Building.query.filter(Building.building_type == "Commercial", Building.status == "ACTIVE").count()
        mixed_buildings = Building.query.filter(Building.building_type == "Mixed-use", Building.status == "ACTIVE").count()
        residential_buildings = Building.query.filter(Building.building_type == "Residential", Building.status == "ACTIVE").count()
        pending_verification = Building.query.filter_by(location_verification_status="PENDING").count()

        surveyor_profile = None
        if admin_id:
            p = self.get_or_create_profile(admin_id)
            surveyor_profile = p.to_dict()

        # Daily Challenges
        daily_challenges = [
            {
                "id": "ch_buildings_5",
                "title": "Map 5 Buildings",
                "description": "Survey 5 physical structures in Pavagada today",
                "target": 5,
                "current": min(5, surveyor_profile["buildingsMappedCount"]) if surveyor_profile else 0,
                "rewardPoints": 100,
                "completed": (surveyor_profile["buildingsMappedCount"] >= 5) if surveyor_profile else False,
            },
            {
                "id": "ch_shops_3",
                "title": "Register 3 Local Shops",
                "description": "Complete full survey profiles for 3 businesses",
                "target": 3,
                "current": min(3, surveyor_profile["shopsRegisteredCount"]) if surveyor_profile else 0,
                "rewardPoints": 150,
                "completed": (surveyor_profile["shopsRegisteredCount"] >= 3) if surveyor_profile else False,
            },
            {
                "id": "ch_photos_5",
                "title": "Visual Documentation",
                "description": "Capture 5+ storefront or building photos",
                "target": 5,
                "current": min(5, surveyor_profile["photosUploadedCount"]) if surveyor_profile else 0,
                "rewardPoints": 75,
                "completed": (surveyor_profile["photosUploadedCount"] >= 5) if surveyor_profile else False,
            },
        ]

        return {
            "totalBuildings": total_buildings,
            "totalShops": total_shops,
            "commercialBuildings": commercial_buildings,
            "mixedBuildings": mixed_buildings,
            "residentialBuildings": residential_buildings,
            "pendingVerification": pending_verification,
            "surveyor": surveyor_profile,
            "dailyChallenges": daily_challenges,
            "allAvailableBadges": [
                {
                    "id": b["id"],
                    "title": b["title"],
                    "description": b["description"],
                    "icon": b["icon"],
                }
                for b in BADGES_CATALOG
            ],
        }

survey_gamification_service = SurveyGamificationService()


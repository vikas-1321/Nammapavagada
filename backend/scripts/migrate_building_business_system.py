import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.models.base import db
from app.models.building import Building, BuildingPhoto
from app.models.floor import Floor
from app.models.unit import Unit
from app.models.business import Business, BusinessProductService, FootfallObservation
from app.models.surveyor_gamification import SurveyorProfile

def migrate():
    app = create_app()
    with app.app_context():
        print(f"Connecting to database: {app.config['SQLALCHEMY_DATABASE_URI']}")
        print("Creating tables: buildings, building_photos, building_floors, building_units, businesses, business_products_services, footfall_observations, surveyor_profiles...")
        db.create_all()
        print("Migration successful! All building & business intelligence tables verified.")

if __name__ == "__main__":
    migrate()


import os
import sys
import sqlite3

current_dir = os.path.abspath(os.path.dirname(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from app.models.base import db
from app.models.category import Category
from app.models.tag import Tag, place_tags
from app.models.location import Location
from app.services.tag_service import tag_service

# 10 Main Categories per Specification
MAIN_CATEGORIES = [
    ("EMERGENCY_CRITICAL_CARE", "Emergency & Critical Care", "EMRG", "bg-rose-950 text-rose-200 border-rose-800", "border-rose-700", "24/7 hospitals, casualty trauma care, ambulance, fire and police stations", False, 1),
    ("HEALTHCARE_MEDICAL", "Healthcare & Daily Medical Care", "HLTH", "bg-teal-950 text-teal-200 border-teal-800", "border-teal-700", "Clinics, pharmacies, Jan Aushadhi Kendras, diagnostic labs, and dental clinics", False, 2),
    ("CIVIC_GOVERNANCE", "Civic Administration & Citizen Governance", "CIVC", "bg-blue-950 text-blue-200 border-blue-800", "border-blue-700", "Town Municipality (Pura Sabhe), Taluk Office, Grama One, and government offices", False, 3),
    ("TRANSIT_LOGISTICS", "Transit, Transport & Logistics", "TRNS", "bg-amber-950 text-amber-200 border-amber-800", "border-amber-700", "KSRTC bus stands, depots, auto stands, petrol pumps, EV charging, and couriers", False, 4),
    ("EDUCATION_TRAINING", "Education & Skill Training", "EDUC", "bg-indigo-950 text-indigo-200 border-indigo-800", "border-indigo-700", "Schools, PU colleges, degree colleges, polytechnics, ITIs, and public libraries", False, 5),
    ("AGRICULTURE_RURAL", "Agriculture & Rural Economy", "AGRI", "bg-emerald-950 text-emerald-200 border-emerald-800", "border-emerald-700", "APMC market yard, agricultural offices, seed & fertilizer stores, and tractor services", False, 6),
    ("BANKING_FINANCE_LEGAL", "Banking, Finance & Legal Services", "BANK", "bg-purple-950 text-purple-200 border-purple-800", "border-purple-700", "Commercial and rural banks, ATMs, courts, lawyers, and notary services", False, 7),
    ("EVENTS_CULTURE_VENUES", "Events, Culture & Social Venues", "EVNT", "bg-yellow-950 text-yellow-200 border-yellow-800", "border-yellow-700", "Kalyana Mantapas, community halls, heritage temples, mosques, churches, and parks", False, 8),
    ("ENTERTAINMENT_HOSPITALITY", "Entertainment & Hospitality", "ENTR", "bg-orange-950 text-orange-200 border-orange-800", "border-orange-700", "Cinema theatres, hotels, lodges, restaurants, cafes, and bakeries", False, 9),
    ("DAILY_UTILITIES_TRADES", "Daily Utilities & Essential Local Trades", "UTIL", "bg-cyan-950 text-cyan-200 border-cyan-800", "border-cyan-700", "Electricians, plumbers, carpenters, LPG agencies, water supply, and DTP centres", False, 10),
]

def migrate():
    app = create_app()
    with app.app_context():
        # Step 1: Ensure all tables exist in database
        print("[Migrate] Creating new tables (tags, place_tags) if not existing...")
        db.create_all()

        # Step 2: Add any missing columns to locations table in SQLite
        db_path = os.path.join(backend_dir, "instance", "namma_pavagada.db")
        if os.path.exists(db_path):
            print(f"[Migrate] Inspecting columns in {db_path}...")
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            existing_cols = [c[1] for c in cursor.execute("PRAGMA table_info(locations)").fetchall()]
            
            columns_to_add = [
                ("short_name", "VARCHAR(150)"),
                ("subcategory", "VARCHAR(100)"),
                ("area", "VARCHAR(150) DEFAULT 'Pavagada Town'"),
                ("pincode", "VARCHAR(20) DEFAULT '561202'"),
                ("landmark", "VARCHAR(250)"),
                ("map_reference", "VARCHAR(500)"),
                ("contact_details_json", "TEXT DEFAULT '{}'"),
                ("operating_hours_json", "TEXT DEFAULT '{}'"),
                ("category_data_json", "TEXT DEFAULT '{}'"),
                ("verification_status", "VARCHAR(50) DEFAULT 'PENDING'"),
                ("last_verified_at", "DATETIME"),
                ("verified_by", "VARCHAR(150)"),
                ("verification_source", "VARCHAR(100)"),
                ("verification_notes", "TEXT"),
            ]

            for col_name, col_type in columns_to_add:
                if col_name not in existing_cols:
                    print(f"[Migrate] Adding column {col_name} to locations table...")
                    cursor.execute(f"ALTER TABLE locations ADD COLUMN {col_name} {col_type}")

            conn.commit()
            conn.close()

        # Step 3: Seed / Update Categories
        print("[Migrate] Seeding the 10 CMS categories...")
        for cat_id, name, short_code, bg, border, desc, is_fut, disp in MAIN_CATEGORIES:
            existing = Category.query.get(cat_id)
            if not existing:
                cat = Category(
                    id=cat_id,
                    name=name,
                    short_code=short_code,
                    badge_color_class=bg,
                    border_class=border,
                    description=desc,
                    is_future_module=is_fut,
                    display_order=disp,
                )
                db.session.add(cat)
            else:
                existing.name = name
                existing.short_code = short_code
                existing.badge_color_class = bg
                existing.border_class = border
                existing.description = desc
                existing.display_order = disp

        db.session.commit()

        # Step 4: Seed Smart Tags
        print("[Migrate] Seeding smart tags...")
        tag_service.seed_defaults_if_needed()

        print("[Migrate] CMS Migration and seeding successfully completed!")

if __name__ == "__main__":
    migrate()

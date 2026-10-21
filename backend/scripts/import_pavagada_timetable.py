import os
import sys
import re
import json

current_dir = os.path.abspath(os.path.dirname(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from app.models.base import db
from app.models.bus_route import BusRoute
from app.models.bus_timing import BusTiming
from app.data.pavagada_timetable import TIMETABLE_DATA


def migrate_schema(app):
    """Ensure all required columns exist in both SQLite and PostgreSQL."""
    with app.app_context():
        engine = db.engine
        dialect = engine.dialect.name
        print(f"[Schema] Running schema migration for dialect: {dialect}...")

        if dialect == "sqlite":
            import sqlite3
            db_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
            # Extract sqlite path
            db_path = db_uri.replace("sqlite:///", "")
            if not os.path.isabs(db_path):
                db_path = os.path.join(app.instance_path, db_path)

            print(f"[Schema] Connecting directly to SQLite database at {db_path}...")
            conn = sqlite3.connect(db_path)
            cur = conn.cursor()

            # bus_routes columns
            existing_route_cols = [c[1] for c in cur.execute("PRAGMA table_info(bus_routes)").fetchall()]
            if "route_classification" not in existing_route_cols:
                print("  [Schema] Adding route_classification to bus_routes...")
                cur.execute("ALTER TABLE bus_routes ADD COLUMN route_classification VARCHAR(50) DEFAULT 'DEPARTING'")

            # bus_timings columns
            existing_timing_cols = [c[1] for c in cur.execute("PRAGMA table_info(bus_timings)").fetchall()]
            timing_cols_to_add = [
                ("serial_number", "INTEGER"),
                ("source_origin", "VARCHAR(150)"),
                ("source_destination", "VARCHAR(150)"),
                ("service_class", "VARCHAR(50)"),
                ("via_place", "VARCHAR(150)"),
                ("source_doc", "VARCHAR(100) DEFAULT 'Pavagada.pdf'"),
                ("source_page", "INTEGER"),
                ("route_classification", "VARCHAR(50) DEFAULT 'DEPARTING'"),
                ("verification_status", "VARCHAR(50) DEFAULT 'OFFICIAL_TIMETABLE'"),
            ]
            for col_name, col_type in timing_cols_to_add:
                if col_name not in existing_timing_cols:
                    print(f"  [Schema] Adding {col_name} ({col_type}) to bus_timings...")
                    cur.execute(f"ALTER TABLE bus_timings ADD COLUMN {col_name} {col_type}")

            cur.execute("CREATE INDEX IF NOT EXISTS ix_bus_timings_serial_number ON bus_timings (serial_number)")
            conn.commit()
            conn.close()
            print("[Schema] SQLite schema updated successfully.")

        else:
            # PostgreSQL or other SQL engine
            with engine.connect() as conn:
                print("  [Schema] Applying PostgreSQL ALTER TABLE statements...")
                conn.execute(db.text("ALTER TABLE bus_routes ADD COLUMN IF NOT EXISTS route_classification VARCHAR(50) DEFAULT 'DEPARTING';"))
                conn.execute(db.text("ALTER TABLE bus_timings ADD COLUMN IF NOT EXISTS serial_number INTEGER;"))
                conn.execute(db.text("ALTER TABLE bus_timings ADD COLUMN IF NOT EXISTS source_origin VARCHAR(150);"))
                conn.execute(db.text("ALTER TABLE bus_timings ADD COLUMN IF NOT EXISTS source_destination VARCHAR(150);"))
                conn.execute(db.text("ALTER TABLE bus_timings ADD COLUMN IF NOT EXISTS service_class VARCHAR(50);"))
                conn.execute(db.text("ALTER TABLE bus_timings ADD COLUMN IF NOT EXISTS via_place VARCHAR(150);"))
                conn.execute(db.text("ALTER TABLE bus_timings ADD COLUMN IF NOT EXISTS source_doc VARCHAR(100) DEFAULT 'Pavagada.pdf';"))
                conn.execute(db.text("ALTER TABLE bus_timings ADD COLUMN IF NOT EXISTS source_page INTEGER;"))
                conn.execute(db.text("ALTER TABLE bus_timings ADD COLUMN IF NOT EXISTS route_classification VARCHAR(50) DEFAULT 'DEPARTING';"))
                conn.execute(db.text("ALTER TABLE bus_timings ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'OFFICIAL_TIMETABLE';"))
                conn.execute(db.text("CREATE INDEX IF NOT EXISTS ix_bus_timings_serial_number ON bus_timings (serial_number);"))
                conn.commit()
            print("[Schema] PostgreSQL schema updated successfully.")


def generate_route_identifiers(origin: str, destination: str, via: str):
    """Generate clean, unique, and deterministic route id and route code."""
    is_departing = (origin.strip().lower() == "pavagada")
    orig_slug = re.sub(r"[^a-zA-Z0-9]+", "-", origin.strip().lower()).strip("-")
    dest_slug = re.sub(r"[^a-zA-Z0-9]+", "-", destination.strip().lower()).strip("-")
    via_slug = re.sub(r"[^a-zA-Z0-9]+", "-", via.strip().lower()).strip("-")

    if is_departing:
        route_id = f"route-pvg-{dest_slug}-{via_slug}"
        route_code = f"PVG-{dest_slug[:3].upper()}-{via_slug[:4].upper()}"
    else:
        route_id = f"route-pass-{orig_slug}-{dest_slug}-{via_slug}"
        route_code = f"PASS-{orig_slug[:3].upper()}-{dest_slug[:3].upper()}-{via_slug[:3].upper()}"

    return route_id, route_code


def import_timetable():
    app = create_app()
    migrate_schema(app)

    with app.app_context():
        print(f"\n[Import] Beginning Pavagada Bus Timetable import ({len(TIMETABLE_DATA)} records)...")
        
        # Track statistics
        stats = {
            "total_expected": len(TIMETABLE_DATA),
            "processed": 0,
            "timings_created": 0,
            "timings_updated": 0,
            "routes_created": 0,
            "routes_reused": 0,
            "departing_records": 0,
            "passing_records": 0,
            "flagged_for_verification": 0,
            "skipped": 0,
        }

        # 1. Group records by unique (From, To, Via) to manage routes cleanly
        corridors = {}
        for row in TIMETABLE_DATA:
            key = (row["from"].strip(), row["to"].strip(), row["via"].strip())
            corridors.setdefault(key, []).append(row)

        print(f"[Import] Found {len(corridors)} distinct transit corridors across {len(TIMETABLE_DATA)} rows.")

        # Map to store resolved route objects
        resolved_routes = {}

        for (orig, dest, via), rows in corridors.items():
            is_departing = (orig.lower() == "pavagada")
            route_id, route_code = generate_route_identifiers(orig, dest, via)

            route = BusRoute.query.get(route_id)
            if not route:
                # Check if route_code collision
                existing_by_code = BusRoute.query.filter_by(route_code=route_code).first()
                if existing_by_code and existing_by_code.id != route_id:
                    route_code = f"{route_code}-{len(resolved_routes) + 1}"

                via_list = [via]
                if not is_departing:
                    via_list = ["Pavagada Bus Stand", via]

                route = BusRoute(
                    id=route_id,
                    route_code=route_code,
                    source=orig,
                    destination=dest,
                    operator="KSRTC",
                    via_json=json.dumps(via_list),
                    frequency_note="Official Timetable - Chitradurga Division",
                    status_note="Official Schedule from Pavagada Bus Stand Timetable (Chitradurga Division)",
                    is_timetable_live=True,
                    route_classification="DEPARTING" if is_departing else "PASSING_THROUGH",
                    status="ACTIVE",
                )
                db.session.add(route)
                db.session.flush()
                stats["routes_created"] += 1
            else:
                # Update route classification and live status
                route.route_classification = "DEPARTING" if is_departing else "PASSING_THROUGH"
                route.is_timetable_live = True
                route.status = "ACTIVE"
                stats["routes_reused"] += 1

            resolved_routes[(orig, dest, via)] = route

        # 2. Upsert Timings for all 249 rows
        for row in TIMETABLE_DATA:
            sl_no = row["sl_no"]
            orig = row["from"].strip()
            dest = row["to"].strip()
            s_class = row["service_class"].strip()
            via = row["via"].strip()
            dep_time = row["departure_time"].strip()
            page = row["page"]

            is_departing = (orig.lower() == "pavagada")
            classification = "DEPARTING" if is_departing else "PASSING_THROUGH"
            
            # Rule: Non-Pavagada origins are flagged as passing through and need verification of exact stop time
            verification_status = "OFFICIAL_TIMETABLE" if is_departing else "OFFICIAL_UNVERIFIED_PASSING"

            stats["processed"] += 1
            if is_departing:
                stats["departing_records"] += 1
            else:
                stats["passing_records"] += 1
                stats["flagged_for_verification"] += 1

            route = resolved_routes[(orig, dest, via)]

            # Check if timing already exists by serial_number
            existing_timing = BusTiming.query.filter_by(serial_number=sl_no).first()

            if existing_timing:
                # Update existing record idempotently
                existing_timing.route_id = route.id
                existing_timing.source_origin = orig
                existing_timing.source_destination = dest
                existing_timing.service_class = s_class
                existing_timing.bus_type = s_class.upper()
                existing_timing.via_place = via
                existing_timing.departure_time = dep_time
                existing_timing.source_doc = "Pavagada.pdf"
                existing_timing.source_page = page
                existing_timing.route_classification = classification
                existing_timing.verification_status = verification_status
                existing_timing.status = "ACTIVE"
                stats["timings_updated"] += 1
            else:
                timing = BusTiming(
                    route_id=route.id,
                    serial_number=sl_no,
                    source_origin=orig,
                    source_destination=dest,
                    service_class=s_class,
                    bus_type=s_class.upper(),
                    via_place=via,
                    departure_time=dep_time,
                    source_doc="Pavagada.pdf",
                    source_page=page,
                    route_classification=classification,
                    verification_status=verification_status,
                    day_type="DAILY",
                    status="ACTIVE",
                    remarks="Official Pavagada Bus Stand Timetable (Chitradurga Division)" if is_departing else "Passing through Pavagada Bus Stand (Departure time recorded from source origin; requires verification of exact Pavagada stop time)",
                )
                db.session.add(timing)
                stats["timings_created"] += 1

        db.session.commit()

        print("\n================ IMPORT SUMMARY ================")
        print(f"Total source records expected:      {stats['total_expected']}")
        print(f"Records successfully processed:     {stats['processed']}")
        print(f"Timings created:                   {stats['timings_created']}")
        print(f"Timings updated (idempotent):      {stats['timings_updated']}")
        print(f"Total timetable entries in DB:     {stats['timings_created'] + stats['timings_updated']}")
        print(f"Corridor routes created:           {stats['routes_created']}")
        print(f"Corridor routes reused:            {stats['routes_reused']}")
        print(f"Departing from Pavagada (Case A):  {stats['departing_records']}")
        print(f"Passing through Pavagada (Case B): {stats['passing_records']}")
        print(f"Records flagged for verification:  {stats['flagged_for_verification']}")
        print(f"Records skipped:                   {stats['skipped']}")
        print("================================================\n")

        # Verify integrity
        assert stats["processed"] == 249, f"Expected 249, got {stats['processed']}"
        imported_count = BusTiming.query.filter(BusTiming.serial_number.isnot(None)).count()
        print(f"[Verification] Confirmed {imported_count} serialized timetable records in database.")
        assert imported_count == 249, f"Database has {imported_count} records instead of 249!"
        print("[Success] Reconciliation verified successfully!")

if __name__ == "__main__":
    import_timetable()

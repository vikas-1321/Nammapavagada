from sqlalchemy import or_, and_
from app.models.location import Location
from app.models.category import Category
from app.models.historical_place import HistoricalPlace
from app.models.hospital import Hospital
from app.models.education import EducationalInstitution
from app.models.theatre import Theatre
from app.models.bus_route import BusRoute
from app.models.bus_stop import BusStop
from app.models.tag import Tag

class SearchService:
    def search_all(self, query: str, limit_per_entity: int = 10) -> dict:
        q_str = (query or "").strip()
        if not q_str:
            return {
                "query": "",
                "locations": [],
                "hospitals": [],
                "schools": [],
                "colleges": [],
                "theatres": [],
                "busRoutes": [],
                "busStops": [],
                "historicalPlaces": [],
                "totalMatches": 0,
            }

        q = f"%{q_str}%"
        tokens = [t.strip() for t in q_str.split() if t.strip()]

        # 1. Locations (CMS places)
        loc_base_query = Location.query.filter(Location.status.in_(["ACTIVE", "PUBLISHED"]))
        
        # Build multi-token matching: each token can match name, category, subcategory, area, tags, or address
        if len(tokens) > 1:
            token_conditions = []
            for tok in tokens:
                tok_pat = f"%{tok}%"
                token_conditions.append(
                    (Location.name.ilike(tok_pat))
                    | (Location.short_name.ilike(tok_pat))
                    | (Location.kannada_name.ilike(tok_pat))
                    | (Location.category_id.ilike(tok_pat))
                    | (Location.category.has(Category.name.ilike(tok_pat)))
                    | (Location.subcategory.ilike(tok_pat))
                    | (Location.area.ilike(tok_pat))
                    | (Location.summary.ilike(tok_pat))
                    | (Location.address.ilike(tok_pat))
                    | (Location.tags_json.ilike(tok_pat))
                    | (Location.tag_objects.any(Tag.name.ilike(tok_pat)))
                )
            locs = loc_base_query.filter(and_(*token_conditions)).limit(limit_per_entity).all()
            # If AND yields fewer results than limit, supplement with OR matches
            if len(locs) < limit_per_entity:
                existing_ids = {l.id for l in locs}
                fallback_locs = loc_base_query.filter(
                    or_(*token_conditions)
                ).limit(limit_per_entity).all()
                for fl in fallback_locs:
                    if fl.id not in existing_ids and len(locs) < limit_per_entity:
                        locs.append(fl)
                        existing_ids.add(fl.id)
        else:
            locs = (
                loc_base_query.filter(
                    (Location.name.ilike(q))
                    | (Location.short_name.ilike(q))
                    | (Location.kannada_name.ilike(q))
                    | (Location.category_id.ilike(q))
                    | (Location.category.has(Category.name.ilike(q)))
                    | (Location.subcategory.ilike(q))
                    | (Location.area.ilike(q))
                    | (Location.summary.ilike(q))
                    | (Location.address.ilike(q))
                    | (Location.tags_json.ilike(q))
                    | (Location.tag_objects.any(Tag.name.ilike(q)))
                )
                .limit(limit_per_entity)
                .all()
            )

        # 2. Hospitals
        hosps = (
            Hospital.query.filter_by(status="ACTIVE")
            .filter(
                (Hospital.name.ilike(q))
                | (Hospital.kannada_name.ilike(q))
                | (Hospital.address.ilike(q))
                | (Hospital.services_json.ilike(q))
            )
            .limit(limit_per_entity)
            .all()
        )

        # 3. Schools & Colleges
        schools = (
            EducationalInstitution.query.filter_by(status="ACTIVE", institution_type="SCHOOL")
            .filter(
                (EducationalInstitution.name.ilike(q))
                | (EducationalInstitution.address.ilike(q))
                | (EducationalInstitution.courses_json.ilike(q))
            )
            .limit(limit_per_entity)
            .all()
        )

        colleges = (
            EducationalInstitution.query.filter_by(status="ACTIVE")
            .filter(EducationalInstitution.institution_type != "SCHOOL")
            .filter(
                (EducationalInstitution.name.ilike(q))
                | (EducationalInstitution.address.ilike(q))
                | (EducationalInstitution.courses_json.ilike(q))
            )
            .limit(limit_per_entity)
            .all()
        )

        # 4. Theatres
        theatres = (
            Theatre.query.filter_by(status="ACTIVE")
            .filter(
                (Theatre.name.ilike(q))
                | (Theatre.address.ilike(q))
                | (Theatre.current_movies_json.ilike(q))
            )
            .limit(limit_per_entity)
            .all()
        )

        # 5. Bus Routes
        routes = (
            BusRoute.query.filter_by(status="ACTIVE")
            .filter(
                (BusRoute.route_code.ilike(q))
                | (BusRoute.source.ilike(q))
                | (BusRoute.destination.ilike(q))
                | (BusRoute.via_json.ilike(q))
            )
            .limit(limit_per_entity)
            .all()
        )

        # 6. Bus Stops
        stops = (
            BusStop.query.filter_by(status="ACTIVE")
            .filter(
                (BusStop.stop_name.ilike(q))
                | (BusStop.location_area.ilike(q))
            )
            .limit(limit_per_entity)
            .all()
        )

        # 7. Historical Places
        places = (
            HistoricalPlace.query.filter_by(status="ACTIVE")
            .filter(
                (HistoricalPlace.name.ilike(q))
                | (HistoricalPlace.description.ilike(q))
            )
            .limit(limit_per_entity)
            .all()
        )

        total = (
            len(locs)
            + len(hosps)
            + len(schools)
            + len(colleges)
            + len(theatres)
            + len(routes)
            + len(stops)
            + len(places)
        )

        return {
            "query": q_str,
            "locations": [l.to_dict() for l in locs],
            "hospitals": [h.to_dict() for h in hosps],
            "schools": [s.to_dict() for s in schools],
            "colleges": [c.to_dict() for c in colleges],
            "theatres": [t.to_dict() for t in theatres],
            "busRoutes": [r.to_dict(include_details=False) for r in routes],
            "busStops": [s.to_dict() for s in stops],
            "historicalPlaces": [p.to_dict() for p in places],
            "totalMatches": total,
        }

search_service = SearchService()

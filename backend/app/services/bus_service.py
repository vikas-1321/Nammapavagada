import re
from app.models.base import db
from app.models.bus_route import BusRoute
from app.models.bus_stop import BusStop
from app.models.route_stop import RouteStop
from app.models.bus_timing import BusTiming
from app.services.audit_service import audit_service

class BusService:
    # --- Routes ---
    def get_routes(self, status: str = "ACTIVE", search_query: str = None, limit: int = 100, offset: int = 0):
        query = BusRoute.query
        if status and status != "ALL":
            query = query.filter_by(status=status)
        if search_query and search_query.strip():
            q = f"%{search_query.strip()}%"
            query = query.filter(
                (BusRoute.route_code.ilike(q))
                | (BusRoute.source.ilike(q))
                | (BusRoute.destination.ilike(q))
                | (BusRoute.operator.ilike(q))
                | (BusRoute.via_json.ilike(q))
            )
        total = query.count()
        routes = query.order_by(BusRoute.route_code.asc()).offset(offset).limit(limit).all()
        return [r.to_dict(include_details=True) for r in routes], total

    def get_route_by_id(self, route_id: str) -> BusRoute:
        route = BusRoute.query.get(route_id)
        if not route:
            raise ValueError(f"Bus route '{route_id}' not found.")
        return route

    def create_route(self, data: dict, admin_email: str, ip: str = "") -> BusRoute:
        source = data.get("source", "").strip()
        dest = data.get("destination", "").strip()
        if not source or not dest:
            raise ValueError("Route source and destination are required.")

        code = data.get("routeCode") or data.get("route_code")
        if not code:
            code = f"PVG-BUS-{BusRoute.query.count() + 1:02d}"

        r_id = data.get("id") or re.sub(r"[^a-zA-Z0-9]+", "-", f"{source}-to-{dest}".lower()).strip("-")
        if BusRoute.query.get(r_id):
            r_id = f"{r_id}-{BusRoute.query.count() + 1}"

        route = BusRoute(
            id=r_id,
            route_code=code,
            source=source,
            destination=dest,
            operator=data.get("operator", "KSRTC"),
            frequency_note=data.get("frequencyNote") or data.get("frequency_note"),
            status_note=data.get("statusNote") or data.get("status_note"),
            is_timetable_live=bool(data.get("isTimetableLive", data.get("is_timetable_live", False))),
            status=data.get("status", "ACTIVE"),
        )
        route.via = data.get("via", [])

        db.session.add(route)
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="CREATE",
            entity_type="BusRoute",
            entity_id=route.id,
            new_values=route.to_dict(include_details=False),
            ip_address=ip,
        )
        return route

    def update_route(self, route_id: str, data: dict, admin_email: str, ip: str = "") -> BusRoute:
        route = self.get_route_by_id(route_id)
        old_val = route.to_dict(include_details=False)

        if "source" in data:
            route.source = data["source"].strip()
        if "destination" in data:
            route.destination = data["destination"].strip()
        if "routeCode" in data or "route_code" in data:
            route.route_code = data.get("routeCode", data.get("route_code"))
        if "operator" in data:
            route.operator = data["operator"]
        if "via" in data:
            route.via = data["via"]
        if "frequencyNote" in data or "frequency_note" in data:
            route.frequency_note = data.get("frequencyNote", data.get("frequency_note"))
        if "statusNote" in data or "status_note" in data:
            route.status_note = data.get("statusNote", data.get("status_note"))
        if "isTimetableLive" in data or "is_timetable_live" in data:
            route.is_timetable_live = bool(data.get("isTimetableLive", data.get("is_timetable_live")))
        if "status" in data:
            route.status = data["status"]

        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="UPDATE",
            entity_type="BusRoute",
            entity_id=route.id,
            old_values=old_val,
            new_values=route.to_dict(include_details=False),
            ip_address=ip,
        )
        return route

    def delete_route(self, route_id: str, admin_email: str, ip: str = ""):
        route = self.get_route_by_id(route_id)
        val = route.to_dict(include_details=False)
        db.session.delete(route)
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="DELETE",
            entity_type="BusRoute",
            entity_id=route_id,
            old_values=val,
            ip_address=ip,
        )
        return True

    # --- Stops ---
    def get_stops(self, search_query: str = None, status: str = "ACTIVE"):
        query = BusStop.query
        if status and status != "ALL":
            query = query.filter_by(status=status)
        if search_query and search_query.strip():
            q = f"%{search_query.strip()}%"
            query = query.filter(
                (BusStop.stop_name.ilike(q))
                | (BusStop.location_area.ilike(q))
            )
        stops = query.order_by(BusStop.stop_name.asc()).all()
        return [s.to_dict() for s in stops]

    def create_stop(self, data: dict, admin_email: str, ip: str = "") -> BusStop:
        name = data.get("stopName") or data.get("stop_name")
        if not name or not name.strip():
            raise ValueError("Stop name is required.")

        s_id = data.get("id") or f"stop-{re.sub(r'[^a-zA-Z0-9]+', '-', name.lower()).strip('-')}"
        if BusStop.query.get(s_id):
            s_id = f"{s_id}-{BusStop.query.count() + 1}"

        stop = BusStop(
            id=s_id,
            stop_name=name.strip(),
            kannada_name=data.get("kannadaName") or data.get("kannada_name"),
            location_area=data.get("locationArea") or data.get("location_area"),
            latitude=float(data["latitude"]) if data.get("latitude") is not None else None,
            longitude=float(data["longitude"]) if data.get("longitude") is not None else None,
            description=data.get("description"),
            status=data.get("status", "ACTIVE"),
        )
        db.session.add(stop)
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="CREATE",
            entity_type="BusStop",
            entity_id=stop.id,
            new_values=stop.to_dict(),
            ip_address=ip,
        )
        return stop

    def update_stop(self, stop_id: str, data: dict, admin_email: str, ip: str = "") -> BusStop:
        stop = BusStop.query.get(stop_id)
        if not stop:
            raise ValueError(f"Bus stop '{stop_id}' not found.")
        old_val = stop.to_dict()

        if "stopName" in data or "stop_name" in data:
            stop.stop_name = (data.get("stopName") or data.get("stop_name")).strip()
        if "kannadaName" in data or "kannada_name" in data:
            stop.kannada_name = data.get("kannadaName", data.get("kannada_name"))
        if "locationArea" in data or "location_area" in data:
            stop.location_area = data.get("locationArea", data.get("location_area"))
        if "latitude" in data and data["latitude"] is not None:
            stop.latitude = float(data["latitude"])
        if "longitude" in data and data["longitude"] is not None:
            stop.longitude = float(data["longitude"])
        if "description" in data:
            stop.description = data.get("description")
        if "status" in data:
            stop.status = data.get("status")

        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="UPDATE",
            entity_type="BusStop",
            entity_id=stop.id,
            old_values=old_val,
            new_values=stop.to_dict(),
            ip_address=ip,
        )
        return stop

    # --- Route Stops Ordering ---
    def add_stop_to_route(self, route_id: str, stop_id: str, sequence: int = None, is_major: bool = False, estimate_mins: int = None, admin_email: str = "", ip: str = ""):
        route = self.get_route_by_id(route_id)
        stop = BusStop.query.get(stop_id)
        if not stop:
            raise ValueError(f"Stop '{stop_id}' does not exist.")

        if sequence is None:
            max_seq = db.session.query(db.func.max(RouteStop.stop_sequence)).filter_by(route_id=route_id).scalar() or 0
            sequence = max_seq + 1

        route_stop = RouteStop(
            route_id=route.id,
            stop_id=stop.id,
            stop_sequence=sequence,
            is_major_stop=is_major,
            arrival_estimate_minutes=estimate_mins,
        )
        db.session.add(route_stop)
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="UPDATE",
            entity_type="BusRoute",
            entity_id=route.id,
            new_values={"added_stop": stop.stop_name, "sequence": sequence},
            ip_address=ip,
        )
        return route_stop

    def remove_stop_from_route(self, route_id: str, stop_id: str, admin_email: str, ip: str = ""):
        route = self.get_route_by_id(route_id)
        rs = RouteStop.query.filter_by(route_id=route_id, stop_id=stop_id).first()
        if not rs:
            raise ValueError(f"Stop '{stop_id}' is not linked to route '{route_id}'.")

        stop_name = rs.stop.stop_name if rs.stop else stop_id
        db.session.delete(rs)
        db.session.commit()

        # Re-sequence remaining stops contiguously
        remaining = RouteStop.query.filter_by(route_id=route_id).order_by(RouteStop.stop_sequence.asc()).all()
        for idx, r in enumerate(remaining, start=1):
            r.stop_sequence = idx
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="UPDATE",
            entity_type="BusRoute",
            entity_id=route.id,
            new_values={"removed_stop": stop_name},
            ip_address=ip,
        )
        return route.to_dict(include_details=True)

    def update_route_stop(self, route_id: str, stop_id: str, data: dict, admin_email: str, ip: str = ""):
        route = self.get_route_by_id(route_id)
        rs = RouteStop.query.filter_by(route_id=route_id, stop_id=stop_id).first()
        if not rs:
            raise ValueError(f"Stop '{stop_id}' is not linked to route '{route_id}'.")

        if "isMajorStop" in data or "is_major" in data:
            rs.is_major_stop = bool(data.get("isMajorStop", data.get("is_major")))
        if "sequence" in data or "stopSequence" in data:
            rs.stop_sequence = int(data.get("sequence", data.get("stopSequence")))
        if "arrivalEstimateMinutes" in data or "estimate_mins" in data:
            val = data.get("arrivalEstimateMinutes", data.get("estimate_mins"))
            rs.arrival_estimate_minutes = int(val) if val is not None else None

        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="UPDATE",
            entity_type="BusRoute",
            entity_id=route.id,
            new_values={"updated_stop": rs.stop.stop_name if rs.stop else stop_id},
            ip_address=ip,
        )
        return route.to_dict(include_details=True)

    def reorder_route_stops(self, route_id: str, stop_ids_in_order: list, admin_email: str, ip: str = ""):
        route = self.get_route_by_id(route_id)
        for idx, stop_id in enumerate(stop_ids_in_order, start=1):
            rs = RouteStop.query.filter_by(route_id=route_id, stop_id=stop_id).first()
            if rs:
                rs.stop_sequence = idx
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="UPDATE",
            entity_type="BusRoute",
            entity_id=route.id,
            new_values={"reordered_stops": stop_ids_in_order},
            ip_address=ip,
        )
        return route.to_dict(include_details=True)

    # --- Bus Timings ---
    def add_timing(self, route_id: str, data: dict, admin_email: str, ip: str = "") -> BusTiming:
        route = self.get_route_by_id(route_id)
        dep_time = data.get("departureTime") or data.get("departure_time")
        if not dep_time:
            raise ValueError("Departure time is required.")

        timing = BusTiming(
            route_id=route.id,
            stop_id=data.get("stopId") or data.get("stop_id"),
            departure_time=dep_time,
            arrival_time=data.get("arrivalTime") or data.get("arrival_time"),
            day_type=data.get("dayType") or data.get("day_type", "DAILY"),
            bus_type=data.get("busType") or data.get("bus_type", "ORDINARY"),
            remarks=data.get("remarks"),
            status=data.get("status", "ACTIVE"),
        )
        db.session.add(timing)
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="CREATE",
            entity_type="BusTiming",
            entity_id=str(timing.id),
            new_values=timing.to_dict(),
            ip_address=ip,
        )
        return timing

    def delete_timing(self, timing_id: int, admin_email: str, ip: str = ""):
        timing = BusTiming.query.get(timing_id)
        if not timing:
            raise ValueError(f"Timing '{timing_id}' not found.")
        val = timing.to_dict()
        db.session.delete(timing)
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="DELETE",
            entity_type="BusTiming",
            entity_id=str(timing_id),
            old_values=val,
            ip_address=ip,
        )
        return True

bus_service = BusService()

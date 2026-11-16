import re
from datetime import datetime, timezone, timedelta
from app.models.base import db
from app.models.bus_route import BusRoute
from app.models.bus_stop import BusStop
from app.models.route_stop import RouteStop
from app.models.bus_timing import BusTiming
from app.services.audit_service import audit_service

IST = timezone(timedelta(hours=5, minutes=30))

def normalize_destination(dest: str) -> str:
    if not dest:
        return ""
    cleaned = dest.strip()
    if re.search(r"^Bengaluru(\s*\(.*\))?$", cleaned, re.IGNORECASE):
        return "Bengaluru"
    if re.search(r"^Tumaku?ru?(\s*.*)?$", cleaned, re.IGNORECASE):
        return "Tumakuru"
    cleaned = re.sub(
        r"\s*(Central Bus Stand|Bus Station|Bus Stand|KSRTC.*)$",
        "",
        cleaned,
        flags=re.IGNORECASE,
    ).strip()
    return cleaned

def parse_time_to_minutes(time_str: str) -> int:
    if not time_str:
        return 9999
    m = re.match(r"^(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?$", time_str.strip())
    if not m:
        return 9999
    h, mins = int(m.group(1)), int(m.group(2))
    mer = m.group(3)
    if mer:
        if mer.upper() == "PM" and h < 12:
            h += 12
        elif mer.upper() == "AM" and h == 12:
            h = 0
    return h * 60 + mins

def format_minutes_to_12h(mins: int) -> str:
    h24 = (mins // 60) % 24
    m = mins % 60
    meridiem = "PM" if h24 >= 12 else "AM"
    h12 = 12 if (h24 % 12 == 0) else (h24 % 12)
    return f"{h12:02d}:{m:02d} {meridiem}"

def is_departing_route(route: BusRoute) -> bool:
    if route.route_classification == "PASSING_THROUGH":
        return False
    if route.route_classification == "DEPARTING":
        return True
    return "pavagada" in (route.source or "").lower()

class BusService:
    # --- Routes ---
    def get_routes(self, status: str = "ACTIVE", search_query: str = None, limit: int = 100, offset: int = 0, sort_by_demand: bool = True):
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
        routes = query.all()

        if sort_by_demand:
            # 1. Destination demand among departing routes (total scheduled departures per destination)
            dest_demand = {}
            for r in routes:
                if is_departing_route(r):
                    nd = normalize_destination(r.destination)
                    dest_demand[nd] = dest_demand.get(nd, 0) + len(r.timings)

            # 2. Sort key:
            # Priority 0: DEPARTING (highest destination demand first, destination name ASC tie-break)
            # Priority 1: PASSING_THROUGH (destination ASC, earliest departure ASC)
            def route_sort_key(r):
                is_dep = is_departing_route(r)
                priority = 0 if is_dep else 1
                nd = normalize_destination(r.destination)
                demand = dest_demand.get(nd, 0) if is_dep else 0
                earliest_t = min([parse_time_to_minutes(t.departure_time) for t in r.timings] or [9999])
                return (priority, -demand, nd, earliest_t, r.route_code)

            routes.sort(key=route_sort_key)
        else:
            routes.sort(key=lambda r: r.route_code)

        paged_routes = routes[offset:offset + limit]
        return [r.to_dict(include_details=True) for r in paged_routes], total

    def get_grouped_schedule(self, status: str = "ACTIVE", service_type: str = None, search_query: str = None):
        """
        Grouped schedule returned for passengers:
        - Priority 1: Departing from Pavagada, grouped by destination ranked by scheduled departure count DESC
        - Priority 2: Passing through Pavagada, clearly designated
        """
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
        routes = query.all()

        departing_routes = []
        passing_routes = []
        for r in routes:
            if is_departing_route(r):
                departing_routes.append(r)
            else:
                passing_routes.append(r)

        st_filter = (service_type or "").upper().strip()

        # Group departing routes by normalized destination
        groups = {}
        for r in departing_routes:
            nd = normalize_destination(r.destination)
            if nd not in groups:
                groups[nd] = {
                    "destination": nd,
                    "routes": [],
                    "allTimings": [],
                }

            matching_timings = []
            for t in r.timings:
                sc = (t.service_class or t.bus_type or "").upper()
                if st_filter:
                    if st_filter in ("NON_STOP", "NON-STOP", "NONSTOP") and ("NON-STOP" in sc or "NONSTOP" in sc):
                        matching_timings.append(t)
                    elif st_filter == "EXPRESS" and "EXPRESS" in sc:
                        matching_timings.append(t)
                    elif st_filter == "ORDINARY" and ("ORDINARY" in sc or not sc):
                        matching_timings.append(t)
                    elif st_filter in sc:
                        matching_timings.append(t)
                else:
                    matching_timings.append(t)

            if not st_filter or matching_timings:
                r_dict = r.to_dict(include_details=True)
                if st_filter:
                    r_dict["timings"] = [t.to_dict() for t in matching_timings]
                groups[nd]["routes"].append(r_dict)
                for t in matching_timings:
                    t_dict = t.to_dict()
                    t_dict["routeCode"] = r.route_code
                    t_dict["routeSource"] = r.source
                    t_dict["routeDestination"] = r.destination
                    t_dict["operator"] = r.operator
                    t_dict["via"] = r.via
                    t_dict["minutes"] = parse_time_to_minutes(t.departure_time)
                    groups[nd]["allTimings"].append(t_dict)

        dest_list = []
        for nd, g in groups.items():
            g["allTimings"].sort(key=lambda t: t["minutes"])
            dest_list.append({
                "destination": nd,
                "totalDepartures": len(g["allTimings"]),
                "routesCount": len(g["routes"]),
                "routes": g["routes"],
                "timings": g["allTimings"],
            })

        # Sort destination groups by total scheduled departures DESC, then destination name ASC
        dest_list.sort(key=lambda x: (-x["totalDepartures"], x["destination"]))

        # Passing through routes
        passing_list = []
        for r in passing_routes:
            matching_timings = []
            for t in r.timings:
                sc = (t.service_class or t.bus_type or "").upper()
                if st_filter:
                    if st_filter in ("NON_STOP", "NON-STOP", "NONSTOP") and ("NON-STOP" in sc or "NONSTOP" in sc):
                        matching_timings.append(t)
                    elif st_filter == "EXPRESS" and "EXPRESS" in sc:
                        matching_timings.append(t)
                    elif st_filter == "ORDINARY" and ("ORDINARY" in sc or not sc):
                        matching_timings.append(t)
                    elif st_filter in sc:
                        matching_timings.append(t)
                else:
                    matching_timings.append(t)

            if not st_filter or matching_timings:
                r_dict = r.to_dict(include_details=True)
                if st_filter:
                    r_dict["timings"] = [t.to_dict() for t in matching_timings]
                r_dict["isPassing"] = True
                r_dict["sourceOrigin"] = r.source
                r_dict["timingNote"] = f"Source-recorded departure from {r.source}. Pavagada stop time subject to highway traffic."
                passing_list.append(r_dict)

        total_deps = sum(d["totalDepartures"] for d in dest_list) + sum(len(r["timings"]) for r in passing_list)

        return {
            "summary": {
                "totalDepartures": total_deps,
                "departingDepartures": sum(d["totalDepartures"] for d in dest_list),
                "passingDepartures": sum(len(r["timings"]) for r in passing_list),
                "totalRoutes": len(departing_routes) + len(passing_routes),
                "departingRoutes": len(departing_routes),
                "passingRoutes": len(passing_routes),
                "destinationsCount": len(dest_list),
            },
            "destinations": dest_list,
            "passingRoutes": passing_list,
        }

    def get_next_departures(self, destination: str = None, limit: int = 5):
        """
        Calculate next available departures from Pavagada using local time (Asia/Kolkata).
        """
        now_ist = datetime.now(IST)
        current_mins = now_ist.hour * 60 + now_ist.minute

        routes = BusRoute.query.filter_by(status="ACTIVE").all()
        dep_routes = [r for r in routes if is_departing_route(r)]

        dest_totals = {}
        dest_timings_map = {}
        for r in dep_routes:
            nd = normalize_destination(r.destination)
            if nd not in dest_totals:
                dest_totals[nd] = 0
                dest_timings_map[nd] = []
            dest_totals[nd] += len(r.timings)
            for t in r.timings:
                tm = parse_time_to_minutes(t.departure_time)
                dest_timings_map[nd].append({
                    "id": t.id,
                    "departureTime": t.departure_time,
                    "formattedTime": format_minutes_to_12h(tm),
                    "minutes": tm,
                    "serviceClass": t.service_class or t.bus_type or "Ordinary",
                    "busType": (t.bus_type or t.service_class or "ORDINARY").upper(),
                    "operator": r.operator or "KSRTC",
                    "routeCode": r.route_code,
                    "source": r.source,
                    "destination": r.destination,
                    "via": " • ".join(r.via) if r.via else (t.via_place or "Madhugiri"),
                })

        popular_destinations = sorted(
            [{"destination": k, "totalDepartures": v} for k, v in dest_totals.items()],
            key=lambda x: (-x["totalDepartures"], x["destination"])
        )

        target_dest = None
        if destination and destination.strip():
            raw_target = destination.strip()
            norm_target = normalize_destination(raw_target)
            for p in popular_destinations:
                if p["destination"].lower() == norm_target.lower() or p["destination"].lower() == raw_target.lower():
                    target_dest = p["destination"]
                    break
            if not target_dest:
                target_dest = norm_target
        elif popular_destinations:
            target_dest = popular_destinations[0]["destination"]
        else:
            target_dest = "Bengaluru"

        all_timings = dest_timings_map.get(target_dest, [])
        all_timings.sort(key=lambda x: x["minutes"])

        upcoming = [t for t in all_timings if t["minutes"] > current_mins]
        if upcoming:
            next_dep = upcoming[0]
            mins_until = next_dep["minutes"] - current_mins
            upcoming_today = upcoming[1:limit + 1]
            has_more_today = True
            first_tomorrow = None
        else:
            next_dep = None
            mins_until = None
            upcoming_today = []
            has_more_today = False
            first_tomorrow = all_timings[0] if all_timings else None

        return {
            "destination": target_dest,
            "currentTimeIst": now_ist.strftime("%H:%M"),
            "currentTimeFormatted": now_ist.strftime("%I:%M %p"),
            "currentMinutes": current_mins,
            "nextDeparture": next_dep,
            "minutesUntil": mins_until,
            "upcomingToday": upcoming_today,
            "hasMoreToday": has_more_today,
            "firstTomorrow": first_tomorrow,
            "totalDepartures": len(all_timings),
            "popularDestinations": popular_destinations[:8],
        }

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

        r_class = data.get("routeClassification") or data.get("route_classification")
        if not r_class:
            r_class = "DEPARTING" if "pavagada" in source.lower() else "PASSING_THROUGH"

        route = BusRoute(
            id=r_id,
            route_code=code,
            source=source,
            destination=dest,
            operator=data.get("operator", "KSRTC"),
            frequency_note=data.get("frequencyNote") or data.get("frequency_note"),
            status_note=data.get("statusNote") or data.get("status_note"),
            is_timetable_live=bool(data.get("isTimetableLive", data.get("is_timetable_live", False))),
            route_classification=r_class,
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
        if "routeClassification" in data or "route_classification" in data:
            route.route_classification = data.get("routeClassification", data.get("route_classification"))

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
    def get_timings(self, route_id: str = None, route_classification: str = None, verification_status: str = None, search_query: str = None, limit: int = 300, offset: int = 0):
        query = BusTiming.query
        if route_id:
            query = query.filter_by(route_id=route_id)
        if route_classification and route_classification != "ALL":
            query = query.filter_by(route_classification=route_classification)
        if verification_status and verification_status != "ALL":
            query = query.filter_by(verification_status=verification_status)
        if search_query and search_query.strip():
            q = f"%{search_query.strip()}%"
            query = query.filter(
                (BusTiming.source_origin.ilike(q))
                | (BusTiming.source_destination.ilike(q))
                | (BusTiming.via_place.ilike(q))
                | (BusTiming.service_class.ilike(q))
                | (BusTiming.departure_time.ilike(q))
            )
        total = query.count()
        timings = query.order_by(
            BusTiming.serial_number.asc().nullslast(),
            BusTiming.departure_time.asc()
        ).offset(offset).limit(limit).all()
        return [t.to_dict() for t in timings], total

    def add_timing(self, route_id: str, data: dict, admin_email: str, ip: str = "") -> BusTiming:
        route = self.get_route_by_id(route_id)
        dep_time = data.get("departureTime") or data.get("departure_time")
        if not dep_time:
            raise ValueError("Departure time is required.")

        s_class = data.get("serviceClass") or data.get("service_class")
        b_type = data.get("busType") or data.get("bus_type")
        if not b_type and s_class:
            b_type = s_class.upper()
        elif not b_type:
            b_type = "ORDINARY"

        timing = BusTiming(
            route_id=route.id,
            stop_id=data.get("stopId") or data.get("stop_id"),
            departure_time=dep_time,
            arrival_time=data.get("arrivalTime") or data.get("arrival_time"),
            day_type=data.get("dayType") or data.get("day_type", "DAILY"),
            bus_type=b_type,
            serial_number=data.get("serialNumber") or data.get("serial_number"),
            source_origin=data.get("sourceOrigin") or data.get("source_origin") or route.source,
            source_destination=data.get("sourceDestination") or data.get("source_destination") or route.destination,
            service_class=s_class or "Ordinary",
            via_place=data.get("viaPlace") or data.get("via_place"),
            source_doc=data.get("sourceDoc") or data.get("source_doc", "Pavagada.pdf"),
            source_page=data.get("sourcePage") or data.get("source_page"),
            route_classification=data.get("routeClassification") or data.get("route_classification", "DEPARTING"),
            verification_status=data.get("verificationStatus") or data.get("verification_status", "OFFICIAL_TIMETABLE"),
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

    def update_timing(self, timing_id: int, data: dict, admin_email: str, ip: str = "") -> BusTiming:
        timing = BusTiming.query.get(timing_id)
        if not timing:
            raise ValueError(f"Timing '{timing_id}' not found.")
        old_val = timing.to_dict()

        if "departureTime" in data or "departure_time" in data:
            timing.departure_time = data.get("departureTime", data.get("departure_time"))
        if "arrivalTime" in data or "arrival_time" in data:
            timing.arrival_time = data.get("arrivalTime", data.get("arrival_time"))
        if "dayType" in data or "day_type" in data:
            timing.day_type = data.get("dayType", data.get("day_type"))
        if "busType" in data or "bus_type" in data:
            timing.bus_type = data.get("busType", data.get("bus_type"))
        if "serialNumber" in data or "serial_number" in data:
            timing.serial_number = data.get("serialNumber", data.get("serial_number"))
        if "sourceOrigin" in data or "source_origin" in data:
            timing.source_origin = data.get("sourceOrigin", data.get("source_origin"))
        if "sourceDestination" in data or "source_destination" in data:
            timing.source_destination = data.get("sourceDestination", data.get("source_destination"))
        if "serviceClass" in data or "service_class" in data:
            timing.service_class = data.get("serviceClass", data.get("service_class"))
        if "viaPlace" in data or "via_place" in data:
            timing.via_place = data.get("viaPlace", data.get("via_place"))
        if "routeClassification" in data or "route_classification" in data:
            timing.route_classification = data.get("routeClassification", data.get("route_classification"))
        if "verificationStatus" in data or "verification_status" in data:
            timing.verification_status = data.get("verificationStatus", data.get("verification_status"))
        if "remarks" in data:
            timing.remarks = data["remarks"]
        if "status" in data:
            timing.status = data["status"]

        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="UPDATE",
            entity_type="BusTiming",
            entity_id=str(timing.id),
            old_values=old_val,
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

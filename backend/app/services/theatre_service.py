import re
from app.models.base import db
from app.models.theatre import Theatre
from app.services.audit_service import audit_service

class TheatreService:
    def get_theatres(self, status: str = "ACTIVE", search_query: str = None):
        query = Theatre.query
        if status and status != "ALL":
            query = query.filter_by(status=status)
        if search_query and search_query.strip():
            q = f"%{search_query.strip()}%"
            query = query.filter(
                (Theatre.name.ilike(q))
                | (Theatre.address.ilike(q))
                | (Theatre.current_movies_json.ilike(q))
            )
        theatres = query.order_by(Theatre.name.asc()).all()
        return [t.to_dict() for t in theatres]

    def get_theatre_by_id(self, theatre_id: str) -> Theatre:
        t = Theatre.query.get(theatre_id)
        if not t:
            raise ValueError(f"Theatre '{theatre_id}' not found.")
        return t

    def create_theatre(self, data: dict, admin_email: str, ip: str = "") -> Theatre:
        name = data.get("name", "").strip()
        if not name:
            raise ValueError("Theatre name is required.")

        t_id = data.get("id") or f"theatre-{re.sub(r'[^a-zA-Z0-9]+', '-', name.lower()).strip('-')}"
        if Theatre.query.get(t_id):
            t_id = f"{t_id}-{Theatre.query.count() + 1}"

        theatre = Theatre(
            id=t_id,
            name=name,
            kannada_name=data.get("kannadaName") or data.get("kannada_name"),
            address=data.get("address", "Pavagada, Karnataka"),
            latitude=float(data["latitude"]) if data.get("latitude") is not None else None,
            longitude=float(data["longitude"]) if data.get("longitude") is not None else None,
            phone=data.get("phone"),
            website=data.get("website"),
            screens_count=int(data.get("screensCount") or data.get("screens_count", 1)),
            primary_photo_url=data.get("primaryPhotoUrl") or data.get("primary_photo_url"),
            status=data.get("status", "ACTIVE"),
        )
        theatre.current_movies = data.get("currentMovies", data.get("current_movies", []))
        theatre.show_timings = data.get("showTimings", data.get("show_timings", []))
        theatre.ticket_info = data.get("ticketInfo", data.get("ticket_info", {}))

        db.session.add(theatre)
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="CREATE",
            entity_type="Theatre",
            entity_id=theatre.id,
            new_values=theatre.to_dict(),
            ip_address=ip,
        )
        return theatre

    def update_theatre(self, theatre_id: str, data: dict, admin_email: str, ip: str = "") -> Theatre:
        theatre = self.get_theatre_by_id(theatre_id)
        old_val = theatre.to_dict()

        if "name" in data:
            theatre.name = data["name"].strip()
        if "kannadaName" in data or "kannada_name" in data:
            theatre.kannada_name = data.get("kannadaName", data.get("kannada_name"))
        if "address" in data:
            theatre.address = data["address"]
        if "latitude" in data and data["latitude"] is not None:
            theatre.latitude = float(data["latitude"])
        if "longitude" in data and data["longitude"] is not None:
            theatre.longitude = float(data["longitude"])
        if "phone" in data:
            theatre.phone = data["phone"]
        if "website" in data:
            theatre.website = data["website"]
        if "screensCount" in data or "screens_count" in data:
            theatre.screens_count = int(data.get("screensCount", data.get("screens_count", 1)))
        if "currentMovies" in data or "current_movies" in data:
            theatre.current_movies = data.get("currentMovies", data.get("current_movies", []))
        if "showTimings" in data or "show_timings" in data:
            theatre.show_timings = data.get("showTimings", data.get("show_timings", []))
        if "ticketInfo" in data or "ticket_info" in data:
            theatre.ticket_info = data.get("ticketInfo", data.get("ticket_info", {}))
        if "primaryPhotoUrl" in data or "primary_photo_url" in data:
            theatre.primary_photo_url = data.get("primaryPhotoUrl", data.get("primary_photo_url"))
        if "status" in data:
            theatre.status = data["status"]

        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="UPDATE",
            entity_type="Theatre",
            entity_id=theatre.id,
            old_values=old_val,
            new_values=theatre.to_dict(),
            ip_address=ip,
        )
        return theatre

theatre_service = TheatreService()

from app.models.base import db
from app.models.history_era import HistoryEra
from app.models.historical_place import HistoricalPlace
from app.services.audit_service import audit_service

class HistoryService:
    def get_eras(self, status: str = "ACTIVE"):
        query = HistoryEra.query
        if status and status != "ALL":
            query = query.filter_by(status=status)
        eras = query.order_by(HistoryEra.display_order.asc()).all()
        return [e.to_dict() for e in eras]

    def get_era_by_id(self, era_id: str) -> HistoryEra:
        era = HistoryEra.query.get(era_id)
        if not era:
            raise ValueError(f"Historical era '{era_id}' not found.")
        return era

    def create_era(self, data: dict, admin_email: str, ip: str = "") -> HistoryEra:
        name = data.get("eraName") or data.get("era_name")
        time_range = data.get("timeRange") or data.get("time_range")
        if not name or not time_range:
            raise ValueError("Era name and time range are required.")

        summary = data.get("summary")
        if not summary:
            raise ValueError("Summary of the historical era is required.")

        # Historical integrity check
        pdf_evidence = data.get("pdfEvidence") or data.get("pdf_evidence")
        if not pdf_evidence:
            pdf_evidence = "Refer to authentic primary sources / survey documents"

        e_id = data.get("id") or name.lower().replace(" ", "-")[:40]
        era = HistoryEra(
            id=e_id,
            era_name=name,
            kannada_title=data.get("kannadaTitle") or data.get("kannada_title"),
            time_range=time_range,
            summary=summary,
            pdf_evidence=pdf_evidence,
            display_order=int(data.get("displayOrder") or data.get("display_order", 0)),
            status=data.get("status", "ACTIVE"),
        )
        era.primary_rulers = data.get("primaryRulers", data.get("primary_rulers", []))
        era.key_events = data.get("keyEvents", data.get("key_events", []))

        db.session.add(era)
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="CREATE",
            entity_type="HistoryEra",
            entity_id=era.id,
            new_values=era.to_dict(),
            ip_address=ip,
        )
        return era

    def update_era(self, era_id: str, data: dict, admin_email: str, ip: str = "") -> HistoryEra:
        era = self.get_era_by_id(era_id)
        old_val = era.to_dict()

        if "eraName" in data or "era_name" in data:
            era.era_name = data.get("eraName", data.get("era_name"))
        if "kannadaTitle" in data or "kannada_title" in data:
            era.kannada_title = data.get("kannadaTitle", data.get("kannada_title"))
        if "timeRange" in data or "time_range" in data:
            era.time_range = data.get("timeRange", data.get("time_range"))
        if "summary" in data:
            era.summary = data["summary"]
        if "pdfEvidence" in data or "pdf_evidence" in data:
            era.pdf_evidence = data.get("pdfEvidence", data.get("pdf_evidence"))
        if "primaryRulers" in data or "primary_rulers" in data:
            era.primary_rulers = data.get("primaryRulers", data.get("primary_rulers", []))
        if "keyEvents" in data or "key_events" in data:
            era.key_events = data.get("keyEvents", data.get("key_events", []))
        if "displayOrder" in data or "display_order" in data:
            era.display_order = int(data.get("displayOrder", data.get("display_order", 0)))
        if "status" in data:
            era.status = data["status"]

        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="UPDATE",
            entity_type="HistoryEra",
            entity_id=era.id,
            old_values=old_val,
            new_values=era.to_dict(),
            ip_address=ip,
        )
        return era

    # --- Historical Places & Monuments ---
    def get_places(self, classification: str = None, status: str = "ACTIVE"):
        query = HistoricalPlace.query
        if status and status != "ALL":
            query = query.filter_by(status=status)
        if classification and classification != "ALL":
            query = query.filter_by(classification=classification)
        places = query.all()
        return [p.to_dict() for p in places]

    def create_place(self, data: dict, admin_email: str, ip: str = "") -> HistoricalPlace:
        name = data.get("name", "").strip()
        if not name:
            raise ValueError("Place/Structure name is required.")

        p_id = data.get("id") or name.lower().replace(" ", "-")[:40]
        place = HistoricalPlace(
            id=p_id,
            name=name,
            kannada_name=data.get("kannadaName") or data.get("kannada_name"),
            era_id=data.get("eraId") or data.get("era_id"),
            classification=data.get("classification", "DEFENSE"),
            description=data.get("description", ""),
            pdf_source=data.get("pdfSource") or data.get("pdf_source", "Survey records"),
            latitude=float(data["latitude"]) if data.get("latitude") is not None else None,
            longitude=float(data["longitude"]) if data.get("longitude") is not None else None,
            elevation_meters=data.get("elevationMeters") or data.get("elevation_meters"),
            primary_photo_url=data.get("primaryPhotoUrl") or data.get("primary_photo_url"),
            status=data.get("status", "ACTIVE"),
        )
        db.session.add(place)
        db.session.commit()

        audit_service.log_action(
            admin_email=admin_email,
            action="CREATE",
            entity_type="HistoricalPlace",
            entity_id=place.id,
            new_values=place.to_dict(),
            ip_address=ip,
        )
        return place

history_service = HistoryService()

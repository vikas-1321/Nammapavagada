from app.models.base import db
from app.models.audit_log import AuditLog

class AuditService:
    @staticmethod
    def log_action(
        admin_email: str,
        action: str,
        entity_type: str,
        entity_id: str,
        admin_id: int = None,
        old_values: dict = None,
        new_values: dict = None,
        ip_address: str = "",
    ):
        try:
            log = AuditLog(
                admin_id=admin_id,
                admin_email=admin_email or "system",
                action=action,
                entity_type=entity_type,
                entity_id=str(entity_id),
                previous_value=old_values,
                new_value=new_values,
                ip_address=ip_address,
            )
            db.session.add(log)
            db.session.commit()
            return log
        except Exception as e:
            print(f"[AuditService] Warning: Failed to record audit log: {e}")
            db.session.rollback()
            return None

    @staticmethod
    def get_logs(entity_type: str = None, entity_id: str = None, limit: int = 100, offset: int = 0):
        query = AuditLog.query.order_by(AuditLog.timestamp.desc())
        if entity_type:
            query = query.filter_by(entity_type=entity_type)
        if entity_id:
            query = query.filter_by(entity_id=str(entity_id))
        total = query.count()
        logs = query.offset(offset).limit(limit).all()
        return [log.to_dict() for log in logs], total

audit_service = AuditService()

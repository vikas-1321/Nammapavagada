import re
from datetime import datetime, timedelta
from sqlalchemy import or_, func
from app.models.base import db
from app.models.feedback import Feedback
from app.services.audit_service import audit_service

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

class FeedbackService:
    @staticmethod
    def submit_feedback(data: dict, ip_address: str = "", user_agent: str = ""):
        """
        Validate and persist visitor feedback.
        Returns: (feedback_obj, error_message, status_code)
        """
        # 1. Honeypot check (spam bots commonly fill invisible fields)
        honeypot = data.get("hp") or data.get("website_hp") or data.get("honeypot")
        if honeypot and str(honeypot).strip():
            # Return pseudo-success to waste bot resources without persisting spam
            return {"id": "fb_spamprevented"}, None, 200

        # 2. Rate limiting: Max 5 submissions per IP every 5 minutes
        if ip_address:
            five_mins_ago = datetime.utcnow() - timedelta(minutes=5)
            recent_count = Feedback.query.filter(
                Feedback.ip_address == ip_address,
                Feedback.created_at >= five_mins_ago
            ).count()
            if recent_count >= 5:
                return None, "You are submitting feedback too quickly. Please wait a few minutes before trying again.", 429

        # 3. Category validation
        category = (data.get("category") or "").strip().upper()
        if not category or category not in Feedback.VALID_CATEGORIES:
            return None, f"Invalid feedback category. Permitted: {', '.join(Feedback.VALID_CATEGORIES.keys())}", 400

        # 4. Message validation
        message = (data.get("message") or "").strip()
        if not message:
            return None, "Feedback message is required.", 400
        if len(message) < 10:
            return None, "Please provide a little more detail in your feedback (minimum 10 characters).", 400
        if len(message) > 3000:
            return None, "Feedback message exceeds the maximum allowed length of 3,000 characters.", 400

        # 5. Duplicate check: Same message from same IP in the last 60 seconds
        if ip_address:
            one_min_ago = datetime.utcnow() - timedelta(seconds=60)
            duplicate = Feedback.query.filter(
                Feedback.ip_address == ip_address,
                Feedback.message == message,
                Feedback.created_at >= one_min_ago
            ).first()
            if duplicate:
                return duplicate, None, 200

        # 6. Optional email validation
        email = (data.get("email") or "").strip()
        if email:
            if len(email) > 150:
                return None, "Email address is too long (maximum 150 characters).", 400
            if not EMAIL_REGEX.match(email):
                return None, "Please enter a valid email address.", 400
        else:
            email = None

        # 7. Optional name validation
        name = (data.get("name") or "").strip()
        if name and len(name) > 120:
            name = name[:120]
        elif not name:
            name = None

        # 8. Page path
        page_path = (data.get("pagePath") or data.get("page_path") or "/").strip()
        if len(page_path) > 300:
            page_path = page_path[:300]

        # 9. Contextual entity linkage
        related_entity_type = (data.get("relatedEntityType") or data.get("related_entity_type") or "").strip()
        if related_entity_type:
            related_entity_type = related_entity_type[:80].upper()
        else:
            related_entity_type = None

        related_entity_id = (data.get("relatedEntityId") or data.get("related_entity_id") or "").strip()
        if related_entity_id:
            related_entity_id = related_entity_id[:100]
        else:
            related_entity_id = None

        related_entity_name = (data.get("relatedEntityName") or data.get("related_entity_name") or "").strip()
        if related_entity_name:
            related_entity_name = related_entity_name[:200]
        else:
            related_entity_name = None

        # 10. Persist
        try:
            feedback = Feedback(
                name=name,
                email=email,
                category=category,
                message=message,
                page_path=page_path,
                related_entity_type=related_entity_type,
                related_entity_id=related_entity_id,
                related_entity_name=related_entity_name,
                status="PENDING",
                ip_address=ip_address[:60] if ip_address else None,
                user_agent=user_agent[:255] if user_agent else None,
            )
            db.session.add(feedback)
            db.session.commit()
            return feedback, None, 201
        except Exception as e:
            db.session.rollback()
            return None, f"Database persistence failure: {str(e)}", 500

    @staticmethod
    def get_feedback_list(
        page: int = 1,
        limit: int = 20,
        status: str = None,
        category: str = None,
        search: str = None,
        start_date: str = None,
        end_date: str = None,
    ):
        query = Feedback.query

        if status and status.upper() in Feedback.VALID_STATUSES:
            query = query.filter(Feedback.status == status.upper())

        if category and category.upper() in Feedback.VALID_CATEGORIES:
            query = query.filter(Feedback.category == category.upper())

        if search:
            search_term = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(Feedback.name).like(search_term),
                    func.lower(Feedback.email).like(search_term),
                    func.lower(Feedback.message).like(search_term),
                    func.lower(Feedback.related_entity_name).like(search_term),
                    func.lower(Feedback.page_path).like(search_term),
                )
            )

        if start_date:
            try:
                dt_start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
                query = query.filter(Feedback.created_at >= dt_start)
            except Exception:
                pass

        if end_date:
            try:
                dt_end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
                query = query.filter(Feedback.created_at <= dt_end)
            except Exception:
                pass

        total = query.count()
        offset = max(0, (page - 1) * limit)
        items = query.order_by(Feedback.created_at.desc()).offset(offset).limit(limit).all()

        # Summary statistics for admin tab badges
        pending_count = Feedback.query.filter_by(status="PENDING").count()
        under_review_count = Feedback.query.filter_by(status="UNDER_REVIEW").count()
        resolved_count = Feedback.query.filter_by(status="RESOLVED").count()
        rejected_count = Feedback.query.filter_by(status="REJECTED").count()
        total_all = Feedback.query.count()

        return {
            "items": [item.to_dict(include_admin=True) for item in items],
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "pages": max(1, (total + limit - 1) // limit),
            },
            "counts": {
                "total": total_all,
                "pending": pending_count,
                "underReview": under_review_count,
                "resolved": resolved_count,
                "rejected": rejected_count,
            }
        }

    @staticmethod
    def get_feedback_by_id(feedback_id: str):
        return Feedback.query.filter_by(id=feedback_id).first()

    @staticmethod
    def update_feedback(
        feedback_id: str,
        status: str = None,
        admin_notes: str = None,
        admin_email: str = "admin@nammapavagada.in",
        admin_id: int = None,
        ip_address: str = "",
    ):
        feedback = Feedback.query.filter_by(id=feedback_id).first()
        if not feedback:
            return None, "Feedback entry not found.", 404

        old_state = feedback.to_dict(include_admin=True)
        changes = {}

        if status:
            norm_status = status.strip().upper()
            if norm_status not in Feedback.VALID_STATUSES:
                return None, f"Invalid status. Permitted: {', '.join(Feedback.VALID_STATUSES.keys())}", 400
            if feedback.status != norm_status:
                changes["status"] = {"from": feedback.status, "to": norm_status}
                feedback.status = norm_status

        if admin_notes is not None:
            if feedback.admin_notes != admin_notes:
                changes["admin_notes"] = {"from": feedback.admin_notes, "to": admin_notes}
                feedback.admin_notes = admin_notes

        feedback.updated_at = datetime.utcnow()

        try:
            db.session.commit()
            if changes:
                audit_service.log_action(
                    admin_email=admin_email,
                    action="UPDATE_FEEDBACK",
                    entity_type="Feedback",
                    entity_id=feedback.id,
                    admin_id=admin_id,
                    old_values=old_state,
                    new_values=feedback.to_dict(include_admin=True),
                    ip_address=ip_address,
                )
            return feedback, None, 200
        except Exception as e:
            db.session.rollback()
            return None, f"Failed to update feedback: {str(e)}", 500

    @staticmethod
    def delete_feedback(
        feedback_id: str,
        admin_email: str = "admin@nammapavagada.in",
        admin_id: int = None,
        ip_address: str = "",
    ):
        feedback = Feedback.query.filter_by(id=feedback_id).first()
        if not feedback:
            return False, "Feedback entry not found.", 404

        old_state = feedback.to_dict(include_admin=True)
        try:
            db.session.delete(feedback)
            db.session.commit()
            audit_service.log_action(
                admin_email=admin_email,
                action="DELETE_FEEDBACK",
                entity_type="Feedback",
                entity_id=feedback_id,
                admin_id=admin_id,
                old_values=old_state,
                new_values=None,
                ip_address=ip_address,
            )
            return True, None, 200
        except Exception as e:
            db.session.rollback()
            return False, f"Failed to delete feedback: {str(e)}", 500

feedback_service = FeedbackService()

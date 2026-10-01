from datetime import datetime, timedelta
import jwt
from app.config.config import get_config
from app.models.base import db
from app.models.admin_user import AdminUser
from app.models.audit_log import AuditLog

config = get_config()

class AuthService:
    def login(self, email: str, password: str, ip_address: str = "") -> dict:
        if not email or not password:
            raise ValueError("Email and password are required.")

        user = AdminUser.query.filter_by(email=email.strip().lower()).first()
        if not user or not user.check_password(password):
            raise ValueError("Invalid email or password.")

        if not user.is_active:
            raise PermissionError("Admin account has been deactivated. Please contact the administrator.")

        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()

        # Generate JWT Token
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "exp": datetime.utcnow() + config.JWT_ACCESS_TOKEN_EXPIRES,
            "iat": datetime.utcnow(),
        }
        token = jwt.encode(payload, config.JWT_SECRET_KEY, algorithm="HS256")

        # Audit login
        audit = AuditLog(
            admin_id=user.id,
            admin_email=user.email,
            action="LOGIN",
            entity_type="AdminUser",
            entity_id=str(user.id),
            ip_address=ip_address,
        )
        db.session.add(audit)
        db.session.commit()

        return {
            "token": token,
            "user": user.to_dict(),
        }

    def verify_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, config.JWT_SECRET_KEY, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Session token has expired. Please log in again.")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid session token.")

    def get_user_by_id(self, user_id: int) -> AdminUser:
        return AdminUser.query.get(user_id)

    def create_admin(self, email: str, password: str, full_name: str, role: str = "EDITOR", creator_email: str = "system") -> AdminUser:
        email = email.strip().lower()
        existing = AdminUser.query.filter_by(email=email).first()
        if existing:
            raise ValueError(f"Admin with email '{email}' already exists.")

        user = AdminUser(
            email=email,
            full_name=full_name,
            role=role,
            is_active=True,
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        # Audit
        audit = AuditLog(
            admin_email=creator_email,
            action="CREATE",
            entity_type="AdminUser",
            entity_id=str(user.id),
            new_values=user.to_dict(),
        )
        db.session.add(audit)
        db.session.commit()

        return user

auth_service = AuthService()

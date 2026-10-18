import re
from app.models.base import db
from app.models.tag import Tag
from app.services.audit_service import audit_service

DEFAULT_TAGS = [
    # 1. Service Tags
    ("Emergency", "SERVICE", "Emergency critical care and immediate response services"),
    ("Healthcare", "SERVICE", "Medical clinics, hospitals, pharmacies and diagnostic labs"),
    ("Government", "SERVICE", "Civic governance, municipal and administrative offices"),
    ("Education", "SERVICE", "Schools, colleges, libraries and training centres"),
    ("Transport", "SERVICE", "Bus transit, auto stands, petrol pumps and logistics"),
    ("Agriculture", "SERVICE", "APMC markets, seeds, fertilizers and farming assistance"),
    ("Banking", "SERVICE", "Banks, ATMs, cooperative societies and financial services"),
    ("Legal", "SERVICE", "Court, lawyers, notaries, and deed writers"),
    ("Food", "SERVICE", "Restaurants, hotels, bakeries and catering services"),
    ("Entertainment", "SERVICE", "Cinemas, theatres, and recreation centres"),

    # 2. Availability Tags
    ("24/7", "AVAILABILITY", "Operational round the clock 24 hours 7 days a week"),
    ("Open Now", "AVAILABILITY", "Currently open during local business hours"),
    ("Appointment Required", "AVAILABILITY", "Requires prior scheduling or booking"),
    ("Walk-in", "AVAILABILITY", "Accepts walk-in visitors without prior appointment"),

    # 3. Facility Tags
    ("Parking", "FACILITY", "Dedicated two-wheeler and four-wheeler vehicle parking available"),
    ("Wheelchair Accessible", "FACILITY", "Ramp and step-free access for persons with disabilities"),
    ("AC", "FACILITY", "Air conditioning available on premises"),
    ("Wi-Fi", "FACILITY", "Public or customer Wi-Fi internet available"),
    ("Hostel", "FACILITY", "Residential hostel or boarding facility provided"),
    ("Library", "FACILITY", "Reading room and book lending facility available"),
    ("Playground", "FACILITY", "Sports ground and recreational outdoor area"),
    ("Cafeteria", "FACILITY", "Canteen or food service on premises"),

    # 4. Payment Tags
    ("UPI", "PAYMENT", "Accepts PhonePe, Google Pay, Paytm and BHIM UPI QR"),
    ("Cash", "PAYMENT", "Accepts Indian Rupee currency cash payments"),
    ("Card", "PAYMENT", "Debit and credit card POS machines available"),
    ("Online Payment", "PAYMENT", "Net banking and online portal payments accepted"),

    # 5. Audience Tags
    ("Children", "AUDIENCE", "Child-friendly or specialized pediatric/elementary services"),
    ("Women", "AUDIENCE", "Specialized desks, maternity, or women-oriented facilities"),
    ("Students", "AUDIENCE", "Concessions, academic study material, or student facilities"),
    ("Senior Citizens", "AUDIENCE", "Priority queues and elder-friendly infrastructure"),
    ("Farmers", "AUDIENCE", "Agricultural community support, subsidies, and farm inputs"),
    ("Visitors", "AUDIENCE", "Tourist and out-of-town traveller assistance"),
    ("Patients", "AUDIENCE", "Inpatient and outpatient healthcare services"),

    # 6. Service Mode Tags
    ("Home Service", "SERVICE_MODE", "Service provided at citizen residence or doorstep"),
    ("In-Person", "SERVICE_MODE", "Service provided at physical office or shop location"),
    ("Online", "SERVICE_MODE", "Digital portal or app-based service delivery"),
    ("Phone", "SERVICE_MODE", "Service consultation or booking available via phone call"),
    ("Appointment", "SERVICE_MODE", "Service provided upon confirmed appointment slot"),
]

class TagService:
    def get_tags(self, category: str = None, search_query: str = None, limit: int = 200):
        query = Tag.query.filter_by(status="ACTIVE")

        if category and category.upper() != "ALL":
            query = query.filter_by(category=category.upper())

        if search_query and search_query.strip():
            q = f"%{search_query.strip()}%"
            query = query.filter(
                (Tag.name.ilike(q)) | (Tag.slug.ilike(q)) | (Tag.description.ilike(q))
            )

        tags = query.order_by(Tag.name.asc()).limit(limit).all()
        return [t.to_dict() for t in tags]

    def get_tags_grouped(self) -> dict:
        """Returns tags grouped by their smart category."""
        all_tags = Tag.query.filter_by(status="ACTIVE").order_by(Tag.name.asc()).all()
        grouped = {
            "SERVICE": [],
            "AVAILABILITY": [],
            "FACILITY": [],
            "PAYMENT": [],
            "AUDIENCE": [],
            "SERVICE_MODE": [],
            "OTHER": [],
        }

        for t in all_tags:
            cat = t.category.upper() if t.category else "OTHER"
            if cat not in grouped:
                grouped[cat] = []
            grouped[cat].append(t.to_dict())

        return grouped

    def find_or_create_tag(self, name: str, category: str = "SERVICE") -> Tag:
        trimmed = name.strip()
        if not trimmed:
            raise ValueError("Tag name cannot be empty.")

        slug = Tag.slugify(trimmed)
        existing = Tag.query.filter((Tag.name.ilike(trimmed)) | (Tag.slug == slug)).first()
        if existing:
            return existing

        new_tag = Tag(
            name=trimmed,
            slug=slug,
            category=(category or "SERVICE").upper(),
            status="ACTIVE",
        )
        db.session.add(new_tag)
        db.session.commit()
        return new_tag

    def create_tag(self, data: dict, admin_email: str = None, ip: str = "") -> Tag:
        name = (data.get("name") or "").strip()
        if not name:
            raise ValueError("Tag name is required.")

        category = (data.get("category") or "SERVICE").upper()
        description = data.get("description", "").strip()

        tag = self.find_or_create_tag(name, category=category)
        if description and not tag.description:
            tag.description = description
            db.session.commit()

        if admin_email:
            audit_service.log_action(
                admin_email=admin_email,
                action="CREATE",
                entity_type="tag",
                entity_id=str(tag.id),
                new_values=tag.to_dict(),
                ip_address=ip,
            )

        return tag

    def seed_defaults_if_needed(self):
        """Idempotently ensures smart tags exist in database."""
        for name, cat, desc in DEFAULT_TAGS:
            slug = Tag.slugify(name)
            existing = Tag.query.filter((Tag.name == name) | (Tag.slug == slug)).first()
            if not existing:
                t = Tag(name=name, slug=slug, category=cat, description=desc, status="ACTIVE")
                db.session.add(t)
        db.session.commit()

tag_service = TagService()

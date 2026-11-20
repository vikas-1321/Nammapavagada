import re
import uuid
import json
from datetime import datetime
from app.models.base import db
from app.models.business import Business, BusinessProductService, FootfallObservation
from app.models.building import Building
from app.models.unit import Unit
from app.services.audit_service import audit_service
from app.services.survey_gamification_service import survey_gamification_service

class BusinessService:
    def create_business(self, data: dict, admin_id: int = None, admin_name: str = None) -> Business:
        building_id = data.get("buildingId") or data.get("building_id")
        if not building_id:
            raise ValueError("buildingId is required to register a business.")

        building = Building.query.get(building_id)
        if not building:
            raise ValueError(f"Parent Building with ID '{building_id}' does not exist.")

        business_id = data.get("id") or f"biz_{uuid.uuid4().hex[:12]}"
        name = (data.get("name") or "").strip()
        if not name:
            raise ValueError("Business name is required.")

        unit_id = data.get("unitId") or data.get("unit_id")
        floor_id = data.get("floorId") or data.get("floor_id")

        # Enforce rule: Only one business with this name per building
        existing_biz = Business.query.filter(
            Business.building_id == building_id,
            Business.status != "ARCHIVED",
            db.func.lower(Business.name) == name.lower(),
        ).first()

        if existing_biz and not data.get("forceCreateDuplicate"):
            # Update the existing business instead of creating duplicate
            return self.update_business(existing_biz.id, data, admin_id=admin_id, admin_name=admin_name)

        # If unit is provided, verify and sync
        unit = Unit.query.get(unit_id) if unit_id else None
        if unit:
            if not floor_id:
                floor_id = unit.floor_id
            if not unit.unit_name:
                unit.unit_name = name
            unit.occupancy_status = "Occupied"

        # Financial Consent Handling
        financial_consent = bool(data.get("financialConsentGranted", False))
        financial_consent_dt = datetime.utcnow() if financial_consent else None

        # Build Business entity
        business = Business(
            id=business_id,
            building_id=building_id,
            floor_id=floor_id,
            unit_id=unit_id,
            name=name,
            kannada_name=data.get("kannadaName"),
            shop_or_unit_number=data.get("shopOrUnitNumber") or (unit.unit_number if unit else None),
            floor_name=data.get("floorName") or (unit.floor.floor_name if unit and unit.floor else None),
            year_established=int(data.get("yearEstablished")) if data.get("yearEstablished") else None,
            owner_name=data.get("ownerName"),
            ownership_type=data.get("ownershipType", "Independent"),
            business_model=data.get("businessModel", "Retail"),
            business_status=data.get("businessStatus", "Operating"),
            category_id=data.get("categoryId"),
            subcategory=data.get("subcategory"),
            tags_json=json.dumps(data.get("tags") or []),
            custom_category_suggestion=data.get("customCategorySuggestion"),
            product_summary=data.get("productSummary"),
            service_summary=data.get("serviceSummary"),
            sells_branded=bool(data.get("sellsBranded", False)),
            brands_stocked_json=json.dumps(data.get("brandsStocked") or []),
            manufactures_products=bool(data.get("manufacturesProducts", False)),
            provides_repair_service=bool(data.get("providesRepairService", False)),
            accepts_custom_orders=bool(data.get("acceptsCustomOrders", False)),
            offers_home_delivery=bool(data.get("offersHomeDelivery", False)),
            offers_wholesale=bool(data.get("offersWholesale", False)),
            offers_credit_to_regular=bool(data.get("offersCreditToRegular", False)),
            price_positioning=data.get("pricePositioning", "Economical"),
            lowest_price=float(data.get("lowestPrice")) if data.get("lowestPrice") else None,
            highest_price=float(data.get("highestPrice")) if data.get("highestPrice") else None,
            wholesale_pricing_available=bool(data.get("wholesalePricingAvailable", False)),
            discount_available=bool(data.get("discountAvailable", False)),
            seasonal_offers=bool(data.get("seasonalOffers", False)),
            min_order_quantity=data.get("minOrderQuantity"),
            payment_methods_json=json.dumps(data.get("paymentMethods") or ["Cash", "UPI"]),
            customer_types_json=json.dumps(data.get("customerTypes") or ["Local Residents"]),
            serves_nearby_villages=bool(data.get("servesNearbyVillages", True)),
            serves_other_towns=bool(data.get("servesOtherTowns", False)),
            is_walkin_primary=bool(data.get("isWalkinPrimary", True)),
            accepts_appointments=bool(data.get("acceptsAppointments", False)),
            has_regular_customers=bool(data.get("hasRegularCustomers", True)),
            why_customers_choose=data.get("whyCustomersChoose"),
            open_time=data.get("openTime", "09:00"),
            close_time=data.get("closeTime", "21:00"),
            weekly_holiday=data.get("weeklyHoliday", "None"),
            daily_schedule_json=json.dumps(data.get("dailySchedule") or {}),
            peak_hours=data.get("peakHours"),
            seasonal_operating_changes=data.get("seasonalOperatingChanges"),
            employee_count_range=data.get("employeeCountRange", "1-3"),
            owner_operated=bool(data.get("ownerOperated", True)),
            delivery_available=bool(data.get("deliveryAvailable", False)),
            online_ordering=bool(data.get("onlineOrdering", False)),
            whatsapp_ordering=bool(data.get("whatsappOrdering", False)),
            home_service=bool(data.get("homeService", False)),
            appointment_available=bool(data.get("appointmentAvailable", False)),
            business_space_sqft=float(data.get("businessSpaceSqft")) if data.get("businessSpaceSqft") else None,
            storage_available=bool(data.get("storageAvailable", False)),
            owner_or_rep_name=data.get("ownerOrRepName"),
            public_phone=data.get("publicPhone"),
            alternate_phone=data.get("alternatePhone"),
            whatsapp_number=data.get("whatsappNumber"),
            email=data.get("email"),
            website=data.get("website"),
            google_business_url=data.get("googleBusinessUrl"),
            instagram=data.get("instagram"),
            facebook=data.get("facebook"),
            online_ordering_url=data.get("onlineOrderingUrl"),
            preferred_contact_method=data.get("preferredContactMethod", "Phone"),
            best_enquiry_time=data.get("bestEnquiryTime"),
            is_contact_public=bool(data.get("isContactPublic", True)),
            years_in_business=int(data.get("yearsInBusiness")) if data.get("yearsInBusiness") else None,
            approx_daily_customers_range=data.get("approxDailyCustomersRange"),
            approx_daily_transactions_range=data.get("approxDailyTransactionsRange"),
            top_performing_category=data.get("topPerformingCategory"),
            growth_trend=data.get("growthTrend", "Stable"),
            seasonal_demand=bool(data.get("seasonalDemand", False)),
            peak_months_json=json.dumps(data.get("peakMonths") or []),
            slow_months_json=json.dumps(data.get("slowMonths") or []),
            how_attracts_customers=data.get("howAttractsCustomers"),
            differentiators_json=json.dumps(data.get("differentiators") or []),
            competitive_advantages=data.get("competitiveAdvantages"),
            challenges_json=json.dumps(data.get("challenges") or []),
            biggest_challenge=data.get("biggestChallenge"),
            approx_initial_investment=data.get("approxInitialInvestment"),
            required_equipment=data.get("requiredEquipment"),
            required_space=data.get("requiredSpace"),
            inventory_requirements=data.get("inventoryRequirements"),
            main_supplier_categories=data.get("mainSupplierCategories"),
            staffing_skills_required=data.get("staffingSkillsRequired"),
            common_operating_costs=data.get("commonOperatingCosts"),
            expansion_opportunities=data.get("expansionOpportunities"),
            analyst_notes=data.get("analystNotes"),
            # Restricted Financials (with consent)
            financial_consent_granted=financial_consent,
            financial_consent_date=financial_consent_dt,
            monthly_revenue_range=data.get("monthlyRevenueRange") if financial_consent else None,
            monthly_rent_range=data.get("monthlyRentRange") if financial_consent else None,
            monthly_operating_expenses=data.get("monthlyOperatingExpenses") if financial_consent else None,
            monthly_staff_expenses=data.get("monthlyStaffExpenses") if financial_consent else None,
            initial_investment_range=data.get("initialInvestmentRange") if financial_consent else None,
            estimated_gross_margin=data.get("estimatedGrossMargin") if financial_consent else None,
            profitability_assessment=data.get("profitabilityAssessment") if financial_consent else None,
            major_financial_challenge=data.get("majorFinancialChallenge") if financial_consent else None,
            # Location & Market
            road_type=data.get("roadType", "Main Road"),
            corner_or_interior=data.get("cornerOrInterior", "Standard front"),
            visibility_from_road=data.get("visibilityFromRoad", "High"),
            road_width_category=data.get("roadWidthCategory", "Medium"),
            nearby_bus_stops=data.get("nearbyBusStops"),
            nearby_schools_colleges=data.get("nearbySchoolsColleges"),
            nearby_hospitals=data.get("nearbyHospitals"),
            nearby_markets=data.get("nearbyMarkets"),
            complementary_businesses=data.get("complementaryBusinesses"),
            pedestrian_activity=data.get("pedestrianActivity", "Medium"),
            competitor_count_nearby=int(data.get("competitorCountNearby", 0)),
            distance_to_nearest_competitor_m=float(data.get("distanceToNearestCompetitorM")) if data.get("distanceToNearestCompetitorM") else None,
            competitor_names_public=data.get("competitorNamesPublic"),
            underserved_customer_needs=data.get("underservedCustomerNeeds"),
            photos_json=json.dumps(data.get("photos") or []),
            surveyor_id=admin_id,
            surveyor_name=admin_name or data.get("surveyorName", "Admin Surveyor"),
            survey_date=datetime.utcnow(),
            status=data.get("status", "ACTIVE"),
        )
        db.session.add(business)
        db.session.flush()

        # Handle nested products/services
        products_data = data.get("products") or []
        for p in products_data:
            prod = BusinessProductService(
                id=f"bps_{uuid.uuid4().hex[:10]}",
                business_id=business.id,
                item_type=p.get("itemType", "PRODUCT"),
                name=p.get("name", "Item"),
                classification=p.get("classification"),
                description=p.get("description"),
                brand=p.get("brand"),
                price=float(p.get("price")) if p.get("price") else None,
                price_range=p.get("priceRange"),
                unit_of_sale=p.get("unitOfSale"),
                is_popular=bool(p.get("isPopular", False)),
                is_branded=bool(p.get("isBranded", False)),
                notes=p.get("notes"),
            )
            db.session.add(prod)

        # Handle nested footfall observations
        footfall_data = data.get("footfallObservations") or []
        for fo in footfall_data:
            f_obs = FootfallObservation(
                id=f"ftf_{uuid.uuid4().hex[:10]}",
                business_id=business.id,
                time_of_day=fo.get("timeOfDay", "Morning"),
                activity_level=fo.get("activityLevel", "Medium"),
                observation_date=datetime.utcnow().date(),
                duration_minutes=int(fo.get("durationMinutes", 15)),
                surveyor_notes=fo.get("surveyorNotes"),
                weather_circumstances=fo.get("weatherCircumstances"),
                surveyor_name=admin_name or "Admin",
            )
            db.session.add(f_obs)

        # Update building counts
        building.commercial_units_count = max(building.commercial_units_count, building.units.count())
        db.session.commit()

        # Audit
        audit_service.log_action(
            admin_email=admin_name or "surveyor",
            action="REGISTER_BUSINESS",
            entity_type="Business",
            entity_id=business.id,
            admin_id=admin_id,
            new_values={"name": business.name, "buildingId": business.building_id},
        )

        # Gamification points (+75 for business, +10 for each product, +15 for each photo)
        if admin_id:
            pts = 75 + (len(products_data) * 10) + (len(business.photos) * 15)
            survey_gamification_service.award_points(
                admin_id=admin_id,
                display_name=admin_name or "Surveyor",
                points=pts,
                action_type="BUSINESS_REGISTERED",
                shops_count=1,
                photos_count=len(business.photos),
            )

        return business

    def update_business(self, business_id: str, data: dict, admin_id: int = None, admin_name: str = None) -> Business:
        business = Business.query.get(business_id)
        if not business:
            raise ValueError(f"Business with id '{business_id}' not found.")

        old_values = {"name": business.name}

        # Update fields dynamically
        for key, val in data.items():
            # Convert camelCase to snake_case
            snake_key = re.sub(r'(?<!^)(?=[A-Z])', '_', key).lower()
            if hasattr(business, snake_key):
                if snake_key.endswith("_json") and isinstance(val, (list, dict)):
                    setattr(business, snake_key, json.dumps(val))
                elif snake_key in ["tags", "payment_methods", "customer_types", "differentiators", "challenges", "photos"]:
                    setattr(business, f"{snake_key}_json", json.dumps(val if isinstance(val, list) else []))
                else:
                    setattr(business, snake_key, val)

        # If financial consent is granted in update
        if "financialConsentGranted" in data and bool(data["financialConsentGranted"]):
            business.financial_consent_granted = True
            business.financial_consent_date = datetime.utcnow()

        db.session.commit()

        audit_service.log_action(
            admin_email=admin_name or "surveyor",
            action="UPDATE_BUSINESS",
            entity_type="Business",
            entity_id=business.id,
            admin_id=admin_id,
            old_values=old_values,
            new_values={"name": business.name},
        )
        return business

    def get_business_by_id(self, business_id: str, include_restricted: bool = False, include_children: bool = True) -> Business:
        biz = Business.query.get(business_id)
        if not biz:
            raise ValueError(f"Business with id '{business_id}' not found.")
        return biz

    def delete_business(self, business_id: str, admin_id: int = None, admin_name: str = None, archive_only: bool = True) -> dict:
        biz = Business.query.get(business_id)
        if not biz:
            raise ValueError(f"Business with id '{business_id}' not found.")

        if archive_only:
            # Soft-delete / Archive: keep historical research & audit trails intact
            biz.status = "ARCHIVED"
            biz.business_status = "Permanently closed"

            # Check if unit has any other active businesses
            if biz.unit:
                remaining_active = [b for b in biz.unit.businesses.all() if b.id != biz.id and getattr(b, "status", "ACTIVE") != "ARCHIVED"]
                if not remaining_active:
                    biz.unit.occupancy_status = "Vacant"

            db.session.commit()

            audit_service.log_action(
                admin_email=admin_name or "admin",
                action="ARCHIVE_BUSINESS",
                entity_type="Business",
                entity_id=biz.id,
                admin_id=admin_id,
                old_values={"name": biz.name, "buildingId": biz.building_id, "status": "ACTIVE"},
                new_values={"status": "ARCHIVED", "businessStatus": "Permanently closed"},
            )
            return {"archived": True, "id": biz.id}

        # Hard delete
        audit_service.log_action(
            admin_email=admin_name or "admin",
            action="DELETE_BUSINESS",
            entity_type="Business",
            entity_id=biz.id,
            admin_id=admin_id,
            old_values={"name": biz.name, "buildingId": biz.building_id},
        )
        db.session.delete(biz)
        db.session.commit()
        return {"deleted": True, "id": biz.id}

    def list_businesses(
        self,
        building_id: str = None,
        category_id: str = None,
        subcategory: str = None,
        query: str = None,
        status: str = "ACTIVE",
        limit: int = 100,
        offset: int = 0,
        include_restricted: bool = False,
    ) -> tuple[list, int]:
        q = Business.query
        if status and status != "ALL":
            q = q.filter_by(status=status)
        if building_id:
            q = q.filter_by(building_id=building_id)
        if category_id:
            q = q.filter_by(category_id=category_id)
        if subcategory:
            q = q.filter_by(subcategory=subcategory)
        if query:
            term = f"%{query.strip()}%"
            q = q.filter(
                (Business.name.ilike(term)) |
                (Business.kannada_name.ilike(term)) |
                (Business.owner_name.ilike(term)) |
                (Business.product_summary.ilike(term))
            )

        total = q.count()
        businesses = q.order_by(Business.created_at.desc()).offset(offset).limit(limit).all()
        return [b.to_dict(include_restricted=include_restricted, include_children=False) for b in businesses], total

    def add_product(self, business_id: str, data: dict) -> BusinessProductService:
        prod = BusinessProductService(
            id=f"bps_{uuid.uuid4().hex[:10]}",
            business_id=business_id,
            item_type=data.get("itemType", "PRODUCT"),
            name=data.get("name", "Product"),
            classification=data.get("classification"),
            description=data.get("description"),
            brand=data.get("brand"),
            price=float(data.get("price")) if data.get("price") else None,
            price_range=data.get("priceRange"),
            unit_of_sale=data.get("unitOfSale"),
            is_popular=bool(data.get("isPopular", False)),
            is_branded=bool(data.get("isBranded", False)),
            notes=data.get("notes"),
        )
        db.session.add(prod)
        db.session.commit()
        return prod

    def add_footfall_observation(self, business_id: str, data: dict, surveyor_name: str = "Admin") -> FootfallObservation:
        obs = FootfallObservation(
            id=f"ftf_{uuid.uuid4().hex[:10]}",
            business_id=business_id,
            time_of_day=data.get("timeOfDay", "Morning"),
            activity_level=data.get("activityLevel", "Medium"),
            observation_date=datetime.utcnow().date(),
            duration_minutes=int(data.get("durationMinutes", 15)),
            surveyor_notes=data.get("surveyorNotes"),
            weather_circumstances=data.get("weatherCircumstances"),
            surveyor_name=surveyor_name,
        )
        db.session.add(obs)
        db.session.commit()
        return obs

business_service = BusinessService()


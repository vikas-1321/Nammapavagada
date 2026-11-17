from datetime import datetime
import json
from app.models.base import db, TimestampMixin

class Business(db.Model, TimestampMixin):
    __tablename__ = "businesses"

    id = db.Column(db.String(80), primary_key=True) # e.g. biz_3a4b5c6d
    building_id = db.Column(db.String(80), db.ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False, index=True)
    floor_id = db.Column(db.String(80), db.ForeignKey("building_floors.id", ondelete="SET NULL"), nullable=True, index=True)
    unit_id = db.Column(db.String(80), db.ForeignKey("building_units.id", ondelete="SET NULL"), nullable=True, index=True)

    # 1. Identity
    name = db.Column(db.String(250), nullable=False, index=True)
    kannada_name = db.Column(db.String(250), nullable=True)
    shop_or_unit_number = db.Column(db.String(50), nullable=True)
    floor_name = db.Column(db.String(100), nullable=True)
    year_established = db.Column(db.Integer, nullable=True)
    owner_name = db.Column(db.String(150), nullable=True)
    ownership_type = db.Column(db.String(80), default="Independent", nullable=False) # Independent, Franchise, Branch, Family-owned, Other
    business_model = db.Column(db.String(80), default="Retail", nullable=False) # Retail, Wholesale, Manufacturing, Service provider, Retail + Wholesale, Online + Offline, Other
    business_status = db.Column(db.String(50), default="Operating", nullable=False, index=True) # Operating, Temporarily closed, Permanently closed, Vacant, Under setup, Unknown

    # 2. Category Taxonomy
    category_id = db.Column(db.String(50), db.ForeignKey("categories.id"), nullable=True, index=True)
    subcategory = db.Column(db.String(100), nullable=True, index=True)
    tags_json = db.Column(db.Text, default="[]", nullable=False)
    custom_category_suggestion = db.Column(db.String(150), nullable=True)

    # 3. Product & Service Capabilities
    product_summary = db.Column(db.Text, nullable=True)
    service_summary = db.Column(db.Text, nullable=True)
    sells_branded = db.Column(db.Boolean, default=False)
    brands_stocked_json = db.Column(db.Text, default="[]", nullable=False)
    manufactures_products = db.Column(db.Boolean, default=False)
    provides_repair_service = db.Column(db.Boolean, default=False)
    accepts_custom_orders = db.Column(db.Boolean, default=False)
    offers_home_delivery = db.Column(db.Boolean, default=False)
    offers_wholesale = db.Column(db.Boolean, default=False)
    offers_credit_to_regular = db.Column(db.Boolean, default=False)

    # 4. Pricing & Market Positioning
    price_positioning = db.Column(db.String(50), default="Economical", nullable=False) # Budget, Economical, Mid-range, Premium, Unknown
    lowest_price = db.Column(db.Float, nullable=True)
    highest_price = db.Column(db.Float, nullable=True)
    wholesale_pricing_available = db.Column(db.Boolean, default=False)
    discount_available = db.Column(db.Boolean, default=False)
    seasonal_offers = db.Column(db.Boolean, default=False)
    min_order_quantity = db.Column(db.String(100), nullable=True)
    payment_methods_json = db.Column(db.Text, default='["Cash", "UPI"]', nullable=False) # Cash, UPI, Debit/Credit Card, Bank Transfer, Credit, Other

    # 5. Customers & Demand
    customer_types_json = db.Column(db.Text, default='["Local Residents"]', nullable=False) # Local Residents, Farmers, Students, Contractors, Businesses, Govt, Visitors, Rural Customers, Other
    serves_nearby_villages = db.Column(db.Boolean, default=True)
    serves_other_towns = db.Column(db.Boolean, default=False)
    is_walkin_primary = db.Column(db.Boolean, default=True)
    accepts_appointments = db.Column(db.Boolean, default=False)
    has_regular_customers = db.Column(db.Boolean, default=True)
    why_customers_choose = db.Column(db.Text, nullable=True)

    # 6. Operations
    open_time = db.Column(db.String(20), default="09:00", nullable=True)
    close_time = db.Column(db.String(20), default="21:00", nullable=True)
    weekly_holiday = db.Column(db.String(30), default="None", nullable=True) # None, Sunday, Monday, etc.
    daily_schedule_json = db.Column(db.Text, default="{}", nullable=False)
    peak_hours = db.Column(db.String(150), nullable=True) # e.g. "Evening (5 PM - 8 PM)"
    seasonal_operating_changes = db.Column(db.Text, nullable=True)
    employee_count_range = db.Column(db.String(50), default="1-3", nullable=True) # 1-2, 3-5, 6-10, 11-25, 25+
    owner_operated = db.Column(db.Boolean, default=True)
    delivery_available = db.Column(db.Boolean, default=False)
    online_ordering = db.Column(db.Boolean, default=False)
    whatsapp_ordering = db.Column(db.Boolean, default=False)
    home_service = db.Column(db.Boolean, default=False)
    appointment_available = db.Column(db.Boolean, default=False)
    business_space_sqft = db.Column(db.Float, nullable=True)
    storage_available = db.Column(db.Boolean, default=False)

    # 7. Contact & Digital Presence (Publicly consented)
    owner_or_rep_name = db.Column(db.String(150), nullable=True)
    public_phone = db.Column(db.String(50), nullable=True)
    alternate_phone = db.Column(db.String(50), nullable=True)
    whatsapp_number = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(150), nullable=True)
    website = db.Column(db.String(250), nullable=True)
    google_business_url = db.Column(db.String(500), nullable=True)
    instagram = db.Column(db.String(200), nullable=True)
    facebook = db.Column(db.String(200), nullable=True)
    online_ordering_url = db.Column(db.String(500), nullable=True)
    preferred_contact_method = db.Column(db.String(50), default="Phone", nullable=True)
    best_enquiry_time = db.Column(db.String(100), nullable=True)
    is_contact_public = db.Column(db.Boolean, default=True)

    # 8. Business Performance (Research / Operational Estimates)
    years_in_business = db.Column(db.Integer, nullable=True)
    approx_daily_customers_range = db.Column(db.String(50), nullable=True) # e.g. "20-50", "50-100", "100-200"
    approx_daily_transactions_range = db.Column(db.String(50), nullable=True)
    top_performing_category = db.Column(db.String(150), nullable=True)
    growth_trend = db.Column(db.String(50), default="Stable", nullable=True) # Growing, Stable, Declining, Unknown
    seasonal_demand = db.Column(db.Boolean, default=False)
    peak_months_json = db.Column(db.Text, default="[]", nullable=False) # e.g. ["October", "November", "May"]
    slow_months_json = db.Column(db.Text, default="[]", nullable=False)
    how_attracts_customers = db.Column(db.Text, nullable=True)

    # 9. Differentiators & Challenges
    differentiators_json = db.Column(db.Text, default="[]", nullable=False)
    competitive_advantages = db.Column(db.Text, nullable=True)
    challenges_json = db.Column(db.Text, default="[]", nullable=False)
    biggest_challenge = db.Column(db.Text, nullable=True)

    # 10. Business Replication Research (Analyst Information)
    approx_initial_investment = db.Column(db.String(100), nullable=True) # e.g. "₹2L - ₹5L"
    required_equipment = db.Column(db.Text, nullable=True)
    required_space = db.Column(db.String(100), nullable=True)
    inventory_requirements = db.Column(db.Text, nullable=True)
    main_supplier_categories = db.Column(db.Text, nullable=True) # e.g. "Bengaluru, Hindupur, Local wholesale"
    staffing_skills_required = db.Column(db.Text, nullable=True)
    common_operating_costs = db.Column(db.Text, nullable=True)
    expansion_opportunities = db.Column(db.Text, nullable=True)
    analyst_notes = db.Column(db.Text, nullable=True)

    # 11. Optional Financial Research (Restricted / Private)
    financial_consent_granted = db.Column(db.Boolean, default=False, nullable=False)
    financial_consent_date = db.Column(db.DateTime, nullable=True)
    monthly_revenue_range = db.Column(db.String(80), nullable=True) # e.g. "₹50k - ₹1L", "Prefer not to disclose"
    monthly_rent_range = db.Column(db.String(80), nullable=True)
    monthly_operating_expenses = db.Column(db.String(80), nullable=True)
    monthly_staff_expenses = db.Column(db.String(80), nullable=True)
    initial_investment_range = db.Column(db.String(80), nullable=True)
    estimated_gross_margin = db.Column(db.String(80), nullable=True) # e.g. "15-25%"
    profitability_assessment = db.Column(db.String(80), nullable=True) # Profitable, Break-even, Struggling, Prefer not to disclose
    major_financial_challenge = db.Column(db.Text, nullable=True)

    # 12. Location Characteristics & Market Context
    road_type = db.Column(db.String(80), default="Main Road", nullable=True) # Main road, Side road, Market street, Residential street
    corner_or_interior = db.Column(db.String(50), default="Standard front", nullable=True) # Corner shop, Interior, Ground front
    visibility_from_road = db.Column(db.String(50), default="High", nullable=True) # High, Moderate, Low
    road_width_category = db.Column(db.String(50), default="Medium", nullable=True) # Wide (>40ft), Medium (20-40ft), Narrow (<20ft)
    nearby_bus_stops = db.Column(db.String(250), nullable=True)
    nearby_schools_colleges = db.Column(db.String(250), nullable=True)
    nearby_hospitals = db.Column(db.String(250), nullable=True)
    nearby_markets = db.Column(db.String(250), nullable=True)
    complementary_businesses = db.Column(db.Text, nullable=True)
    pedestrian_activity = db.Column(db.String(50), default="Medium", nullable=True) # High, Medium, Low

    # Competition Context
    competitor_count_nearby = db.Column(db.Integer, default=0, nullable=True)
    distance_to_nearest_competitor_m = db.Column(db.Float, nullable=True)
    competitor_names_public = db.Column(db.Text, nullable=True)
    underserved_customer_needs = db.Column(db.Text, nullable=True)

    # Media & Photos
    photos_json = db.Column(db.Text, default="[]", nullable=False)

    # Surveyor details
    surveyor_id = db.Column(db.Integer, nullable=True, index=True)
    surveyor_name = db.Column(db.String(150), nullable=True)
    survey_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    products = db.relationship("BusinessProductService", backref="business", lazy="dynamic", cascade="all, delete-orphan")
    footfall_observations = db.relationship("FootfallObservation", backref="business", lazy="dynamic", cascade="all, delete-orphan")

    # Helper JSON properties
    @property
    def tags(self):
        try:
            return json.loads(self.tags_json) if self.tags_json else []
        except Exception:
            return []

    @property
    def payment_methods(self):
        try:
            return json.loads(self.payment_methods_json) if self.payment_methods_json else []
        except Exception:
            return []

    @property
    def customer_types(self):
        try:
            return json.loads(self.customer_types_json) if self.customer_types_json else []
        except Exception:
            return []

    @property
    def differentiators(self):
        try:
            return json.loads(self.differentiators_json) if self.differentiators_json else []
        except Exception:
            return []

    @property
    def challenges(self):
        try:
            return json.loads(self.challenges_json) if self.challenges_json else []
        except Exception:
            return []

    @property
    def photos(self):
        try:
            return json.loads(self.photos_json) if self.photos_json else []
        except Exception:
            return []

    @photos.setter
    def photos(self, val):
        self.photos_json = json.dumps(val if isinstance(val, list) else [])

    def to_dict(self, include_restricted: bool = False, include_children: bool = False) -> dict:
        data = {
            "id": self.id,
            "buildingId": self.building_id,
            "floorId": self.floor_id,
            "unitId": self.unit_id,
            "name": self.name,
            "kannadaName": self.kannada_name,
            "shopOrUnitNumber": self.shop_or_unit_number,
            "floorName": self.floor_name,
            "yearEstablished": self.year_established,
            "ownerName": self.owner_name,
            "ownershipType": self.ownership_type,
            "businessModel": self.business_model,
            "businessStatus": self.business_status,
            "categoryId": self.category_id,
            "subcategory": self.subcategory,
            "tags": self.tags,
            "customCategorySuggestion": self.custom_category_suggestion,
            "productSummary": self.product_summary,
            "serviceSummary": self.service_summary,
            "sellsBranded": self.sells_branded,
            "brandsStocked": json.loads(self.brands_stocked_json or "[]"),
            "manufacturesProducts": self.manufactures_products,
            "providesRepairService": self.provides_repair_service,
            "acceptsCustomOrders": self.accepts_custom_orders,
            "offersHomeDelivery": self.offers_home_delivery,
            "offersWholesale": self.offers_wholesale,
            "offersCreditToRegular": self.offers_credit_to_regular,
            "pricePositioning": self.price_positioning,
            "lowestPrice": self.lowest_price,
            "highestPrice": self.highest_price,
            "wholesalePricingAvailable": self.wholesale_pricing_available,
            "discountAvailable": self.discount_available,
            "seasonalOffers": self.seasonal_offers,
            "minOrderQuantity": self.min_order_quantity,
            "paymentMethods": self.payment_methods,
            "customerTypes": self.customer_types,
            "servesNearbyVillages": self.serves_nearby_villages,
            "servesOtherTowns": self.serves_other_towns,
            "isWalkinPrimary": self.is_walkin_primary,
            "acceptsAppointments": self.accepts_appointments,
            "hasRegularCustomers": self.has_regular_customers,
            "whyCustomersChoose": self.why_customers_choose,
            "openTime": self.open_time,
            "closeTime": self.close_time,
            "weeklyHoliday": self.weekly_holiday,
            "dailySchedule": json.loads(self.daily_schedule_json or "{}"),
            "peakHours": self.peak_hours,
            "seasonalOperatingChanges": self.seasonal_operating_changes,
            "employeeCountRange": self.employee_count_range,
            "ownerOperated": self.owner_operated,
            "deliveryAvailable": self.delivery_available,
            "onlineOrdering": self.online_ordering,
            "whatsappOrdering": self.whatsapp_ordering,
            "homeService": self.home_service,
            "appointmentAvailable": self.appointment_available,
            "businessSpaceSqft": self.business_space_sqft,
            "storageAvailable": self.storage_available,
            "ownerOrRepName": self.owner_or_rep_name,
            "publicPhone": self.public_phone if self.is_contact_public else None,
            "alternatePhone": self.alternate_phone if self.is_contact_public else None,
            "whatsappNumber": self.whatsapp_number if self.is_contact_public else None,
            "email": self.email,
            "website": self.website,
            "googleBusinessUrl": self.google_business_url,
            "instagram": self.instagram,
            "facebook": self.facebook,
            "onlineOrderingUrl": self.online_ordering_url,
            "preferredContactMethod": self.preferred_contact_method,
            "bestEnquiryTime": self.best_enquiry_time,
            "isContactPublic": self.is_contact_public,
            "yearsInBusiness": self.years_in_business,
            "approxDailyCustomersRange": self.approx_daily_customers_range,
            "approxDailyTransactionsRange": self.approx_daily_transactions_range,
            "topPerformingCategory": self.top_performing_category,
            "growthTrend": self.growth_trend,
            "seasonalDemand": self.seasonal_demand,
            "peakMonths": json.loads(self.peak_months_json or "[]"),
            "slowMonths": json.loads(self.slow_months_json or "[]"),
            "howAttractsCustomers": self.how_attracts_customers,
            "differentiators": self.differentiators,
            "competitiveAdvantages": self.competitive_advantages,
            "challenges": self.challenges,
            "biggestChallenge": self.biggest_challenge,
            "roadType": self.road_type,
            "cornerOrInterior": self.corner_or_interior,
            "visibilityFromRoad": self.visibility_from_road,
            "roadWidthCategory": self.road_width_category,
            "nearbyBusStops": self.nearby_bus_stops,
            "nearbySchoolsColleges": self.nearby_schools_colleges,
            "nearbyHospitals": self.nearby_hospitals,
            "nearbyMarkets": self.nearby_markets,
            "complementaryBusinesses": self.complementary_businesses,
            "pedestrianActivity": self.pedestrian_activity,
            "competitorCountNearby": self.competitor_count_nearby,
            "distanceToNearestCompetitorM": self.distance_to_nearest_competitor_m,
            "competitorNamesPublic": self.competitor_names_public,
            "underservedCustomerNeeds": self.underserved_customer_needs,
            "photos": self.photos,
            "surveyorId": self.surveyor_id,
            "surveyorName": self.surveyor_name,
            "surveyDate": self.survey_date.isoformat() if self.survey_date else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
            "status": self.status,
        }

        # Analyst & Replication Research (Publicly safe summary vs restricted full details)
        if include_restricted:
            data["replicationResearch"] = {
                "approxInitialInvestment": self.approx_initial_investment,
                "requiredEquipment": self.required_equipment,
                "requiredSpace": self.required_space,
                "inventoryRequirements": self.inventory_requirements,
                "mainSupplierCategories": self.main_supplier_categories,
                "staffingSkillsRequired": self.staffing_skills_required,
                "commonOperatingCosts": self.common_operating_costs,
                "expansionOpportunities": self.expansion_opportunities,
                "analystNotes": self.analyst_notes,
            }
            # Restricted Financial Research
            data["financialResearch"] = {
                "consentGranted": self.financial_consent_granted,
                "consentDate": self.financial_consent_date.isoformat() if self.financial_consent_date else None,
                "monthlyRevenueRange": self.monthly_revenue_range,
                "monthlyRentRange": self.monthly_rent_range,
                "monthlyOperatingExpenses": self.monthly_operating_expenses,
                "monthlyStaffExpenses": self.monthly_staff_expenses,
                "initialInvestmentRange": self.initial_investment_range,
                "estimatedGrossMargin": self.estimated_gross_margin,
                "profitabilityAssessment": self.profitability_assessment,
                "majorFinancialChallenge": self.major_financial_challenge,
            }

        if include_children:
            data["products"] = [p.to_dict() for p in self.products.all()]
            data["footfallObservations"] = [f.to_dict() for f in self.footfall_observations.all()]

        return data


class BusinessProductService(db.Model, TimestampMixin):
    __tablename__ = "business_products_services"

    id = db.Column(db.String(80), primary_key=True) # e.g. bps_1a2b3c4d
    business_id = db.Column(db.String(80), db.ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    item_type = db.Column(db.String(20), default="PRODUCT", nullable=False) # PRODUCT, SERVICE
    name = db.Column(db.String(200), nullable=False, index=True)
    classification = db.Column(db.String(100), nullable=True) # Category or group
    description = db.Column(db.Text, nullable=True)
    brand = db.Column(db.String(150), nullable=True)
    price = db.Column(db.Float, nullable=True)
    price_range = db.Column(db.String(100), nullable=True) # e.g. "₹50 - ₹120"
    unit_of_sale = db.Column(db.String(50), nullable=True) # e.g. "Kg", "Piece", "Hour", "Session"
    is_popular = db.Column(db.Boolean, default=False)
    is_branded = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text, nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "businessId": self.business_id,
            "itemType": self.item_type,
            "name": self.name,
            "classification": self.classification,
            "description": self.description,
            "brand": self.brand,
            "price": self.price,
            "priceRange": self.price_range,
            "unitOfSale": self.unit_of_sale,
            "isPopular": self.is_popular,
            "isBranded": self.is_branded,
            "notes": self.notes,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class FootfallObservation(db.Model, TimestampMixin):
    __tablename__ = "footfall_observations"

    id = db.Column(db.String(80), primary_key=True)
    business_id = db.Column(db.String(80), db.ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    time_of_day = db.Column(db.String(50), nullable=False) # Morning, Afternoon, Evening
    activity_level = db.Column(db.String(50), nullable=False) # Low, Medium, High
    observation_date = db.Column(db.Date, default=datetime.utcnow, nullable=False)
    duration_minutes = db.Column(db.Integer, default=15)
    surveyor_notes = db.Column(db.Text, nullable=True)
    weather_circumstances = db.Column(db.String(200), nullable=True) # e.g. "Weekly shandy day, heavy rain"
    surveyor_name = db.Column(db.String(150), nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "businessId": self.business_id,
            "timeOfDay": self.time_of_day,
            "activityLevel": self.activity_level,
            "observationDate": self.observation_date.isoformat() if self.observation_date else None,
            "durationMinutes": self.duration_minutes,
            "surveyorNotes": self.surveyor_notes,
            "weatherCircumstances": self.weather_circumstances,
            "surveyorName": self.surveyor_name,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app import create_app
from app.models.base import db
from app.models.admin_user import AdminUser
from app.models.category import Category

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.test_client() as client:
        with app.app_context():
            db.create_all()

            # Seed admin user
            admin = AdminUser(
                email="surveyor@nammapavagada.in",
                full_name="Pavagada Surveyor",
                role="SUPER_ADMIN",
                is_active=True,
            )
            admin.set_password("SecurePass123!")
            db.session.add(admin)

            # Seed Category
            cat = Category(
                id="commercial-trade",
                name="Commercial & Retail",
                short_code="COMM",
                display_order=1,
            )
            db.session.add(cat)
            db.session.commit()

        yield client

        with app.app_context():
            db.drop_all()

def get_auth_token(client):
    res = client.post("/api/auth/login", json={
        "email": "surveyor@nammapavagada.in",
        "password": "SecurePass123!",
    })
    assert res.status_code == 200
    data = res.get_json()
    return data["data"]["token"]

def test_building_and_business_survey_lifecycle(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Proximity / duplicate check when no buildings exist
    dup_res = client.post("/api/buildings/check-duplicate", json={
        "latitude": 14.1025,
        "longitude": 77.2798,
        "name": "Pavagada Complex",
        "radiusMeters": 50,
    }, headers=headers)
    assert dup_res.status_code == 200
    dup_data = dup_res.get_json()["data"]
    assert dup_data["isDuplicateSuspected"] is False
    assert dup_data["matchCount"] == 0

    # 2. Create Building with floors and units
    bld_payload = {
        "name": "Pavagada Trade Centre",
        "kannadaName": "ಪಾವಗಡ ವಾಣಿಜ್ಯ ಕೇಂದ್ರ",
        "address": "Main Road, Opp KSRTC Bus Stand",
        "area": "Fort Road",
        "buildingType": "Commercial",
        "commercialSubtype": "commercial_multibusiness",
        "occupancyStatus": "Fully occupied",
        "buildingCondition": "Excellent",
        "totalFloors": 2,
        "latitude": 14.1025,
        "longitude": 77.2798,
        "twoWheelerParking": True,
        "carParking": True,
        "floors": [
            {
                "floorLevel": 0,
                "floorName": "Ground Floor",
                "floorUsage": "Commercial",
                "units": [
                    {
                        "unitNumber": "Shop G-01",
                        "unitName": "Pavagada Medicals",
                        "unitType": "Retail Shop",
                        "usage": "Commercial",
                        "occupancyStatus": "Occupied",
                    },
                    {
                        "unitNumber": "Shop G-02",
                        "unitName": "Sri Manjunatha Stores",
                        "unitType": "Retail Shop",
                        "usage": "Commercial",
                        "occupancyStatus": "Occupied",
                    }
                ]
            }
        ],
        "photos": [
            {"url": "https://media.nammapavagada.in/bld1.jpg", "photoType": "Front View", "isPrimary": True}
        ]
    }

    create_bld_res = client.post("/api/buildings", json=bld_payload, headers=headers)
    print("CREATE BUILDING RESULT:", create_bld_res.get_json())
    assert create_bld_res.status_code == 201
    bld_data = create_bld_res.get_json()["data"]
    building_id = bld_data["id"]
    assert bld_data["name"] == "Pavagada Trade Centre"
    assert len(bld_data["floors"]) == 1
    assert len(bld_data["floors"][0]["units"]) == 2
    unit_id = bld_data["floors"][0]["units"][0]["id"]
    floor_id = bld_data["floors"][0]["id"]

    # 3. Duplicate check should now detect nearby building within 50m!
    dup_res2 = client.post("/api/buildings/check-duplicate", json={
        "latitude": 14.10252,
        "longitude": 77.27981,
        "name": "Pavagada Trade",
        "radiusMeters": 50,
    }, headers=headers)
    assert dup_res2.status_code == 200
    dup_data2 = dup_res2.get_json()["data"]
    assert dup_data2["isDuplicateSuspected"] is True
    assert dup_data2["matchCount"] >= 1
    assert dup_data2["nearbyBuildings"][0]["id"] == building_id

    # 4. Map markers should return this building
    markers_res = client.get("/api/buildings/map/markers")
    assert markers_res.status_code == 200
    markers = markers_res.get_json()["data"]
    assert len(markers) == 1
    assert markers[0]["name"] == "Pavagada Trade Centre"
    assert markers[0]["buildingType"] == "Commercial"

    # 5. Register Business in Unit G-01
    biz_payload = {
        "buildingId": building_id,
        "floorId": floor_id,
        "unitId": unit_id,
        "name": "Pavagada Medicals",
        "kannadaName": "ಪಾವಗಡ ಮೆಡಿಕಲ್ಸ್",
        "shopOrUnitNumber": "Shop G-01",
        "ownerName": "K. R. Venkatesh",
        "businessModel": "Retail",
        "businessStatus": "Operating",
        "categoryId": "commercial-trade",
        "subcategory": "Pharmacy & Healthcare",
        "offersHomeDelivery": True,
        "pricePositioning": "Economical",
        "paymentMethods": ["Cash", "UPI"],
        "customerTypes": ["Local Residents", "Farmers"],
        "openTime": "08:30",
        "closeTime": "22:00",
        "weeklyHoliday": "None",
        "publicPhone": "9845012345",
        "isContactPublic": True,
        # Financial Research (Consented)
        "financialConsentGranted": True,
        "monthlyRevenueRange": "₹1.5L - ₹3L",
        "monthlyRentRange": "₹8,000 - ₹12,000",
        "estimatedGrossMargin": "15-20%",
        "profitabilityAssessment": "Profitable",
        "roadType": "Main Road",
        "visibilityFromRoad": "High",
        "products": [
            {
                "itemType": "PRODUCT",
                "name": "Generic Medicines & First Aid",
                "brand": "Various",
                "priceRange": "₹10 - ₹500",
                "isPopular": True,
            }
        ]
    }

    create_biz_res = client.post("/api/businesses", json=biz_payload, headers=headers)
    assert create_biz_res.status_code == 201
    biz_data = create_biz_res.get_json()["data"]
    biz_id = biz_data["id"]
    assert biz_data["name"] == "Pavagada Medicals"
    assert biz_data["financialResearch"]["consentGranted"] is True
    assert biz_data["financialResearch"]["monthlyRevenueRange"] == "₹1.5L - ₹3L"

    # 6. Verify Public Endpoint STRICTLY HIDES Financial Research
    public_biz_res = client.get(f"/api/businesses/{biz_id}")
    assert public_biz_res.status_code == 200
    public_data = public_biz_res.get_json()["data"]
    assert "financialResearch" not in public_data
    assert "replicationResearch" not in public_data

    # But authenticated request includes restricted research
    auth_biz_res = client.get(f"/api/businesses/{biz_id}", headers=headers)
    assert auth_biz_res.status_code == 200
    auth_data = auth_biz_res.get_json()["data"]
    assert "financialResearch" in auth_data
    assert auth_data["financialResearch"]["monthlyRevenueRange"] == "₹1.5L - ₹3L"

    # 7. Check Surveyor Gamification Stats
    profile_res = client.get("/api/survey/profile", headers=headers)
    assert profile_res.status_code == 200
    profile_data = profile_res.get_json()["data"]
    assert profile_data["totalPoints"] > 0
    assert profile_data["buildingsMappedCount"] == 1
    assert profile_data["shopsRegisteredCount"] == 1
    assert len(profile_data["badges"]) >= 1

    # Check Dashboard Stats
    dash_res = client.get("/api/survey/dashboard-stats", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.get_json()["data"]
    assert dash_data["totalBuildings"] == 1
    assert dash_data["totalShops"] == 1
    assert len(dash_data["dailyChallenges"]) == 3

    # 8. Test Bulk Offline Sync
    sync_payload = {
        "buildings": [
            {
                "clientDraftId": "draft_bld_999",
                "name": "Kalyandurga Road Complex",
                "address": "Kalyandurga Road, Pavagada",
                "area": "Kalyandurga Road",
                "buildingType": "Mixed-use",
                "latitude": 14.1040,
                "longitude": 77.2810,
            }
        ],
        "businesses": [
            {
                "clientDraftId": "draft_biz_888",
                "buildingId": "draft_bld_999",
                "name": "Pavagada Agro Feeds",
                "businessModel": "Retail + Wholesale",
                "ownerName": "B. Hanumanthappa",
            }
        ]
    }

    sync_res = client.post("/api/survey/bulk-sync", json=sync_payload, headers=headers)
    assert sync_res.status_code == 200
    sync_data = sync_res.get_json()["data"]
    assert sync_data["syncedBuildingsCount"] == 1
    assert sync_data["syncedBusinessesCount"] == 1
    assert "draft_bld_999" in sync_data["idMapping"]
    reconciled_bld_id = sync_data["idMapping"]["draft_bld_999"]
    reconciled_biz_id = sync_data["idMapping"]["draft_biz_888"]

    # Verify business is linked to reconciled building server ID
    saved_biz_res = client.get(f"/api/businesses/{reconciled_biz_id}", headers=headers)
    assert saved_biz_res.status_code == 200
    assert saved_biz_res.get_json()["data"]["buildingId"] == reconciled_bld_id


def test_building_and_business_archive_workflow(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Building
    b_res = client.post("/api/buildings", json={
        "name": "Archive Test Arcade",
        "address": "Subhash Road",
        "area": "Town Center",
        "buildingType": "Commercial",
        "latitude": 14.1011,
        "longitude": 77.2788,
        "floors": [{
            "floorLevel": 0,
            "floorName": "Ground",
            "units": [{"unitNumber": "A-1", "unitType": "Retail Shop", "usage": "Commercial"}]
        }]
    }, headers=headers)
    assert b_res.status_code == 201
    b_data = b_res.get_json()["data"]
    bld_id = b_data["id"]
    unit_id = b_data["floors"][0]["units"][0]["id"]

    # 2. Register Business in this Building & Unit
    biz_res = client.post("/api/businesses", json={
        "buildingId": bld_id,
        "unitId": unit_id,
        "name": "Shri Venkateshwara Electronics",
        "businessModel": "Retail",
        "shopOrUnitNumber": "A-1",
    }, headers=headers)
    assert biz_res.status_code == 201
    biz_id = biz_res.get_json()["data"]["id"]

    # 3. Verify markers include businessesCount
    markers_res = client.get("/api/buildings/map/markers")
    assert markers_res.status_code == 200
    markers = markers_res.get_json()["data"]
    matching = [m for m in markers if m["id"] == bld_id]
    assert len(matching) == 1
    assert matching[0]["businessesCount"] == 1

    # 4. Attempt hard delete without force -> 409 Conflict
    hard_del_res = client.delete(f"/api/buildings/{bld_id}?archive=false", headers=headers)
    assert hard_del_res.status_code == 409

    # 5. Safe Archive Building -> Success, businesses preserved
    archive_res = client.delete(f"/api/buildings/{bld_id}?archive=true", headers=headers)
    assert archive_res.status_code == 200
    assert archive_res.get_json()["data"]["archived"] is True
    assert archive_res.get_json()["data"]["businessesPreserved"] == 1

    # Verify building marker is now removed from active map
    m_after = client.get("/api/buildings/map/markers").get_json()["data"]
    assert not any(m["id"] == bld_id for m in m_after)

def test_point_deduplication_and_single_building_at_point(client):
    """Verify that creating multiple buildings at the exact same point deduplicates to exactly one building."""
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    test_lat = 14.10334
    test_lng = 77.27665

    # 1. Create first building at point
    res1 = client.post("/api/buildings", json={
        "name": "Point Building A",
        "address": "Main Bazar",
        "latitude": test_lat,
        "longitude": test_lng,
        "buildingType": "Commercial",
    }, headers=headers)
    assert res1.status_code == 201
    b1_id = res1.get_json()["data"]["id"]

    # 2. Attempt to create second building at the exact same point
    res2 = client.post("/api/buildings", json={
        "name": "Point Building A (Updated)",
        "address": "Main Bazar Near Circle",
        "latitude": test_lat,
        "longitude": test_lng,
        "buildingType": "Commercial",
    }, headers=headers)
    assert res2.status_code == 201
    b2_id = res2.get_json()["data"]["id"]

    # Crucial assertion: exactly the same building ID is updated, NO duplicate created!
    assert b1_id == b2_id

    # 3. Test business deduplication in the same building
    biz1 = client.post("/api/businesses", json={
        "buildingId": b1_id,
        "name": "Pavagada Sweets",
        "businessModel": "Retail",
    }, headers=headers)
    assert biz1.status_code == 201
    biz1_id = biz1.get_json()["data"]["id"]

    # Duplicate business registration
    biz2 = client.post("/api/businesses", json={
        "buildingId": b1_id,
        "name": "Pavagada Sweets",
        "businessModel": "Retail",
    }, headers=headers)
    assert biz2.status_code == 201
    biz2_id = biz2.get_json()["data"]["id"]

    assert biz1_id == biz2_id

    # Verify business record still exists
    biz_check = client.get(f"/api/businesses/{biz1_id}", headers=headers)
    assert biz_check.status_code == 200
    assert biz_check.get_json()["data"]["id"] == biz1_id

    # 4. Archive Business
    archive_biz_res = client.delete(f"/api/businesses/{biz1_id}?archive=true", headers=headers)
    assert archive_biz_res.status_code == 200
    assert archive_biz_res.get_json()["data"]["archived"] is True

    # Verify business status is ARCHIVED
    biz_archived = client.get(f"/api/businesses/{biz1_id}", headers=headers).get_json()["data"]
    assert biz_archived["status"] == "ARCHIVED"
    assert biz_archived["status"] == "ARCHIVED"

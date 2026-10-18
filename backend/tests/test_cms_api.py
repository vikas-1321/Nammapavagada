import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app import create_app
from app.config.config import Config
from app.models.base import db
from app.models.admin_user import AdminUser
from app.models.category import Category
from app.models.location import Location
from app.models.tag import Tag

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-jwt-secret-cms-key"
    SECRET_KEY = "test-secret-cms-key"

@pytest.fixture
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()

        admin = AdminUser(
            email="cmsadmin@nammapavagada.com",
            full_name="CMS Admin",
            role="SUPER_ADMIN",
            is_active=True,
        )
        admin.set_password("AdminPass@2026")
        db.session.add(admin)

        cat = Category(
            id="EMERGENCY_CRITICAL_CARE",
            name="Emergency & Critical Care",
            short_code="EMRG",
        )
        db.session.add(cat)
        db.session.commit()

        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_token(client):
    res = client.post("/api/auth/login", json={
        "email": "cmsadmin@nammapavagada.com",
        "password": "AdminPass@2026"
    })
    return res.get_json()["data"]["token"]

def test_cms_tags_api(client, auth_token):
    # 1. Create tag
    res = client.post("/api/admin/tags", json={
        "name": "24/7 Emergency",
        "category": "AVAILABILITY",
        "description": "Round the clock emergency"
    }, headers={"Authorization": f"Bearer {auth_token}"})
    assert res.status_code == 201
    assert res.get_json()["data"]["name"] == "24/7 Emergency"

    # 2. Get tags
    res = client.get("/api/tags")
    assert res.status_code == 200
    assert len(res.get_json()["data"]) >= 1

    # 3. Get grouped tags
    res = client.get("/api/tags/grouped")
    assert res.status_code == 200
    assert "AVAILABILITY" in res.get_json()["data"]

def test_cms_location_full_flow(client, auth_token):
    # 1. Duplicate check before creation
    dup_res = client.get("/api/admin/locations/check-duplicate?name=Pavagada Taluk Hospital",
                         headers={"Authorization": f"Bearer {auth_token}"})
    assert dup_res.status_code == 200
    assert dup_res.get_json()["data"]["hasDuplicates"] is False

    # 2. Create CMS location
    loc_payload = {
        "name": "Pavagada Taluk Hospital",
        "shortName": "Taluk Hospital",
        "category": "EMERGENCY_CRITICAL_CARE",
        "subcategory": "Emergency Hospital",
        "summary": "Primary government hospital with 24/7 casualty desk.",
        "address": "Hospital Road, Pavagada, Karnataka 561202",
        "area": "Pavagada Town",
        "coordinates": {"latitude": 14.1025, "longitude": 77.2798},
        "contact": {
            "authority": "Directorate of Health & Family Welfare",
            "phone": "08136-244222",
            "alternatePhone": "08136-244223",
            "whatsapp": "9449800000",
            "email": "thopavagada@karnataka.gov.in"
        },
        "hours": {
            "is24Hours": True,
            "open": "24 Hours",
            "close": "24 Hours",
            "days": "Daily"
        },
        "categoryData": {
            "hasTraumaCare": True,
            "hasSnakebiteTreatment": True,
            "hasIcu": True,
            "hasAmbulance": True,
            "emergencyPhone": "108"
        },
        "tags": ["Emergency", "24/7", "Government", "Hospital"],
        "verification": {
            "status": "VERIFIED",
            "source": "Physical Visit & Taluk Health Officer",
            "verifiedBy": "CMS Admin"
        },
        "status": "PUBLISHED"
    }

    res = client.post("/api/admin/locations", json=loc_payload, headers={"Authorization": f"Bearer {auth_token}"})
    assert res.status_code == 201
    created = res.get_json()["data"]
    assert created["subcategory"] == "Emergency Hospital"
    assert created["categoryData"]["hasSnakebiteTreatment"] is True
    assert created["verification"]["status"] == "VERIFIED"
    assert "Emergency" in created["tags"]

    loc_id = created["id"]

    # 3. Duplicate check should now detect this hospital
    dup_res2 = client.get(f"/api/admin/locations/check-duplicate?name=Pavagada Taluk Hospital",
                          headers={"Authorization": f"Bearer {auth_token}"})
    assert dup_res2.status_code == 200
    assert dup_res2.get_json()["data"]["hasDuplicates"] is True

    # 4. Freshness stats
    fresh_res = client.get("/api/admin/locations/freshness", headers={"Authorization": f"Bearer {auth_token}"})
    assert fresh_res.status_code == 200
    stats = fresh_res.get_json()["data"]
    assert stats["totalRecords"] >= 1
    assert stats["verifiedFresh"] >= 1

    # 5. Verify endpoint
    verify_res = client.post(f"/api/admin/locations/{loc_id}/verify", json={
        "status": "VERIFIED",
        "source": "Official Phone Verification",
        "notes": "Verified with Medical Superintendent"
    }, headers={"Authorization": f"Bearer {auth_token}"})
    assert verify_res.status_code == 200
    assert verify_res.get_json()["data"]["verification"]["source"] == "Official Phone Verification"

    # 6. Duplicate location endpoint
    clone_res = client.post(f"/api/admin/locations/{loc_id}/duplicate", headers={"Authorization": f"Bearer {auth_token}"})
    assert clone_res.status_code == 201
    assert "(Copy)" in clone_res.get_json()["data"]["name"]

    # 7. Search endpoint with multi-token query across name, subcategory, and tags
    search_res = client.get("/api/search?q=hospital 24/7 snakebite")
    assert search_res.status_code == 200
    search_data = search_res.get_json()["data"]
    assert any(l["id"] == loc_id for l in search_data["locations"])


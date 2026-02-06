"""
Test suite for profile management endpoints.

This module tests:
- Profile creation and retrieval
- Profile updates
- Authentication requirements
- Data validation
- Error handling
"""

import pytest
import sys
import os
from fastapi.testclient import TestClient

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app
from database import init_db, get_db_connection

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Initialize database before each test"""
    init_db()
    yield
    # Cleanup after test if needed


@pytest.fixture
def auth_token():
    """Create a test user and return auth token"""
    import random
    import string
    
    # Generate random email to avoid conflicts
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    test_email = f"test_{random_suffix}@example.com"
    
    # Register a test user
    response = client.post(
        "/api/auth/register",
        json={
            "email": test_email,
            "password": "testpassword123"
        }
    )
    
    # If user exists, try to login instead
    if response.status_code == 400:
        response = client.post(
            "/api/auth/login",
            json={
                "email": test_email,
                "password": "testpassword123"
            }
        )
    
    assert response.status_code == 200, f"Failed to authenticate: {response.json()}"
    data = response.json()
    return data["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    """Return authorization headers"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestProfileEndpoints:
    """Test profile management endpoints"""

    def test_get_profile_without_auth(self):
        """Test that profile endpoint requires authentication"""
        response = client.get("/api/profile")
        assert response.status_code == 401
        assert "NO_AUTH_HEADER" in str(response.json())

    def test_get_profile_with_invalid_token(self):
        """Test profile endpoint with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/profile", headers=headers)
        assert response.status_code == 401

    def test_get_empty_profile(self, auth_headers):
        """Test getting profile when no data exists (should create empty profile)"""
        response = client.get("/api/profile", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Should have user ID and email
        assert "id" in data
        assert "email" in data
        
        # Other fields should be None or empty
        assert data.get("full_name") is None or data.get("full_name") == ""

    def test_update_profile_basic_info(self, auth_headers):
        """Test updating basic profile information"""
        profile_data = {
            "full_name": "John Doe",
            "phone_number": "+1234567890",
            "date_of_birth": "1990-01-15"
        }
        
        response = client.post("/api/profile", headers=auth_headers, json=profile_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["full_name"] == "John Doe"
        assert data["phone_number"] == "+1234567890"
        assert data["date_of_birth"] == "1990-01-15"

    def test_update_profile_address(self, auth_headers):
        """Test updating address information"""
        profile_data = {
            "address": "123 Main St",
            "city": "New York",
            "zip_code": "10001"
        }
        
        response = client.post("/api/profile", headers=auth_headers, json=profile_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["address"] == "123 Main St"
        assert data["city"] == "New York"
        assert data["zip_code"] == "10001"

    def test_update_profile_health_info(self, auth_headers):
        """Test updating health information"""
        profile_data = {
            "blood_type": "O+",
            "height": 175.5,
            "weight": 70.2,
            "allergies": "Penicillin, peanuts",
            "chronic_conditions": "Asthma",
            "current_medications": "Albuterol inhaler"
        }
        
        response = client.post("/api/profile", headers=auth_headers, json=profile_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["blood_type"] == "O+"
        assert data["height"] == 175.5
        assert data["weight"] == 70.2
        assert data["allergies"] == "Penicillin, peanuts"
        assert data["chronic_conditions"] == "Asthma"
        assert data["current_medications"] == "Albuterol inhaler"

    def test_update_profile_emergency_contact(self, auth_headers):
        """Test updating emergency contact information"""
        profile_data = {
            "emergency_contact_name": "Jane Doe",
            "emergency_contact_phone": "+1987654321"
        }
        
        response = client.post("/api/profile", headers=auth_headers, json=profile_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["emergency_contact_name"] == "Jane Doe"
        assert data["emergency_contact_phone"] == "+1987654321"

    def test_update_profile_insurance(self, auth_headers):
        """Test updating insurance information"""
        profile_data = {
            "insurance_provider": "Blue Cross",
            "insurance_number": "BC123456789"
        }
        
        response = client.post("/api/profile", headers=auth_headers, json=profile_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["insurance_provider"] == "Blue Cross"
        assert data["insurance_number"] == "BC123456789"

    def test_update_profile_location(self, auth_headers):
        """Test updating location coordinates"""
        profile_data = {
            "latitude": 40.7128,
            "longitude": -74.0060
        }
        
        response = client.post("/api/profile", headers=auth_headers, json=profile_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["latitude"] == 40.7128
        assert data["longitude"] == -74.0060

    def test_update_profile_medical_history(self, auth_headers):
        """Test updating medical history (JSON array)"""
        profile_data = {
            "medical_history": [
                {"condition": "Appendicitis", "year": 2015, "treatment": "Surgery"},
                {"condition": "Broken arm", "year": 2018, "treatment": "Cast"}
            ]
        }
        
        response = client.post("/api/profile", headers=auth_headers, json=profile_data)
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data["medical_history"], list)
        assert len(data["medical_history"]) == 2
        assert data["medical_history"][0]["condition"] == "Appendicitis"

    def test_update_profile_partial(self, auth_headers):
        """Test partial profile update (only some fields)"""
        # First update
        response1 = client.post(
            "/api/profile",
            headers=auth_headers,
            json={"full_name": "John Doe", "phone_number": "+1234567890"}
        )
        assert response1.status_code == 200
        
        # Second update (partial)
        response2 = client.post(
            "/api/profile",
            headers=auth_headers,
            json={"city": "Boston"}
        )
        assert response2.status_code == 200
        data = response2.json()
        
        # Previous data should be preserved
        assert data["full_name"] == "John Doe"
        assert data["phone_number"] == "+1234567890"
        # New data should be added
        assert data["city"] == "Boston"

    def test_profile_persistence(self, auth_headers):
        """Test that profile data persists across requests"""
        # Update profile
        profile_data = {
            "full_name": "Test User",
            "blood_type": "A+",
            "city": "San Francisco"
        }
        client.post("/api/profile", headers=auth_headers, json=profile_data)
        
        # Retrieve profile
        response = client.get("/api/profile", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["full_name"] == "Test User"
        assert data["blood_type"] == "A+"
        assert data["city"] == "San Francisco"

    def test_update_profile_without_auth(self):
        """Test that profile update requires authentication"""
        response = client.post(
            "/api/profile",
            json={"full_name": "John Doe"}
        )
        assert response.status_code == 401

    def test_profile_isolation_between_users(self):
        """Test that users can only access their own profiles"""
        import random
        import string
        
        # Generate random emails
        random_suffix1 = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        random_suffix2 = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        
        # Create first user
        response1 = client.post(
            "/api/auth/register",
            json={"email": f"user1_{random_suffix1}@example.com", "password": "password123"}
        )
        assert response1.status_code == 200, f"User 1 registration failed: {response1.json()}"
        token1 = response1.json()["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}
        
        # Create second user
        response2 = client.post(
            "/api/auth/register",
            json={"email": f"user2_{random_suffix2}@example.com", "password": "password123"}
        )
        assert response2.status_code == 200, f"User 2 registration failed: {response2.json()}"
        token2 = response2.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        # Update user1's profile
        client.post(
            "/api/profile",
            headers=headers1,
            json={"full_name": "User One"}
        )
        
        # Update user2's profile
        client.post(
            "/api/profile",
            headers=headers2,
            json={"full_name": "User Two"}
        )
        
        # Verify user1 sees their own data
        response1 = client.get("/api/profile", headers=headers1)
        assert response1.json()["full_name"] == "User One"
        
        # Verify user2 sees their own data
        response2 = client.get("/api/profile", headers=headers2)
        assert response2.json()["full_name"] == "User Two"


class TestProfileValidation:
    """Test profile data validation"""

    def test_invalid_field_ignored(self, auth_headers):
        """Test that invalid fields are ignored"""
        profile_data = {
            "full_name": "John Doe",
            "invalid_field": "should be ignored",
            "another_invalid": 123
        }
        
        response = client.post("/api/profile", headers=auth_headers, json=profile_data)
        assert response.status_code == 200
        data = response.json()
        
        assert data["full_name"] == "John Doe"
        assert "invalid_field" not in data
        assert "another_invalid" not in data


def test_profile_api_documentation():
    """Test that profile endpoints are documented in OpenAPI"""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    openapi_spec = response.json()
    
    # Check that profile endpoints exist
    assert "/api/profile" in openapi_spec["paths"]
    assert "get" in openapi_spec["paths"]["/api/profile"]
    assert "post" in openapi_spec["paths"]["/api/profile"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

"""
Integration tests for Gemini API endpoints
"""

import pytest
from fastapi.testclient import TestClient
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app

client = TestClient(app)

# Sample base64 image (1x1 pixel PNG)
SAMPLE_BASE64_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
SAMPLE_DATA_URI = f"data:image/png;base64,{SAMPLE_BASE64_IMAGE}"


class TestImageAnalysisEndpoints:
    """Test cases for image analysis endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for protected endpoints"""
        # Register a test user
        response = client.post(
            "/api/auth/register",
            json={
                "email": f"test_{os.urandom(4).hex()}@example.com",
                "password": "testpass123"
            }
        )
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_analyze_image_endpoint_without_auth(self):
        """Test that protected endpoint requires authentication"""
        response = client.post(
            "/api/analyze-image",
            json={
                "image": SAMPLE_DATA_URI,
                "symptoms": "Test symptoms"
            }
        )
        
        assert response.status_code == 401
    
    def test_analyze_image_endpoint_with_auth(self, auth_token):
        """Test image analysis with authentication"""
        if not os.environ.get("GEMINI_API_KEY"):
            pytest.skip("GEMINI_API_KEY not configured")
        
        response = client.post(
            "/api/analyze-image",
            json={
                "image": SAMPLE_DATA_URI,
                "symptoms": "I have a rash on my arm"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "analysis_text" in data
        assert "detected_symptoms" in data
        assert "possible_conditions" in data
        assert "urgency_level" in data
        assert "recommendations" in data
        assert "disclaimer" in data
    
    def test_analyze_image_public_endpoint(self):
        """Test public image analysis endpoint"""
        if not os.environ.get("GEMINI_API_KEY"):
            pytest.skip("GEMINI_API_KEY not configured")
        
        response = client.post(
            "/api/analyze-image-public",
            json={
                "image": SAMPLE_DATA_URI,
                "symptoms": "Test symptoms"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "analysis_text" in data
    
    def test_analyze_image_invalid_base64(self, auth_token):
        """Test handling of invalid base64 image"""
        response = client.post(
            "/api/analyze-image",
            json={
                "image": "not-valid-base64!!!",
                "symptoms": "Test"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 400
        assert "INVALID_IMAGE_DATA" in response.json()["detail"]["code"]
    
    def test_analyze_image_with_user_prompt(self, auth_token):
        """Test image analysis with custom user prompt"""
        if not os.environ.get("GEMINI_API_KEY"):
            pytest.skip("GEMINI_API_KEY not configured")
        
        response = client.post(
            "/api/analyze-image",
            json={
                "image": SAMPLE_DATA_URI,
                "symptoms": "Rash on arm",
                "user_prompt": "Focus on skin conditions"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_analyze_image_without_gemini_key(self, auth_token):
        """Test error handling when Gemini API key is not configured"""
        # Temporarily remove API key
        original_key = os.environ.get("GEMINI_API_KEY")
        if original_key:
            del os.environ["GEMINI_API_KEY"]
        
        try:
            response = client.post(
                "/api/analyze-image",
                json={"image": SAMPLE_DATA_URI},
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            
            assert response.status_code == 500
            assert "GEMINI_NOT_CONFIGURED" in response.json()["detail"]["code"]
        finally:
            # Restore API key
            if original_key:
                os.environ["GEMINI_API_KEY"] = original_key
    
    def test_analyze_image_response_structure(self, auth_token):
        """Test that response has correct structure"""
        if not os.environ.get("GEMINI_API_KEY"):
            pytest.skip("GEMINI_API_KEY not configured")
        
        response = client.post(
            "/api/analyze-image",
            json={"image": SAMPLE_DATA_URI},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check all required fields
        required_fields = [
            "success", "analysis_text", "detected_symptoms",
            "possible_conditions", "urgency_level", 
            "recommendations", "disclaimer"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        # Check data types
        assert isinstance(data["success"], bool)
        assert isinstance(data["analysis_text"], str)
        assert isinstance(data["detected_symptoms"], list)
        assert isinstance(data["possible_conditions"], list)
        assert isinstance(data["urgency_level"], str)
        assert isinstance(data["recommendations"], list)
        assert isinstance(data["disclaimer"], str)
    
    def test_analyze_image_symptom_structure(self, auth_token):
        """Test that detected symptoms have correct structure"""
        if not os.environ.get("GEMINI_API_KEY"):
            pytest.skip("GEMINI_API_KEY not configured")
        
        response = client.post(
            "/api/analyze-image",
            json={
                "image": SAMPLE_DATA_URI,
                "symptoms": "Rash and swelling"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data["detected_symptoms"]) > 0:
            symptom = data["detected_symptoms"][0]
            
            assert "symptom_name" in symptom
            assert "severity" in symptom
            assert "confidence" in symptom
            
            assert isinstance(symptom["symptom_name"], str)
            assert isinstance(symptom["severity"], str)
            assert isinstance(symptom["confidence"], (int, float))
            assert 0 <= symptom["confidence"] <= 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

"""
Unit tests for Gemini Image Analysis Service
"""

import pytest
import base64
import os
from unittest.mock import Mock, patch, MagicMock
from gemini_service import GeminiService, ImageAnalysisResult, SymptomData


# Sample base64 image (1x1 pixel PNG)
SAMPLE_BASE64_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
SAMPLE_DATA_URI = f"data:image/png;base64,{SAMPLE_BASE64_IMAGE}"


class TestGeminiService:
    """Test cases for GeminiService"""
    
    def test_init_without_api_key(self):
        """Test that initialization fails without API key"""
        with pytest.raises(ValueError, match="Gemini API key is required"):
            GeminiService(api_key="")
    
    def test_init_with_api_key(self):
        """Test successful initialization with API key"""
        service = GeminiService(api_key="test-api-key")
        assert service is not None
    
    def test_prepare_image_data_with_data_uri(self):
        """Test image data preparation with data URI prefix"""
        service = GeminiService(api_key="test-api-key")
        result = service._prepare_image_data(SAMPLE_DATA_URI)
        
        assert 'mime_type' in result
        assert 'data' in result
        assert isinstance(result['data'], bytes)
    
    def test_prepare_image_data_without_prefix(self):
        """Test image data preparation without data URI prefix"""
        service = GeminiService(api_key="test-api-key")
        result = service._prepare_image_data(SAMPLE_BASE64_IMAGE)
        
        assert 'mime_type' in result
        assert 'data' in result
        assert isinstance(result['data'], bytes)
    
    def test_prepare_image_data_invalid(self):
        """Test that invalid base64 raises ValueError"""
        service = GeminiService(api_key="test-api-key")
        
        with pytest.raises(ValueError, match="Invalid image data"):
            service._prepare_image_data("not-valid-base64!!!")
    
    def test_parse_analysis_response_with_symptoms(self):
        """Test parsing response with detected symptoms"""
        service = GeminiService(api_key="test-api-key")
        
        response_text = """
        Analysis: The image shows visible redness and swelling on the skin.
        This appears to be a mild rash, possibly due to an allergic reaction or dermatitis.
        Recommendation: Keep the area clean and consult a healthcare professional.
        """
        
        result = service._parse_analysis_response(response_text)
        
        assert isinstance(result, ImageAnalysisResult)
        assert result.analysis_text == response_text
        assert len(result.detected_symptoms) > 0
        assert result.urgency_level in ['low', 'medium', 'high', 'emergency']
        assert len(result.recommendations) > 0
    
    def test_parse_analysis_response_high_urgency(self):
        """Test that urgent keywords trigger high urgency level"""
        service = GeminiService(api_key="test-api-key")
        
        response_text = "This is an emergency situation requiring immediate medical attention."
        result = service._parse_analysis_response(response_text)
        
        assert result.urgency_level == "high"
    
    def test_parse_analysis_response_low_urgency(self):
        """Test that mild keywords trigger low urgency level"""
        service = GeminiService(api_key="test-api-key")
        
        response_text = "This appears to be a mild condition with minor symptoms."
        result = service._parse_analysis_response(response_text)
        
        assert result.urgency_level == "low"
    
    @pytest.mark.asyncio
    @patch('gemini_service.genai.GenerativeModel')
    async def test_analyze_medical_image_success(self, mock_model_class):
        """Test successful image analysis"""
        # Mock the Gemini API response
        mock_response = Mock()
        mock_response.text = "Analysis: Visible rash with mild redness. Possible dermatitis."
        
        mock_model = Mock()
        mock_model.generate_content.return_value = mock_response
        mock_model_class.return_value = mock_model
        
        service = GeminiService(api_key="test-api-key")
        service.model = mock_model
        
        result = await service.analyze_medical_image(
            base64_image=SAMPLE_DATA_URI,
            user_prompt="I have a rash"
        )
        
        assert isinstance(result, ImageAnalysisResult)
        assert result.analysis_text is not None
        assert mock_model.generate_content.called
    
    @pytest.mark.asyncio
    @patch('gemini_service.genai.GenerativeModel')
    async def test_analyze_medical_image_no_response(self, mock_model_class):
        """Test handling of empty API response"""
        mock_response = Mock()
        mock_response.text = None
        
        mock_model = Mock()
        mock_model.generate_content.return_value = mock_response
        mock_model_class.return_value = mock_model
        
        service = GeminiService(api_key="test-api-key")
        service.model = mock_model
        
        with pytest.raises(Exception, match="No response received"):
            await service.analyze_medical_image(base64_image=SAMPLE_DATA_URI)
    
    @pytest.mark.asyncio
    async def test_analyze_medical_image_invalid_image(self):
        """Test handling of invalid image data"""
        service = GeminiService(api_key="test-api-key")
        
        with pytest.raises(ValueError):
            await service.analyze_medical_image(base64_image="invalid-data")
    
    @pytest.mark.asyncio
    @patch('gemini_service.genai.GenerativeModel')
    async def test_analyze_medical_image_with_user_prompt(self, mock_model_class):
        """Test that user prompt is included in API call"""
        mock_response = Mock()
        mock_response.text = "Analysis complete"
        
        mock_model = Mock()
        mock_model.generate_content.return_value = mock_response
        mock_model_class.return_value = mock_model
        
        service = GeminiService(api_key="test-api-key")
        service.model = mock_model
        
        user_prompt = "Focus on skin conditions"
        await service.analyze_medical_image(
            base64_image=SAMPLE_DATA_URI,
            user_prompt=user_prompt
        )
        
        # Verify that generate_content was called
        assert mock_model.generate_content.called
        call_args = mock_model.generate_content.call_args[0][0]
        
        # Check that user prompt is in the call
        assert any(user_prompt in str(arg) for arg in call_args)


class TestSymptomData:
    """Test cases for SymptomData model"""
    
    def test_symptom_data_creation(self):
        """Test creating SymptomData instance"""
        symptom = SymptomData(
            symptom_name="Rash",
            severity="moderate",
            confidence=0.85,
            description="Red rash on arm"
        )
        
        assert symptom.symptom_name == "Rash"
        assert symptom.severity == "moderate"
        assert symptom.confidence == 0.85
        assert symptom.description == "Red rash on arm"
    
    def test_symptom_data_optional_description(self):
        """Test that description is optional"""
        symptom = SymptomData(
            symptom_name="Pain",
            severity="mild",
            confidence=0.7
        )
        
        assert symptom.description is None


class TestImageAnalysisResult:
    """Test cases for ImageAnalysisResult model"""
    
    def test_image_analysis_result_creation(self):
        """Test creating ImageAnalysisResult instance"""
        result = ImageAnalysisResult(
            analysis_text="Test analysis",
            detected_symptoms=[],
            possible_conditions=["Condition A"],
            urgency_level="medium",
            recommendations=["See a doctor"]
        )
        
        assert result.analysis_text == "Test analysis"
        assert len(result.detected_symptoms) == 0
        assert "Condition A" in result.possible_conditions
        assert result.urgency_level == "medium"
        assert "See a doctor" in result.recommendations
        assert "AI-generated" in result.disclaimer


# Integration test (requires actual API key)
@pytest.mark.skipif(
    not os.environ.get("GEMINI_API_KEY"),
    reason="GEMINI_API_KEY not set"
)
@pytest.mark.asyncio
async def test_real_api_call():
    """Integration test with real Gemini API (skipped if no API key)"""
    service = GeminiService(api_key=os.environ.get("GEMINI_API_KEY"))
    
    result = await service.analyze_medical_image(
        base64_image=SAMPLE_DATA_URI,
        user_prompt="Test image analysis"
    )
    
    assert isinstance(result, ImageAnalysisResult)
    assert result.analysis_text is not None
    assert len(result.recommendations) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

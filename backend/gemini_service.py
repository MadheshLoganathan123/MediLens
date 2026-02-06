"""
Gemini API Service for Medical Image Analysis
Handles image analysis using Google's Gemini AI model
"""

import os
import base64
import logging
from typing import Dict, Any, Optional, List
import google.generativeai as genai
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class SymptomData(BaseModel):
    """Standardized symptom data structure"""
    symptom_name: str
    severity: str  # mild, moderate, severe
    confidence: float  # 0.0 to 1.0
    description: Optional[str] = None


class ImageAnalysisResult(BaseModel):
    """Structured response for image analysis"""
    analysis_text: str
    detected_symptoms: List[SymptomData]
    possible_conditions: List[str]
    urgency_level: str  # low, medium, high, emergency
    recommendations: List[str]
    disclaimer: str = "This is an AI-generated analysis and should not replace professional medical advice."


class GeminiService:
    """Service class for interacting with Google Gemini API"""
    
    def __init__(self, api_key: str):
        """Initialize Gemini service with API key"""
        if not api_key:
            raise ValueError("Gemini API key is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        logger.info("Gemini service initialized successfully")
    
    def _prepare_image_data(self, base64_image: str) -> Dict[str, Any]:
        """
        Prepare image data for Gemini API
        
        Args:
            base64_image: Base64 encoded image string (with or without data URI prefix)
        
        Returns:
            Dictionary with image data ready for Gemini API
        """
        try:
            # Remove data URI prefix if present
            if ',' in base64_image:
                base64_data = base64_image.split(',')[1]
            else:
                base64_data = base64_image
            
            # Decode base64 to bytes
            image_bytes = base64.b64decode(base64_data)
            
            return {
                'mime_type': 'image/jpeg',  # Default to JPEG, can be enhanced
                'data': image_bytes
            }
        except Exception as e:
            logger.error(f"Error preparing image data: {str(e)}")
            raise ValueError(f"Invalid image data: {str(e)}")
    
    def _parse_analysis_response(self, response_text: str) -> ImageAnalysisResult:
        """
        Parse Gemini response into structured format
        
        Args:
            response_text: Raw text response from Gemini
        
        Returns:
            Structured ImageAnalysisResult
        """
        # This is a simplified parser. In production, you might want to use
        # more sophisticated NLP or prompt engineering to get structured output
        
        detected_symptoms = []
        possible_conditions = []
        recommendations = []
        urgency_level = "medium"
        
        # Parse response text (simplified logic)
        lines = response_text.lower().split('\n')
        
        # Extract urgency level
        if any(word in response_text.lower() for word in ['emergency', 'urgent', 'immediate', 'severe']):
            urgency_level = "high"
        elif any(word in response_text.lower() for word in ['mild', 'minor', 'slight']):
            urgency_level = "low"
        
        # Extract symptoms (simplified - looks for common symptom keywords)
        symptom_keywords = ['rash', 'swelling', 'redness', 'pain', 'inflammation', 
                           'lesion', 'bruise', 'cut', 'burn', 'infection']
        
        for keyword in symptom_keywords:
            if keyword in response_text.lower():
                detected_symptoms.append(SymptomData(
                    symptom_name=keyword.capitalize(),
                    severity="moderate",
                    confidence=0.7,
                    description=f"Detected {keyword} in image"
                ))
        
        # Extract conditions (simplified)
        condition_keywords = ['dermatitis', 'eczema', 'psoriasis', 'acne', 'infection',
                             'allergy', 'injury', 'wound']
        
        for keyword in condition_keywords:
            if keyword in response_text.lower():
                possible_conditions.append(keyword.capitalize())
        
        # Default recommendations
        recommendations = [
            "Consult a healthcare professional for proper diagnosis",
            "Monitor the condition for any changes",
            "Keep the affected area clean and dry"
        ]
        
        return ImageAnalysisResult(
            analysis_text=response_text,
            detected_symptoms=detected_symptoms,
            possible_conditions=possible_conditions if possible_conditions else ["Requires professional evaluation"],
            urgency_level=urgency_level,
            recommendations=recommendations
        )
    
    async def analyze_medical_image(
        self, 
        base64_image: str, 
        user_prompt: Optional[str] = None
    ) -> ImageAnalysisResult:
        """
        Analyze medical image using Gemini API
        
        Args:
            base64_image: Base64 encoded image
            user_prompt: Optional user-provided context or symptoms
        
        Returns:
            Structured analysis result
        
        Raises:
            ValueError: If image data is invalid
            Exception: If API call fails
        """
        try:
            # Prepare image data
            image_data = self._prepare_image_data(base64_image)
            
            # Construct prompt
            system_prompt = """You are a medical image analysis assistant. Analyze the provided image for:
1. Visible symptoms or abnormalities
2. Possible medical conditions
3. Severity/urgency level
4. Recommended actions

Provide a detailed but concise analysis. Be factual and medical in your assessment.
Always remind users to consult healthcare professionals for proper diagnosis."""
            
            if user_prompt:
                full_prompt = f"{system_prompt}\n\nUser context: {user_prompt}\n\nAnalyze the image:"
            else:
                full_prompt = f"{system_prompt}\n\nAnalyze the image:"
            
            logger.info("Sending request to Gemini API")
            
            # Generate content using Gemini
            response = self.model.generate_content([
                full_prompt,
                {
                    'mime_type': image_data['mime_type'],
                    'data': image_data['data']
                }
            ])
            
            if not response or not response.text:
                raise Exception("No response received from Gemini API")
            
            logger.info("Successfully received response from Gemini API")
            
            # Parse and structure the response
            result = self._parse_analysis_response(response.text)
            
            return result
            
        except ValueError as e:
            logger.error(f"Validation error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error analyzing image with Gemini: {str(e)}")
            raise Exception(f"Image analysis failed: {str(e)}")


# Singleton instance
_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    """Get or create Gemini service instance"""
    global _gemini_service
    
    if _gemini_service is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        _gemini_service = GeminiService(api_key)
    
    return _gemini_service

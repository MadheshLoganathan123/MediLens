import os
import json
import tempfile
from PIL import Image as PILImage
from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.media import Image as AgnoImage
from .processor import ImageProcessor

class MedicalSymptomAnalyzer:
    def __init__(self):
        # Initialize Gemini API key
        api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY or GEMINI_API_KEY environment variable is not set")
        
        os.environ["GOOGLE_API_KEY"] = api_key
        
        # Initialize the Medical Agent with Gemini
        self.medical_agent = Agent(
            model=Gemini(id="gemini-2.0-flash-exp"),
            tools=[DuckDuckGoTools()],
            markdown=True
        )
        
        self.processor = ImageProcessor()

    def analyze(self, image_bytes):
        """
        Analyzes the medical image and returns a structured summary using Gemini AI.
        """
        # Medical Analysis Query
        query = """You are a highly skilled medical imaging expert with extensive knowledge in radiology and diagnostic imaging. 
Analyze the medical image and provide a structured JSON response with the following fields:

{
    "analysis_text": "brief summary of what you observe in the image",
    "detected_symptoms": [
        {
            "symptom_name": "name of symptom",
            "severity": "low / medium / high",
            "description": "brief description"
        }
    ],
    "possible_conditions": ["list of potential conditions based on visible symptoms"],
    "urgency_level": "low / medium / high / emergency",
    "recommendations": ["specific action advice for the patient"],
    "disclaimer": "This is not a medical diagnosis. Please consult a healthcare professional."
}

Guidelines:
- Focus ONLY on what is visible in the image
- Do not hallucinate details not present
- Use simple but professional medical language
- Be specific about visible symptoms
- Provide actionable recommendations
- Set urgency_level based on severity: emergency for critical, high for urgent, medium for moderate, low for minor
- Always include the medical disclaimer

Return ONLY valid JSON, no additional text or markdown."""

        try:
            # Save image bytes to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
                # Convert bytes to PIL Image
                from io import BytesIO
                pil_image = PILImage.open(BytesIO(image_bytes))
                
                # Resize image for optimal processing
                width, height = pil_image.size
                aspect_ratio = width / height
                new_width = 500
                new_height = int(new_width / aspect_ratio)
                resized_image = pil_image.resize((new_width, new_height))
                
                # Save to temp file
                resized_image.save(temp_file.name)
                temp_path = temp_file.name
            
            # Create AgnoImage object
            agno_image = AgnoImage(filepath=temp_path)
            
            # Run AI analysis
            response = self.medical_agent.run(query, images=[agno_image])
            
            # Clean up temporary file
            os.remove(temp_path)
            
            # Parse response content
            content = response.content
            
            # Try to extract JSON from response
            if isinstance(content, str):
                # Remove markdown code blocks if present
                content = content.strip()
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()
                
                # Parse JSON
                result_json = json.loads(content)
            else:
                result_json = content
            
            # Ensure all required fields are present with correct names
            if "analysis_text" not in result_json:
                result_json["analysis_text"] = "Image analysis completed"
            
            if "detected_symptoms" not in result_json:
                result_json["detected_symptoms"] = []
            
            if "possible_conditions" not in result_json:
                result_json["possible_conditions"] = ["Further medical evaluation needed"]
            
            # Map severity_level to urgency_level if needed
            if "severity_level" in result_json and "urgency_level" not in result_json:
                result_json["urgency_level"] = result_json["severity_level"]
            
            if "urgency_level" not in result_json:
                result_json["urgency_level"] = "medium"
            
            if "recommendations" not in result_json:
                if "recommendation" in result_json:
                    # Convert single recommendation to array
                    result_json["recommendations"] = [result_json["recommendation"]]
                else:
                    result_json["recommendations"] = ["Please consult a healthcare professional for proper diagnosis"]
            
            if "disclaimer" not in result_json:
                result_json["disclaimer"] = "This is not a medical diagnosis. Please consult a healthcare professional."
            
            # Add success flag
            result_json["success"] = True
            
            return result_json

        except json.JSONDecodeError as e:
            # If JSON parsing fails, create a structured response from the text
            return {
                "success": False,
                "analysis_text": "Analysis completed but response format needs adjustment",
                "detected_symptoms": [],
                "possible_conditions": ["Please consult a healthcare professional"],
                "urgency_level": "medium",
                "recommendations": ["Seek professional medical evaluation for accurate diagnosis"],
                "disclaimer": "This is not a medical diagnosis. Please consult a healthcare professional.",
                "raw_response": str(response.content) if 'response' in locals() else "No response"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to analyze image",
                "analysis_text": "Analysis error occurred",
                "detected_symptoms": [],
                "possible_conditions": ["Technical issue during analysis"],
                "urgency_level": "unknown",
                "recommendations": ["Please try again or consult a healthcare professional"],
                "disclaimer": "This is not a medical diagnosis. Please consult a healthcare professional."
            }

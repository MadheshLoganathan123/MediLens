from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import sys
import json
import requests
import logging
import tempfile
from supabase import create_client, Client
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Try relative imports first, fall back to absolute imports
try:
    from .config import settings
    from .auth_routes import router as auth_router, get_current_user
    from .database import get_profile_by_id, upsert_profile
except ImportError:
    from config import settings
    from auth_routes import router as auth_router, get_current_user
    from database import get_profile_by_id, upsert_profile

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Look for .env in current and parent directories
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv()

app = FastAPI(title="MediLens Patient API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase setup (backend should use service role key when available)
supabase_url: str = (
    os.environ.get("SUPABASE_URL")
    or os.environ.get("VITE_SUPABASE_URL")
    or str(settings.SUPABASE_URL)
)

service_role_key: str | None = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or settings.SUPABASE_SERVICE_ROLE_KEY
anon_key: str | None = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

key_to_use: str | None = service_role_key or anon_key

if not supabase_url or not key_to_use:
    raise RuntimeError(
        "SUPABASE_URL and at least one of SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY must be set."
    )

supabase: Client = create_client(supabase_url, key_to_use)

class Profile(BaseModel):
    id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    zip_code: Optional[str] = None
    blood_type: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    current_medications: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_number: Optional[str] = None
    medical_history: Optional[List[dict]] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ProfileUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    zip_code: Optional[str] = None
    blood_type: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    current_medications: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_number: Optional[str] = None
    medical_history: Optional[List[dict]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AnalyzeRequest(BaseModel):
    symptoms: str
    has_image: bool = False


class AnalyzeResponse(BaseModel):
    analysis: str


class HealthCaseCreate(BaseModel):
    symptoms: str
    severity: Optional[str] = None
    category: Optional[str] = None


class HealthCaseUpdate(BaseModel):
    symptoms: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None


class HealthCaseResponse(BaseModel):
    id: str
    user_id: str
    symptoms: str
    ai_analysis: Optional[Dict[str, Any]] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    status: str
    created_at: str
    updated_at: Optional[str] = None


@app.get("/")
async def root():
    return {"message": "Welcome to MediLens Patient API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_issue(payload: AnalyzeRequest, current_user=Depends(get_current_user)):
    """
    Analyze user symptoms using Gemini AI with agno library.
    Note: This endpoint is for text-only analysis. Use /api/analyze-image for image analysis.
    """
    # Check if Google/Gemini API key is configured
    if not (os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")):
        raise HTTPException(
            status_code=500,
            detail={
                "code": "GEMINI_NOT_CONFIGURED",
                "message": "Google/Gemini API key is not configured on the backend.",
            },
        )
    
    try:
        from agno.agent import Agent
        from agno.models.google import Gemini
        
        # Initialize Gemini agent
        api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
        os.environ["GOOGLE_API_KEY"] = api_key
        
        agent = Agent(
            model=Gemini(id="gemini-2.0-flash-exp"),
            markdown=True
        )
        
        # Create a simple text prompt
        prompt = f"""You are a medical triage assistant. 
        Analyze these symptoms and provide:
        1. A concise summary
        2. Possible causes
        3. Urgency level
        
        Keep the answer under 200 words.
        
        Symptoms: {payload.symptoms}
        """
        
        # Use Gemini's text generation
        response = agent.run(prompt)
        analysis_text = response.content if response and response.content else "Unable to generate analysis"
        
        return AnalyzeResponse(analysis=analysis_text)
        
    except Exception as e:
        logger.error(f"Error in symptom analysis: {str(e)}")
        raise HTTPException(
            status_code=502,
            detail={"code": "AI_BACKEND_ERROR", "message": f"AI analysis error: {str(e)}"},
        )

@app.get("/api/profile", response_model=Profile)
async def get_profile(current_user=Depends(get_current_user)):
    profile = get_profile_by_id(current_user["id"])
    if not profile:
        # Create empty profile if it doesn't exist
        logger.info(f"Creating empty profile for user: {current_user['id']}")
        profile = upsert_profile(current_user["id"], {"email": current_user.get("email")})
    return profile


@app.post("/api/profile", response_model=Profile)
async def update_profile(profile: ProfileUpdate, current_user=Depends(get_current_user)):
    """Update the current user's profile using a partial payload.

    The `id` is taken from the authenticated `current_user` and is not required
    in the request body. Only provided fields will be updated.
    """
    provided = profile.dict(exclude_unset=True)
    update_data = provided.copy()

    # Upsert into local DB
    try:
        result = upsert_profile(current_user["id"], update_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "PROFILE_UPDATE_ERROR", "message": str(e)})

    return result


# Health Cases Endpoints

@app.post("/api/cases", response_model=HealthCaseResponse)
async def create_case(case: HealthCaseCreate, current_user=Depends(get_current_user)):
    """Create a new health case for the current user."""
    try:
        case_data = {
            "user_id": current_user["id"],
            "symptoms": case.symptoms,
            "severity": case.severity,
            "category": case.category,
            "status": "open",
        }
        
        response = supabase.table("health_cases").insert(case_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=400,
                detail={"code": "CASE_CREATE_FAILED", "message": "Failed to create health case"},
            )
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "CASE_CREATE_ERROR", "message": f"Error creating case: {str(e)}"},
        )


@app.get("/api/cases", response_model=List[HealthCaseResponse])
async def list_cases(current_user=Depends(get_current_user)):
    """List all health cases for the current user."""
    try:
        response = (
            supabase.table("health_cases")
            .select("*")
            .eq("user_id", current_user["id"])
            .order("created_at", desc=True)
            .execute()
        )
        
        return response.data or []
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "CASES_FETCH_ERROR", "message": f"Error fetching cases: {str(e)}"},
        )


@app.get("/api/cases/{case_id}", response_model=HealthCaseResponse)
async def get_case(case_id: str, current_user=Depends(get_current_user)):
    """Get a specific health case (user can only access their own)."""
    try:
        response = (
            supabase.table("health_cases")
            .select("*")
            .eq("id", case_id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )
        
        if not response.data:
            raise HTTPException(
                status_code=404,
                detail={"code": "CASE_NOT_FOUND", "message": "Health case not found"},
            )
        
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "CASE_FETCH_ERROR", "message": f"Error fetching case: {str(e)}"},
        )


@app.put("/api/cases/{case_id}", response_model=HealthCaseResponse)
async def update_case(case_id: str, update: HealthCaseUpdate, current_user=Depends(get_current_user)):
    """Update a health case (user can only update their own)."""
    try:
        # Verify ownership
        check_response = (
            supabase.table("health_cases")
            .select("id")
            .eq("id", case_id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )
        
        if not check_response.data:
            raise HTTPException(
                status_code=404,
                detail={"code": "CASE_NOT_FOUND", "message": "Health case not found or access denied"},
            )
        
        # Build update data (only include fields that are not None)
        update_data = {}
        if update.symptoms is not None:
            update_data["symptoms"] = update.symptoms
        if update.severity is not None:
            update_data["severity"] = update.severity
        if update.category is not None:
            update_data["category"] = update.category
        if update.status is not None:
            update_data["status"] = update.status
        
        if not update_data:
            raise HTTPException(
                status_code=400,
                detail={"code": "NO_UPDATE_FIELDS", "message": "No fields to update provided"},
            )
        
        # Perform update
        response = (
            supabase.table("health_cases")
            .update(update_data)
            .eq("id", case_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
        
        if not response.data:
            raise HTTPException(
                status_code=400,
                detail={"code": "CASE_UPDATE_FAILED", "message": "Failed to update health case"},
            )
        
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "CASE_UPDATE_ERROR", "message": f"Error updating case: {str(e)}"},
        )


@app.get("/api/map-style")
async def get_map_style():
    rapidapi_key = os.environ.get("RAPIDAPI_KEY")
    if not rapidapi_key:
        logger.warning("RAPIDAPI_KEY not set in environment")
        return {"error": "RAPIDAPI_KEY not configured"}

    url = "https://raster-and-vector-maps.p.rapidapi.com/v1/styles/osm-carto/style.json"
    headers = {
        "X-RapidAPI-Key": rapidapi_key,
        "X-RapidAPI-Host": "raster-and-vector-maps.p.rapidapi.com"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Failed to fetch map style: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Failed to fetch map style: {str(e)}")

@app.get("/api/hospitals")
async def get_hospitals():
    try:
        # Path to the hospitals.json file relative to backend/main.py
        # Use absolute path from project root for reliability
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(backend_dir)
        json_path = os.path.join(project_root, "src", "data", "hospitals.json")
        
        if not os.path.exists(json_path):
            raise HTTPException(
                status_code=404, 
                detail=f"Hospitals data file not found at {json_path}"
            )
        
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Hospitals data file not found")
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error decoding hospitals data: {str(e)}"
        )


# Medical Image Analysis Endpoints (Gemini with agno library)

class ImageAnalysisRequest(BaseModel):
    """Request model for image analysis"""
    image: str  # Base64 encoded image
    symptoms: Optional[str] = None  # Optional user-provided symptoms/context
    user_prompt: Optional[str] = None  # Optional custom prompt


@app.post("/api/analyze-image")
async def analyze_medical_image_endpoint(
    request: ImageAnalysisRequest,
    current_user=Depends(get_current_user)
):
    """
    Analyze medical image using Gemini AI with agno library
    
    This endpoint accepts a base64-encoded image and optional context,
    then returns structured analysis including detected symptoms,
    possible conditions, and recommendations.
    
    **Authentication Required:** Yes (Bearer token)
    
    **Request Body:**
    - image: Base64 encoded image string (with or without data URI prefix)
    - symptoms: Optional text describing current symptoms
    - user_prompt: Optional custom analysis prompt
    
    **Response:**
    - observed_symptoms: List of observable physical signs
    - possible_causes: List of potential conditions
    - severity_level: Assessment (low, medium, high)
    - recommendation: Specific action advice
    - disclaimer: Medical disclaimer
    
    **Example Request:**
    ```json
    {
        "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
        "symptoms": "I have a rash on my arm that appeared yesterday",
        "user_prompt": "Focus on skin conditions"
    }
    ```
    """
    try:
        # Import medical analyzer
        try:
            from models.analyzer import MedicalSymptomAnalyzer
        except ImportError:
            from .models.analyzer import MedicalSymptomAnalyzer
        
        # Check if Google/Gemini API key is configured
        if not (os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")):
            raise HTTPException(
                status_code=500,
                detail={
                    "code": "GEMINI_NOT_CONFIGURED",
                    "message": "Google/Gemini API key is not configured on the backend"
                }
            )
        
        logger.info(f"Image analysis requested by user: {current_user['id']}")
        
        # Remove data URI prefix if present
        image_data = request.image
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64 to bytes
        import base64
        image_bytes = base64.b64decode(image_data)
        
        # Initialize analyzer and analyze
        analyzer = MedicalSymptomAnalyzer()
        result = analyzer.analyze(image_bytes)
        
        # Check for errors
        if "error" in result:
            raise HTTPException(
                status_code=500,
                detail={
                    "code": "ANALYSIS_ERROR",
                    "message": result.get("message", "Failed to analyze image")
                }
            )
        
        logger.info(f"Image analysis completed for user: {current_user['id']}")
        
        return result
        
    except ValueError as e:
        logger.error(f"Validation error in image analysis: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_IMAGE_DATA",
                "message": str(e)
            }
        )
    except Exception as e:
        logger.error(f"Error in image analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "code": "IMAGE_ANALYSIS_ERROR",
                "message": f"Failed to analyze image: {str(e)}"
            }
        )


@app.post("/api/analyze-image-public")
async def analyze_medical_image_public(request: ImageAnalysisRequest):
    """
    Public endpoint for image analysis (no authentication required)
    
    This is useful for testing or allowing users to try the service
    before signing up. Consider adding rate limiting in production.
    """
    try:
        try:
            from models.analyzer import MedicalSymptomAnalyzer
        except ImportError:
            from .models.analyzer import MedicalSymptomAnalyzer
        
        if not (os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")):
            raise HTTPException(
                status_code=500,
                detail={
                    "code": "GEMINI_NOT_CONFIGURED",
                    "message": "Google/Gemini API key is not configured"
                }
            )
        
        logger.info("Public image analysis requested")
        
        # Remove data URI prefix if present
        image_data = request.image
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64 to bytes
        import base64
        image_bytes = base64.b64decode(image_data)
        
        # Initialize analyzer and analyze
        analyzer = MedicalSymptomAnalyzer()
        result = analyzer.analyze(image_bytes)
        
        # Check for errors
        if "error" in result:
            raise HTTPException(
                status_code=500,
                detail={
                    "code": "ANALYSIS_ERROR",
                    "message": result.get("message", "Failed to analyze image")
                }
            )
        
        logger.info("Public image analysis completed")
        
        return result
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_IMAGE_DATA", "message": str(e)}
        )
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"code": "IMAGE_ANALYSIS_ERROR", "message": str(e)}
        )




# Voice Transcription Endpoint (Whisper)

# Load Whisper model on startup (lazy loading to avoid startup delay)
whisper_model = None

def get_whisper_model():
    """Lazy load Whisper model to avoid startup delay"""
    global whisper_model
    if whisper_model is None:
        try:
            import whisper
            logger.info("Loading Whisper model (base)...")
            whisper_model = whisper.load_model("base")
            logger.info("Whisper model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail={
                    "code": "WHISPER_LOAD_ERROR",
                    "message": f"Failed to load Whisper model: {str(e)}"
                }
            )
    return whisper_model


class TranscriptionResponse(BaseModel):
    """Response model for voice transcription"""
    success: bool
    transcript: str
    language: Optional[str] = None
    confidence: Optional[float] = None


@app.post("/api/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    """
    Transcribe audio file to text using OpenAI Whisper
    
    This endpoint accepts audio files (WAV, MP3, M4A, etc.) and returns
    the transcribed text. Useful for voice input of symptoms.
    
    **Authentication Required:** Yes (Bearer token)
    
    **Request:**
    - file: Audio file (multipart/form-data)
    
    **Response:**
    - success: Boolean indicating if transcription was successful
    - transcript: The transcribed text
    - language: Detected language (optional)
    - confidence: Confidence score (optional)
    
    **Supported Audio Formats:**
    - WAV, MP3, M4A, FLAC, OGG, WEBM
    
    **Example Usage:**
    ```python
    files = {'file': open('audio.wav', 'rb')}
    response = requests.post(
        'http://localhost:5000/api/transcribe',
        files=files,
        headers={'Authorization': 'Bearer <token>'}
    )
    ```
    """
    # Validate file type
    allowed_extensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.webm']
    file_ext = os.path.splitext(file.filename)[1].lower() if file.filename else ''
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_FILE_TYPE",
                "message": f"File type {file_ext} not supported. Allowed: {', '.join(allowed_extensions)}"
            }
        )
    
    logger.info(f"Transcription requested by user: {current_user['id']}, file: {file.filename}")
    
    # Save uploaded audio to a temporary file
    temp_filename = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            content = await file.read()
            tmp.write(content)
            temp_filename = tmp.name
        
        logger.info(f"Audio file saved to temp: {temp_filename}, size: {len(content)} bytes")
        
        # Get Whisper model
        model = get_whisper_model()
        
        # Transcribe audio
        logger.info("Starting transcription...")
        result = model.transcribe(temp_filename, fp16=False)
        
        text = result.get("text", "").strip()
        language = result.get("language")
        
        # Calculate average confidence if available
        segments = result.get("segments", [])
        confidence = None
        if segments:
            confidences = [seg.get("no_speech_prob", 0) for seg in segments]
            confidence = 1.0 - (sum(confidences) / len(confidences)) if confidences else None
        
        logger.info(f"Transcription completed: {len(text)} characters, language: {language}")
        
        if not text:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "NO_SPEECH_DETECTED",
                    "message": "No speech detected in the audio file. Please try again."
                }
            )
        
        return TranscriptionResponse(
            success=True,
            transcript=text,
            language=language,
            confidence=confidence
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during transcription: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "code": "TRANSCRIPTION_ERROR",
                "message": f"Failed to transcribe audio: {str(e)}"
            }
        )
    finally:
        # Clean up temporary file
        if temp_filename and os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
                logger.info(f"Temp file removed: {temp_filename}")
            except Exception as e:
                logger.warning(f"Failed to remove temp file: {str(e)}")


@app.post("/api/transcribe-public", response_model=TranscriptionResponse)
async def transcribe_audio_public(file: UploadFile = File(...)):
    """
    Public endpoint for audio transcription (no authentication required)
    
    This is useful for testing or allowing users to try the service
    before signing up. Consider adding rate limiting in production.
    """
    # Validate file type
    allowed_extensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.webm']
    file_ext = os.path.splitext(file.filename)[1].lower() if file.filename else ''
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_FILE_TYPE",
                "message": f"File type {file_ext} not supported. Allowed: {', '.join(allowed_extensions)}"
            }
        )
    
    logger.info(f"Public transcription requested, file: {file.filename}")
    
    temp_filename = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            content = await file.read()
            tmp.write(content)
            temp_filename = tmp.name
        
        model = get_whisper_model()
        result = model.transcribe(temp_filename, fp16=False)
        
        text = result.get("text", "").strip()
        language = result.get("language")
        
        if not text:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "NO_SPEECH_DETECTED",
                    "message": "No speech detected in the audio file."
                }
            )
        
        return TranscriptionResponse(
            success=True,
            transcript=text,
            language=language
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during public transcription: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "code": "TRANSCRIPTION_ERROR",
                "message": f"Failed to transcribe audio: {str(e)}"
            }
        )
    finally:
        if temp_filename and os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except:
                pass


app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000)

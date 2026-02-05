from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from supabase import create_client, Client
from dotenv import load_dotenv

from .config import settings
from .auth_routes import router as auth_router, get_current_user

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
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    medical_history: Optional[List[dict]] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AnalyzeRequest(BaseModel):
    symptoms: str
    has_image: bool = False


class AnalyzeResponse(BaseModel):
    analysis: str

@app.get("/")
async def root():
    return {"message": "Welcome to MediLens Patient API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_issue(payload: AnalyzeRequest, current_user=Depends(get_current_user)):
    """
    Analyze user symptoms (and optionally presence of images) using OpenRouter AI.
    """
    if not settings.OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail={
                "code": "OPENROUTER_NOT_CONFIGURED",
                "message": "OPENROUTER_API_KEY is not configured on the backend.",
            },
        )

    # Build OpenRouter request payload
    body = {
        "model": "google/gemma-3-4b-it:free",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "You are a medical triage assistant. "
                            "Given these symptoms (and the note that the user "
                            f"{'has' if payload.has_image else 'has not'} provided images), "
                            "provide a concise summary, possible causes, and an urgency level. "
                            "Keep the answer under 200 words.\n\n"
                            f"Symptoms: {payload.symptoms}"
                        ),
                    }
                ],
            }
        ],
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "MediLens",
            },
            json=body,
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        raise HTTPException(
            status_code=502,
            detail={"code": "AI_BACKEND_ERROR", "message": f"AI backend error: {e}"},
        )

    try:
        analysis_text = data["choices"][0]["message"]["content"]
    except Exception:
        raise HTTPException(
            status_code=502,
            detail={"code": "AI_RESPONSE_ERROR", "message": "Unexpected AI response format"},
        )

    return AnalyzeResponse(analysis=analysis_text)

@app.get("/api/profile", response_model=Profile)
async def get_profile(current_user=Depends(get_current_user)):
    response = supabase.table("profiles").select("*").eq("id", current_user["id"]).execute()
    if not response.data:
        raise HTTPException(
            status_code=404,
            detail={"code": "PROFILE_NOT_FOUND", "message": "Profile not found"},
        )
    return response.data[0]


@app.post("/api/profile", response_model=Profile)
async def update_profile(profile: Profile, current_user=Depends(get_current_user)):
    response = (
        supabase.table("profiles")
        .upsert(
            {
                "id": current_user["id"],
                "full_name": profile.full_name,
                "phone_number": profile.phone_number,
                "date_of_birth": profile.date_of_birth,
                "medical_history": profile.medical_history,
                "latitude": profile.latitude,
                "longitude": profile.longitude,
            }
        )
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=400,
            detail={"code": "PROFILE_UPDATE_FAILED", "message": "Failed to update profile"},
        )
    return response.data[0]

import json
import requests

# ... (existing code)

@app.get("/api/map-style")
async def get_map_style():
    rapidapi_key = os.environ.get("RAPIDAPI_KEY")
    if not rapidapi_key:
        # Placeholder behavior or error if key is missing
        # For now, let's warn but try to proceed if the user hasn't set it yet, 
        # though the upstream request will likely fail without a valid key.
        print("Warning: RAPIDAPI_KEY not set in environment.")
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
        raise HTTPException(status_code=502, detail=f"Failed to fetch map style: {str(e)}")

@app.get("/api/hospitals")
async def get_hospitals():
    try:
        # Path to the hospitals.json file relative to backend/main.py
        json_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "hospitals.json")
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Hospitals data file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding hospitals data")

app.include_router(auth_router, prefix="/api", tags=["auth"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000)

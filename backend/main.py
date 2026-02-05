from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Look for .env in current and parent directories
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv()

app = FastAPI(title="MediLens Patient API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase setup
# Try to get variables with or without VITE_ prefix
url: str = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_ANON_KEY not found in environment variables.")
    # For local development, provide placeholders to avoid crash during start if possible, 
    # but the client requires valid URL format.
    url = url or "https://placeholder.supabase.co"
    key = key or "placeholder"

supabase: Client = create_client(url, key)

class Profile(BaseModel):
    id: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    medical_history: Optional[List[dict]] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@app.get("/")
async def root():
    return {"message": "Welcome to MediLens Patient API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/profile/{user_id}", response_model=Profile)
async def get_profile(user_id: str):
    response = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return response.data[0]

@app.post("/profile", response_model=Profile)
async def update_profile(profile: Profile):
    response = supabase.table("profiles").upsert({
        "id": profile.id,
        "full_name": profile.full_name,
        "phone_number": profile.phone_number,
        "date_of_birth": profile.date_of_birth,
        "medical_history": profile.medical_history,
        "latitude": profile.latitude,
        "longitude": profile.longitude
    }).execute()
    
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to update profile")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)

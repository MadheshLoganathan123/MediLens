from pydantic import BaseModel
from typing import List, Optional

class SymptomAnalysisResponse(BaseModel):
    observed_symptoms: List[str]
    possible_causes: List[str]
    severity_level: str
    recommendation: str
    disclaimer: str

class ErrorResponse(BaseModel):
    error: str
    message: str

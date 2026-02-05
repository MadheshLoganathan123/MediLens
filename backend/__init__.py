"""
Backend package for MediLens FastAPI application.

This file makes the `backend` directory a Python package so that
relative imports like `from .config import settings` work correctly
when running the app with:

    uvicorn backend.main:app --reload

from the project root.
"""


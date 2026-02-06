@echo off
REM MediLens Backend Startup Script (Windows Batch)
REM This script starts the FastAPI backend server

echo Starting MediLens Backend Server...
echo.

REM Check if virtual environment exists
if exist ".venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
) else (
    echo Warning: Virtual environment not found at .venv
    echo Continuing with system Python...
)

REM Check if backend directory exists
if not exist "backend" (
    echo Error: backend directory not found!
    exit /b 1
)

REM Check if .env file exists
if not exist "backend\.env" (
    echo Warning: backend\.env file not found!
    echo Please create backend\.env with required configuration.
    echo See backend\.env.example for reference.
    echo.
)

echo Starting server on http://127.0.0.1:5000
echo API Documentation: http://127.0.0.1:5000/docs
echo Press CTRL+C to stop the server
echo.

REM Start the server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 5000 --reload

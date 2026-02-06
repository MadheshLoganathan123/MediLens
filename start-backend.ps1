# MediLens Backend Startup Script
# This script starts the FastAPI backend server

Write-Host "Starting MediLens Backend Server..." -ForegroundColor Green
Write-Host ""

# Check if virtual environment exists
if (Test-Path ".venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & .venv\Scripts\Activate.ps1
} else {
    Write-Host "Warning: Virtual environment not found at .venv" -ForegroundColor Yellow
    Write-Host "Continuing with system Python..." -ForegroundColor Yellow
}

# Check if backend directory exists
if (-not (Test-Path "backend")) {
    Write-Host "Error: backend directory not found!" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "Warning: backend\.env file not found!" -ForegroundColor Yellow
    Write-Host "Please create backend\.env with required configuration." -ForegroundColor Yellow
    Write-Host "See backend\.env.example for reference." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Starting server on http://127.0.0.1:5000" -ForegroundColor Green
Write-Host "API Documentation: http://127.0.0.1:5000/docs" -ForegroundColor Cyan
Write-Host "Press CTRL+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 5000 --reload

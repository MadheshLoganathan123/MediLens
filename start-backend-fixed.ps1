# MediLens Backend Startup Script (Fixed)
# Run this from the PROJECT ROOT directory

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "Starting MediLens Backend Server" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend/main.py")) {
    Write-Host "ERROR: backend/main.py not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Gray
    exit 1
}

# Kill any existing Python processes
Write-Host "Stopping any existing backend processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*python*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✓ Cleared old processes" -ForegroundColor Green
Write-Host ""

# Check if virtual environment exists
if (Test-Path ".venv/Scripts/Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & .venv/Scripts/Activate.ps1
    Write-Host "✓ Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "Warning: No virtual environment found" -ForegroundColor Yellow
    Write-Host "Using system Python..." -ForegroundColor Gray
}
Write-Host ""

# Check environment variables
Write-Host "Checking configuration..." -ForegroundColor Yellow
if (Test-Path "backend/.env") {
    $envContent = Get-Content "backend/.env" -Raw
    if ($envContent -match "GEMINI_API_KEY") {
        Write-Host "✓ Gemini API key configured" -ForegroundColor Green
    } else {
        Write-Host "⚠ Warning: GEMINI_API_KEY not found in backend/.env" -ForegroundColor Yellow
    }
    if ($envContent -match "VITE_SUPABASE_URL") {
        Write-Host "✓ Supabase configured" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ Warning: backend/.env not found" -ForegroundColor Yellow
}
Write-Host ""

# Start the server
Write-Host "Starting FastAPI server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Server URL:    http://127.0.0.1:5000" -ForegroundColor Green
Write-Host "API Docs:      http://127.0.0.1:5000/docs" -ForegroundColor Green
Write-Host "Health Check:  http://127.0.0.1:5000/health" -ForegroundColor Green
Write-Host ""
Write-Host "Press CTRL+C to stop the server" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Run from project root with correct module path
python -m uvicorn backend.main:app --host 127.0.0.1 --port 5000 --reload

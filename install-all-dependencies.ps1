# Install ALL Backend Dependencies
# This script installs everything needed for the MediLens backend

Write-Host "=== Installing ALL Backend Dependencies ===" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host ""
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Check FFmpeg
Write-Host ""
Write-Host "Checking FFmpeg installation..." -ForegroundColor Yellow
try {
    $ffmpegVersion = ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host "  ✓ FFmpeg is installed" -ForegroundColor Green
}
catch {
    Write-Host "  ⚠ FFmpeg not found (needed for voice input)" -ForegroundColor Yellow
    Write-Host "  Download from: https://www.gyan.dev/ffmpeg/builds/" -ForegroundColor Gray
    Write-Host "  Extract to C:\ffmpeg and add C:\ffmpeg\bin to PATH" -ForegroundColor Gray
}

# Install ALL dependencies from requirements.txt
Write-Host ""
Write-Host "Installing all dependencies from requirements.txt..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes..." -ForegroundColor Gray
pip install -r backend/requirements.txt

# Verify critical packages
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Yellow

$criticalPackages = @(
    "fastapi",
    "uvicorn",
    "supabase",
    "agno",
    "google-generativeai",
    "opencv-python",
    "openai-whisper",
    "torch"
)

$allInstalled = $true

foreach ($package in $criticalPackages) {
    try {
        $version = pip show $package 2>$null | Select-String "Version:" | ForEach-Object { $_.ToString().Split(":")[1].Trim() }
        if ($version) {
            Write-Host "  ✓ $package ($version)" -ForegroundColor Green
        }
        else {
            Write-Host "  ✗ $package not found" -ForegroundColor Red
            $allInstalled = $false
        }
    }
    catch {
        Write-Host "  ✗ $package not found" -ForegroundColor Red
        $allInstalled = $false
    }
}

Write-Host ""
if ($allInstalled) {
    Write-Host "=== Installation Complete! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ All backend dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Features enabled:" -ForegroundColor Cyan
    Write-Host "  ✓ FastAPI backend" -ForegroundColor White
    Write-Host "  ✓ Supabase integration" -ForegroundColor White
    Write-Host "  ✓ Gemini AI (image analysis)" -ForegroundColor White
    Write-Host "  ✓ Whisper AI (voice input)" -ForegroundColor White
    Write-Host "  ✓ Image preprocessing (OpenCV)" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Make sure API keys are set in backend\.env:" -ForegroundColor White
    Write-Host "   - GOOGLE_API_KEY (for Gemini)" -ForegroundColor Gray
    Write-Host "   - GEMINI_API_KEY (for Gemini)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Start the backend:" -ForegroundColor White
    Write-Host "   .\start-backend-fixed.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Test the features:" -ForegroundColor White
    Write-Host "   - Image analysis: Upload medical image" -ForegroundColor Gray
    Write-Host "   - Voice input: Record symptoms" -ForegroundColor Gray
    Write-Host ""
    
    # Check FFmpeg again
    try {
        ffmpeg -version 2>&1 | Out-Null
    }
    catch {
        Write-Host "⚠ Note: FFmpeg not detected. Voice input requires FFmpeg." -ForegroundColor Yellow
        Write-Host "   Download: https://www.gyan.dev/ffmpeg/builds/" -ForegroundColor Gray
        Write-Host "   Extract to C:\ffmpeg and add to PATH" -ForegroundColor Gray
    }
}
else {
    Write-Host "=== Installation Issues Detected ===" -ForegroundColor Red
    Write-Host ""
    Write-Host "Some packages failed to install." -ForegroundColor Yellow
    Write-Host "This might be due to:" -ForegroundColor Yellow
    Write-Host "  - Network issues" -ForegroundColor Gray
    Write-Host "  - Python version (need 3.8+)" -ForegroundColor Gray
    Write-Host "  - Missing system dependencies" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Try:" -ForegroundColor Yellow
    Write-Host "  pip install -r backend/requirements.txt --verbose" -ForegroundColor Gray
    exit 1
}

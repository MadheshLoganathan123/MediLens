# Install Whisper Dependencies for Voice Input

Write-Host "=== Installing Whisper for Voice Input ===" -ForegroundColor Cyan
Write-Host ""

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# Check FFmpeg
Write-Host ""
Write-Host "Checking FFmpeg installation..." -ForegroundColor Yellow
try {
    $ffmpegVersion = ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host "  ✓ FFmpeg is installed: $ffmpegVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ FFmpeg not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install FFmpeg:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://ffmpeg.org/download.html" -ForegroundColor White
    Write-Host "2. Extract to C:\ffmpeg" -ForegroundColor White
    Write-Host "3. Add C:\ffmpeg\bin to PATH" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use Chocolatey: choco install ffmpeg" -ForegroundColor Gray
    exit 1
}

# Install Whisper
Write-Host ""
Write-Host "Installing OpenAI Whisper..." -ForegroundColor Yellow
pip install openai-whisper torch ffmpeg-python

# Verify installation
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Yellow

$packages = @("openai-whisper", "torch", "ffmpeg-python")
$allInstalled = $true

foreach ($package in $packages) {
    try {
        $version = pip show $package 2>$null | Select-String "Version:" | ForEach-Object { $_.ToString().Split(":")[1].Trim() }
        if ($version) {
            Write-Host "  ✓ $package ($version)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $package not found" -ForegroundColor Red
            $allInstalled = $false
        }
    } catch {
        Write-Host "  ✗ $package not found" -ForegroundColor Red
        $allInstalled = $false
    }
}

Write-Host ""
if ($allInstalled) {
    Write-Host "=== Installation Complete ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Voice input is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart backend: .\restart-backend-now.ps1" -ForegroundColor White
    Write-Host "2. Test voice input in the app" -ForegroundColor White
    Write-Host "3. Go to Report Health Issue → Voice Input" -ForegroundColor White
    Write-Host ""
    Write-Host "Note: First transcription will take 5-10 seconds (model loading)" -ForegroundColor Yellow
} else {
    Write-Host "=== Installation Failed ===" -ForegroundColor Red
    Write-Host "Some packages failed to install." -ForegroundColor Yellow
    exit 1
}

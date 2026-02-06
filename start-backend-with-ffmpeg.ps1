# Start Backend with FFmpeg in PATH

Write-Host "=== Starting Backend with FFmpeg ===" -ForegroundColor Cyan
Write-Host ""

# Refresh PATH to include FFmpeg
$env:PATH = [Environment]::GetEnvironmentVariable("Path", "User") + ";" + [Environment]::GetEnvironmentVariable("Path", "Machine")

# Verify FFmpeg is available
Write-Host "Checking FFmpeg..." -ForegroundColor Yellow
try {
    $ffmpegVersion = ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host "  FFmpeg found: $ffmpegVersion" -ForegroundColor Green
}
catch {
    Write-Host "  WARNING: FFmpeg not found in PATH" -ForegroundColor Red
    Write-Host "  Voice transcription may not work" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Cyan
Write-Host "  URL: http://127.0.0.1:5000" -ForegroundColor Gray
Write-Host "  Docs: http://127.0.0.1:5000/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "Press CTRL+C to stop" -ForegroundColor Yellow
Write-Host ""

# Change to backend directory and start
Set-Location backend
python -m uvicorn main:app --host 127.0.0.1 --port 5000 --reload

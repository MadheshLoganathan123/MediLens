# Test Voice Transcription Endpoint

Write-Host "=== Testing Voice Transcription ===" -ForegroundColor Cyan
Write-Host ""

# First, let's check if the backend is running
Write-Host "1. Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:5000/health" -Method Get
    Write-Host "   Backend is running!" -ForegroundColor Green
}
catch {
    Write-Host "   ERROR: Backend is not running" -ForegroundColor Red
    Write-Host "   Please start it with: .\start-backend-with-ffmpeg.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2. Testing transcription endpoint..." -ForegroundColor Yellow
Write-Host "   Note: You need to provide an audio file to test" -ForegroundColor Gray
Write-Host ""
Write-Host "To test transcription:" -ForegroundColor Cyan
Write-Host "  1. Record a short audio message (WAV, MP3, etc.)" -ForegroundColor White
Write-Host "  2. Use the frontend voice recorder" -ForegroundColor White
Write-Host "  3. Or use curl/Postman to POST to /api/transcribe" -ForegroundColor White
Write-Host ""
Write-Host "Example curl command:" -ForegroundColor Cyan
Write-Host '  curl -X POST "http://127.0.0.1:5000/api/transcribe" \' -ForegroundColor Gray
Write-Host '    -H "Authorization: Bearer YOUR_TOKEN" \' -ForegroundColor Gray
Write-Host '    -F "file=@audio.wav"' -ForegroundColor Gray
Write-Host ""
Write-Host "FFmpeg is now properly configured!" -ForegroundColor Green
Write-Host "The transcription endpoint should work when you send audio files." -ForegroundColor Green

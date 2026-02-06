# Test Profile API Endpoints

Write-Host "=== MediLens Profile API Tests ===" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "1. Checking backend status..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:5000/health" -Method Get -ErrorAction Stop
    Write-Host "   Backend is running!" -ForegroundColor Green
}
catch {
    Write-Host "   ERROR: Backend is not running" -ForegroundColor Red
    Write-Host "   Please start it with: .\start-backend-with-ffmpeg.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2. Running pytest tests..." -ForegroundColor Yellow
Write-Host ""

# Change to backend directory
Set-Location backend

# Run pytest with verbose output
python -m pytest test_profile_endpoints.py -v --tb=short

$testResult = $LASTEXITCODE

# Return to root directory
Set-Location ..

Write-Host ""
if ($testResult -eq 0) {
    Write-Host "=== All Tests Passed! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Profile API is working correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Import Postman collection: backend/MediLens_Profile_API.postman_collection.json" -ForegroundColor White
    Write-Host "2. Test endpoints manually in Postman" -ForegroundColor White
    Write-Host "3. Integrate with frontend using ProfileScreen component" -ForegroundColor White
}
else {
    Write-Host "=== Some Tests Failed ===" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review the errors above and fix any issues." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "API Documentation: backend/PROFILE_API_DOCUMENTATION.md" -ForegroundColor Cyan
Write-Host "Postman Collection: backend/MediLens_Profile_API.postman_collection.json" -ForegroundColor Cyan
Write-Host ""

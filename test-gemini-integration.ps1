# Test Gemini API Integration
# This script tests the Gemini image analysis endpoint

$BASE_URL = "http://127.0.0.1:5000"

Write-Host "Testing Gemini API Integration..." -ForegroundColor Green
Write-Host ""

# Sample 1x1 pixel PNG image (base64)
$SAMPLE_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Test 1: Check if backend is running
Write-Host "Test 1: Checking backend status..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/health" -UseBasicParsing
    Write-Host "✓ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is not running!" -ForegroundColor Red
    Write-Host "Please start the backend with: .\start-backend.ps1" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 2: Register a test user
Write-Host "Test 2: Registering test user..." -ForegroundColor Cyan
$testEmail = "gemini_test_$(Get-Random)@example.com"
$testPassword = "testpass123"

$registerBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -UseBasicParsing
    
    $content = $response.Content | ConvertFrom-Json
    $token = $content.access_token
    Write-Host "✓ User registered successfully" -ForegroundColor Green
    Write-Host "  Email: $testEmail" -ForegroundColor Gray
} catch {
    Write-Host "✗ Registration failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Test public image analysis endpoint
Write-Host "Test 3: Testing public image analysis..." -ForegroundColor Cyan
$analysisBody = @{
    image = $SAMPLE_IMAGE
    symptoms = "Test symptoms for Gemini analysis"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/analyze-image-public" `
        -Method POST `
        -ContentType "application/json" `
        -Body $analysisBody `
        -UseBasicParsing
    
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✓ Image analysis successful!" -ForegroundColor Green
        Write-Host "  Analysis: $($result.analysis_text.Substring(0, [Math]::Min(100, $result.analysis_text.Length)))..." -ForegroundColor Gray
        Write-Host "  Detected Symptoms: $($result.detected_symptoms.Count)" -ForegroundColor Gray
        Write-Host "  Possible Conditions: $($result.possible_conditions.Count)" -ForegroundColor Gray
        Write-Host "  Urgency Level: $($result.urgency_level)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Analysis returned success=false" -ForegroundColor Red
    }
} catch {
    $errorDetails = $_.ErrorDetails.Message
    if ($errorDetails -like "*GEMINI_NOT_CONFIGURED*") {
        Write-Host "✗ Gemini API key is not configured!" -ForegroundColor Red
        Write-Host "  Please add GEMINI_API_KEY to backend/.env" -ForegroundColor Yellow
        Write-Host "  Example: GEMINI_API_KEY=AIzaSyCCOCoyWg8Sh5Aww6Tpkg5hTrTFw9eqas4" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Analysis failed: $_" -ForegroundColor Red
        Write-Host "  Error details: $errorDetails" -ForegroundColor Gray
    }
    exit 1
}
Write-Host ""

# Test 4: Test protected endpoint with authentication
Write-Host "Test 4: Testing protected image analysis..." -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/analyze-image" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $analysisBody `
        -UseBasicParsing
    
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✓ Protected endpoint works!" -ForegroundColor Green
        Write-Host "  Recommendations: $($result.recommendations.Count)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Protected endpoint failed: $_" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Green
Write-Host "Gemini Integration Tests Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open your app: http://localhost:5173" -ForegroundColor White
Write-Host "2. Login with: $testEmail" -ForegroundColor White
Write-Host "3. Go to 'Report Health Issue'" -ForegroundColor White
Write-Host "4. Upload an image and watch the AI analysis!" -ForegroundColor White
Write-Host ""
Write-Host "API Documentation: $BASE_URL/docs" -ForegroundColor Cyan

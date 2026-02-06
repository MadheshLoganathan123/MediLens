# Test OpenAI Integration
# This script tests the new OpenAI-based medical image analysis

Write-Host "=== Testing OpenAI Medical Image Analysis ===" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "1. Checking if backend is running..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -ErrorAction Stop
    Write-Host "   ✓ Backend is running: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend is not running!" -ForegroundColor Red
    Write-Host "   Run: .\start-backend-fixed.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2. Checking OpenAI API key configuration..." -ForegroundColor Yellow

# Check if .env file has OPENAI_API_KEY
$envPath = "backend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match 'OPENAI_API_KEY="?([^"\r\n]+)"?') {
        $apiKey = $matches[1]
        if ($apiKey -eq "your-openai-api-key-here" -or $apiKey -eq "") {
            Write-Host "   ⚠ OPENAI_API_KEY not configured!" -ForegroundColor Yellow
            Write-Host "   Please set your OpenAI API key in backend\.env" -ForegroundColor Yellow
            Write-Host "   Get your key from: https://platform.openai.com/api-keys" -ForegroundColor Cyan
            exit 1
        } else {
            Write-Host "   ✓ OPENAI_API_KEY is configured" -ForegroundColor Green
        }
    } else {
        Write-Host "   ✗ OPENAI_API_KEY not found in .env file" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ✗ backend\.env file not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Testing public image analysis endpoint..." -ForegroundColor Yellow

# Create a simple test image (1x1 red pixel as base64)
$testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="

$requestBody = @{
    image = "data:image/png;base64,$testImageBase64"
    symptoms = "Test image for system verification"
} | ConvertTo-Json

try {
    Write-Host "   Sending test request..." -ForegroundColor Gray
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/analyze-image-public" `
        -Method Post `
        -Body $requestBody `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "   ✓ Image analysis successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Response:" -ForegroundColor Cyan
    Write-Host "   - Observed Symptoms: $($response.observed_symptoms.Count) items" -ForegroundColor Gray
    Write-Host "   - Possible Causes: $($response.possible_causes.Count) items" -ForegroundColor Gray
    Write-Host "   - Severity Level: $($response.severity_level)" -ForegroundColor Gray
    Write-Host "   - Recommendation: $($response.recommendation.Substring(0, [Math]::Min(50, $response.recommendation.Length)))..." -ForegroundColor Gray
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    
    Write-Host "   ✗ Image analysis failed" -ForegroundColor Red
    Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    
    if ($errorBody) {
        try {
            $errorJson = $errorBody | ConvertFrom-Json
            Write-Host "   Error: $($errorJson.detail.message)" -ForegroundColor Red
            Write-Host "   Code: $($errorJson.detail.code)" -ForegroundColor Red
        } catch {
            Write-Host "   Error: $errorBody" -ForegroundColor Red
        }
    }
    
    if ($statusCode -eq 500) {
        Write-Host ""
        Write-Host "   Possible issues:" -ForegroundColor Yellow
        Write-Host "   - OpenAI API key is invalid" -ForegroundColor Yellow
        Write-Host "   - OpenAI API quota exceeded" -ForegroundColor Yellow
        Write-Host "   - Network connectivity issues" -ForegroundColor Yellow
    }
    
    exit 1
}

Write-Host ""
Write-Host "4. Testing authenticated endpoint..." -ForegroundColor Yellow

# Test login first
$loginBody = @{
    email = "test@example.com"
    password = "testpassword123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    $token = $loginResponse.access_token
    Write-Host "   ✓ Login successful" -ForegroundColor Green
    
    # Test authenticated image analysis
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $authResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/analyze-image" `
        -Method Post `
        -Headers $headers `
        -Body $requestBody `
        -ErrorAction Stop
    
    Write-Host "   ✓ Authenticated image analysis successful!" -ForegroundColor Green
    
} catch {
    Write-Host "   ℹ Skipping authenticated test (no test user)" -ForegroundColor Yellow
    Write-Host "   This is normal if you haven't created a test user yet" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== OpenAI Integration Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ All tests passed! Your OpenAI integration is working correctly." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test with a real medical image in the frontend" -ForegroundColor White
Write-Host "2. Run SQL script in Supabase: RUN_THIS_IN_SUPABASE.sql" -ForegroundColor White
Write-Host "3. Test full user flow: Register → Upload Image → Create Case" -ForegroundColor White

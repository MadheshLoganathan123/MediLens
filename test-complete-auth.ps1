# Complete Authentication Test Script
# Tests registration, login, profile creation, and token verification

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:5000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MediLens Complete Auth Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Generate unique test email
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$testEmail = "test_$timestamp@medilens.test"
$testPassword = "SecurePassword123!"

Write-Host "Test Credentials:" -ForegroundColor Yellow
Write-Host "  Email: $testEmail"
Write-Host "  Password: $testPassword"
Write-Host ""

# Test 1: Health Check
Write-Host "[1/6] Testing health endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✓ Health check passed" -ForegroundColor Green
    Write-Host "  Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
    Write-Host "  Make sure the backend is running on port 5000" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 2: Register New User
Write-Host "[2/6] Testing user registration..." -ForegroundColor Cyan
$registerBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method Post `
        -Body $registerBody `
        -ContentType "application/json"
    
    $accessToken = $registerResponse.access_token
    $userId = $registerResponse.user.id
    
    Write-Host "✓ Registration successful" -ForegroundColor Green
    Write-Host "  User ID: $userId" -ForegroundColor Gray
    Write-Host "  Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Registration failed: $_" -ForegroundColor Red
    Write-Host "  Response: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 3: Get Current User Info
Write-Host "[3/6] Testing /me endpoint..." -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✓ User info retrieved" -ForegroundColor Green
    Write-Host "  User: $($meResponse.user | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to get user info: $_" -ForegroundColor Red
    Write-Host "  Response: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Test 4: Get Profile (should create empty profile if not exists)
Write-Host "[4/6] Testing profile retrieval..." -ForegroundColor Cyan
try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/api/profile" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✓ Profile retrieved" -ForegroundColor Green
    Write-Host "  Profile ID: $($profileResponse.id)" -ForegroundColor Gray
    Write-Host "  Email: $($profileResponse.email)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to get profile: $_" -ForegroundColor Red
    Write-Host "  Response: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: Update Profile
Write-Host "[5/6] Testing profile update..." -ForegroundColor Cyan
$profileUpdateBody = @{
    full_name = "Test User"
    phone_number = "+1234567890"
    date_of_birth = "1990-01-01"
    blood_type = "O+"
    city = "Test City"
    allergies = "None"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/api/profile" `
        -Method Post `
        -Body $profileUpdateBody `
        -ContentType "application/json" `
        -Headers $headers
    
    Write-Host "✓ Profile updated successfully" -ForegroundColor Green
    Write-Host "  Full Name: $($updateResponse.full_name)" -ForegroundColor Gray
    Write-Host "  Phone: $($updateResponse.phone_number)" -ForegroundColor Gray
    Write-Host "  Blood Type: $($updateResponse.blood_type)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to update profile: $_" -ForegroundColor Red
    Write-Host "  Response: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Test 6: Login with Created User
Write-Host "[6/6] Testing login..." -ForegroundColor Cyan
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"
    
    $newToken = $loginResponse.access_token
    
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "  New Token: $($newToken.Substring(0, 20))..." -ForegroundColor Gray
    
    # Verify new token works
    $headers["Authorization"] = "Bearer $newToken"
    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✓ New token verified" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    Write-Host "  Response: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ All authentication tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Test user created:" -ForegroundColor Yellow
Write-Host "  Email: $testEmail"
Write-Host "  Password: $testPassword"
Write-Host "  User ID: $userId"
Write-Host ""
Write-Host "You can use these credentials to test the frontend." -ForegroundColor Gray

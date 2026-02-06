# MediLens Backend Test Script
# This script tests the backend API endpoints

$BASE_URL = "http://127.0.0.1:5000"

Write-Host "Testing MediLens Backend API..." -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/health" -UseBasicParsing
    $content = $response.Content | ConvertFrom-Json
    if ($content.status -eq "healthy") {
        Write-Host "✓ Health check passed" -ForegroundColor Green
    } else {
        Write-Host "✗ Health check failed" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
    Write-Host "Make sure the server is running (run start-backend.ps1)" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 2: Root Endpoint
Write-Host "Test 2: Root Endpoint" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/" -UseBasicParsing
    $content = $response.Content | ConvertFrom-Json
    if ($content.message) {
        Write-Host "✓ Root endpoint passed: $($content.message)" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Root endpoint failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Register User
Write-Host "Test 3: Register User" -ForegroundColor Cyan
$testEmail = "test_$(Get-Random)@example.com"
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
    if ($content.access_token) {
        Write-Host "✓ User registration passed" -ForegroundColor Green
        $token = $content.access_token
        Write-Host "  Token received: $($token.Substring(0, 20))..." -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ User registration failed: $_" -ForegroundColor Red
    $token = $null
}
Write-Host ""

# Test 4: Login
Write-Host "Test 4: Login" -ForegroundColor Cyan
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing
    
    $content = $response.Content | ConvertFrom-Json
    if ($content.access_token) {
        Write-Host "✓ Login passed" -ForegroundColor Green
        $token = $content.access_token
    }
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get Current User (Protected Endpoint)
if ($token) {
    Write-Host "Test 5: Get Current User (Protected)" -ForegroundColor Cyan
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $response = Invoke-WebRequest -Uri "$BASE_URL/api/auth/me" `
            -Headers $headers `
            -UseBasicParsing
        
        $content = $response.Content | ConvertFrom-Json
        if ($content.user) {
            Write-Host "✓ Protected endpoint passed" -ForegroundColor Green
            Write-Host "  User ID: $($content.user.id)" -ForegroundColor Gray
            Write-Host "  Email: $($content.user.email)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "✗ Protected endpoint failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 6: Invalid Token (Should Fail)
Write-Host "Test 6: Invalid Token (Should Fail)" -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer invalid_token_12345"
    }
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/auth/me" `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✗ Should have failed with 401" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Correctly rejected invalid token" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Green
Write-Host "Backend API Tests Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "API Documentation: $BASE_URL/docs" -ForegroundColor Cyan
Write-Host "Alternative Docs: $BASE_URL/redoc" -ForegroundColor Cyan

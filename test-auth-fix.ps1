# Test script to verify authentication fix
# This tests that logging in with different accounts works correctly

Write-Host "Testing Authentication Fix..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000/api"

# Test 1: Register first user
Write-Host "Test 1: Registering first user (user1@test.com)..." -ForegroundColor Yellow
$user1Email = "user1@test.com"
$user1Password = "password123"

try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body (@{
        email = $user1Email
        password = $user1Password
    } | ConvertTo-Json)
    
    $token1 = $response1.access_token
    $userId1 = $response1.user.id
    
    Write-Host "✓ User 1 registered successfully" -ForegroundColor Green
    Write-Host "  User ID: $userId1" -ForegroundColor Gray
    Write-Host "  Email: $($response1.user.email)" -ForegroundColor Gray
    Write-Host ""
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✓ User 1 already exists (expected if running multiple times)" -ForegroundColor Yellow
        
        # Try to login instead
        $response1 = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{
            email = $user1Email
            password = $user1Password
        } | ConvertTo-Json)
        
        $token1 = $response1.access_token
        $userId1 = $response1.user.id
        Write-Host "✓ User 1 logged in successfully" -ForegroundColor Green
        Write-Host "  User ID: $userId1" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "✗ Failed to register/login user 1: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Test 2: Verify user 1 token
Write-Host "Test 2: Verifying user 1 token..." -ForegroundColor Yellow
try {
    $headers1 = @{
        "Authorization" = "Bearer $token1"
    }
    $meResponse1 = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $headers1
    
    if ($meResponse1.user.id -eq $userId1 -and $meResponse1.user.email -eq $user1Email) {
        Write-Host "✓ User 1 token verified correctly" -ForegroundColor Green
        Write-Host "  Returned ID: $($meResponse1.user.id)" -ForegroundColor Gray
        Write-Host "  Returned Email: $($meResponse1.user.email)" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "✗ User 1 token verification failed - wrong user data returned" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Failed to verify user 1 token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Register second user
Write-Host "Test 3: Registering second user (user2@test.com)..." -ForegroundColor Yellow
$user2Email = "user2@test.com"
$user2Password = "password456"

try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body (@{
        email = $user2Email
        password = $user2Password
    } | ConvertTo-Json)
    
    $token2 = $response2.access_token
    $userId2 = $response2.user.id
    
    Write-Host "✓ User 2 registered successfully" -ForegroundColor Green
    Write-Host "  User ID: $userId2" -ForegroundColor Gray
    Write-Host "  Email: $($response2.user.email)" -ForegroundColor Gray
    Write-Host ""
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✓ User 2 already exists (expected if running multiple times)" -ForegroundColor Yellow
        
        # Try to login instead
        $response2 = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{
            email = $user2Email
            password = $user2Password
        } | ConvertTo-Json)
        
        $token2 = $response2.access_token
        $userId2 = $response2.user.id
        Write-Host "✓ User 2 logged in successfully" -ForegroundColor Green
        Write-Host "  User ID: $userId2" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "✗ Failed to register/login user 2: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Test 4: Verify user 2 token
Write-Host "Test 4: Verifying user 2 token..." -ForegroundColor Yellow
try {
    $headers2 = @{
        "Authorization" = "Bearer $token2"
    }
    $meResponse2 = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $headers2
    
    if ($meResponse2.user.id -eq $userId2 -and $meResponse2.user.email -eq $user2Email) {
        Write-Host "✓ User 2 token verified correctly" -ForegroundColor Green
        Write-Host "  Returned ID: $($meResponse2.user.id)" -ForegroundColor Gray
        Write-Host "  Returned Email: $($meResponse2.user.email)" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "✗ User 2 token verification failed - wrong user data returned" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Failed to verify user 2 token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 5: Verify tokens are different
Write-Host "Test 5: Verifying tokens are unique..." -ForegroundColor Yellow
if ($token1 -ne $token2) {
    Write-Host "✓ Tokens are unique for different users" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✗ CRITICAL: Both users have the same token!" -ForegroundColor Red
    exit 1
}

# Test 6: Verify user IDs are different
Write-Host "Test 6: Verifying user IDs are unique..." -ForegroundColor Yellow
if ($userId1 -ne $userId2) {
    Write-Host "✓ User IDs are unique" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✗ CRITICAL: Both users have the same ID!" -ForegroundColor Red
    exit 1
}

# Test 7: Cross-verify tokens don't mix users
Write-Host "Test 7: Cross-verifying tokens don't return wrong users..." -ForegroundColor Yellow
try {
    # Use token1 and verify it returns user1 data
    $crossCheck1 = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $headers1
    
    if ($crossCheck1.user.id -ne $userId1 -or $crossCheck1.user.email -ne $user1Email) {
        Write-Host "✗ CRITICAL: Token 1 returned wrong user data!" -ForegroundColor Red
        Write-Host "  Expected: $userId1 ($user1Email)" -ForegroundColor Red
        Write-Host "  Got: $($crossCheck1.user.id) ($($crossCheck1.user.email))" -ForegroundColor Red
        exit 1
    }
    
    # Use token2 and verify it returns user2 data
    $crossCheck2 = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $headers2
    
    if ($crossCheck2.user.id -ne $userId2 -or $crossCheck2.user.email -ne $user2Email) {
        Write-Host "✗ CRITICAL: Token 2 returned wrong user data!" -ForegroundColor Red
        Write-Host "  Expected: $userId2 ($user2Email)" -ForegroundColor Red
        Write-Host "  Got: $($crossCheck2.user.id) ($($crossCheck2.user.email))" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Tokens correctly return their respective user data" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Failed cross-verification: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ALL TESTS PASSED! ✓" -ForegroundColor Green
Write-Host "Authentication is working correctly." -ForegroundColor Green
Write-Host "Users can now login to their own accounts without mixing." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

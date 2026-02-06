param(
    [switch]$Verbose
)

Write-Host "🔍 MediLens Authentication Diagnostic (Windows)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Function to check file
function Test-AuthFile {
    param([string]$Path)
    $exists = Test-Path $Path
    $status = if ($exists) { "✓" } else { "✗" }
    $color = if ($exists) { "Green" } else { "Red" }
    Write-Host "  $status $Path" -ForegroundColor $color
    return $exists
}

# 1. Check environment files
Write-Host "1️⃣ Environment Configuration" -ForegroundColor Yellow
Write-Host ""

if (Test-Path ".env") {
    Write-Host "✓ Root .env file found" -ForegroundColor Green
    $env_content = Get-Content ".env" -Raw
    
    if ($env_content -match "VITE_SUPABASE_URL") {
        Write-Host "  ✓ VITE_SUPABASE_URL configured" -ForegroundColor Green
    } else {
        Write-Host "  ✗ VITE_SUPABASE_URL missing" -ForegroundColor Red
    }
    
    if ($env_content -match "VITE_SUPABASE_ANON_KEY") {
        Write-Host "  ✓ VITE_SUPABASE_ANON_KEY configured" -ForegroundColor Green
    } else {
        Write-Host "  ✗ VITE_SUPABASE_ANON_KEY missing" -ForegroundColor Red
    }
    
    if ($env_content -match "VITE_API_BASE_URL") {
        Write-Host "  ✓ VITE_API_BASE_URL configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ VITE_API_BASE_URL not configured (default: http://localhost:5000/api)" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Root .env file not found" -ForegroundColor Red
}

Write-Host ""

if (Test-Path "backend\.env") {
    Write-Host "✓ Backend .env file found" -ForegroundColor Green
    $backend_env = Get-Content "backend\.env" -Raw
    
    if ($backend_env -match "SUPABASE_JWT_SECRET") {
        Write-Host "  ✓ SUPABASE_JWT_SECRET configured" -ForegroundColor Green
    } else {
        Write-Host "  ✗ SUPABASE_JWT_SECRET missing (JWT verification will fail)" -ForegroundColor Red
    }
    
    if ($backend_env -match "VITE_SUPABASE_URL|SUPABASE_URL") {
        Write-Host "  ✓ Supabase URL configured" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Supabase URL missing" -ForegroundColor Red
    }
    
    if ($backend_env -match "SUPABASE_SERVICE_ROLE_KEY") {
        Write-Host "  ✓ SUPABASE_SERVICE_ROLE_KEY configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ SUPABASE_SERVICE_ROLE_KEY not configured (will use ANON_KEY)" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Backend .env file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "2️⃣ Frontend Key Files" -ForegroundColor Yellow
Write-Host ""

$frontend_files = @(
    "src\context\AuthContext.tsx",
    "src\lib\supabaseClient.ts",
    "src\lib\apiClient.ts",
    "src\components\LoginScreen.tsx",
    "src\components\SignupScreen.tsx",
    "src\pages\auth\LoginPage.tsx",
    "src\pages\auth\SignupPage.tsx",
    "src\app\guards\ProtectedRoute.tsx"
)

foreach ($file in $frontend_files) {
    Test-AuthFile $file | Out-Null
}

Write-Host ""
Write-Host "3️⃣ Backend Key Files" -ForegroundColor Yellow
Write-Host ""

$backend_files = @(
    "backend\config.py",
    "backend\auth_utils.py",
    "backend\auth_routes.py",
    "backend\main.py"
)

foreach ($file in $backend_files) {
    Test-AuthFile $file | Out-Null
}

Write-Host ""
Write-Host "4️⃣ Recommended Next Steps" -ForegroundColor Yellow
Write-Host ""

Write-Host "Frontend Setup:" -ForegroundColor Cyan
Write-Host "  1. npm install"
Write-Host "  2. npm run dev (starts on http://localhost:5173)"
Write-Host ""

Write-Host "Backend Setup:" -ForegroundColor Cyan
Write-Host "  1. python -m venv .venv"
Write-Host "  2. .venv\Scripts\activate.ps1"
Write-Host "  3. pip install -r backend\requirements.txt"
Write-Host "  4. python -m uvicorn backend.main:app --reload --port 5000"
Write-Host ""

Write-Host "Testing:" -ForegroundColor Cyan
Write-Host "  1. Navigate to http://localhost:5173"
Write-Host "  2. Try signing up or logging in"
Write-Host "  3. Check console (F12) for errors"
Write-Host ""

Write-Host "Auth Flow:" -ForegroundColor Cyan
Write-Host "  ✓ Frontend → Supabase Auth"
Write-Host "  ✓ Backend ← Frontend (JWT)"
Write-Host "  ✓ Backend → Supabase"
Write-Host ""

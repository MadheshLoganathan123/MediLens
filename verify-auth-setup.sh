#!/bin/bash

# MediLens Authentication Diagnostic Script
# This script validates the authentication setup across frontend and backend

set -e

echo "🔍 MediLens Authentication Diagnostic"
echo "===================================="
echo ""

# Check environment files
echo "1️⃣ Checking Environment Configuration..."
echo ""

# Check root .env
if [ -f ".env" ]; then
    echo "✓ Root .env file exists"
    
    if grep -q "VITE_SUPABASE_URL" .env; then
        echo "  ✓ VITE_SUPABASE_URL is configured"
    else
        echo "  ✗ VITE_SUPABASE_URL is missing"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        echo "  ✓ VITE_SUPABASE_ANON_KEY is configured"
    else
        echo "  ✗ VITE_SUPABASE_ANON_KEY is missing"
    fi
    
    if grep -q "VITE_API_BASE_URL" .env; then
        echo "  ✓ VITE_API_BASE_URL is configured"
    else
        echo "  ⚠ VITE_API_BASE_URL is not configured (will use default: http://localhost:5000/api)"
    fi
else
    echo "✗ Root .env file not found"
fi

echo ""

# Check backend .env
if [ -f "backend/.env" ]; then
    echo "✓ Backend .env file exists"
    
    if grep -q "SUPABASE_JWT_SECRET" backend/.env; then
        echo "  ✓ SUPABASE_JWT_SECRET is configured"
    else
        echo "  ✗ SUPABASE_JWT_SECRET is missing (JWT verification will fail)"
    fi
    
    if grep -q "VITE_SUPABASE_URL\|SUPABASE_URL" backend/.env; then
        echo "  ✓ Supabase URL is configured"
    else
        echo "  ✗ Supabase URL is missing"
    fi
    
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" backend/.env; then
        echo "  ✓ SUPABASE_SERVICE_ROLE_KEY is configured"
    else
        echo "  ⚠ SUPABASE_SERVICE_ROLE_KEY is not configured (will try to use ANON_KEY)"
    fi
else
    echo "✗ Backend .env file not found"
fi

echo ""
echo "2️⃣ Key Files Check..."
echo ""

# Check frontend auth files
frontend_files=(
    "src/context/AuthContext.tsx"
    "src/lib/supabaseClient.ts"
    "src/lib/apiClient.ts"
    "src/components/LoginScreen.tsx"
    "src/components/SignupScreen.tsx"
    "src/pages/auth/LoginPage.tsx"
    "src/pages/auth/SignupPage.tsx"
    "src/app/guards/ProtectedRoute.tsx"
)

for file in "${frontend_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ $file (MISSING)"
    fi
done

echo ""

# Check backend auth files
backend_files=(
    "backend/config.py"
    "backend/auth_utils.py"
    "backend/auth_routes.py"
    "backend/main.py"
)

for file in "${backend_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ $file (MISSING)"
    fi
done

echo ""
echo "3️⃣ Recommended Next Steps..."
echo ""
echo "Frontend Setup:"
echo "  1. Install dependencies: npm install"
echo "  2. Start dev server: npm run dev (runs on http://localhost:5173)"
echo ""
echo "Backend Setup:"
echo "  1. Create Python virtual environment: python -m venv .venv"
echo "  2. Activate virtual environment:"
echo "     - Windows: .venv\\Scripts\\activate.ps1"
echo "     - Mac/Linux: source .venv/bin/activate"
echo "  3. Install dependencies: pip install -r backend/requirements.txt"
echo "  4. Start backend: python -m uvicorn backend.main:app --reload --port 5000"
echo ""
echo "Testing:"
echo "  1. Navigate to http://localhost:5173 in your browser"
echo "  2. Try signing up with a test email/password"
echo "  3. Check browser console and backend logs for any errors"
echo ""
echo "Auth Flow Validation:"
echo "  ✓ Frontend → Supabase Auth (via configured URL + Anon Key)"
echo "  ✓ Backend ← Frontend (JWT in Authorization header)"
echo "  ✓ Backend → Supabase (via Service Role Key or Anon Key)"
echo ""

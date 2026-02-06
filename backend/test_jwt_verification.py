"""
JWT Verification Test Script
This script helps identify JWT token verification issues.

Run this AFTER a user has logged in to test token verification.
"""

import os
import sys
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
BACKEND_DIR = os.path.dirname(__file__)

load_dotenv(os.path.join(ROOT_DIR, ".env"))
load_dotenv(os.path.join(BACKEND_DIR, ".env"))

from jose import jwt, JWTError


def test_jwt_verification():
    """Test JWT verification with current backend configuration"""
    
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
    supabase_url = os.getenv("VITE_SUPABASE_URL")
    
    print("=" * 70)
    print("JWT VERIFICATION TEST")
    print("=" * 70)
    print()
    
    # Step 1: Check configuration
    print("1. CONFIGURATION CHECK")
    print("-" * 70)
    print(f"Supabase URL configured: {bool(supabase_url)}")
    print(f"JWT Secret configured: {bool(jwt_secret)}")
    
    if not jwt_secret:
        print("\n❌ ERROR: SUPABASE_JWT_SECRET is not configured!")
        print("\nTo fix:")
        print("1. Go to your Supabase project: https://supabase.com/dashboard")
        print("2. Navigate to: Settings → API")
        print("3. Look for 'JWT Secret' field")
        print("4. Copy the secret")
        print("5. Add to backend/.env: SUPABASE_JWT_SECRET=your_secret_here")
        print("6. Restart the backend")
        return False
    
    print(f"\nJWT Secret (first 20 chars): {jwt_secret[:20]}...")
    print()
    
    # Step 2: Get a token from Supabase
    print("2. TOKEN ACQUISITION")
    print("-" * 70)
    print("To test JWT verification, you need a valid token from Supabase.")
    print("\nOptions:")
    print("1. Log in to the app (at http://localhost:5173)")
    print("2. Open DevTools Console (F12)")
    print("3. Paste and run this command:")
    print("   (await fetch(window.location.origin.replace('5173','5000') + '.../api/me')).json()")
    print("   OR check Network tab for Authorization header value")
    print()
    
    # Step 3: Manual token input
    print("3. TEST A TOKEN (OPTIONAL)")
    print("-" * 70)
    
    token_input = input("Paste a token here (or press Enter to skip): ").strip()
    
    if token_input:
        try:
            print(f"\nDecoding token...")
            payload = jwt.decode(
                token_input,
                jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            
            print("✅ Token verification SUCCESSFUL!")
            print("\nToken claims:")
            for key, value in payload.items():
                if key == "exp":
                    dt = datetime.fromtimestamp(value, tz=timezone.utc)
                    print(f"  {key}: {value} (expires: {dt})")
                elif key == "iat":
                    dt = datetime.fromtimestamp(value, tz=timezone.utc)
                    print(f"  {key}: {value} (issued: {dt})")
                else:
                    print(f"  {key}: {value}")
            
            return True
            
        except JWTError as e:
            print(f"\n❌ Token verification FAILED!")
            print(f"Error: {str(e)}")
            print("\nThis means:")
            print("- The JWT Secret is likely INCORRECT")
            print("- OR the token is malformed/corrupted")
            print("\nTo fix:")
            print("1. Verify the JWT Secret in backend/.env matches Supabase")
            print("2. Check you copied the ENTIRE secret")
            print("3. Restart backend after updating")
            print("4. Try logging in again with a fresh token")
            return False
    
    print("\nSkipped manual token test")
    return None


def verify_backend_is_running():
    """Check if backend is running"""
    import socket
    
    print("\n4. BACKEND STATUS CHECK")
    print("-" * 70)
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', 5000))
        sock.close()
        
        if result == 0:
            print("✅ Backend is running on localhost:5000")
            return True
        else:
            print("❌ Backend is NOT running on localhost:5000")
            print("   Start: python -m uvicorn backend.main:app --reload --port 5000")
            return False
    except Exception as e:
        print(f"⚠️  Could not check backend: {str(e)}")
        return None


if __name__ == "__main__":
    print()
    
    # Check backend running
    verify_backend_is_running()
    print()
    
    # Run verification test
    test_jwt_verification()
    
    print()
    print("=" * 70)
    print("NEXT STEPS")
    print("=" * 70)
    print("1. Check backend logs for '[JWT Verification]' messages")
    print("2. Check frontend Network tab for Authorization header")
    print("3. If token not being sent:")
    print("   - Ensure frontend .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY")
    print("4. If token rejected:")
    print("   - JWT Secret MUST match Supabase Settings → API → JWT Secret")
    print("5. Restart backend after any changes")
    print()

"""
Verification script to check backend setup and database integrity.
Run this to ensure everything is configured correctly.
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

def check_environment():
    """Check if all required environment variables are set."""
    print("=" * 60)
    print("CHECKING ENVIRONMENT VARIABLES")
    print("=" * 60)
    
    from dotenv import load_dotenv
    load_dotenv()
    
    required_vars = {
        "VITE_SUPABASE_URL": os.getenv("VITE_SUPABASE_URL"),
        "VITE_SUPABASE_ANON_KEY": os.getenv("VITE_SUPABASE_ANON_KEY"),
        "JWT_SECRET": os.getenv("JWT_SECRET"),
    }
    
    optional_vars = {
        "SUPABASE_SERVICE_ROLE_KEY": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        "GOOGLE_API_KEY": os.getenv("GOOGLE_API_KEY"),
        "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY"),
        "RAPIDAPI_KEY": os.getenv("RAPIDAPI_KEY"),
    }
    
    all_good = True
    
    for var, value in required_vars.items():
        if value:
            print(f"✓ {var}: Set")
        else:
            print(f"✗ {var}: MISSING (REQUIRED)")
            all_good = False
    
    print("\nOptional variables:")
    for var, value in optional_vars.items():
        if value:
            print(f"✓ {var}: Set")
        else:
            print(f"  {var}: Not set")
    
    return all_good


def check_database():
    """Check database setup and tables."""
    print("\n" + "=" * 60)
    print("CHECKING DATABASE")
    print("=" * 60)
    
    try:
        from database import get_db_connection, DB_PATH
        
        print(f"Database location: {DB_PATH}")
        print(f"Database exists: {DB_PATH.exists()}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check users table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if cursor.fetchone():
            print("✓ Users table exists")
            cursor.execute("SELECT COUNT(*) FROM users")
            count = cursor.fetchone()[0]
            print(f"  - {count} user(s) in database")
        else:
            print("✗ Users table missing")
            return False
        
        # Check profiles table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='profiles'")
        if cursor.fetchone():
            print("✓ Profiles table exists")
            cursor.execute("SELECT COUNT(*) FROM profiles")
            count = cursor.fetchone()[0]
            print(f"  - {count} profile(s) in database")
        else:
            print("✗ Profiles table missing")
            return False
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"✗ Database error: {str(e)}")
        return False


def check_auth_system():
    """Test authentication system."""
    print("\n" + "=" * 60)
    print("CHECKING AUTHENTICATION SYSTEM")
    print("=" * 60)
    
    try:
        from auth_utils import hash_password, verify_password, create_access_token, verify_jwt
        
        # Test password hashing
        test_password = "TestPassword123!"
        hashed = hash_password(test_password)
        print("✓ Password hashing works")
        
        # Test password verification
        if verify_password(test_password, hashed):
            print("✓ Password verification works")
        else:
            print("✗ Password verification failed")
            return False
        
        # Test JWT creation
        token = create_access_token("test-user-id", "test@example.com")
        print("✓ JWT token creation works")
        
        # Test JWT verification
        payload = verify_jwt(token)
        if payload.get("sub") == "test-user-id" and payload.get("email") == "test@example.com":
            print("✓ JWT token verification works")
        else:
            print("✗ JWT token verification failed")
            return False
        
        return True
        
    except Exception as e:
        print(f"✗ Authentication system error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def check_supabase_connection():
    """Check Supabase connection."""
    print("\n" + "=" * 60)
    print("CHECKING SUPABASE CONNECTION")
    print("=" * 60)
    
    try:
        from supabase import create_client
        
        supabase_url = os.getenv("VITE_SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_key:
            print("✗ Supabase credentials not configured")
            return False
        
        supabase = create_client(supabase_url, supabase_key)
        
        # Try to query profiles table
        response = supabase.table("profiles").select("id").limit(1).execute()
        print("✓ Supabase connection successful")
        print(f"  - Profiles table accessible")
        
        # Try to query health_cases table
        response = supabase.table("health_cases").select("id").limit(1).execute()
        print("✓ Health cases table accessible")
        
        return True
        
    except Exception as e:
        print(f"✗ Supabase connection error: {str(e)}")
        return False


def main():
    """Run all checks."""
    print("\n" + "=" * 60)
    print("MEDILENS BACKEND VERIFICATION")
    print("=" * 60 + "\n")
    
    results = {
        "Environment": check_environment(),
        "Database": check_database(),
        "Authentication": check_auth_system(),
        "Supabase": check_supabase_connection(),
    }
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    for check, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{check}: {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n✓ All checks passed! Backend is ready to use.")
        return 0
    else:
        print("\n✗ Some checks failed. Please review the errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())

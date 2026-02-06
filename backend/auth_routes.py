from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
import logging
import os
from supabase import create_client, Client

try:
    from .auth_utils import verify_jwt, hash_password, verify_password, create_access_token
    from .database import create_user, get_user_by_email
except ImportError:
    from auth_utils import verify_jwt, hash_password, verify_password, create_access_token
    from database import create_user, get_user_by_email

router = APIRouter()
security = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)

# Initialize Supabase client for syncing users
supabase_url = os.environ.get("VITE_SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

supabase: Client | None = None
if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
        logger.info("Supabase client initialized for user sync")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")


def sync_user_to_supabase(user_id: str, email: str):
    """
    Sync user to Supabase profiles table
    This ensures the user exists in Supabase for foreign key constraints
    """
    if not supabase:
        logger.warning("Supabase not configured, skipping user sync")
        return
    
    try:
        # Check if profile already exists in Supabase
        existing = supabase.table("profiles").select("id").eq("id", user_id).execute()
        
        if existing.data and len(existing.data) > 0:
            logger.info(f"User profile {user_id} already exists in Supabase")
            return
        
        # Insert user into Supabase profiles table
        supabase.table("profiles").insert({
            "id": user_id,
            "email": email,
        }).execute()
        
        logger.info(f"Successfully synced user {user_id} to Supabase profiles")
    except Exception as e:
        logger.error(f"Failed to sync user to Supabase profiles: {e}")
        # Don't fail the registration/login if sync fails
        pass


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    logger.debug("Checking for Authorization credentials")
    
    if credentials is None:
        logger.error("No Authorization header found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "NO_AUTH_HEADER",
                "message": "Missing Authorization header",
            },
        )

    logger.debug("Authorization header found, verifying token")
    claims = verify_jwt(credentials.credentials)

    user_data = {
        "id": claims.get("sub"),
        "email": claims.get("email"),
        "role": claims.get("role", "user"),
        "claims": claims,
    }
    logger.info(f"Successfully authenticated user: {user_data['id']}")
    return user_data


def require_role(role: str):
    def _checker(current_user=Depends(get_current_user)):
        if current_user["role"] != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "INSUFFICIENT_PERMISSIONS",
                    "message": "You do not have access to this resource",
                },
            )
        return current_user

    return _checker


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """
    Register a new user with email and password.
    """
    logger.info(f"Registration attempt for email: {request.email}")
    
    # Check if user already exists
    existing_user = get_user_by_email(request.email)
    if existing_user:
        logger.warning(f"Registration failed: User already exists for email {request.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "USER_EXISTS",
                "message": "User with this email already exists",
            },
        )
    
    # Hash password and create user in local database
    password_hash = hash_password(request.password)
    try:
        user_id, email = create_user(request.email, password_hash)
        logger.info(f"User created successfully: {user_id} ({email})")
    except ValueError as e:
        logger.error(f"User creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "USER_CREATION_FAILED",
                "message": str(e),
            },
        )
    
    # Sync user to Supabase for foreign key constraints
    sync_user_to_supabase(user_id, email)
    
    # Create JWT token with the correct user ID and email
    access_token = create_access_token(user_id, email)
    
    logger.info(f"Registration successful for user: {user_id} ({email})")
    
    # Return the exact user data that matches the token
    return AuthResponse(
        access_token=access_token,
        user={"id": user_id, "email": email},
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Login with email and password.
    """
    logger.info(f"Login attempt for email: {request.email}")
    
    # Get user by email
    user = get_user_by_email(request.email)
    if not user:
        logger.warning(f"Login failed: User not found for email {request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": "Invalid email or password",
            },
        )
    
    # Verify password
    if not verify_password(request.password, user["password_hash"]):
        logger.warning(f"Login failed: Invalid password for email {request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": "Invalid email or password",
            },
        )
    
    # Sync user to Supabase (in case they registered before this fix)
    sync_user_to_supabase(user["id"], user["email"])
    
    # Create JWT token with the correct user ID and email
    access_token = create_access_token(user["id"], user["email"])
    
    logger.info(f"Login successful for user: {user['id']} ({user['email']})")
    
    # Return the exact user data that matches the token
    return AuthResponse(
        access_token=access_token,
        user={"id": user["id"], "email": user["email"]},
    )


@router.get("/me")
def read_me(current_user=Depends(get_current_user)):
    """
    Get current user information from JWT token.
    This endpoint verifies the token and returns the user data.
    """
    logger.info(f"User info requested for: {current_user['id']} ({current_user['email']})")
    
    # Return only the essential user data (id and email)
    return {
        "user": {
            "id": current_user["id"],
            "email": current_user["email"]
        }
    }


@router.post("/logout")
def logout(current_user=Depends(get_current_user)):
    """
    Logout endpoint (client-side token removal).
    The actual token invalidation happens on the client side.
    """
    logger.info(f"User logged out: {current_user['id']} ({current_user['email']})")
    return {"message": "Logged out successfully"}


@router.get("/admin/dashboard")
def admin_dashboard(current_user=Depends(require_role("admin"))):
    return {"message": "Welcome, admin", "user": current_user}


from datetime import datetime, timezone, timedelta
from typing import Any, Dict
import logging

from fastapi import HTTPException, status
from jose import JWTError, jwt
import bcrypt

try:
    from .config import settings
except ImportError:
    from config import settings

ALGORITHM = "HS256"
logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(user_id: str, email: str) -> str:
    """Create a JWT access token."""
    now = datetime.now(timezone.utc)
    exp = now + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    
    payload = {
        "sub": user_id,
        "email": email,
        "role": "user",
        "iat": now,
        "exp": exp,
    }
    
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)
    return token


def verify_jwt(token: str) -> Dict[str, Any]:
    """
    Verify a JWT token.

    Raises HTTPException with structured error details on failure.
    """
    logger.debug("Starting JWT verification")
    
    try:
        logger.debug(f"Attempting to decode token with algorithm {ALGORITHM}")
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[ALGORITHM],
        )
        logger.debug(f"Successfully decoded token for user: {payload.get('sub')}")
    except JWTError as e:
        logger.error(f"JWT decode failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Invalid token"},
        )

    if "sub" not in payload:
        logger.error("No 'sub' (user ID) in token payload")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_PAYLOAD", "message": "Missing subject in token"},
        )

    logger.info(f"Token verification successful for user: {payload.get('sub')}")
    return payload


# Keep for backward compatibility if needed
def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Verify a JWT token (now using custom secret instead of Supabase).
    """
    return verify_jwt(token)


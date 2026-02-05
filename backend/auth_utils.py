from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import HTTPException, status
from jose import JWTError, jwt

from .config import settings

ALGORITHM = "HS256"


def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Verify a Supabase-issued JWT access token.

    Raises HTTPException with structured error details on failure.
    """
    if not settings.SUPABASE_JWT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "SERVER_MISCONFIGURED",
                "message": "SUPABASE_JWT_SECRET is not configured on the backend.",
            },
        )

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[ALGORITHM],
            options={"verify_aud": False},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Invalid token"},
        )

    exp = payload.get("exp")
    if exp is not None:
        now_ts = datetime.now(timezone.utc).timestamp()
        if now_ts > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "TOKEN_EXPIRED", "message": "Token has expired"},
            )

    if "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_PAYLOAD", "message": "Missing subject in token"},
        )

    return payload


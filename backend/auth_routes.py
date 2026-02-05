from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .auth_utils import verify_supabase_jwt

router = APIRouter()

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "NO_AUTH_HEADER",
                "message": "Missing Authorization header",
            },
        )

    claims = verify_supabase_jwt(credentials.credentials)

    return {
        "id": claims.get("sub"),
        "email": claims.get("email"),
        "role": claims.get("role", "user"),
        "claims": claims,
    }


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


@router.get("/me")
def read_me(current_user=Depends(get_current_user)):
    return {"user": current_user}


@router.get("/admin/dashboard")
def admin_dashboard(current_user=Depends(require_role("admin"))):
    return {"message": "Welcome, admin", "user": current_user}


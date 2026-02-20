from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from typing import Optional, Dict, Any

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """
    Valida JWT do Better Auth e retorna dados do usuário.
    """
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Não autenticado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    secret = os.getenv("BETTER_AUTH_SECRET")
    
    if not secret:
        raise HTTPException(status_code=500, detail="Auth secret not configured")
    
    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """
    Retorna usuário se autenticado, ou None se não.
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None

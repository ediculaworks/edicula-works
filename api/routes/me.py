from fastapi import APIRouter, Depends
from typing import Dict, Any
from api.middleware.auth import get_current_user
from api.database import get_db

router = APIRouter()


@router.get("/me")
async def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retorna dados do usuário logado.
    """
    db = get_db()
    
    # Buscar dados completos na tabela usuarios
    result = db.table("usuarios").select("*").eq("auth_user_id", user.get("sub")).execute()
    
    if not result.data:
        # Fallback: buscar por email
        result = db.table("usuarios").select("*").eq("email", user.get("email")).execute()
    
    usuario = result.data[0] if result.data else None
    
    return {
        "auth": {
            "id": user.get("sub"),
            "email": user.get("email"),
        },
        "usuario": usuario,
    }

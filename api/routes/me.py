from fastapi import APIRouter, Depends
from typing import Dict, Any
from api.middleware.auth import get_current_user
from api.database import get_db

router = APIRouter()


@router.get("/me")
async def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retorna dados do usuário (sem auth - retorna mock).
    """
    db = get_db()
    
    # Retornar dados mock do usuário selecionado
    return {
        "auth": {
            "id": user.get("id", "mock-user"),
            "email": user.get("email", "user@edicula.com"),
            "name": user.get("name", "Usuário"),
        },
        "usuario": {
            "id": "1",
            "nome": "Usuário",
            "email": "user@edicula.com",
            "role": "admin"
        }
    }

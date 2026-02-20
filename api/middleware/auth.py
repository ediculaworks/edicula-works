from typing import Dict, Any, Optional

# Auth desabilitado - sistema aberto


async def get_current_user() -> Dict[str, Any]:
    """
    Retorna usuário mock para compatibilidade.
    """
    return {
        "id": "mock-user",
        "email": "user@edicula.com",
        "name": "Usuário"
    }


async def get_current_user_optional() -> Optional[Dict[str, Any]]:
    """
    Sempre retorna usuário mock.
    """
    return await get_current_user()

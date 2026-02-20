from typing import List, Optional, Dict, Any
from api.database import get_db


async def listar_usuarios(
    empresa_id: int = 1,
    ativo: Optional[bool] = None,
    role: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Dict[str, Any]]:
    db = get_db()
    
    query = db.table("usuarios").select("*").eq("empresa_id", empresa_id)
    
    if ativo is not None:
        query = query.eq("ativo", ativo)
    if role:
        query = query.eq("role", role)
    
    query = query.order("nome").range(skip, skip + limit - 1)
    
    result = query.execute()
    return result.data or []


async def buscar_usuario(usuario_id: str, empresa_id: int = 1) -> Optional[Dict[str, Any]]:
    db = get_db()
    
    result = db.table("usuarios").select("*").eq("id", usuario_id).eq("empresa_id", empresa_id).execute()
    
    return result.data[0] if result.data else None


async def buscar_usuario_por_email(email: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    
    result = db.table("usuarios").select("*").eq("email", email).execute()
    
    return result.data[0] if result.data else None


async def buscar_usuario_por_auth_id(auth_user_id: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    
    result = db.table("usuarios").select("*").eq("auth_user_id", auth_user_id).execute()
    
    return result.data[0] if result.data else None


async def criar_usuario(usuario: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    
    result = db.table("usuarios").insert(usuario).execute()
    
    return result.data[0] if result.data else None


async def atualizar_usuario(usuario_id: str, data: Dict[str, Any], empresa_id: int = 1) -> Optional[Dict[str, Any]]:
    db = get_db()
    
    if data:
        result = db.table("usuarios").update(data).eq("id", usuario_id).eq("empresa_id", empresa_id).execute()
        return result.data[0] if result.data else None
    
    return await buscar_usuario(usuario_id, empresa_id)


async def deletar_usuario(usuario_id: str, empresa_id: int = 1) -> bool:
    db = get_db()
    
    result = db.table("usuarios").delete().eq("id", usuario_id).eq("empresa_id", empresa_id).execute()
    
    return len(result.data) > 0 if result.data else False

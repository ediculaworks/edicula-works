from typing import List, Optional, Dict, Any
from api.database import get_db


async def listar_tags(
    empresa_id: int = 1,
    escopo: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Dict[str, Any]]:
    db = get_db()
    
    query = db.table("tags").select("*").eq("empresa_id", empresa_id)
    
    if escopo:
        query = query.eq("escopo", escopo)
    
    query = query.order("nome").range(skip, skip + limit - 1)
    
    result = query.execute()
    return result.data or []


async def buscar_tag(tag_id: int, empresa_id: int = 1) -> Optional[Dict[str, Any]]:
    db = get_db()
    
    result = db.table("tags").select("*").eq("id", tag_id).eq("empresa_id", empresa_id).execute()
    
    return result.data[0] if result.data else None


async def criar_tag(tag: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    
    result = db.table("tags").insert(tag).execute()
    
    return result.data[0] if result.data else None


async def atualizar_tag(tag_id: int, data: Dict[str, Any], empresa_id: int = 1) -> Optional[Dict[str, Any]]:
    db = get_db()
    
    if data:
        result = db.table("tags").update(data).eq("id", tag_id).eq("empresa_id", empresa_id).execute()
        return result.data[0] if result.data else None
    
    return await buscar_tag(tag_id, empresa_id)


async def deletar_tag(tag_id: int, empresa_id: int = 1) -> bool:
    db = get_db()
    
    result = db.table("tags").delete().eq("id", tag_id).eq("empresa_id", empresa_id).execute()
    
    return len(result.data) > 0 if result.data else False

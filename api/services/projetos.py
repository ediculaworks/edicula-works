from supabase import Client
from api.schemas.projeto import ProjetoCreate, ProjetoUpdate, ProjetoResponse
from typing import List, Optional
from api.database import get_db


async def listar_projetos(
    empresa_id: int,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[dict]:
    db = get_db()
    query = db.table("projetos").select("*").eq("empresa_id", empresa_id)
    
    if status:
        query = query.eq("status", status)
    
    result = query.order("created_at", desc=True).range(skip, skip + limit - 1).execute()
    return result.data or []


async def buscar_projeto(projeto_id: int, empresa_id: int) -> Optional[dict]:
    db = get_db()
    result = db.table("projetos").select("*").eq("id", projeto_id).eq("empresa_id", empresa_id).execute()
    return result.data[0] if result.data else None


async def criar_projeto(projeto: ProjetoCreate) -> dict:
    db = get_db()
    data = projeto.model_dump()
    result = db.table("projetos").insert(data).execute()
    return result.data[0]


async def atualizar_projeto(projeto_id: int, empresa_id: int, projeto: ProjetoUpdate) -> Optional[dict]:
    db = get_db()
    data = {k: v for k, v in projeto.model_dump().items() if v is not None}
    
    if not data:
        return await buscar_projeto(projeto_id, empresa_id)
    
    result = db.table("projetos").update(data).eq("id", projeto_id).eq("empresa_id", empresa_id).execute()
    return result.data[0] if result.data else None


async def deletar_projeto(projeto_id: int, empresa_id: int) -> bool:
    db = get_db()
    result = db.table("projetos").delete().eq("id", projeto_id).eq("empresa_id", empresa_id).execute()
    return len(result.data) > 0 if result.data else False

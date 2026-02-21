from typing import List, Optional, Any, Dict
from datetime import datetime, date

from api.database import get_db
from api.schemas.tarefa import TarefaCreate, TarefaUpdate, TarefaResponse


async def listar_tarefas(
    empresa_id: int = 1,
    coluna: Optional[str] = None,
    prioridade: Optional[str] = None,
    responsavel: Optional[int] = None,
    projeto_id: Optional[int] = None,
    sprint_id: Optional[int] = None,
    grupo_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Dict[str, Any]]:
    db = get_db()
    
    query = db.table("tarefas").select("*").eq("empresa_id", empresa_id)
    
    if coluna:
        query = query.eq("coluna", coluna)
    if prioridade:
        query = query.eq("prioridade", prioridade)
    if responsavel:
        query = query.contains("responsaveis", [responsavel])
    if projeto_id:
        query = query.eq("projeto_id", projeto_id)
    if sprint_id:
        query = query.eq("sprint_id", sprint_id)
    if grupo_id:
        query = query.eq("grupo_id", grupo_id)
    if status:
        query = query.eq("status", status)
    
    query = query.order("created_at", desc=True).range(skip, skip + limit - 1)
    
    result = query.execute()
    return result.data or []


async def buscar_tarefa(tarefa_id: int, empresa_id: int = 1) -> Optional[Dict[str, Any]]:
    db = get_db()
    
    result = db.table("tarefas").select("*").eq("id", tarefa_id).eq("empresa_id", empresa_id).execute()
    
    return result.data[0] if result.data else None


async def criar_tarefa(tarefa: TarefaCreate) -> Dict[str, Any]:
    db = get_db()
    
    data = tarefa.model_dump()
    
    data["responsaveis"] = data.get("responsaveis") or []
    data["tags"] = data.get("tags") or []
    data["embedding"] = None
    
    print(f"[DEBUG] Criando tarefa: {data}")
    
    try:
        result = db.table("tarefas").insert(data).execute()
        print(f"[DEBUG] Resultado: {result.data}")
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"[ERROR] Erro ao criar tarefa: {e}")
        raise


async def atualizar_tarefa(tarefa_id: int, tarefa: TarefaUpdate, empresa_id: int = 1) -> Optional[Dict[str, Any]]:
    db = get_db()
    
    data = tarefa.model_dump(exclude_unset=True)
    
    if "tags" in data and data["tags"] is None:
        data["tags"] = []
    
    if data:
        data["updated_at"] = datetime.utcnow().isoformat()
        
        result = db.table("tarefas").update(data).eq("id", tarefa_id).eq("empresa_id", empresa_id).execute()
        
        return result.data[0] if result.data else None
    
    return await buscar_tarefa(tarefa_id, empresa_id)


async def deletar_tarefa(tarefa_id: int, empresa_id: int = 1) -> bool:
    db = get_db()
    
    result = db.table("tarefas").delete().eq("id", tarefa_id).eq("empresa_id", empresa_id).execute()
    
    return len(result.data) > 0 if result.data else False


async def mover_tarefa(tarefa_id: int, coluna: str, empresa_id: int = 1) -> Optional[Dict[str, Any]]:
    db = get_db()
    
    data = {
        "coluna": coluna,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    if coluna == "done":
        data["data_conclusao"] = datetime.utcnow().isoformat()
    
    result = db.table("tarefas").update(data).eq("id", tarefa_id).eq("empresa_id", empresa_id).execute()
    
    return result.data[0] if result.data else None


async def buscar_tarefas_semelhantes(
    query_text: str,
    empresa_id: int = 1,
    limite: int = 10
) -> List[Dict[str, Any]]:
    db = get_db()
    
    embedding = await gerar_embedding(query_text)
    
    if not embedding:
        return []
    
    result = db.rpc(
        "buscar_tarefas_similares",
        {
            "query_embedding": embedding,
            "empresa_id_int": empresa_id,
            "limite": limite
        }
    ).execute()
    
    return result.data or []


async def gerar_embedding(text: str) -> Optional[List[float]]:
    return None

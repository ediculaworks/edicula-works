from typing import List, Optional
from datetime import datetime
import uuid

from api.schemas.tarefa import TarefaCreate, TarefaUpdate, TarefaResponse

tarefas_db: List[dict] = []


async def listar_tarefas(
    coluna: Optional[str] = None,
    prioridade: Optional[str] = None,
    responsavel: Optional[str] = None,
    projeto: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[TarefaResponse]:
    results = tarefas_db.copy()
    
    if coluna:
        results = [t for t in results if t["coluna"] == coluna]
    if prioridade:
        results = [t for t in results if t["prioridade"] == prioridade]
    if responsavel:
        results = [t for t in results if responsavel in t.get("responsaveis", [])]
    if projeto:
        results = [t for t in results if t.get("projeto") == projeto]
    
    return results[skip:skip+limit]


async def buscar_tarefa(tarefa_id: int) -> Optional[TarefaResponse]:
    for tarefa in tarefas_db:
        if tarefa["id"] == tarefa_id:
            return tarefa
    return None


async def criar_tarefa(tarefa: TarefaCreate) -> TarefaResponse:
    now = datetime.utcnow()
    nova_tarefa = {
        "id": len(tarefas_db) + 1,
        "titulo": tarefa.titulo,
        "descricao": tarefa.descricao,
        "coluna": tarefa.coluna.value,
        "prioridade": tarefa.prioridade.value,
        "responsaveis": tarefa.responsaveis or [],
        "projeto": tarefa.projeto,
        "cliente": tarefa.cliente,
        "prazo": tarefa.prazo,
        "estimativa": tarefa.estimativa,
        "tags": tarefa.tags or [],
        "embedding": None,
        "created_at": now,
        "updated_at": now
    }
    tarefas_db.append(nova_tarefa)
    return nova_tarefa


async def atualizar_tarefa(tarefa_id: int, tarefa: TarefaUpdate) -> Optional[TarefaResponse]:
    for i, t in enumerate(tarefas_db):
        if t["id"] == tarefa_id:
            update_data = tarefa.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                if value is not None:
                    if hasattr(value, 'value'):
                        t[key] = value.value
                    else:
                        t[key] = value
            t["updated_at"] = datetime.utcnow()
            return t
    return None


async def deletar_tarefa(tarefa_id: int) -> bool:
    for i, t in enumerate(tarefas_db):
        if t["id"] == tarefa_id:
            tarefas_db.pop(i)
            return True
    return False


async def mover_tarefa(tarefa_id: int, coluna: str) -> Optional[TarefaResponse]:
    for t in tarefas_db:
        if t["id"] == tarefa_id:
            t["coluna"] = coluna
            t["updated_at"] = datetime.utcnow()
            return t
    return None

from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional

from api.schemas.tarefa import TarefaCreate, TarefaUpdate, TarefaResponse
from api.services import tarefas as tarefa_service

router = APIRouter()


@router.get("/", response_model=List[TarefaResponse])
async def listar_tarefas(
    empresa_id: int = Query(1, description="ID da empresa"),
    coluna: Optional[str] = Query(None, description="Filtrar por coluna"),
    prioridade: Optional[str] = Query(None, description="Filtrar por prioridade"),
    responsavel: Optional[int] = Query(None, description="Filtrar por responsável (ID)"),
    projeto_id: Optional[int] = Query(None, description="Filtrar por projeto (ID)"),
    sprint_id: Optional[int] = Query(None, description="Filtrar por sprint (ID)"),
    grupo_id: Optional[int] = Query(None, description="Filtrar por grupo (ID)"),
    status: Optional[str] = Query(None, description="Filtrar por status (ativa, pausada, abandonada, suspensa)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    return await tarefa_service.listar_tarefas(
        empresa_id=empresa_id,
        coluna=coluna,
        prioridade=prioridade,
        responsavel=responsavel,
        projeto_id=projeto_id,
        sprint_id=sprint_id,
        grupo_id=grupo_id,
        status=status,
        skip=skip,
        limit=limit
    )


@router.get("/{tarefa_id}", response_model=TarefaResponse)
async def buscar_tarefa(tarefa_id: int, empresa_id: int = Query(1)):
    tarefa = await tarefa_service.buscar_tarefa(tarefa_id, empresa_id)
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return tarefa


@router.post("/", response_model=TarefaResponse, status_code=status.HTTP_201_CREATED)
async def criar_tarefa(tarefa: TarefaCreate):
    return await tarefa_service.criar_tarefa(tarefa)


@router.patch("/{tarefa_id}", response_model=TarefaResponse)
async def atualizar_tarefa(tarefa_id: int, tarefa: TarefaUpdate, empresa_id: int = Query(1)):
    tarefa_atualizada = await tarefa_service.atualizar_tarefa(tarefa_id, tarefa, empresa_id)
    if not tarefa_atualizada:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return tarefa_atualizada


@router.delete("/{tarefa_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_tarefa(tarefa_id: int, empresa_id: int = Query(1)):
    sucesso = await tarefa_service.deletar_tarefa(tarefa_id, empresa_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")


@router.post("/{tarefa_id}/mover")
async def mover_tarefa(tarefa_id: int, coluna: str, empresa_id: int = Query(1)):
    tarefa = await tarefa_service.mover_tarefa(tarefa_id, coluna, empresa_id)
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return tarefa


@router.post("/{tarefa_id}/iniciar", response_model=TarefaResponse)
async def iniciar_tarefa(tarefa_id: int, empresa_id: int = Query(1)):
    from datetime import datetime
    tarefa = await tarefa_service.atualizar_tarefa(
        tarefa_id,
        {"status": "ativa", "data_inicio": datetime.now().isoformat()},
        empresa_id
    )
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return tarefa


@router.post("/{tarefa_id}/pausar", response_model=TarefaResponse)
async def pausar_tarefa(tarefa_id: int, motivo: str = "", empresa_id: int = Query(1)):
    from datetime import datetime
    tarefa = await tarefa_service.atualizar_tarefa(
        tarefa_id,
        {"status": "pausada", "motivo_pausa": motivo, "data_pausa": datetime.now().isoformat()},
        empresa_id
    )
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return tarefa


@router.post("/{tarefa_id}/abandonar", response_model=TarefaResponse)
async def abandonar_tarefa(tarefa_id: int, motivo: str = "", empresa_id: int = Query(1)):
    from datetime import datetime
    tarefa = await tarefa_service.atualizar_tarefa(
        tarefa_id,
        {"status": "abandonada", "motivo_abandono": motivo, "data_abandono": datetime.now().isoformat()},
        empresa_id
    )
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return tarefa


@router.post("/{tarefa_id}/suspender", response_model=TarefaResponse)
async def suspender_tarefa(tarefa_id: int, motivo: str = "", empresa_id: int = Query(1)):
    from datetime import datetime
    tarefa = await tarefa_service.atualizar_tarefa(
        tarefa_id,
        {"status": "suspensa", "motivo_suspensao": motivo, "data_suspensao": datetime.now().isoformat()},
        empresa_id
    )
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return tarefa


@router.post("/{tarefa_id}/finalizar", response_model=TarefaResponse)
async def finalizar_tarefa(tarefa_id: int, empresa_id: int = Query(1)):
    from datetime import datetime
    tarefa = await tarefa_service.atualizar_tarefa(
        tarefa_id,
        {"status": "concluida", "coluna": "done", "data_conclusao": datetime.now().isoformat()},
        empresa_id
    )
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return tarefa

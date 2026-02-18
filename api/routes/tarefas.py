from fastapi import APIRouter, HTTPException, status
from typing import List, Optional

from api.schemas.tarefa import TarefaCreate, TarefaUpdate, TarefaResponse
from api.services import tarefas as tarefa_service

router = APIRouter()


@router.get("/", response_model=List[TarefaResponse])
async def listar_tarefas(
    coluna: Optional[str] = None,
    prioridade: Optional[str] = None,
    responsavel: Optional[str] = None,
    projeto: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    return await tarefa_service.listar_tarefas(
        coluna=coluna,
        prioridade=prioridade,
        responsavel=responsavel,
        projeto=projeto,
        skip=skip,
        limit=limit
    )


@router.get("/{tarefa_id}", response_model=TarefaResponse)
async def buscar_tarefa(tarefa_id: int):
    tarefa = await tarefa_service.buscar_tarefa(tarefa_id)
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return tarefa


@router.post("/", response_model=TarefaResponse, status_code=status.HTTP_201_CREATED)
async def criar_tarefa(tarefa: TarefaCreate):
    return await tarefa_service.criar_tarefa(tarefa)


@router.patch("/{tarefa_id}", response_model=TarefaResponse)
async def atualizar_tarefa(tarefa_id: int, tarefa: TarefaUpdate):
    tarefa_atualizada = await tarefa_service.atualizar_tarefa(tarefa_id, tarefa)
    if not tarefa_atualizada:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return tarefa_atualizada


@router.delete("/{tarefa_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_tarefa(tarefa_id: int):
    sucesso = await tarefa_service.deletar_tarefa(tarefa_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")


@router.post("/{tarefa_id}/mover")
async def mover_tarefa(tarefa_id: int, coluna: str):
    tarefa = await tarefa_service.mover_tarefa(tarefa_id, coluna)
    if not tarefa:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return tarefa

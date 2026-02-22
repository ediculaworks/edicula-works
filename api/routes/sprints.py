from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional

from api.schemas.sprint import SprintCreate, SprintUpdate, SprintResponse
from api.services.sprints import SprintService

router = APIRouter()


@router.get("/", response_model=List[SprintResponse])
async def listar_sprints(
    empresa_id: int = Query(1, description="ID da empresa"),
    projeto_id: Optional[int] = Query(None, description="Filtrar por projeto (ID)"),
    status: Optional[str] = Query(None, description="Filtrar por status")
):
    return SprintService.list(empresa_id=empresa_id, projeto_id=projeto_id, status=status)


@router.get("/ativa", response_model=SprintResponse)
async def buscar_sprint_ativa(empresa_id: int = Query(1)):
    sprint = SprintService.get_active(empresa_id=empresa_id)
    if not sprint:
        raise HTTPException(status_code=404, detail="Nenhuma sprint ativa encontrada")
    return sprint


@router.get("/{sprint_id}", response_model=SprintResponse)
async def buscar_sprint(sprint_id: int):
    sprint = SprintService.get_by_id(sprint_id)
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint não encontrada")
    return sprint


@router.post("/", response_model=SprintResponse, status_code=status.HTTP_201_CREATED)
async def criar_sprint(sprint: SprintCreate):
    return SprintService.create(sprint.model_dump())


@router.patch("/{sprint_id}", response_model=SprintResponse)
async def atualizar_sprint(sprint_id: int, sprint: SprintUpdate):
    sprint_atualizado = SprintService.update(sprint_id, sprint.model_dump(exclude_unset=True))
    if not sprint_atualizado:
        raise HTTPException(status_code=404, detail="Sprint não encontrada")
    return sprint_atualizado


@router.delete("/{sprint_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_sprint(sprint_id: int):
    sucesso = SprintService.delete(sprint_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Sprint não encontrada")


@router.post("/{sprint_id}/iniciar", response_model=SprintResponse)
async def iniciar_sprint(sprint_id: int):
    sprint = SprintService.update(sprint_id, {"status": "ativa"})
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint não encontrada")
    return sprint


@router.post("/{sprint_id}/concluir", response_model=SprintResponse)
async def concluir_sprint(sprint_id: int, mover_tarefas: bool = True):
    from datetime import date
    sprint = SprintService.update(sprint_id, {"status": "concluida", "data_conclusao": date.today()})
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint não encontrada")
    SprintService.update_pontos(sprint_id)
    
    if mover_tarefas:
        next_sprint = SprintService.move_incomplete_to_next(sprint_id)
        if next_sprint:
            print(f"Tarefas movidas para a próxima sprint: {next_sprint['nome']}")
    
    return sprint

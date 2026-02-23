from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional

from api.schemas.evento import (
    EventoCreate, 
    EventoUpdate, 
    EventoResponse,
    ParticipanteCreate,
    ParticipanteResponse
)
from api.services.eventos import EventoService as evento_service

router = APIRouter()


@router.get("/", response_model=List[EventoResponse])
async def listar_eventos(
    empresa_id: int = Query(1, description="ID da empresa"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo"),
    data_inicio: Optional[str] = Query(None, description="Data inicial (YYYY-MM-DD)"),
    data_fim: Optional[str] = Query(None, description="Data final (YYYY-MM-DD)"),
    membro_id: Optional[str] = Query(None, description="Filtrar por membro participante"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    return evento_service.listar(
        empresa_id=empresa_id,
        tipo=tipo,
        data_inicio=data_inicio,
        data_fim=data_fim,
        membro_id=membro_id,
        limit=limit,
        offset=skip
    )


@router.get("/dia/{data}", response_model=List[EventoResponse])
async def eventos_do_dia(
    data: str,
    empresa_id: int = Query(1)
):
    return evento_service.eventos_do_dia(data, empresa_id)


@router.get("/timeline", response_model=List[EventoResponse])
async def timeline_eventos(
    inicio: str = Query(..., description="Data inicial (YYYY-MM-DD)"),
    fim: str = Query(..., description="Data final (YYYY-MM-DD)"),
    empresa_id: int = Query(1),
    membro_id: Optional[str] = Query(None)
):
    return evento_service.timeline(inicio, fim, empresa_id, membro_id)


@router.get("/{evento_id}", response_model=EventoResponse)
async def buscar_evento(evento_id: str, empresa_id: int = Query(1)):
    evento = evento_service.buscar(evento_id, empresa_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return evento


@router.post("/", response_model=EventoResponse, status_code=status.HTTP_201_CREATED)
async def criar_evento(evento: EventoCreate):
    data = evento.model_dump()
    return evento_service.criar(data)


@router.patch("/{evento_id}", response_model=EventoResponse)
async def atualizar_evento(evento_id: str, evento: EventoUpdate, empresa_id: int = Query(1)):
    data = evento.model_dump(exclude_unset=True)
    atualizado = evento_service.atualizar(evento_id, data, empresa_id)
    if not atualizado:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return atualizado


@router.delete("/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_evento(evento_id: str, empresa_id: int = Query(1)):
    sucesso = evento_service.deletar(evento_id, empresa_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Evento não encontrado")


@router.post("/{evento_id}/participantes", response_model=ParticipanteResponse)
async def adicionar_participante(
    evento_id: str,
    participante: ParticipanteCreate
):
    # Verificar se evento existe
    evento = evento_service.buscar(evento_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    
    result = evento_service.adicionar_participante(
        evento_id, 
        participante.membro_id, 
        participante.status
    )
    return result


@router.delete("/{evento_id}/participantes/{membro_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover_participante(evento_id: str, membro_id: str):
    evento_service.remover_participante(evento_id, membro_id)

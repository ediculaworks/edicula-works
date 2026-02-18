from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any

from api.services import search as search_service

router = APIRouter()


@router.post("/")
async def buscar_similar(
    query: str,
    tipo: str = "all",
    limite: int = 10,
    threshold: float = 0.7,
    projeto: Optional[str] = None,
    coluna: Optional[str] = None
) -> Dict[str, Any]:
    return await search_service.buscar(
        query=query,
        tipo=tipo,
        limite=limite,
        threshold=threshold,
        projeto=projeto,
        coluna=coluna
    )


@router.post("/tarefas")
async def buscar_tarefas_similares(
    query: str,
    limite: int = 10,
    threshold: float = 0.7,
    projeto: Optional[str] = None,
    coluna: Optional[str] = None
) -> Dict[str, Any]:
    return await search_service.buscar_tarefas(
        query=query,
        limite=limite,
        threshold=threshold,
        projeto=projeto,
        coluna=coluna
    )


@router.post("/contratos")
async def buscar_contratos_similares(
    query: str,
    limite: int = 10,
    threshold: float = 0.7
) -> Dict[str, Any]:
    return await search_service.buscar_contratos(
        query=query,
        limite=limite,
        threshold=threshold
    )

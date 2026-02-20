from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional

from api.schemas.projeto import ProjetoCreate, ProjetoUpdate, ProjetoResponse
from api.services import projetos as projeto_service

router = APIRouter()


@router.get("/", response_model=List[ProjetoResponse])
async def listar_projetos(
    empresa_id: int = Query(1, description="ID da empresa"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    return await projeto_service.listar_projetos(
        empresa_id=empresa_id,
        status=status,
        skip=skip,
        limit=limit
    )


@router.get("/{projeto_id}", response_model=ProjetoResponse)
async def buscar_projeto(projeto_id: int, empresa_id: int = Query(1)):
    projeto = await projeto_service.buscar_projeto(projeto_id, empresa_id)
    if not projeto:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return projeto


@router.post("/", response_model=ProjetoResponse, status_code=status.HTTP_201_CREATED)
async def criar_projeto(projeto: ProjetoCreate):
    return await projeto_service.criar_projeto(projeto)


@router.patch("/{projeto_id}", response_model=ProjetoResponse)
async def atualizar_projeto(projeto_id: int, projeto: ProjetoUpdate, empresa_id: int = Query(1)):
    projeto_atualizado = await projeto_service.atualizar_projeto(projeto_id, empresa_id, projeto)
    if not projeto_atualizado:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return projeto_atualizado


@router.delete("/{projeto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_projeto(projeto_id: int, empresa_id: int = Query(1)):
    sucesso = await projeto_service.deletar_projeto(projeto_id, empresa_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return None

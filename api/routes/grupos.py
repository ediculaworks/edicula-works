from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional

from api.schemas.grupo import GrupoCreate, GrupoUpdate, GrupoResponse
from api.services.grupos import GrupoService

router = APIRouter()


@router.get("/", response_model=List[GrupoResponse])
async def listar_grupos(
    empresa_id: int = Query(1, description="ID da empresa"),
    ativo: Optional[bool] = Query(None, description="Filtrar por status ativo")
):
    return GrupoService.list(empresa_id=empresa_id, ativo=ativo)


@router.get("/{grupo_id}", response_model=GrupoResponse)
async def buscar_grupo(grupo_id: int):
    grupo = GrupoService.get_by_id(grupo_id)
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    return grupo


@router.post("/", response_model=GrupoResponse, status_code=status.HTTP_201_CREATED)
async def criar_grupo(grupo: GrupoCreate):
    return GrupoService.create(grupo.model_dump())


@router.patch("/{grupo_id}", response_model=GrupoResponse)
async def atualizar_grupo(grupo_id: int, grupo: GrupoUpdate):
    grupo_atualizado = GrupoService.update(grupo_id, grupo.model_dump(exclude_unset=True))
    if not grupo_atualizado:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    return grupo_atualizado


@router.delete("/{grupo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_grupo(grupo_id: int):
    sucesso = GrupoService.delete(grupo_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")

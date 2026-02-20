from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional

from api.schemas.tag import TagCreate, TagUpdate, TagResponse
from api.services import tags as tag_service

router = APIRouter()


@router.get("/", response_model=List[TagResponse])
async def listar_tags(
    empresa_id: int = Query(1, description="ID da empresa"),
    escopo: Optional[str] = Query(None, description="Filtrar por escopo"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    return await tag_service.listar_tags(
        empresa_id=empresa_id,
        escopo=escopo,
        skip=skip,
        limit=limit
    )


@router.get("/{tag_id}", response_model=TagResponse)
async def buscar_tag(tag_id: int, empresa_id: int = Query(1)):
    tag = await tag_service.buscar_tag(tag_id, empresa_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag não encontrada")
    return tag


@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def criar_tag(tag: TagCreate):
    data = tag.model_dump()
    return await tag_service.criar_tag(data)


@router.patch("/{tag_id}", response_model=TagResponse)
async def atualizar_tag(tag_id: int, tag: TagUpdate, empresa_id: int = Query(1)):
    data = tag.model_dump(exclude_unset=True)
    tag_atualizada = await tag_service.atualizar_tag(tag_id, data, empresa_id)
    if not tag_atualizada:
        raise HTTPException(status_code=404, detail="Tag não encontrada")
    return tag_atualizada


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_tag(tag_id: int, empresa_id: int = Query(1)):
    sucesso = await tag_service.deletar_tag(tag_id, empresa_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Tag não encontrada")

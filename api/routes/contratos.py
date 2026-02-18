from fastapi import APIRouter, HTTPException, status
from typing import List, Optional

from api.schemas.contrato import ContratoCreate, ContratoUpdate, ContratoResponse
from api.services import contratos as contrato_service

router = APIRouter()


@router.get("/", response_model=List[ContratoResponse])
async def listar_contratos(
    status: Optional[str] = None,
    tipo: Optional[str] = None,
    contratante: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    return await contrato_service.listar_contratos(
        status=status,
        tipo=tipo,
        contratante=contratante,
        skip=skip,
        limit=limit
    )


@router.get("/{contrato_id}", response_model=ContratoResponse)
async def buscar_contrato(contrato_id: int):
    contrato = await contrato_service.buscar_contrato(contrato_id)
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    return contrato


@router.post("/", response_model=ContratoResponse, status_code=status.HTTP_201_CREATED)
async def criar_contrato(contrato: ContratoCreate):
    return await contrato_service.criar_contrato(contrato)


@router.patch("/{contrato_id}", response_model=ContratoResponse)
async def atualizar_contrato(contrato_id: int, contrato: ContratoUpdate):
    contrato_atualizado = await contrato_service.atualizar_contrato(contrato_id, contrato)
    if not contrato_atualizado:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    return contrato_atualizado


@router.delete("/{contrato_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_contrato(contrato_id: int):
    sucesso = await contrato_service.deletar_contrato(contrato_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")


@router.get("/vencer/{dias}")
async def contratos_vencer(dias: int = 30):
    return await contrato_service.contratos_vencem_em(dias)

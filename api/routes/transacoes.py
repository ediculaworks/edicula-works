from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional

from api.schemas.transacao import TransacaoCreate, TransacaoUpdate, TransacaoResponse
from api.services import transacoes as transacao_service

router = APIRouter()


@router.get("/", response_model=List[TransacaoResponse])
async def listar_transacoes(
    empresa_id: int = Query(1, description="ID da empresa"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo"),
    categoria_id: Optional[int] = Query(None, description="Filtrar por categoria (ID)"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    projeto_id: Optional[int] = Query(None, description="Filtrar por projeto (ID)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    return await transacao_service.listar_transacoes(
        empresa_id=empresa_id,
        tipo=tipo,
        categoria_id=categoria_id,
        status=status,
        projeto_id=projeto_id,
        skip=skip,
        limit=limit
    )


@router.get("/{transacao_id}", response_model=TransacaoResponse)
async def buscar_transacao(transacao_id: int, empresa_id: int = Query(1)):
    transacao = await transacao_service.buscar_transacao(transacao_id, empresa_id)
    if not transacao:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return transacao


@router.post("/", response_model=TransacaoResponse, status_code=status.HTTP_201_CREATED)
async def criar_transacao(transacao: TransacaoCreate):
    return await transacao_service.criar_transacao(transacao)


@router.patch("/{transacao_id}", response_model=TransacaoResponse)
async def atualizar_transacao(transacao_id: int, transacao: TransacaoUpdate, empresa_id: int = Query(1)):
    transacao_atualizada = await transacao_service.atualizar_transacao(transacao_id, transacao, empresa_id)
    if not transacao_atualizada:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return transacao_atualizada


@router.delete("/{transacao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_transacao(transacao_id: int, empresa_id: int = Query(1)):
    sucesso = await transacao_service.deletar_transacao(transacao_id, empresa_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Transação não encontrada")


@router.get("/resumo/mensal")
async def resumo_mensal(ano: int, mes: int, empresa_id: int = Query(1)):
    return await transacao_service.resumo_mensal(ano, mes, empresa_id)


@router.get("/resumo/projetos")
async def resumo_projetos(empresa_id: int = Query(1)):
    return await transacao_service.resumo_por_projeto(empresa_id)


@router.get("/resumo/categorias")
async def resumo_categorias(ano: int, mes: int, empresa_id: int = Query(1)):
    return await transacao_service.resumo_por_categoria(ano, mes, empresa_id)

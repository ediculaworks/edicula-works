from typing import List, Optional
from datetime import datetime

from api.schemas.transacao import TransacaoCreate, TransacaoUpdate, TransacaoResponse

transacoes_db: List[dict] = []


async def listar_transacoes(
    tipo: Optional[str] = None,
    categoria: Optional[str] = None,
    status: Optional[str] = None,
    projeto: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[TransacaoResponse]:
    results = transacoes_db.copy()
    
    if tipo:
        results = [t for t in results if t["tipo"] == tipo]
    if categoria:
        results = [t for t in results if t.get("categoria") == categoria]
    if status:
        results = [t for t in results if t["status"] == status]
    if projeto:
        results = [t for t in results if t.get("projeto") == projeto]
    
    return results[skip:skip+limit]


async def buscar_transacao(transacao_id: int) -> Optional[TransacaoResponse]:
    for transacao in transacoes_db:
        if transacao["id"] == transacao_id:
            return transacao
    return None


async def criar_transacao(transacao: TransacaoCreate) -> TransacaoResponse:
    now = datetime.utcnow()
    nova_transacao = {
        "id": len(transacoes_db) + 1,
        "tipo": transacao.tipo.value,
        "categoria": transacao.categoria,
        "descricao": transacao.descricao,
        "valor": transacao.valor,
        "data_transacao": transacao.data_transacao,
        "data_vencimento": transacao.data_vencimento,
        "data_pagamento": transacao.data_pagamento,
        "status": transacao.status.value,
        "projeto": transacao.projeto,
        "contrato_id": transacao.contrato_id,
        "created_at": now,
        "updated_at": now
    }
    transacoes_db.append(nova_transacao)
    return nova_transacao


async def atualizar_transacao(transacao_id: int, transacao: TransacaoUpdate) -> Optional[TransacaoResponse]:
    for i, t in enumerate(transacoes_db):
        if t["id"] == transacao_id:
            update_data = transacao.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                if value is not None:
                    if hasattr(value, 'value'):
                        t[key] = value.value
                    else:
                        t[key] = value
            t["updated_at"] = datetime.utcnow()
            return t
    return None


async def deletar_transacao(transacao_id: int) -> bool:
    for i, t in enumerate(transacoes_db):
        if t["id"] == transacao_id:
            transacoes_db.pop(i)
            return True
    return False


async def resumo_mensal(ano: int, mes: int) -> dict:
    receitas = sum(t["valor"] for t in transacoes_db 
                   if t["tipo"] == "receita" 
                   and t["data_transacao"].year == ano 
                   and t["data_transacao"].month == mes
                   and t["status"] == "pago")
    
    despesas = sum(t["valor"] for t in transacoes_db 
                   if t["tipo"] == "despesa" 
                   and t["data_transacao"].year == ano 
                   and t["data_transacao"].month == mes
                   and t["status"] == "pago")
    
    return {
        "ano": ano,
        "mes": mes,
        "receitas": receitas,
        "despesas": despesas,
        "saldo": receitas - despesas
    }


async def resumo_por_projeto() -> List[dict]:
    projetos = {}
    
    for t in transacoes_db:
        projeto = t.get("projeto", "Sem projeto")
        if projeto not in projetos:
            projetos[projeto] = {"receitas": 0, "despesas": 0}
        
        if t["tipo"] == "receita":
            projetos[projeto]["receitas"] += t["valor"]
        else:
            projetos[projeto]["despesas"] += t["valor"]
    
    return [
        {"projeto": p, **vals, "saldo": vals["receitas"] - vals["despesas"]}
        for p, vals in projetos.items()
    ]

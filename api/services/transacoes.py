from typing import List, Optional, Dict, Any
from datetime import datetime, date

from api.database import get_db
from api.schemas.transacao import TransacaoCreate, TransacaoUpdate


async def listar_transacoes(
    empresa_id: int = 1,
    tipo: Optional[str] = None,
    categoria_id: Optional[int] = None,
    status: Optional[str] = None,
    projeto_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Dict[str, Any]]:
    db = get_db()
    
    query = db.table("transacoes").select("*").eq("empresa_id", empresa_id)
    
    if tipo:
        query = query.eq("tipo", tipo)
    if categoria_id:
        query = query.eq("categoria_id", categoria_id)
    if status:
        query = query.eq("status", status)
    if projeto_id:
        query = query.eq("projeto_id", projeto_id)
    
    query = query.order("data_transacao", desc=True).range(skip, skip + limit - 1)
    
    result = query.execute()
    return result.data or []


async def buscar_transacao(transacao_id: int, empresa_id: int = 1) -> Optional[Dict[str, Any]]:
    db = get_db()
    
    result = db.table("transacoes").select("*").eq("id", transacao_id).eq("empresa_id", empresa_id).execute()
    
    return result.data[0] if result.data else None


async def criar_transacao(transacao: TransacaoCreate) -> Dict[str, Any]:
    db = get_db()
    
    data = transacao.model_dump()
    
    data["tags"] = data.get("tags") or []
    data["embedding"] = None
    
    result = db.table("transacoes").insert(data).execute()
    
    return result.data[0] if result.data else None


async def atualizar_transacao(transacao_id: int, transacao: TransacaoUpdate, empresa_id: int = 1) -> Optional[Dict[str, Any]]:
    db = get_db()
    
    data = transacao.model_dump(exclude_unset=True)
    
    if "tags" in data and data["tags"] is None:
        data["tags"] = []
    
    if data:
        data["updated_at"] = datetime.utcnow().isoformat()
        
        result = db.table("transacoes").update(data).eq("id", transacao_id).eq("empresa_id", empresa_id).execute()
        
        return result.data[0] if result.data else None
    
    return await buscar_transacao(transacao_id, empresa_id)


async def deletar_transacao(transacao_id: int, empresa_id: int = 1) -> bool:
    db = get_db()
    
    result = db.table("transacoes").delete().eq("id", transacao_id).eq("empresa_id", empresa_id).execute()
    
    return len(result.data) > 0 if result.data else False


async def resumo_mensal(ano: int, mes: int, empresa_id: int = 1) -> Dict[str, Any]:
    db = get_db()
    
    data_inicio = date(ano, mes, 1)
    if mes == 12:
        data_fim = date(ano + 1, 1, 1)
    else:
        data_fim = date(ano, mes + 1, 1)
    
    receitas_result = db.table("transacoes").select(
        db.context.postgrest.api.APIRPCBuilder("sum", ["valor"])
    ).eq("empresa_id", empresa_id).eq("tipo", "receita").eq("status", "pago").gte("data_transacao", data_inicio.isoformat()).lt("data_transacao", data_fim.isoformat()).execute()
    
    despesas_result = db.table("transacoes").select(
        db.context.postgrest.api.APIRPCBuilder("sum", ["valor"])
    ).eq("empresa_id", empresa_id).eq("tipo", "despesa").eq("status", "pago").gte("data_transacao", data_inicio.isoformat()).lt("data_transacao", data_fim.isoformat()).execute()
    
    receitas = receitas_result.data[0].get("sum", 0) if receitas_result.data else 0
    despesas = despesas_result.data[0].get("sum", 0) if despesas_result.data else 0
    
    return {
        "ano": ano,
        "mes": mes,
        "receitas": receitas or 0,
        "despesas": despesas or 0,
        "saldo": (receitas or 0) - (despesas or 0)
    }


async def resumo_por_projeto(empresa_id: int = 1) -> List[Dict[str, Any]]:
    db = get_db()
    
    result = db.table("transacoes").select(
        "projeto_id",
        "tipo",
        "valor"
    ).eq("empresa_id", empresa_id).execute()
    
    projetos: Dict[int, Dict[str, float]] = {}
    
    for item in result.data or []:
        projeto_id = item.get("projeto_id") or 0
        if projeto_id not in projetos:
            projetos[projeto_id] = {"receitas": 0, "despesas": 0}
        
        if item["tipo"] == "receita":
            projetos[projeto_id]["receitas"] += item["valor"] or 0
        else:
            projetos[projeto_id]["despesas"] += item["valor"] or 0
    
    return [
        {
            "projeto_id": pid,
            "receitas": vals["receitas"],
            "despesas": vals["despesas"],
            "saldo": vals["receitas"] - vals["despesas"]
        }
        for pid, vals in projetos.items()
    ]


async def resumo_por_categoria(ano: int, mes: int, empresa_id: int = 1) -> List[Dict[str, Any]]:
    db = get_db()
    
    data_inicio = date(ano, mes, 1)
    if mes == 12:
        data_fim = date(ano + 1, 1, 1)
    else:
        data_fim = date(ano, mes + 1, 1)
    
    result = db.table("transacoes").select(
        "categoria_id",
        "tipo",
        "valor"
    ).eq("empresa_id", empresa_id).eq("status", "pago").gte("data_transacao", data_inicio.isoformat()).lt("data_transacao", data_fim.isoformat()).execute()
    
    categorias: Dict[int, Dict[str, float]] = {}
    
    for item in result.data or []:
        cat_id = item.get("categoria_id") or 0
        if cat_id not in categorias:
            categorias[cat_id] = {"receitas": 0, "despesas": 0}
        
        if item["tipo"] == "receita":
            categorias[cat_id]["receitas"] += item["valor"] or 0
        else:
            categorias[cat_id]["despesas"] += item["valor"] or 0
    
    return [
        {
            "categoria_id": cid,
            "receitas": vals["receitas"],
            "despesas": vals["despesas"]
        }
        for cid, vals in categorias.items()
    ]

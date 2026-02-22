from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta

from api.database import get_db
from api.schemas.contrato import ContratoCreate, ContratoUpdate


async def listar_contratos(
    empresa_id: int = 1,
    status: Optional[str] = None,
    tipo: Optional[str] = None,
    cliente_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Dict[str, Any]]:
    db = get_db()
    
    query = db.table("contratos").select("*").eq("empresa_id", empresa_id)
    
    if status:
        query = query.eq("status", status)
    if tipo:
        query = query.eq("tipo", tipo)
    if cliente_id:
        query = query.eq("cliente_id", cliente_id)
    
    query = query.order("created_at", desc=True).range(skip, skip + limit - 1)
    
    result = query.execute()
    return result.data or []


async def buscar_contrato(contrato_id: int, empresa_id: int = 1) -> Optional[Dict[str, Any]]:
    db = get_db()
    
    result = db.table("contratos").select("*").eq("id", contrato_id).eq("empresa_id", empresa_id).execute()
    
    return result.data[0] if result.data else None


async def criar_contrato(contrato: ContratoCreate) -> Dict[str, Any]:
    db = get_db()
    
    data = contrato.model_dump()
    
    for key, value in data.items():
        if isinstance(value, date):
            data[key] = value.isoformat()
    
    data["embedding"] = None
    
    result = db.table("contratos").insert(data).execute()
    
    return result.data[0] if result.data else None


async def atualizar_contrato(contrato_id: int, contrato: ContratoUpdate, empresa_id: int = 1) -> Optional[Dict[str, Any]]:
    db = get_db()
    
    data = contrato.model_dump(exclude_unset=True)
    
    for key, value in data.items():
        if isinstance(value, date):
            data[key] = value.isoformat()
    
    if data:
        data["updated_at"] = datetime.utcnow().isoformat()
        
        result = db.table("contratos").update(data).eq("id", contrato_id).eq("empresa_id", empresa_id).execute()
        
        return result.data[0] if result.data else None
    
    return await buscar_contrato(contrato_id, empresa_id)


async def deletar_contrato(contrato_id: int, empresa_id: int = 1) -> bool:
    db = get_db()
    
    result = db.table("contratos").delete().eq("id", contrato_id).eq("empresa_id", empresa_id).execute()
    
    return len(result.data) > 0 if result.data else False


async def contratos_vencem_em(dias: int, empresa_id: int = 1) -> List[Dict[str, Any]]:
    db = get_db()
    
    hoje = date.today()
    limite = hoje + timedelta(days=dias)
    
    result = db.table("contratos").select("*").eq("empresa_id", empresa_id).eq("status", "ativo").gte("data_fim", hoje.isoformat()).lte("data_fim", limite.isoformat()).execute()
    
    return result.data or []


async def contratos_expirados(empresa_id: int = 1) -> List[Dict[str, Any]]:
    db = get_db()
    
    hoje = date.today()
    
    result = db.table("contratos").select("*").eq("empresa_id", empresa_id).eq("status", "ativo").lt("data_fim", hoje.isoformat()).execute()
    
    return result.data or []


async def adicionar_renovacao(
    contrato_id: int,
    data_inicio: date,
    data_fim: date,
    valor_novo: Optional[float] = None,
    empresa_id: int = 1
) -> Dict[str, Any]:
    db = get_db()
    
    contrato = await buscar_contrato(contrato_id, empresa_id)
    if not contrato:
        raise ValueError("Contrato não encontrado")
    
    valor_anterior = contrato.get("valor")
    
    percentual_aumento = None
    if valor_anterior and valor_novo:
        percentual_aumento = ((valor_novo - valor_anterior) / valor_anterior) * 100
    
    result_renovacao = db.table("contrato_renovacoes").insert({
        "contrato_id": contrato_id,
        "numero_renovacao": 1,
        "data_inicio": data_inicio.isoformat(),
        "data_fim": data_fim.isoformat(),
        "valor_anterior": valor_anterior,
        "valor_novo": valor_novo,
        "percentual_aumento": percentual_aumento,
        "status": "ativa"
    }).execute()
    
    db.table("contratos").update({
        "data_inicio": data_inicio.isoformat(),
        "data_fim": data_fim.isoformat(),
        "valor": valor_novo,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", contrato_id).eq("empresa_id", empresa_id).execute()
    
    return result_renovacao.data[0] if result_renovacao.data else {}

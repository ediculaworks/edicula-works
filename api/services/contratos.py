from typing import List, Optional
from datetime import datetime

from api.schemas.contrato import ContratoCreate, ContratoUpdate, ContratoResponse

contratos_db: List[dict] = []


async def listar_contratos(
    status: Optional[str] = None,
    tipo: Optional[str] = None,
    contratante: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[ContratoResponse]:
    results = contratos_db.copy()
    
    if status:
        results = [c for c in results if c["status"] == status]
    if tipo:
        results = [c for c in results if c["tipo"] == tipo]
    if contratante:
        results = [c for c in results if contratante.lower() in c.get("contratante", "").lower()]
    
    return results[skip:skip+limit]


async def buscar_contrato(contrato_id: int) -> Optional[ContratoResponse]:
    for contrato in contratos_db:
        if contrato["id"] == contrato_id:
            return contrato
    return None


async def criar_contrato(contrato: ContratoCreate) -> ContratoResponse:
    now = datetime.utcnow()
    novo_contrato = {
        "id": len(contratos_db) + 1,
        "titulo": contrato.titulo,
        "tipo": contrato.tipo.value,
        "contratante": contrato.contratante,
        "contratado": contrato.contratado,
        "valor": contrato.valor,
        "periodicidade": contrato.periodicidade.value if contrato.periodicidade else None,
        "status": contrato.status.value,
        "data_inicio": contrato.data_inicio,
        "data_fim": contrato.data_fim,
        "descricao": contrato.descricao,
        "embedding": None,
        "created_at": now,
        "updated_at": now
    }
    contratos_db.append(novo_contrato)
    return novo_contrato


async def atualizar_contrato(contrato_id: int, contrato: ContratoUpdate) -> Optional[ContratoResponse]:
    for i, c in enumerate(contratos_db):
        if c["id"] == contrato_id:
            update_data = contrato.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                if value is not None:
                    if hasattr(value, 'value'):
                        c[key] = value.value
                    else:
                        c[key] = value
            c["updated_at"] = datetime.utcnow()
            return c
    return None


async def deletar_contrato(contrato_id: int) -> bool:
    for i, c in enumerate(contratos_db):
        if c["id"] == contrato_id:
            contratos_db.pop(i)
            return True
    return False


async def contratos_vencem_em(dias: int) -> List[ContratoResponse]:
    from datetime import timedelta
    from api.services.tarefas import tarefas_db
    
    hoje = datetime.utcnow()
    limite = hoje + timedelta(days=dias)
    
    return [
        c for c in contratos_db
        if c.get("data_fim") and c["data_fim"] <= limite and c["status"] == "active"
    ]

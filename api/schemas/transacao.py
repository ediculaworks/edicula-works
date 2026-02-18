from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class TipoTransacao(str, Enum):
    receita = "receita"
    despesa = "despesa"


class StatusTransacao(str, Enum):
    pendente = "pendente"
    pago = "pago"
    cancelado = "cancelado"


class TransacaoCreate(BaseModel):
    tipo: TipoTransacao
    categoria: str
    descricao: Optional[str] = None
    valor: float = Field(..., gt=0)
    data_transacao: Optional[datetime] = None
    data_vencimento: Optional[datetime] = None
    data_pagamento: Optional[datetime] = None
    status: StatusTransacao = StatusTransacao.pendente
    projeto: Optional[str] = None
    contrato_id: Optional[int] = None


class TransacaoUpdate(BaseModel):
    tipo: Optional[TipoTransacao] = None
    categoria: Optional[str] = None
    descricao: Optional[str] = None
    valor: Optional[float] = Field(None, gt=0)
    data_transacao: Optional[datetime] = None
    data_vencimento: Optional[datetime] = None
    data_pagamento: Optional[datetime] = None
    status: Optional[StatusTransacao] = None
    projeto: Optional[str] = None
    contrato_id: Optional[int] = None


class TransacaoResponse(BaseModel):
    id: int
    tipo: str
    categoria: str
    descricao: Optional[str]
    valor: float
    data_transacao: Optional[datetime]
    data_vencimento: Optional[datetime]
    data_pagamento: Optional[datetime]
    status: str
    projeto: Optional[str]
    contrato_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

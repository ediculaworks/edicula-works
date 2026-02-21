from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime, date
from enum import Enum


class TipoTransacao(str, Enum):
    receita = "receita"
    despesa = "despesa"
    transferencia = "transferencia"


class StatusTransacao(str, Enum):
    pendente = "pendente"
    pago = "pago"
    cancelado = "cancelado"
    estornado = "estornado"


class TransacaoCreate(BaseModel):
    empresa_id: int = 1
    
    tipo: TipoTransacao
    
    categoria_id: Optional[int] = None
    centro_custo_id: Optional[int] = None
    
    valor: float = Field(..., gt=0)
    valor_original: Optional[float] = None
    moeda_original: Optional[str] = "BRL"
    cambio: Optional[float] = 1.0
    
    descricao: Optional[str] = None
    descricao_detalhada: Optional[str] = None
    
    data_transacao: Optional[date] = None
    data_vencimento: Optional[date] = None
    data_pagamento: Optional[date] = None
    data_competencia: Optional[date] = None
    
    status: StatusTransacao = StatusTransacao.pendente
    
    conta_bancaria_id: Optional[int] = None
    
    contrato_id: Optional[int] = None
    projeto_id: Optional[int] = None
    tarefa_id: Optional[int] = None
    fatura_id: Optional[int] = None
    orcamento_id: Optional[int] = None
    
    documento_tipo: Optional[str] = None
    documento_numero: Optional[str] = None
    documento_url: Optional[str] = None
    
    recorrente: bool = False
    transacao_pai_id: Optional[int] = None
    
    fornecedor_id: Optional[int] = None
    cliente_id: Optional[int] = None
    pessoa_nome: Optional[str] = None
    
    observacoes: Optional[str] = None
    tags: Optional[List[str]] = []
    
    created_by: Optional[int] = None


class TransacaoUpdate(BaseModel):
    tipo: Optional[TipoTransacao] = None
    
    categoria_id: Optional[int] = None
    centro_custo_id: Optional[int] = None
    
    valor: Optional[float] = Field(None, gt=0)
    valor_original: Optional[float] = None
    cambio: Optional[float] = None
    
    descricao: Optional[str] = None
    descricao_detalhada: Optional[str] = None
    
    data_transacao: Optional[date] = None
    data_vencimento: Optional[date] = None
    data_pagamento: Optional[date] = None
    data_competencia: Optional[date] = None
    
    status: Optional[StatusTransacao] = None
    
    conta_bancaria_id: Optional[int] = None
    
    contrato_id: Optional[int] = None
    projeto_id: Optional[int] = None
    tarefa_id: Optional[int] = None
    fatura_id: Optional[int] = None
    orcamento_id: Optional[int] = None
    
    documento_tipo: Optional[str] = None
    documento_numero: Optional[str] = None
    
    recorrente: Optional[bool] = None
    
    fornecedor_id: Optional[int] = None
    cliente_id: Optional[int] = None
    
    observacoes: Optional[str] = None
    tags: Optional[List[str]] = None


class TransacaoResponse(BaseModel):
    id: int
    empresa_id: int
    
    tipo: str
    
    categoria_id: Optional[int]
    centro_custo_id: Optional[int]
    
    valor: float
    valor_original: Optional[float]
    moeda_original: Optional[str]
    cambio: Optional[float]
    
    descricao: Optional[str]
    descricao_detalhada: Optional[str]
    
    data_transacao: Optional[date]
    data_vencimento: Optional[date]
    data_pagamento: Optional[date]
    data_competencia: Optional[date]
    
    status: str
    
    conta_bancaria_id: Optional[int]
    
    contrato_id: Optional[int]
    projeto_id: Optional[int]
    tarefa_id: Optional[int]
    fatura_id: Optional[int]
    orcamento_id: Optional[int]
    
    documento_tipo: Optional[str]
    documento_numero: Optional[str]
    documento_url: Optional[str]
    
    recorrente: bool
    transacao_pai_id: Optional[int]
    
    fornecedor_id: Optional[int]
    cliente_id: Optional[int]
    pessoa_nome: Optional[str]
    
    observacoes: Optional[str]
    tags: Optional[List[str]] = []
    
    embedding: Optional[Any] = None
    
    created_by: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

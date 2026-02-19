from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime, date
from enum import Enum


class TipoContrato(str, Enum):
    nda = "nda"
    servico = "servico"
    parceria = "parceria"
    locacao = "locacao"
    licenca = "licenca"
    outro = "outro"


class StatusContrato(str, Enum):
    rascunho = "rascunho"
    ativo = "ativo"
    expirado = "expired"
    encerrado = "encerrado"
    cancelado = "cancelado"


class Periodicidade(str, Enum):
    mensal = "mensal"
    bimestral = "bimestral"
    trimestral = "trimestral"
    semestral = "semestral"
    anual = "anual"
    unico = "unico"


class ContratoCreate(BaseModel):
    empresa_id: int = 1
    
    titulo: str = Field(..., min_length=1, max_length=500)
    descricao: Optional[str] = None
    numero: Optional[str] = None
    
    tipo: TipoContrato = TipoContrato.servico
    
    cliente_id: Optional[int] = None
    fornecedor_id: Optional[int] = None
    contraparte_nome: Optional[str] = None
    contraparte_documento: Optional[str] = None
    
    valor: Optional[float] = Field(None, ge=0)
    valor_mensal: Optional[float] = Field(None, ge=0)
    periodicidade: Optional[Periodicidade] = None
    
    data_assinatura: Optional[date] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    data_encerramento: Optional[date] = None
    
    status: StatusContrato = StatusContrato.rascunho
    
    renovacao_automatica: bool = False
    periodo_aviso_renovacao: int = 30
    
    arquivo_url: Optional[str] = None
    
    created_by: Optional[int] = None


class ContratoUpdate(BaseModel):
    titulo: Optional[str] = Field(None, max_length=500)
    descricao: Optional[str] = None
    numero: Optional[str] = None
    
    tipo: Optional[TipoContrato] = None
    
    cliente_id: Optional[int] = None
    fornecedor_id: Optional[int] = None
    contraparte_nome: Optional[str] = None
    contraparte_documento: Optional[str] = None
    
    valor: Optional[float] = Field(None, ge=0)
    valor_mensal: Optional[float] = Field(None, ge=0)
    periodicidade: Optional[Periodicidade] = None
    
    data_assinatura: Optional[date] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    data_encerramento: Optional[date] = None
    
    status: Optional[StatusContrato] = None
    
    renovacao_automatica: Optional[bool] = None
    periodo_aviso_renovacao: Optional[int] = None
    
    arquivo_url: Optional[str] = None


class ContratoResponse(BaseModel):
    id: int
    empresa_id: int
    
    titulo: str
    descricao: Optional[str]
    numero: Optional[str]
    
    tipo: str
    
    cliente_id: Optional[int]
    fornecedor_id: Optional[int]
    contraparte_nome: Optional[str]
    contraparte_documento: Optional[str]
    
    valor: Optional[float]
    valor_mensal: Optional[float]
    periodicidade: Optional[str]
    
    data_assinatura: Optional[date]
    data_inicio: Optional[date]
    data_fim: Optional[date]
    data_encerramento: Optional[date]
    
    status: str
    
    renovacao_automatica: bool
    periodo_aviso_renovacao: int
    
    arquivo_url: Optional[str]
    
    embedding: Optional[Any] = None
    
    created_by: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

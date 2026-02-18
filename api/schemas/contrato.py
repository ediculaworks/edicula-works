from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class TipoContrato(str, Enum):
    nda = "nda"
    servico = "servico"
    parceria = "parceria"
    outro = "outro"


class StatusContrato(str, Enum):
    draft = "draft"
    active = "active"
    expired = "expired"
    terminated = "terminated"


class Periodicidade(str, Enum):
    mensal = "mensal"
    anual = "anual"


class ContratoCreate(BaseModel):
    titulo: str = Field(..., min_length=1)
    tipo: TipoContrato
    contratante: str
    contratado: Optional[str] = None
    valor: Optional[float] = Field(None, ge=0)
    periodicidade: Optional[Periodicidade] = None
    status: StatusContrato = StatusContrato.draft
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    descricao: Optional[str] = None


class ContratoUpdate(BaseModel):
    titulo: Optional[str] = None
    tipo: Optional[TipoContrato] = None
    contratante: Optional[str] = None
    contratado: Optional[str] = None
    valor: Optional[float] = Field(None, ge=0)
    periodicidade: Optional[Periodicidade] = None
    status: Optional[StatusContrato] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    descricao: Optional[str] = None


class ContratoResponse(BaseModel):
    id: int
    titulo: str
    tipo: str
    contratante: str
    contratado: Optional[str]
    valor: Optional[float]
    periodicidade: Optional[str]
    status: str
    data_inicio: Optional[datetime]
    data_fim: Optional[datetime]
    descricao: Optional[str]
    embedding: Optional[list] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

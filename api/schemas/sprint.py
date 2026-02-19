from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class SprintCreate(BaseModel):
    empresa_id: int = 1
    projeto_id: Optional[int] = None
    nome: str = Field(..., min_length=1, max_length=100)
    objetivo: Optional[str] = None
    data_inicio: date
    data_fim: date
    status: str = "planejada"
    meta_pontos: Optional[int] = None
    ordem: int = 0


class SprintUpdate(BaseModel):
    projeto_id: Optional[int] = None
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    objetivo: Optional[str] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    data_conclusao: Optional[date] = None
    status: Optional[str] = None
    meta_pontos: Optional[int] = None
    pontos_concluidos: Optional[int] = None
    ordem: Optional[int] = None


class SprintResponse(BaseModel):
    id: int
    empresa_id: int
    projeto_id: Optional[int]
    nome: str
    objetivo: Optional[str]
    data_inicio: date
    data_fim: date
    data_conclusao: Optional[date]
    status: str
    meta_pontos: Optional[int]
    pontos_concluidos: int
    ordem: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

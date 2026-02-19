from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class GrupoCreate(BaseModel):
    empresa_id: int = 1
    nome: str = Field(..., min_length=1, max_length=100)
    descricao: Optional[str] = None
    cor: str = "#6b7280"
    icone: Optional[str] = None
    ativo: bool = True
    ordem: int = 0


class GrupoUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    descricao: Optional[str] = None
    cor: Optional[str] = None
    icone: Optional[str] = None
    ativo: Optional[bool] = None
    ordem: Optional[int] = None


class GrupoResponse(BaseModel):
    id: int
    empresa_id: int
    nome: str
    descricao: Optional[str]
    cor: str
    icone: Optional[str]
    ativo: bool
    ordem: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProjetoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    cor: Optional[str] = "#3b82f6"
    icone: Optional[str] = None
    cliente_nome: Optional[str] = None
    data_inicio: Optional[str] = None
    data_fim: Optional[str] = None
    status: str = "ativo"
    progresso: int = 0


class ProjetoCreate(ProjetoBase):
    empresa_id: int


class ProjetoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    cor: Optional[str] = None
    icone: Optional[str] = None
    cliente_nome: Optional[str] = None
    data_inicio: Optional[str] = None
    data_fim: Optional[str] = None
    status: Optional[str] = None
    progresso: Optional[int] = None


class ProjetoResponse(ProjetoBase):
    id: int
    empresa_id: int
    created_by: Optional[int] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

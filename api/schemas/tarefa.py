from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class Prioridade(str, Enum):
    urgente = "urgente"
    alta = "alta"
    media = "media"
    baixa = "baixa"


class Coluna(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    review = "review"
    done = "done"


class TarefaCreate(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=500)
    descricao: Optional[str] = None
    coluna: Coluna = Coluna.todo
    prioridade: Prioridade = Prioridade.media
    responsaveis: Optional[List[str]] = []
    projeto: Optional[str] = None
    cliente: Optional[str] = None
    prazo: Optional[datetime] = None
    estimativa: Optional[int] = Field(None, ge=0)
    tags: Optional[List[str]] = []


class TarefaUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=1, max_length=500)
    descricao: Optional[str] = None
    coluna: Optional[Coluna] = None
    prioridade: Optional[Prioridade] = None
    responsaveis: Optional[List[str]] = None
    projeto: Optional[str] = None
    cliente: Optional[str] = None
    prazo: Optional[datetime] = None
    estimativa: Optional[int] = Field(None, ge=0)
    tags: Optional[List[str]] = None


class TarefaResponse(BaseModel):
    id: int
    titulo: str
    descricao: Optional[str]
    coluna: str
    prioridade: str
    responsaveis: List[str]
    projeto: Optional[str]
    cliente: Optional[str]
    prazo: Optional[datetime]
    estimativa: Optional[int]
    tags: List[str]
    embedding: Optional[List[float]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

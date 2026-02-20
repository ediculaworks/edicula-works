from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TagCreate(BaseModel):
    empresa_id: int = 1
    nome: str = Field(..., min_length=1, max_length=100)
    cor: Optional[str] = Field(None, max_length=7)
    icone: Optional[str] = Field(None, max_length=50)
    escopo: str = Field(default="tarefa", max_length=50)


class TagUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    cor: Optional[str] = Field(None, max_length=7)
    icone: Optional[str] = Field(None, max_length=50)
    escopo: Optional[str] = Field(None, max_length=50)


class TagResponse(BaseModel):
    id: int
    empresa_id: int
    nome: str
    cor: Optional[str]
    icone: Optional[str]
    escopo: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime, date
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
    empresa_id: int = 1
    projeto_id: Optional[int] = None
    
    titulo: str = Field(..., min_length=1, max_length=500)
    descricao: Optional[str] = None
    descricao_html: Optional[str] = None
    
    coluna: Coluna = Coluna.todo
    prioridade: Prioridade = Prioridade.media
    estimativa_horas: Optional[float] = Field(None, ge=0)
    estimativa_pontos: Optional[int] = Field(None, ge=0)
    
    prazo: Optional[date] = None
    
    responsaveis: Optional[List[int]] = []
    cliente_nome: Optional[str] = None
    
    tarefa_pai_id: Optional[int] = None
    eh_subtarefa: bool = False
    
    tags: Optional[List[str]] = []
    created_by: Optional[int] = None


class TarefaUpdate(BaseModel):
    projeto_id: Optional[int] = None
    
    titulo: Optional[str] = Field(None, min_length=1, max_length=500)
    descricao: Optional[str] = None
    descricao_html: Optional[str] = None
    
    coluna: Optional[Coluna] = None
    prioridade: Optional[Prioridade] = None
    estimativa_horas: Optional[float] = Field(None, ge=0)
    estimativa_pontos: Optional[int] = Field(None, ge=0)
    
    prazo: Optional[date] = None
    data_conclusao: Optional[datetime] = None
    
    responsaveis: Optional[List[int]] = None
    cliente_nome: Optional[str] = None
    
    tarefa_pai_id: Optional[int] = None
    
    tags: Optional[List[str]] = None
    ordem: Optional[int] = None
    
    tempo_gasto_minutas: Optional[int] = None
    relatorio_horas: Optional[float] = None
    relatorio_custo: Optional[float] = None


class TarefaResponse(BaseModel):
    id: int
    empresa_id: int
    projeto_id: Optional[int]
    
    titulo: str
    descricao: Optional[str]
    descricao_html: Optional[str]
    
    coluna: str
    prioridade: str
    estimativa_horas: Optional[float]
    estimativa_pontos: Optional[int]
    
    prazo: Optional[date]
    data_conclusao: Optional[datetime]
    tempo_gasto_minutos: int
    
    responsaveis: List[int]
    created_by: Optional[int]
    cliente_nome: Optional[str]
    
    tarefa_pai_id: Optional[int]
    eh_subtarefa: bool
    
    ordem: int
    
    tags: List[str]
    embedding: Optional[Any] = None
    
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

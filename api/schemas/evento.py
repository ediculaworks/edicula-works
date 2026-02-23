from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import date, time
from enum import Enum


class TipoEvento(str, Enum):
    reuniao = "reuniao"
    visita = "visita"
    daily = "daily"
    evento = "evento"
    outro = "outro"


class Recorrencia(str, Enum):
    diaria = "diaria"
    semanal = "semanal"
    mensal = "mensal"


class StatusParticipante(str, Enum):
    confirmado = "confirmado"
    pendente = "pendente"
    recusado = "recusado"


class EventoCreate(BaseModel):
    empresa_id: int = 1
    
    titulo: str = Field(..., min_length=1, max_length=500)
    descricao: Optional[str] = None
    
    tipo: TipoEvento = TipoEvento.evento
    
    data_inicio: date
    data_fim: Optional[date] = None
    hora_inicio: Optional[time] = None
    hora_fim: Optional[time] = None
    
    local: Optional[str] = None
    link_reuniao: Optional[str] = None
    
    recorrencia: Optional[Recorrencia] = None
    fim_recorrencia: Optional[date] = None
    dia_semana_recorrencia: Optional[int] = None  # 0=dom, 1=seg, etc
    
    cor: Optional[str] = "#3b82f6"
    
    tarefa_id: Optional[int] = None
    
    participantes: Optional[List[str]] = []  # Lista de member IDs
    
    criado_por: Optional[int] = None


class EventoUpdate(BaseModel):
    titulo: Optional[str] = Field(None, max_length=500)
    descricao: Optional[str] = None
    
    tipo: Optional[TipoEvento] = None
    
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    hora_inicio: Optional[time] = None
    hora_fim: Optional[time] = None
    
    local: Optional[str] = None
    link_reuniao: Optional[str] = None
    
    recorrencia: Optional[Recorrencia] = None
    fim_recorrencia: Optional[date] = None
    dia_semana_recorrencia: Optional[int] = None
    
    cor: Optional[str] = None
    
    tarefa_id: Optional[int] = None


class ParticipanteCreate(BaseModel):
    membro_id: str
    status: StatusParticipante = StatusParticipante.confirmado


class ParticipanteResponse(BaseModel):
    id: str
    evento_id: str
    membro_id: str
    status: str
    created_at: str

    class Config:
        from_attributes = True


class EventoResponse(BaseModel):
    id: str
    empresa_id: int
    
    titulo: str
    descricao: Optional[str]
    
    tipo: str
    
    data_inicio: str
    data_fim: Optional[str]
    hora_inicio: Optional[str]
    hora_fim: Optional[str]
    
    local: Optional[str]
    link_reuniao: Optional[str]
    
    recorrencia: Optional[str]
    fim_recorrencia: Optional[str]
    dia_semana_recorrencia: Optional[int]
    
    cor: str
    
    tarefa_id: Optional[int]
    
    participantes: List[ParticipanteResponse] = []
    
    criado_por: Optional[int]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

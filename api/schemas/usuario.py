from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class Role(str, Enum):
    admin = "admin"
    manager = "manager"
    member = "member"


class UsuarioCreate(BaseModel):
    empresa_id: int = 1
    nome: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., max_length=255)
    username: Optional[str] = None
    cargo: Optional[str] = None
    departamento: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Role = Role.member
    perfil_id: Optional[int] = None


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=1, max_length=255)
    username: Optional[str] = None
    cargo: Optional[str] = None
    departamento: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[Role] = None
    perfil_id: Optional[int] = None
    ativo: Optional[bool] = None
    tema: Optional[str] = None
    linguagem: Optional[str] = None


class UsuarioResponse(BaseModel):
    id: str
    empresa_id: int
    nome: str
    email: str
    username: Optional[str]
    cargo: Optional[str]
    departamento: Optional[str]
    avatar_url: Optional[str]
    role: str
    perfil_id: Optional[int]
    ativo: bool
    email_verificado: bool
    ultimo_login: Optional[datetime]
    tema: str
    linguagem: str
    auth_user_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

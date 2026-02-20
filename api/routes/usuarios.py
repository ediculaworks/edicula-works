from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional

from api.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from api.services import usuarios as usuario_service

router = APIRouter()


@router.get("/", response_model=List[UsuarioResponse])
async def listar_usuarios(
    empresa_id: int = Query(1, description="ID da empresa"),
    ativo: Optional[bool] = Query(None, description="Filtrar por status ativo"),
    role: Optional[str] = Query(None, description="Filtrar por role"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    return await usuario_service.listar_usuarios(
        empresa_id=empresa_id,
        ativo=ativo,
        role=role,
        skip=skip,
        limit=limit
    )


@router.get("/{usuario_id}", response_model=UsuarioResponse)
async def buscar_usuario(usuario_id: str, empresa_id: int = Query(1)):
    usuario = await usuario_service.buscar_usuario(usuario_id, empresa_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario


@router.get("/email/{email}", response_model=UsuarioResponse)
async def buscar_usuario_por_email(email: str):
    usuario = await usuario_service.buscar_usuario_por_email(email)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario


@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def criar_usuario(usuario: UsuarioCreate):
    data = usuario.model_dump()
    return await usuario_service.criar_usuario(data)


@router.patch("/{usuario_id}", response_model=UsuarioResponse)
async def atualizar_usuario(usuario_id: str, usuario: UsuarioUpdate, empresa_id: int = Query(1)):
    data = usuario.model_dump(exclude_unset=True)
    usuario_atualizado = await usuario_service.atualizar_usuario(usuario_id, data, empresa_id)
    if not usuario_atualizado:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario_atualizado


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_usuario(usuario_id: str, empresa_id: int = Query(1)):
    sucesso = await usuario_service.deletar_usuario(usuario_id, empresa_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

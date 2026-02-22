from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File, Form
from typing import List, Optional
from datetime import date

from api.schemas.contrato import ContratoCreate, ContratoUpdate, ContratoResponse
from api.services import contratos as contrato_service

router = APIRouter()


@router.get("/", response_model=List[ContratoResponse])
async def listar_contratos(
    empresa_id: int = Query(1, description="ID da empresa"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo"),
    cliente_id: Optional[int] = Query(None, description="Filtrar por cliente (ID)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    return await contrato_service.listar_contratos(
        empresa_id=empresa_id,
        status=status,
        tipo=tipo,
        cliente_id=cliente_id,
        skip=skip,
        limit=limit
    )


@router.get("/{contrato_id}", response_model=ContratoResponse)
async def buscar_contrato(contrato_id: int, empresa_id: int = Query(1)):
    contrato = await contrato_service.buscar_contrato(contrato_id, empresa_id)
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    return contrato


@router.post("/", response_model=ContratoResponse, status_code=status.HTTP_201_CREATED)
async def criar_contrato(contrato: ContratoCreate):
    return await contrato_service.criar_contrato(contrato)


@router.patch("/{contrato_id}", response_model=ContratoResponse)
async def atualizar_contrato(contrato_id: int, contrato: ContratoUpdate, empresa_id: int = Query(1)):
    contrato_atualizado = await contrato_service.atualizar_contrato(contrato_id, contrato, empresa_id)
    if not contrato_atualizado:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    return contrato_atualizado


@router.delete("/{contrato_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_contrato(contrato_id: int, empresa_id: int = Query(1)):
    sucesso = await contrato_service.deletar_contrato(contrato_id, empresa_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")


@router.post("/{contrato_id}/upload")
async def upload_arquivo(
    contrato_id: int,
    arquivo: UploadFile = File(...),
    empresa_id: int = Query(1)
):
    from api.database import get_db
    
    contrato = await contrato_service.buscar_contrato(contrato_id, empresa_id)
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    
    if arquivo.size and arquivo.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Arquivo muito grande. Máximo 10MB")
    
    allowed_types = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if arquivo.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de arquivo não permitido")
    
    db = get_db()
    
    file_ext = arquivo.filename.split(".")[-1] if "." in arquivo.filename else "pdf"
    file_name = f"contrato_{contrato_id}_{int(date.today().strftime('%Y%m%d'))}.{file_ext}"
    
    content = await arquivo.read()
    
    try:
        response = db.storage.from_("contratos").upload(
            file_name,
            content,
            {"content-type": arquivo.content_type}
        )
        
        if response.error:
            raise Exception(response.error.message)
        
        public_url = db.storage.from_("contratos").get_public_url(file_name)
        
        await contrato_service.atualizar_contrato(contrato_id, {"arquivo_url": public_url}, empresa_id)
        
        return {"url": public_url, "filename": file_name}
        
    except Exception as e:
        print(f"[ERROR] Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload: {str(e)}")


@router.get("/vencer/{dias}")
async def contratos_vencer(dias: int = 30, empresa_id: int = Query(1)):
    return await contrato_service.contratos_vencem_em(dias, empresa_id)


@router.get("/expirados/")
async def contratos_expirados(empresa_id: int = Query(1)):
    return await contrato_service.contratos_expirados(empresa_id)

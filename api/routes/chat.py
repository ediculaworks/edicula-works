from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import httpx

router = APIRouter()

AGENT_SYSTEM_PROMPTS = {
    "chief": """Você é o Chief Agent da EdiculaWorks, um assistente de gestão estratégica.
    Você ajuda com planejamento estratégico, objetivos de negócio, métricas e decisões de alto nível.
    Seja objetivo, prático e focado em resultados de negócio.""",
    
    "tech": """Você é o Tech Lead da EdiculaWorks, um assistente técnico especializado.
    Você ajuda com decisões técnicas, arquitetura de software, código, reviews e melhores práticas de desenvolvimento.
    Seja técnico, preciso e orientado a soluções.""",
    
    "gestao": """Você é o Agent de Gestão da EdiculaWorks.
    Você ajuda com gerenciamento de projetos, tarefas, sprints e coordenação de equipe.
    Seja organizado, prático e focado em execução.""",
    
    "financeiro": """Você é o Agent Financeiro da EdiculaWorks.
    Você ajuda com controle financeiro, orçamentos, contratos e análise de custos.
    Seja detalhista, preciso e focado em números.""",
    
    "security": """Você é o Security Agent da EdiculaWorks.
    Você ajuda com segurança, compliance, LGPD e práticas seguras de desenvolvimento.
    Seja cauteloso, detalhista e priorize a segurança.""",
    
    "ops": """Você é o Ops Agent da EdiculaWorks.
    Você ajuda com infraestrutura, DevOps, deployment e monitoramento.
    Seja prático, eficiente e focado em operações."""
}


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    agente: str
    mensagem: str
    historico: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    resposta: str
    agente: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Endpoint para chat com agentes IA via OpenRouter"""
    
    if request.agente not in AGENT_SYSTEM_PROMPTS:
        raise HTTPException(status_code=400, detail="Agente inválido")
    
    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    if not openrouter_api_key:
        raise HTTPException(status_code=500, detail="OpenRouter API key não configurada")
    
    system_prompt = AGENT_SYSTEM_PROMPTS[request.agente]
    
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    for msg in request.historico:
        messages.append({"role": msg.role, "content": msg.content})
    
    messages.append({"role": "user", "content": request.mensagem})
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openrouter_api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://edihub.work.gd",
                    "X-Title": "EdiculaWorks"
                },
                json={
                    "model": "openrouter/auto",
                    "messages": messages,
                    "max_tokens": 2048
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Erro na API: {response.text}")
            
            data = response.json()
            resposta = data["choices"][0]["message"]["content"]
            
            return ChatResponse(resposta=resposta, agente=request.agente)
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Timeout na requisição")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")


@router.get("/agentes")
async def list_agentes():
    """Lista agentes disponíveis"""
    return [
        {"id": "chief", "nome": "Chief", "descricao": "Coordenador geral", "cor": "#22c55e"},
        {"id": "tech", "nome": "Tech Lead", "descricao": "Desenvolvimento e código", "cor": "#3b82f6"},
        {"id": "gestao", "nome": "Gestão", "descricao": "Tarefas e projetos", "cor": "#f59e0b"},
        {"id": "financeiro", "nome": "Financeiro", "descricao": "Finanças e contratos", "cor": "#8b5cf6"},
        {"id": "security", "nome": "Security", "descricao": "Segurança", "cor": "#ef4444"},
        {"id": "ops", "nome": "Ops", "descricao": "Infraestrutura", "cor": "#06b6d4"},
    ]

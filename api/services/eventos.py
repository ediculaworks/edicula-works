from typing import List, Optional, Dict, Any
from datetime import datetime, date, time
from api.database import get_db


class EventoService:
    @staticmethod
    def _parse_date(value: Any) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, date):
            return value.isoformat()
        return str(value)
    
    @staticmethod
    def _parse_time(value: Any) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, time):
            return value.isoformat()
        return str(value)

    @staticmethod
    def listar(
        empresa_id: int = 1,
        tipo: Optional[str] = None,
        data_inicio: Optional[str] = None,
        data_fim: Optional[str] = None,
        membro_id: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        db = get_db()
        
        query = db.table("eventos").select("*").eq("empresa_id", empresa_id)
        
        if tipo:
            query = query.eq("tipo", tipo)
        if data_inicio:
            query = query.gte("data_inicio", data_inicio)
        if data_fim:
            query = query.lte("data_inicio", data_fim)
        
        query = query.order("data_inicio", desc=False).order("hora_inicio", desc=False)
        query = query.range(offset, offset + limit - 1)
        
        result = query.execute()
        eventos = result.data or []
        
        # Buscar participantes para cada evento
        for evento in eventos:
            participantes = db.table("evento_participantes").select("*").eq("evento_id", evento["id"]).execute()
            evento["participantes"] = participantes.data or []
        
        # Filtrar por membro se necessário
        if membro_id:
            eventos = [
                e for e in eventos 
                if any(p.get("membro_id") == membro_id for p in e.get("participantes", []))
            ]
        
        return eventos

    @staticmethod
    def buscar(evento_id: str, empresa_id: int = 1) -> Optional[Dict[str, Any]]:
        db = get_db()
        
        result = db.table("eventos").select("*").eq("id", evento_id).eq("empresa_id", empresa_id).execute()
        
        if not result.data:
            return None
        
        evento = result.data[0]
        
        participantes = db.table("evento_participantes").select("*").eq("evento_id", evento_id).execute()
        evento["participantes"] = participantes.data or []
        
        return evento

    @staticmethod
    def criar(data: Dict[str, Any]) -> Dict[str, Any]:
        db = get_db()
        
        # Converter datas e times para string
        evento_data = {
            "empresa_id": data.get("empresa_id", 1),
            "titulo": data.get("titulo"),
            "descricao": data.get("descricao"),
            "tipo": data.get("tipo", "evento"),
            "data_inicio": EventoService._parse_date(data.get("data_inicio")),
            "data_fim": EventoService._parse_date(data.get("data_fim")),
            "hora_inicio": EventoService._parse_time(data.get("hora_inicio")),
            "hora_fim": EventoService._parse_time(data.get("hora_fim")),
            "local": data.get("local"),
            "link_reuniao": data.get("link_reuniao"),
            "recorrencia": data.get("recorrencia"),
            "fim_recorrencia": EventoService._parse_date(data.get("fim_recorrencia")),
            "dia_semana_recorrencia": data.get("dia_semana_recorrencia"),
            "cor": data.get("cor", "#3b82f6"),
            "tarefa_id": data.get("tarefa_id"),
            "criado_por": data.get("criado_por"),
        }
        
        result = db.table("eventos").insert(evento_data).execute()
        
        if not result.data:
            return None
        
        evento = result.data[0]
        
        # Adicionar participantes
        participantes = data.get("participantes", [])
        for membro_id in participantes:
            db.table("evento_participantes").insert({
                "evento_id": evento["id"],
                "membro_id": membro_id,
                "status": "confirmado"
            }).execute()
        
        # Buscar participantes criados
        participantes_db = db.table("evento_participantes").select("*").eq("evento_id", evento["id"]).execute()
        evento["participantes"] = participantes_db.data or []
        
        return evento

    @staticmethod
    def atualizar(evento_id: str, data: Dict[str, Any], empresa_id: int = 1) -> Optional[Dict[str, Any]]:
        db = get_db()
        
        # Converter datas e times para string
        evento_data = {}
        for key in ["titulo", "descricao", "tipo", "local", "link_reuniao", "recorrencia", "cor", "tarefa_id", "dia_semana_recorrencia"]:
            if key in data and data[key] is not None:
                evento_data[key] = data[key]
        
        if "data_inicio" in data:
            evento_data["data_inicio"] = EventoService._parse_date(data.get("data_inicio"))
        if "data_fim" in data:
            evento_data["data_fim"] = EventoService._parse_date(data.get("data_fim"))
        if "hora_inicio" in data:
            evento_data["hora_inicio"] = EventoService._parse_time(data.get("hora_inicio"))
        if "hora_fim" in data:
            evento_data["hora_fim"] = EventoService._parse_time(data.get("hora_fim"))
        if "fim_recorrencia" in data:
            evento_data["fim_recorrencia"] = EventoService._parse_date(data.get("fim_recorrencia"))
        
        if evento_data:
            evento_data["updated_at"] = datetime.utcnow().isoformat()
            db.table("eventos").update(evento_data).eq("id", evento_id).eq("empresa_id", empresa_id).execute()
        
        return EventoService.buscar(evento_id, empresa_id)

    @staticmethod
    def deletar(evento_id: str, empresa_id: int = 1) -> bool:
        db = get_db()
        
        # Participantes são deletados automaticamente por CASCADE
        
        result = db.table("eventos").delete().eq("id", evento_id).eq("empresa_id", empresa_id).execute()
        
        return len(result.data) > 0 if result.data else False

    @staticmethod
    def eventos_do_dia(data: str, empresa_id: int = 1) -> List[Dict[str, Any]]:
        return EventoService.listar(empresa_id=empresa_id, data_inicio=data, data_fim=data)

    @staticmethod
    def timeline(inicio: str, fim: str, empresa_id: int = 1, membro_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return EventoService.listar(
            empresa_id=empresa_id,
            data_inicio=inicio,
            data_fim=fim,
            membro_id=membro_id
        )

    @staticmethod
    def adicionar_participante(evento_id: str, membro_id: str, status: str = "confirmado") -> Dict[str, Any]:
        db = get_db()
        
        # Verificar se já existe
        existing = db.table("evento_participantes").select("*").eq("evento_id", evento_id).eq("membro_id", membro_id).execute()
        if existing.data:
            return existing.data[0]
        
        result = db.table("evento_participantes").insert({
            "evento_id": evento_id,
            "membro_id": membro_id,
            "status": status
        }).execute()
        
        return result.data[0] if result.data else {}

    @staticmethod
    def remover_participante(evento_id: str, membro_id: str) -> bool:
        db = get_db()
        
        result = db.table("evento_participantes").delete().eq("evento_id", evento_id).eq("membro_id", membro_id).execute()
        
        return len(result.data) > 0 if result.data else False

from typing import Optional, List, Dict, Any
from api.database import get_db


class SprintService:
    @staticmethod
    def create(data: Dict[str, Any]) -> Dict[str, Any]:
        db = get_db()
        result = db.table("sprints").insert(data).execute()
        if result.data:
            return result.data[0]
        return {}
    
    @staticmethod
    def get_by_id(sprint_id: int) -> Optional[Dict[str, Any]]:
        db = get_db()
        result = db.table("sprints").select("*").eq("id", sprint_id).execute()
        if result.data:
            return result.data[0]
        return None
    
    @staticmethod
    def list(empresa_id: int = 1, projeto_id: Optional[int] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        db = get_db()
        query = db.table("sprints").select("*").eq("empresa_id", empresa_id)
        if projeto_id is not None:
            query = query.eq("projeto_id", projeto_id)
        if status is not None:
            query = query.eq("status", status)
        result = query.order("ordem").execute()
        return result.data or []
    
    @staticmethod
    def get_active(empresa_id: int = 1) -> Optional[Dict[str, Any]]:
        db = get_db()
        result = db.table("sprints").select("*").eq("empresa_id", empresa_id).eq("status", "ativa").execute()
        if result.data:
            return result.data[0]
        return None
    
    @staticmethod
    def update(sprint_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        db = get_db()
        result = db.table("sprints").update(data).eq("id", sprint_id).execute()
        if result.data:
            return result.data[0]
        return None
    
    @staticmethod
    def delete(sprint_id: int) -> bool:
        db = get_db()
        result = db.table("sprints").delete().eq("id", sprint_id).execute()
        return len(result.data) > 0 if result.data else False
    
    @staticmethod
    def update_pontos(sprint_id: int) -> None:
        from api.services.tarefas import TarefaService
        db = get_db()
        tarefas = TarefaService.list(empresa_id=1, sprint_id=sprint_id, coluna="done")
        pontos = sum(t.get("estimativa_pontos", 0) or 0 for t in tarefas)
        db.table("sprints").update({"pontos_concluidos": pontos}).eq("id", sprint_id).execute()
    
    @staticmethod
    def move_incomplete_to_next(sprint_id: int) -> Optional[Dict[str, Any]]:
        db = get_db()
        
        sprint = SprintService.get_by_id(sprint_id)
        if not sprint:
            return None
        
        projeto_id = sprint.get("projeto_id")
        
        next_sprint = db.table("sprints").select("*").eq("empresa_id", sprint["empresa_id"]).eq("status", "planejada")
        
        if projeto_id:
            next_sprint = next_sprint.eq("projeto_id", projeto_id)
        
        next_sprint = next_sprint.gt("ordem", sprint.get("ordem", 0)).order("ordem").limit(1).execute()
        
        if not next_sprint.data:
            return None
        
        next_sprint_data = next_sprint.data[0]
        
        tarefas_incompletas = db.table("tarefas").select("*").eq("sprint_id", sprint_id).execute()
        
        for tarefa in tarefas_incompletas.data:
            if tarefa.get("coluna") != "done":
                db.table("tarefas").update({"sprint_id": next_sprint_data["id"]}).eq("id", tarefa["id"]).execute()
        
        return next_sprint_data

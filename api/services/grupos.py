from typing import Optional, List, Dict, Any
from api.database import supabase


class GrupoService:
    @staticmethod
    def create(data: Dict[str, Any]) -> Dict[str, Any]:
        result = supabase.table("grupos").insert(data).execute()
        if result.data:
            return result.data[0]
        return {}
    
    @staticmethod
    def get_by_id(grupo_id: int) -> Optional[Dict[str, Any]]:
        result = supabase.table("grupos").select("*").eq("id", grupo_id).execute()
        if result.data:
            return result.data[0]
        return None
    
    @staticmethod
    def list(empresa_id: int = 1, ativo: Optional[bool] = None) -> List[Dict[str, Any]]:
        query = supabase.table("grupos").select("*").eq("empresa_id", empresa_id)
        if ativo is not None:
            query = query.eq("ativo", ativo)
        result = query.order("ordem").execute()
        return result.data or []
    
    @staticmethod
    def update(grupo_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        result = supabase.table("grupos").update(data).eq("id", grupo_id).execute()
        if result.data:
            return result.data[0]
        return None
    
    @staticmethod
    def delete(grupo_id: int) -> bool:
        result = supabase.table("grupos").delete().eq("id", grupo_id).execute()
        return len(result.data) > 0 if result.data else False

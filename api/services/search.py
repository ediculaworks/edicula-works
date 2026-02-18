from typing import List, Dict, Any, Optional

from api.services import tarefas, contratos


PRIORITY_BOOST = {
    "urgente": 0.20,
    "alta": 0.15,
    "media": 0.10,
    "baixa": 0.05
}


async def buscar(
    query: str,
    tipo: str = "all",
    limite: int = 10,
    threshold: float = 0.7,
    projeto: Optional[str] = None,
    coluna: Optional[str] = None
) -> Dict[str, Any]:
    results = []
    
    if tipo in ("all", "tarefas"):
        tarefas_results = await buscar_tarefas(query, limite, threshold, projeto, coluna)
        results.extend(tarefas_results)
    
    if tipo in ("all", "contratos"):
        contratos_results = await buscar_contratos(query, limite, threshold)
        results.extend(contratos_results)
    
    results.sort(key=lambda x: x.get("similaridade", 0), reverse=True)
    
    return {
        "success": True,
        "results": results[:limite],
        "metadata": {
            "query": query,
            "total": len(results),
            "threshold_usado": threshold
        }
    }


async def buscar_tarefas(
    query: str,
    limite: int = 10,
    threshold: float = 0.7,
    projeto: Optional[str] = None,
    coluna: Optional[str] = None
) -> List[Dict[str, Any]]:
    tarefas_list = await tarefas.listar_tarefas()
    
    results = []
    for tarefa in tarefas_list:
        text = f"{tarefa.get('titulo', '')} {tarefa.get('descricao', '')}"
        
        similarity = calcular_similaridade(query, text)
        
        boost_projeto = 0.20 if projeto and tarefa.get("projeto") == projeto else 0
        boost_prioridade = PRIORITY_BOOST.get(tarefa.get("prioridade", ""), 0)
        
        similaridade_final = (similarity * 0.60) + (boost_projeto * 0.20) + (boost_prioridade * 0.20)
        
        if similaridade_final >= threshold:
            if coluna and tarefa.get("coluna") != coluna:
                continue
            results.append({
                "id": tarefa["id"],
                "tipo": "tarefa",
                "titulo": tarefa["titulo"],
                "descricao": tarefa.get("descricao"),
                "coluna": tarefa.get("coluna"),
                "prioridade": tarefa.get("prioridade"),
                "projeto": tarefa.get("projeto"),
                "similaridade": round(similaridade_final, 3)
            })
    
    return results[:limite]


async def buscar_contratos(
    query: str,
    limite: int = 10,
    threshold: float = 0.7
) -> List[Dict[str, Any]]:
    contratos_list = await contratos.listar_contratos()
    
    results = []
    for contrato in contratos_list:
        text = f"{contrato.get('titulo', '')} {contrato.get('descricao', '')}"
        
        similarity = calcular_similaridade(query, text)
        
        if similarity >= threshold:
            results.append({
                "id": contrato["id"],
                "tipo": "contrato",
                "titulo": contrato["titulo"],
                "tipo_contrato": contrato.get("tipo"),
                "contratante": contrato.get("contratante"),
                "status": contrato.get("status"),
                "similaridade": round(similarity, 3)
            })
    
    return results[:limite]


def calcular_similaridade(query: str, texto: str) -> float:
    query_words = set(query.lower().split())
    texto_words = set(texto.lower().split())
    
    if not query_words or not texto_words:
        return 0.0
    
    intersection = query_words.intersection(texto_words)
    union = query_words.union(texto_words)
    
    jaccard = len(intersection) / len(union) if union else 0
    
    return min(jaccard * 1.5, 1.0)

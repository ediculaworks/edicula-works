# Arquitetura de Comunicação entre Agentes

## Visão Geral

Sistema de comunicação entre agentes baseado em message queue e API calls.

---

## Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUÁRIO                                     │
│                    (Chat Interface)                                │
└──────────────────────────────┬────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SECRETARY AGENT                                 │
│              (Classificador/Roteador)                             │
│                                                                       │
│   1. Recebe mensagem                                              │
│   2. Classifica intent                                           │
│   3. Roteia para agente correto                                   │
└──────────────────────────────┬────────────────────────────────────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                    ▼          ▼          ▼
            ┌──────────┐ ┌──────────┐ ┌──────────┐
            │  CHIEF   │ │  LEAD    │ │  LEAD    │
            │  AGENT   │ │  AGENTS  │ │  AGENTS  │
            └────┬─────┘ └────┬─────┘ └────┬─────┘
                 │            │            │
                 │    ┌───────┴───────┐   │
                 │    │               │   │
                 ▼    ▼               ▼   ▼
          ┌──────────────────────────────────────────┐
          │            MESSAGE QUEUE                 │
          │     (Redis ou PostgreSQL)                │
          └──────────────────────────────────────────┘
                           │
                           ▼
          ┌──────────────────────────────────────────┐
          │              DATABASE                     │
          │         (PostgreSQL + pgVector)         │
          └──────────────────────────────────────────┘
```

---

## Fluxo de Comunicação

### 1. Mensagem Recebida

```
Usuário envia mensagem
         │
         ▼
Secretary Agent classifica
         │
         ├─→ "criar tarefa"     → Gestao Lead
         ├─→ "quanto gastei"    → Financeiro Lead
         ├─→ "bug no código"    → Tech Lead
         ├─→ "verificar acesso" → Security Lead
         └─→ "várias coisas"    → Chief Orchestrator
```

### 2. Processamento

```
Agente recebe task
         │
         ▼
Executa (Tools + Skills)
         │
         ▼
Retorna resultado
         │
         ▼
Secretary compila resposta
         │
         ▼
Retorna ao usuário
```

---

## Message Queue

### Formato de Mensagem

```json
{
  "message_id": "msg_123",
  "timestamp": "2026-02-18T19:00:00Z",
  "from": "secretary",
  "to": "gestao_lead",
  "type": "task",
  "payload": {
    "intent": "criar_tarefa",
    "content": "Crie uma tarefa para revisar o contrato",
    "context": {
      "user_id": 1,
      "session_id": "sess_abc"
    },
    "metadata": {
      "priority": "normal",
      "language": "pt-BR"
    }
  }
}
```

### Tipos de Mensagem

| Tipo | Descrição |
|------|-----------|
| `task` | Tarefa a ser executada |
| `result` | Resultado de tarefa |
| `error` | Erro occurred |
| `clarification` | Precisa de mais info |
| `handoff` | Transferência entre agentes |

### Filas

```
edicula.messages.incoming     → Novas mensagens
edicula.messages.gestao      → Tasks para Gestao
edicula.messages.tech        → Tasks para Tech
edicula.messages.financeiro  → Tasks para Financeiro
edicula.messages.security    → Tasks para Security
edicula.messages.ops         → Tasks para Ops
edicula.messages.outgoing    → Respostas ao usuário
```

---

## Implementação

### 1. Redis (Recomendado para produção)

```python
# publisher.py
import redis
import json

r = redis.Redis(host='localhost', port=6379)

def publish_message(queue: str, message: dict):
    r.publish(queue, json.dumps(message))

# Exemplo
publish_message('edicula.messages.gestao', {
    'type': 'task',
    'payload': {'action': 'criar_tarefa', 'data': {...}}
})
```

```python
# subscriber.py
import redis
import json

r = redis.Redis(host='localhost', port=6379)
p = r.pubsub()

p.subscribe('edicula.messages.gestao')

for message in p.listen():
    if message['type'] == 'message':
        data = json.loads(message['data'])
        process_task(data)
```

### 2. PostgreSQL (Alternativa simples)

```python
# Usar tabela de messages
CREATE TABLE agent_messages (
    id SERIAL PRIMARY KEY,
    queue VARCHAR(50),
    payload JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);
```

---

## Tool de Comunicação

Cada agente teria tools para chamar outros agentes:

```python
# Tool: delegate
def delegate(agent: str, task: dict):
    """
    Encaminhar tarefa para outro agente
    
    Args:
        agent: 'tech', 'gestao', 'financeiro', 'security', 'ops'
        task: {'intent': '...', 'content': '...'}
    """
    publish_message(f'edicula.messages.{agent}', {
        'type': 'task',
        'from': current_agent,
        'payload': task
    })
    return {'status': 'queued', 'agent': agent}
```

---

## Exemplo de Fluxo

### Usuário: "Crie uma tarefa urgente"

```
1. Secretary recebe
   └── Intent: "criar_tarefa"
   └── Prioridade: "urgente"

2. Secretary → Gestao Lead
   └── Fila: edicula.messages.gestao
   └── Payload: {intent: "criar_tarefa", priority: "urgente", ...}

3. Gestao Lead processa
   └── criar_tarefa(prioridade="urgente")
   └── Salvar no banco
   └── Gerar embedding

4. Gestao Lead → Secretary
   └── Resultado: {success: true, tarefa_id: 123}

5. Secretary → Usuário
   └── "Tarefa criada com sucesso! ID: 123"
```

---

## Session por Agente

No OpenClaw, cada sessão teria seu contexto:

```python
# Sessão Chief
session_chief = {
    "agent": "chief",
    "system_prompt": ChiefAgent.prompt,
    "tools": ["delegate", "search", "analytics"]
}

# Sessão Tech Lead
session_tech = {
    "agent": "tech_lead", 
    "system_prompt": TechLead.prompt,
    "tools": ["bash", "read", "write", "docker", "db_query"]
}

# Sessão Gestao
session_gestao = {
    "agent": "gestao_lead",
    "system_prompt": GestaoLead.prompt,
    "tools": ["create_task", "list_tasks", "search_similar"]
}
```

---

## Configuração

```python
# config/agents.py
AGENTS = {
    "secretary": {
        "prompt_file": "agents/SECRETARY.md",
        "queue": "edicula.messages.incoming",
        "tools": ["classify", "route", "delegate"]
    },
    "chief": {
        "prompt_file": "agents/CHIEF.md",
        "queue": "edicula.messages.chief",
        "tools": ["delegate", "search", "analytics"]
    },
    "gestao": {
        "prompt_file": "agents/GESTAO_LEAD.md",
        "queue": "edicula.messages.gestao",
        "tools": ["create_task", "update_task", "search_similar"]
    },
    # ... outros agentes
}

COMMUNICATION = {
    "redis": {
        "host": "localhost",
        "port": 6379
    },
    "timeout": 30,  # segundos
    "retry": 3
}
```

# ÍNDICE - EdiculaWorks Platform

## Visão Geral

Este documento serve como índice para toda a documentação da plataforma EdiculaWorks.

---

## 📁 Estrutura de Diretórios

```
EdiculaWorks/
│
├── docs/                         # Documentação
│   └── platform/
│       ├── ARQUITETURA.md      # Arquitetura geral
│       ├── DATABASE.md         # Schema PostgreSQL + pgVector
│       ├── COMUNICACAO.md     # Comunicação entre agentes
│       └── CORRECOES.md       # Correções e ajustes
│
├── agents/                       # Agentes IA
│   ├── CHIEF.md                # Líder geral
│   ├── SECRETARY.md           # Classificador/Roteador
│   ├── TECH_LEAD.md           # Tech
│   ├── OPS_LEAD.md            # Operações
│   ├── SECURITY_LEAD.md        # Segurança
│   ├── GESTAO_LEAD.md         # Gestão tarefas/projetos
│   └── FINANCEIRO_LEAD.md     # Financeiro/Contratos
│
├── skills-platform/             # Skills específicas
│   ├── kanban-manager/         # Gerenciar tarefas
│   ├── task-creator/          # Criar tarefas
│   ├── search-similar/        # Busca semântica
│   ├── contract-manager/      # Gerenciar contratos
│   └── financial-analyst/     # Análise financeira
│
├── tools-platform/             # Tools
│   ├── database/              # Tools de banco
│   └── notifications/         # Notificações
│
└── scripts/
    └── migration/
        └── migrate.py          # Script de migração TXT→DB
```

---

## 📋 Guias por Área

### 🚀 Começar

| Documento | Descrição |
|-----------|-----------|
| [ARQUITETURA.md](docs/platform/ARQUITETURA.md) | Visão geral da arquitetura |
| [DATABASE.md](docs/platform/DATABASE.md) | Schema do banco de dados |

### 🤖 Agentes

| Agent | Função |
|-------|--------|
| [SECRETARY.md](agents/SECRETARY.md) | Classifica e roteia mensagens |
| [CHIEF.md](agents/CHIEF.md) | Coordenador geral |
| [GESTAO_LEAD.md](agents/GESTAO_LEAD.md) | Tarefas e projetos |
| [TECH_LEAD.md](agents/TECH_LEAD.md) | Código e infra |
| [FINANCEIRO_LEAD.md](agents/FINANCEIRO_LEAD.md) | Custos e contratos |
| [SECURITY_LEAD.md](agents/SECURITY_LEAD.md) | Segurança |
| [OPS_LEAD.md](agents/OPS_LEAD.md) | Monitoramento e backup |

### ⚙️ Skills

| Skill | Descrição |
|-------|-----------|
| [kanban-manager](skills-platform/kanban-manager/SKILL.md) | CRUD de tarefas |
| [task-creator](skills-platform/task-creator/SKILL.md) | Criar tarefas com validação |
| [search-similar](skills-platform/search-similar/SKILL.md) | Busca semântica |
| [contract-manager](skills-platform/contract-manager/SKILL.md) | Gerenciar contratos |
| [financial-analyst](skills-platform/financial-analyst/SKILL.md) | Análise financeira |

### 🛠️ Utilities

| Documento | Descrição |
|-----------|-----------|
| [COMUNICACAO.md](docs/platform/COMUNICACAO.md) | Como agentes se comunicam |
| [migrate.py](scripts/migration/migrate.py) | Script de migração |

---

## 🔗 Fluxo de Dados

```
Usuário
    │
    ▼
SECRETARY (classifica intent)
    │
    ├─→ Gestao Lead ──→ kanban-manager ──→ DATABASE
    ├─→ Financeiro Lead ──→ financial-analyst ──→ DATABASE
    ├─→ Tech Lead ──→ código/infra ──→ DATABASE
    ├─→ Security Lead ──→ audit ──→ DATABASE
    └─→ Ops Lead ──→ monitoramento ──→ DATABASE
```

---

## 📊 Busca Semântica

### Fórmula de Similaridade

```
similaridade_final = 
    (vetorial * 0.60) +   # Embedding
    (projeto * 0.20) +     # Mesmo projeto
    (prioridade * 0.20)    # Urgente > Alta > Média
```

### Threshold

- **0.8**: Ideal (alta precisão)
- **0.7**: Mínimo (mais resultados)

### Prioridades

| Prioridade | Peso |
|-----------|------|
| urgente | 0.20 |
| alta | 0.15 |
| media | 0.10 |
| baixa | 0.05 |

---

## 🗂️ Tabelas do Banco

| Tabela | Descrição |
|--------|-----------|
| `empresas` | Empresas (multi-tenant) |
| `usuarios` | Usuários |
| `projetos` | Projetos |
| `tarefas` | Tarefas Kanban + embedding |
| `contratos` | Contratos + embedding |
| `documentos` | Documentos + embedding |
| `transacoes` | Transações financeiras |
| `atividade_logs` | Logs de atividade |

---

## 📝 Padrões

### Colunas Kanban

- `todo` - A Fazer
- `in_progress` - Em Andamento
- `review` - Em Revisão
- `done` - Concluída

### Status de Contrato

- `draft` - Rascunho
- `active` - Ativo
- `expired` - Expirado
- `terminated` - Encerrado

---

## 🚀 Próximos Passos

1. Executar script de migração
2. Configurar Message Queue (Redis)
3. Implementar Secretary Agent
4. Implementar demais agentes
5. Deploy

---

## ❓ Perguntas Frequentes

**P**: Como adicionar novo agente?
**R**: Criar arquivo em `agents/` e adicionar em `config/agents.py`

**P**: Como adicionar nova skill?
**R**: Criar pasta em `skills-platform/` com `SKILL.md`

**P**: Como a busca semântica funciona?
**R**: Veja [search-similar](skills-platform/search-similar/SKILL.md)

# Blueprint Completo - EdiculaWorks Platform

> **Última atualização**: 2026-02-18
> **Versão**: 2.0

---

## 1. Visão Geral do Sistema

### 1.1 O que é

A **EdiculaWorks Platform** é um sistema de gestão empresarial inteligente com:
- Kanban para tarefas
- Controle financeiro
- Gerenciamento de contratos
- Busca semântica por IA
- Múltiplos agentes especializados
- API interna (FastAPI)
- Banco de dados Supabase (PostgreSQL + pgVector)

### 1.2 Componentes Principais

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EDICULA WORKS PLATFORM                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│   │   FRONTEND   │   │   BACKEND    │   │    IA        │         │
│   │  (Next.js)   │◄──│  (FastAPI)   │◄──│  (OpenClaw)  │         │
│   └──────────────┘   └──────┬───────┘   └──────────────┘         │
│                              │                                      │
│                     ┌────────┴────────┐                            │
│                     │   DATABASE     │                            │
│                     │  (Supabase)    │                            │
│                     │ pgVector + RLS│                            │
│                     └────────────────┘                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 Infraestrutura (VPS)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VPS UBUNTU 22.04                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│   │   DOCKER     │   │    NGINX     │   │  TAILSCALE   │         │
│   │  (OpenClaw) │   │  (Reverse)   │   │    (VPN)     │         │
│   └──────────────┘   └──────────────┘   └──────────────┘         │
│                                                                      │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│   │    UFW       │   │  FAIL2BAN    │   │  BACKUP      │         │
│   │  (Firewall)  │   │ (Brute-force)│   │(GPG + rclone)│         │
│   └──────────────┘   └──────────────┘   └──────────────┘         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Arquitetura de Agentes

### 2.1 Hierarquia

```
                         ┌──────────────────┐
                         │   SECRETARY      │  ← Primeiro contato
                         │   (Roteador)     │
                         └────────┬─────────┘
                                  │
                         ┌────────▼─────────┐
                         │      CHIEF       │  ← Coordenador geral
                         │    (Líder)       │
                         └────────┬─────────┘
                                  │
        ┌─────────────┬──────────┼──────────┬─────────────┐
        │             │          │          │             │
   ┌────▼────┐  ┌────▼────┐ ┌──▼────┐ ┌──▼─────┐ ┌──▼──────┐
   │  TECH   │  │  OPS    │ │SECURITY│ │ GESTAO │ │FINANCEIRO│
   │  LEAD   │  │  LEAD   │ │  LEAD │ │  LEAD  │ │  LEAD   │
   └─────────┘  └─────────┘ └────────┘ └─────────┘ └──────────┘
```

### 2.2 Função de Cada Agente

| Agente | Função | Especialidades |
|--------|--------|---------------|
| **Secretary** | Classificar intents e rotear | classify, route, delegate |
| **Chief** | Coordenação geral | delegate, search, analytics |
| **Tech Lead** | Código e infraestrutura | bash, docker, nginx, scripts |
| **Ops Lead** | Monitoramento e backup | health checks, manutenção |
| **Security Lead** | Segurança e auditoria | firewall, fail2ban, audit |
| **Gestao Lead** | Tarefas e projetos | kanban, tasks, OKRs |
| **Financeiro Lead** | Custos e contratos | financial, contracts |

### 2.3 Sessions no OpenClaw

Cada agente seria uma **sessão separada** no OpenClaw:

```
Sessions disponíveis:
├── chief@edicula     - Conversa geral (principal)
├── tech@edicula     - Questões técnicas
├── gestao@edicula   - Tarefas e projetos
├── financeiro@edicula - Custos e contratos
├── security@edicula  - Segurança
└── ops@edicula      - Operações
```

---

## 3. Comunicação entre Agentes

### 3.1 Fluxo de Mensagens

```
Usuário envia mensagem
         │
         ▼
┌─────────────────────┐
│    SECRETARY        │ ◄─── Classifica intent
│  (Classificador)    │
└─────────┬───────────┘
          │
          ├──────► Tech Lead      (se código/infra)
          ├──────► Ops Lead        (se monitoramento/backup)
          ├──────► Security Lead  (se segurança)
          ├──────► Gestao Lead    (se tarefas/projetos)
          ├──────► Financeiro Lead (se custos/contratos)
          └──────► Chief          (se múltiplas áreas)
```

### 3.2 Sistema de Filas (Message Queue)

```
edicula.messages.incoming    → Novas mensagens
edicula.messages.chief       → Tasks do Chief
edicula.messages.tech        → Tasks do Tech
edicula.messages.gestao     → Tasks do Gestao
edicula.messages.financeiro → Tasks do Financeiro
edicula.messages.security   → Tasks do Security
edicula.messages.ops        → Tasks do Ops
edicula.messages.outgoing   → Respostas
```

### 3.3 Formato de Mensagem

```json
{
  "message_id": "msg_abc123",
  "timestamp": "2026-02-18T19:00:00Z",
  "from": "secretary",
  "to": "gestao_lead",
  "type": "task",
  "payload": {
    "intent": "criar_tarefa",
    "content": "Crie uma tarefa urgente",
    "entities": {
      "prioridade": "urgente"
    },
    "context": {
      "user_id": 1,
      "session_id": "sess_123"
    }
  }
}
```

---

## 4. Busca Semântica (pgVector)

### 4.1 Como Funciona

Cada tarefa, contrato e documento tem um **embedding** (vetor de 1536 dimensões) gerado por IA.

Quando você busca por "problema com pagamento", o sistema:
1. Converte o texto em embedding
2. Compara com todos os embeddings do banco
3. Retorna os mais similares

### 4.2 Fórmula de Similaridade

```
similaridade_final = 
    (similaridade_vetorial × 0.60) +   ← Conteúdo semântico
    (boost_projeto × 0.20) +          ← Mesmo projeto
    (boost_prioridade × 0.20)          ← Urgente > Alta > Média
```

### 4.3 Pesos de Prioridade

| Prioridade | Peso |
|------------|------|
| urgente | 0.20 |
| alta | 0.15 |
| media | 0.10 |
| baixa | 0.05 |

### 4.4 Threshold

- **0.8**: Ideal (alta precisão)
- **0.7**: Mínimo (mais resultados)

---

## 5. Banco de Dados

### 5.1 Tabelas Principais

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   empresas   │     │   usuarios    │     │   projetos   │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id            │     │ id           │
│ nome         │     │ empresa_id    │     │ empresa_id   │
│ cnpj         │     │ nome         │     │ nome         │
│ email        │     │ email        │     │ descricao    │
└──────────────┘     │ cargo         │     │ cliente      │
                     │ role          │     │ status       │
                     └───────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   tarefas    │     │  contratos   │     │transacoes   │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ empresa_id   │     │ empresa_id   │     │ empresa_id   │
│ projeto_id   │     │ titulo       │     │ tipo         │
│ titulo       │     │ conteudo     │     │ categoria    │
│ descricao    │     │ tipo         │     │ valor        │
│ coluna       │     │ contratante  │     │ data_trans  │
│ prioridade   │     │ valor        │     │ status       │
│ embedding⚡  │     │ embedding⚡   │     └──────────────┘
│ assigned_to │     │ status       │
│ prazo       │     │ data_fim     │
└──────────────┘     └──────────────┘

⚡ = campo vector(1536) para busca semântica
```

### 5.2 Colunas do Kanban

| Coluna | Descrição |
|--------|-----------|
| `todo` | A Fazer |
| `in_progress` | Em Andamento |
| `review` | Em Revisão |
| `done` | Concluída |

### 5.3 Status de Contrato

| Status | Descrição |
|--------|-----------|
| `draft` | Rascunho |
| `active` | Ativo |
| `expired` | Expirado |
| `terminated` | Encerrado |

---

## 6. Skills Disponíveis por Agente

### 6.1 Gestao Lead

| Skill | Função |
|-------|--------|
| `kanban-manager` | CRUD de tarefas |
| `task-creator` | Criar com validação |
| `search-similar` | Busca semântica |

### 6.2 Financeiro Lead

| Skill | Função |
|-------|--------|
| `financial-analyst` | Análise de custos |
| `contract-manager` | Gestão de contratos |

### 6.3 Tech Lead

| Skill | Função |
|-------|--------|
| `devops-engineer` | Docker, deploys |
| `code-reviewer` | Revisão de código |
| `python-dev` | Scripts Python |

### 6.4 Security Lead

| Skill | Função |
|-------|--------|
| `security-expert` | Auditoria e proteção |

---

## 7. Fluxo de Criação de Tarefa

```
Usuário: "Crie uma tarefa urgente para Lucas"

1. SECRETARY recebe
   └── Intent: "criar_tarefa"
   └── Entidades: {prioridade: "urgente", responsavel: "Lucas"}

2. SECRETARY → GESTAO LEAD
   └── Task: criar_tarefa(prioridade="urgente")

3. GESTAO LEAD valida
   └── Título: obrigatório
   └── Responsável: existe?

4. GESTAO LEAD → DATABASE
   └── INSERT INTO tarefas (...)
   └── Gera embedding

5. GESTAO LEAD → SECRETARY
   └── Resultado: {success: true, id: 123}

6. SECRETARY → Usuário
   └── "Tarefa criada com sucesso! ID: 123"
```

---

## 8. Interface (Frontend)

### 8.1 Páginas

| Página | Descrição |
|--------|-----------|
| `/dashboard` | Visão geral |
| `/kanban` | Quadro de tarefas |
| `/tarefas` | Lista de tarefas |
| `/projetos` | Projetos |
| `/contratos` | Contratos |
| `/financeiro` | Financeiro |
| `/documentos` | Documentos |
| `/settings` | Configurações |

### 8.2 Sessões no Chat

Cada agente seria uma sessão/aba no chat:
- Chief (principal)
- Tech
- Gestao
- Financeiro
- Security
- Ops

---

## 9. Configuração de Ambiente

### 9.1 Variáveis (Infraestrutura VPS)

```bash
# OpenClaw
OPENROUTER_API_KEY=sk-or-v1-...
OPENCLAW_PORT=18789

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...  # Apenas admin

# Backup
GPG_RECIPIENT=admin@seudominio.com
RCLONE_REMOTE=backup-edicula

# Monitoramento
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
SLACK_WEBHOOK=...
```

### 9.2 Variáveis (API Backend)

```bash
# Banco
DATABASE_URL=postgresql://user:pass@host:5432/edicula

# Supabase (alternativo)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJ...

# Backend
SECRET_KEY=xxx
JWT_SECRET=xxx

# OpenClaw
OPENCLAW_URL=http://localhost:18789
OPENCLAW_API_KEY=sk-...

# Redis (Message Queue - opcional)
REDIS_URL=redis://localhost:6379
```

### 9.3 Stack Recomendada

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14+ |
| Backend API | FastAPI |
| Database | Supabase (PostgreSQL 15 + pgVector) |
| Queue | Redis (opcional) |
| IA | OpenClaw |
| Search | pgVector similarity |
| VPS | Ubuntu 22.04 LTS |
| Docker | Latest |
| Proxy | Nginx + SSL Let's Encrypt |
| VPN | Tailscale |

---

## 10. Segurança

### 10.1 Autenticação

- JWT tokens
- Refresh tokens
- Rate limiting: 60 req/min

### 10.2 Autorização

- RBAC: admin, manager, member
- ownner's only para dados sensíveis

### 10.3 Dados

- SSL/TLS em trânsito
- Backup diário
- Criptografia de senhas

---

## 11. Roadmap de Implementação

### Fase 1: Fundamentos
- [ ] Banco PostgreSQL + pgVector
- [ ] API FastAPI básica
- [ ] Frontend Next.js

### Fase 2: Agentes
- [ ] Secretary Agent
- [ ] Chief Agent
- [ ] Gestao Lead
- [ ] Financeiro Lead

### Fase 3: Integração
- [ ] Message Queue
- [ ] Sessions no OpenClaw
- [ ] Busca semântica

### Fase 4: Expansão
- [ ] Tech Lead
- [ ] Security Lead
- [ ] Ops Lead
- [ ] Mais skills

---

## 12. Status de Implementação

### 12.1 Infraestrutura ✅

| Item | Status | Observações |
|------|--------|-------------|
| VPS Ubuntu 22.04 | ✅ Pronto | Configuração base |
| Docker + Docker Compose | ✅ Pronto | docker-compose.yml |
| Firewall UFW | ✅ Pronto | install-firewall.sh |
| SSH Hardening | ✅ Pronto | Porta 2222 |
| Fail2Ban | ✅ Pronto | install-fail2ban.sh |
| Nginx + SSL | ✅ Pronto | Let's Encrypt |
| Tailscale | ✅ Pronto | install-tailscale.sh |
| Backupriptografado | ✅ Pronto | GPG + rclone |
| Monitoramento | ✅ Pronto | Health checks |

### 12.2 Documentação ✅

| Item | Status | Arquivo |
|------|--------|---------|
| Blueprint | ✅ Atualizado | docs/platform/BLUEPRINT.md |
| Arquitetura Infra | ✅ | docs/infra/arquitetura.md |
| Database Schema | ✅ | docs/platform/DATABASE.md |
| Comunicação | ✅ | docs/platform/COMUNICACAO.md |
| Tutorial Instalação | ✅ | docs/TUTORIAL-INSTALACAO.md |
| Tutorial Supabase | ✅ | docs/TUTORIAL-SUPABASE.md |
| Tutorial Agentes | ✅ | docs/TUTORIAL-AGENTES.md |
| Segurança | ✅ | docs/infra/seguranca.md |
| Backup | ✅ | docs/infra/backup.md |
| Checklist | ✅ | docs/CHECKLIST.md |

### 12.3 Vulnerabilidades Corrigidas ✅

| Item | Status | Data |
|------|--------|------|
| CORS allow_origins=["*"] | ✅ Corrigido | 2026-02-18 |
| Backup.sh bug (TEMP_DIR) | ✅ Corrigido | 2026-02-18 |
| Docker security (cap_drop) | ✅ Corrigido | 2026-02-18 |
| Senha hardcoded placeholder | ✅ Corrigido | 2026-02-18 |
| install-supabase.sh | ✅ Corrigido | 2026-02-18 |

### 12.4 Plataforma (Em Desenvolvimento)

| Item | Status | Observações |
|------|--------|-------------|
| API FastAPI | ⚠️ Base | api/main.py |
| Supabase | ⚠️ Configurar | Criar projeto |
| Frontend | ❌ Não criado | Next.js |
| Agentes OpenClaw | ⚠️ Configurar | Json pronto |
| Busca semântica | ⚠️ Schema | pgVector pronto |

---

## 13. Estrutura de Arquivos

### 13.1 Organização Atual

```
EdiculaWorks/
├── agents/                    # Documentação dos agentes
│   ├── CHIEF.md
│   ├── TECH_LEAD.md
│   ├── GESTAO_LEAD.md
│   └── ...
│
├── api/                      # Backend FastAPI
│   ├── routes/
│   ├── services/
│   └── schemas/
│
├── config/                   # Configurações
│   ├── openclaw.json
│   ├── nginx.conf
│   └── fail2ban/
│
├── docs/                     # Documentação
│   ├── infra/              # Infraestrutura VPS
│   │   ├── arquitetura.md
│   │   ├── seguranca.md
│   │   ├── backup.md
│   │   └── tailscale.md
│   │
│   ├── platform/            # Plataforma
│   │   ├── BLUEPRINT.md
│   │   ├── DATABASE.md
│   │   └── COMUNICACAO.md
│   │
│   ├── TUTORIAL-*.md       # Tutoriais
│   ├── CHECKLIST.md
│   └── TROUBLESHOOTING.md
│
├── scripts/                  # Scripts de instalação
│   ├── install-*.sh
│   ├── backup.sh
│   └── restore.sh
│
├── skills/                   # Skills reutilizáveis
│   ├── devops-engineer/
│   ├── code-reviewer/
│   ├── security-expert/
│   ├── dba/
│   └── python-dev/
│
└── workspace/               # Configuração OpenClaw
    ├── chief/
    │   ├── SOUL.md
    │   └── TOOLS.md
    ├── tech/
    ├── gestao/
    ├── financeiro/
    ├── security/
    └── ops/
```

### 13.2 O que foi Removido (Reorganização)

| Removido | Motivo |
|----------|--------|
| workspace/*/skills/ | Skills eram cópias - referenciadas de `skills/` |
| skills-platform/ | Duplicado de `skills/` |
| tools-platform/ | Redundante |
| docs/platform/ARQUITETURA.md | Duplicado de docs/infra/ |

---

## 14. Regras de Desenvolvimento

### 13.1 Documentação Obrigatória

> **Regra**: Toda funcionalidadenova deve incluir documentação

```markdown
# Regra: 3 clicks
- Usuário deve encontrar qualquer info em 3 cliques ou menos

# Regra: Self-documenting code
- Código deve ser legível sem comentários extras

# Regra: CHANGELOG
- Toda mudança significativa = entrada no CHANGELOG.md

# Regra: README atualizado
- Após criar novo arquivo/script → atualizar README.md
```

### 13.2 Checklist de Documentação

Antes de marcar tarefa como **concluída**, verificar:

- [ ] Blueprint atualizada? (se mudou arquitetura)
- [ ] Novo tutorial necessário? (se nova feature)
- [ ] README.md atualizado? (se novos arquivos)
- [ ] CHANGELOG.md registrado? (se mudança significativa)
- [ ] Variáveis documentadas? (.env.example)

### 13.3 Estrutura de Arquivos

```
docs/
├── Tutoriais/                    # Como fazer algo
│   ├── TUTORIAL-INSTALACAO.md
│   ├── TUTORIAL-SUPABASE.md
│   └── TUTORIAL-AGENTES.md
├── Guias/                       # Explicações
│   ├── SEGURANCA.md
│   ├── BACKUP.md
│   └── ARQUITETURA.md
├── Referências/                 # Informações
│   ├── BLUEPRINT.md            # Visão geral (ATUALIZAR SEMPRE)
│   ├── DATABASE.md
│   └── CHECKLIST.md
└── TROUBLESHOOTING.md          # Problemas comuns
```

### 13.4 Padrão de Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Tutorial | TUTORIAL-[TEMA].md | TUTORIAL-SUPABASE.md |
| Guia | GUIA-[TEMA].md | GUIA-SEGURANCA.md |
| Variáveis | UPPER_SNAKE_CASE | OPENROUTER_API_KEY |
| Arquivos | kebab-case | install-firewall.sh |
| Agentes | snake_case | tech_lead, gestao_lead |

### 13.5 Versionamento

```bash
# Formato: vMAJOR.MINOR.PATCH
# Exemplo: v1.0.0

v1.0.0 - Release inicial
v1.0.1 - Correção de bug
v1.1.0 - Nova feature
v2.0.0 - Breaking change
```

### 13.6 Commit Messages

```bash
# Formato: tipo: descrição

feat: adicionar tutorial supabase
fix: corrigir bug no backup.sh
docs: atualizar blueprint
security: corrigir vulnerabilidade CORS
refactor: reorganizar estrutura de arquivos
```

---

## 14. Próximas Decisões Needed

1. **Quando começar a codificar a plataforma?**
2. **Ordem de implementação?** (Agentes primeiro ou Backend?)
3. **Quem vai usar?** (só vocês ou clientes também?)
4. **Precisa de auth?** (login/senha)
5. **Dados migrar ou começar do zero?**

---

## 15. Histórico de Mudanças

| Data | Versão | Mudança |
|------|--------|---------|
| 2026-02-18 | 2.0 | Adicionadas regras de desenvolvimento, Supabase, vulnerabilidades corrigidas |
| 2026-02-10 | 1.0 | Versão inicial do blueprint |

---

Este é o blueprint completo. Quer esclarecer ou ajustar algo?

# CHANGELOG - EdiculaWorks

Todas as mudanças significativas neste projeto devem ser documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

> **Nota**: Consulte [REGRAS.md](REGRAS.md) para as regras de desenvolvimento e documentação.

---

## [3.1.0] - 2026-02-19

### Adicionado
- Subagentes especializados do TechLead (`skills/techlead/`)
  - `implementador.md`: Implementa código com metodologia red-green-refactor
  - `revisor-codigo.md`: Revisão adversarial (3-10 issues mínimas)
  - `testador-qa.md`: Testes funcionais e de regressão
  - `revisor-ui-ux.md`: Validação de interface e acessibilidade
  - `desenvolvedor-frontend.md`: Componentes React/Next.js
- `workspace/tech/SOUL.md`: Atualizado para funcionar como orquestrador de subagentes

### Modificado
- TechLead agora delega tarefas para subagentes especializados via sessions_spawn
- Workflow: Implementador → Revisor → QA → (UI/UX opcional)

---

## [3.0.0] - 2026-02-19

### Adicionado
- Schema SQL completo (`docs/platform/schema.sql`) - versão enterprise com ~40 tabelas
  - Módulo Core: empresas, usuarios, perfis, configuracoes
  - Módulo Gestão: projetos, tarefas, subtarefas, comentarios, anexos, tags, checklist, historico
  - Módulo Contratos: contratos, renovações, clientes, fornecedores
  - Módulo Financeiro: transacoes, categorias, faturas, orçamentos, contas, centros custo, metas
  - Módulo Documentos: documentos, categorias, tags
  - Módulo IA: conversas, mensagens, embeddings_cache, buscas_salvas
  - Módulo Sistema: notificacoes, email_queue, webhooks
  - Módulo Auditoria: audit_logs, sessoes
  - Índices otimizados para busca vetorial e queries comuns
  - Dados iniciais (empresa, usuarios, categorias, tarefas exemplo)
  - Funções úteis (busca semântica, audit trail, triggers)
- Arquivo `.env` para API (`api/.env`) com credenciais Supabase
- Atualizado `.env.example` com variáveis Supabase

### Modificado
- `docs/platform/DATABASE.md`: agora指向 schema.sql como fonte oficial

### Adicionado (API)
- `api/database.py`: Cliente Supabase singleton
- `api/requirements.txt`: Dependências (supabase, sqlalchemy, psycopg2, etc)
- `api/schemas/tarefa.py`: Schema atualizado com campos do schema SQL
- `api/schemas/contrato.py`: Schema atualizado com campos do schema SQL
- `api/schemas/transacao.py`: Schema atualizado com campos do schema SQL

### Modificado (API)
- `api/services/tarefas.py`: Conectado ao Supabase
- `api/services/contratos.py`: Conectado ao Supabase + renovações
- `api/services/transacoes.py`: Conectado ao Supabase + resumos
- `api/routes/tarefas.py`: Parâmetros atualizados (empresa_id, projeto_id)
- `api/routes/contratos.py`: Parâmetros atualizados (empresa_id, cliente_id)
- `api/routes/transacoes.py`: Parâmetros atualizados (empresa_id, categoria_id)

---

## [2.2.1] - 2026-02-18

### Modificado
- README.md: clarificado que EdiculaWorks é a empresa, não a plataforma (sistema ainda sem nome)

---

## [2.1.0] - 2026-02-18

### Adicionado
- Tutorial de Supabase (`docs/TUTORIAL-SUPABASE.md`)
- Tutorial de Instalação (`docs/TUTORIAL-INSTALACAO.md`)
- Tutorial de Agentes (`docs/TUTORIAL-AGENTES.md`)
- Seção de Regras de Desenvolvimento no Blueprint
- Arquivo de Regras de Desenvolvimento (`REGRAS.md`)
- CHANGELOG.md
- Pasta `docs/infra/` para documentação de infraestrutura

### Corrigido
- Bug no `backup.sh`: variável `TEMP_DIR` usada antes de ser definida
- Bug no `backup.sh`: crontabs exportadas antes do diretório existir
- CORS: `allow_origins=["*"]` → `["http://localhost:3000", "http://localhost:18789"]`
- Docker: adicionado `cap_drop: ALL` e `extra_hosts`
- `install-supabase.sh`: script melhorado com verificação de conexão
- Placeholder de senha em `config/openclaw.json`
- Placeholder de API key em `.env.example`

### Modificado
- `docs/platform/BLUEPRINT.md`: atualizado com status, vulnerabilidades e regras
- `README.md`: adicionada referência às regras de desenvolvimento

### Reorganizado
- Removido `workspace/*/skills/`: skills copiadas eram redundantes
- Removido `skills-platform/`: skills duplicadas
- Removido `tools-platform/`: redundante
- Movido `docs/arquitetura.md`, `seguranca.md`, `backup.md`, `tailscale.md` → `docs/infra/`
- Removido duplicata `docs/platform/ARQUITETURA.md`

---

## [2.0.0] - 2026-02-10

### Adicionado
- Blueprint completo da plataforma
- Estrutura de agentes (Chief, Tech Lead, Ops, Security, Gestao, Financeiro)
- Skills definidas (kanban-manager, task-creator, etc)
- Documentação de comunicação entre agentes

---

## [1.0.0] - 2026-01-XX

### Adicionado
- Infraestrutura VPS inicial
- Docker + OpenClaw
- Firewall UFW + Fail2Ban
- Nginx + SSL
- Tailscale
- Backup criptografado
- Monitoramento

---

## Formato de Entrada

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Adicionado
- Nova funcionalidade

### Corrigido
- Bug corrigido

### Modificado
- Mudança em funcionalidade existente

### Removido
- Funcionalidade removida
```

## Como Contribuir

1. Faça as mudanças no código/documentação
2. Atualize este arquivo seguindo o formato
3. Use versão semântica: MAJOR.MINOR.PATCH

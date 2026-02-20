# EdiculaWorks Platform

Sistema de gestão empresarial inteligente com agentes de IA integrados.

---

## Visão Geral

EdiculaWorks é uma plataforma completa para gestão de tarefas, projetos, contratos e finanças, potencializada por inteligência artificial. O sistema integra um quadro Kanban, controle financeiro, gestão de contratos e múltiplos agentes de IA que auxiliam a equipe nas atividades diárias.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      Nginx (SSL)                        │
│                  Reverse Proxy                          │
└─────────────┬─────────────┬─────────────┬───────────────┘
              │             │             │
    ┌─────────▼───┐ ┌───────▼─────┐ ┌─────▼──────────┐
    │   Frontend  │ │     API     │ │    OpenClaw    │
    │  Next.js    │ │   FastAPI   │ │   Agentes IA   │
    └─────────────┘ └─────────────┘ └────────────────┘
              │             │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │  Supabase   │
              │ PostgreSQL  │
              │  + pgVector │
              └─────────────┘
```

### Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Backend | FastAPI (Python 3.12) |
| Banco de Dados | Supabase (PostgreSQL + pgVector) |
| Autenticação | Better Auth |
| IA | OpenClaw + OpenRouter |
| Infraestrutura | Docker, Nginx, Ubuntu 24.04 |

---

## Funcionalidades

### Autenticação e Controle de Acesso

Sistema de autenticação completo com Better Auth:

- Login por email/senha
- OAuth com Google e GitHub (opcional)
- Sessões persistentes com JWT
- Controle de acesso baseado em perfis (RBAC)

**Perfis disponíveis:**

| Perfil | Acesso |
|--------|--------|
| Administrador | Completo |
| Gerente | Projetos, tarefas, relatórios |
| Desenvolvedor | Tarefas atribuídas |
| Visualizador | Apenas leitura |

### Kanban

Quadro visual de tarefas com:

- **Colunas:** A Fazer → Em Andamento → Em Revisão → Concluída
- **Prioridades:** Urgente, Alta, Média, Baixa
- **Organização:** Grupos, Sprints, Tags
- **Funcionalidades:** Drag-and-drop, filtros, estimativas

### Gestão de Projetos

- Projetos com orçamento e prazos
- Tarefas e subtarefas
- Comentários e anexos
- Time tracking
- Dependências entre tarefas

### Financeiro

- Controle de receitas e despesas
- Categorias personalizáveis
- Contratos com alertas de vencimento
- Faturas e cobranças
- Relatórios por período

### Busca Semântica

Sistema de busca inteligente utilizando pgVector:

- Encontra documentos relacionados mesmo com palavras diferentes
- Ex: "problema com pagamento" encontra contratos de "pagamento"
- Indexação automática de tarefas, contratos e documentos

### Agentes de IA (OpenClaw)

A plataforma conta com múltiplos agentes especializados:

| Agente | Especialidade |
|--------|---------------|
| **Chief** | Coordenador geral, direciona solicitações |
| **Tech Lead** | Código, infraestrutura, debugging |
| **Gestão** | Tarefas, projetos, organização |
| **Financeiro** | Custos, orçamento, análises |
| **Security** | Segurança, auditoria, conformidade |
| **Ops** | Monitoramento, backups, manutenção |

Os agentes podem ser acionados via chat web, terminal ou integrações.

---

## Estrutura do Projeto

```
EdiculaWorks/
├── api/                    # Backend FastAPI
│   ├── routes/            # Endpoints REST
│   ├── services/          # Lógica de negócio
│   ├── schemas/           # Modelos Pydantic
│   └── middleware/        # Autenticação, CORS
│
├── frontend/              # Frontend Next.js
│   ├── src/
│   │   ├── app/          # Páginas (App Router)
│   │   ├── components/   # Componentes React
│   │   ├── hooks/        # Hooks customizados
│   │   └── lib/          # Utilitários e API client
│
├── config/                # Configurações
│   └── nginx.conf        # Reverse proxy
│
├── docs/                  # Documentação técnica
│   └── platform/
│       ├── BLUEPRINT.md  # Visão arquitetural
│       ├── DATABASE.md   # Schema do banco
│       └── schema.sql    # Scripts SQL
│
├── docker-compose.yml     # Orquestração de containers
└── .env.example          # Template de variáveis
```

---

## Banco de Dados

O sistema utiliza PostgreSQL com as seguintes extensões:

- **pgcrypto** - Criptografia
- **uuid-ossp** - Geração de UUIDs
- **vector** - Busca semântica (pgVector)

### Principais Tabelas

| Módulo | Tabelas |
|--------|---------|
| Core | empresas, usuarios, perfis |
| Tarefas | tarefas, grupos, sprints, tags |
| Projetos | projetos, comentarios, anexos |
| Financeiro | transacoes, faturas, orcamentos |
| Contratos | contratos, documentos |

---

## Segurança

O sistema implementa múltiplas camadas de segurança:

- **Autenticação:** JWT com rotação de tokens
- **Autorização:** RBAC com permissões granulares
- **Criptografia:** HTTPS, dados sensíveis criptografados
- **Rate Limiting:** Proteção contra abuso (Nginx)
- **Isolamento:** Containers Docker com privilégios mínimos
- **Headers de Segurança:** CSP, HSTS, X-Frame-Options

---

## Integrações

### Supabase

- PostgreSQL gerenciado
- Autenticação suplementar
- Storage para arquivos
- Realtime (futuro)

### OpenRouter

- Acesso a múltiplos modelos de IA
- Fallback automático entre modelos
- Otimização de custos

### OAuth Providers

- Google (opcional)
- GitHub (opcional)

---

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [BLUEPRINT.md](docs/platform/BLUEPRINT.md) | Visão técnica completa |
| [DATABASE.md](docs/platform/DATABASE.md) | Schema e relacionamentos |
| [seguranca.md](docs/infra/seguranca.md) | Boas práticas de segurança |
| [REGRAS.md](REGRAS.md) | Padrões de desenvolvimento |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de mudanças |

---

## Equipe

Desenvolvido internamente pela equipe EdiculaWorks:

- Lucas Drummond
- Matheus Guim
- Luca Junqueira
- João Pedro Santana
- Gabriel Fonseca
- Guilherme Sad

---

## Licença

MIT

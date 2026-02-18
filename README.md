# EdiculaWorks

Plataforma de gestão empresarial inteligente com agentes de IA, desenvolvida pela equipe EdiculaWorks.

---

## O que é a EdiculaWorks?

A EdiculaWorks é uma plataforma completa para gestão de tarefas, contratos e projetos, potencializada por inteligência artificial.Think of it as um assistente virtual que ajuda a equipe com organização, análise financeira, gestão de contratos e muito mais.

---

## Funcionalidades

### 🤖 Agentes Inteligentes

A plataforma conta com múltiplos agentes especializados que trabalham juntos:

| Agente | Função |
|--------|--------|
| **Chief** | Coordenador geral - direciona suas solicitações para o agente certo |
| **Tech Lead** | Ajuda com código, infraestrutura e questões técnicas |
| **Gestao Lead** | Gerencia tarefas, projetos e o quadro Kanban |
| **Financeiro Lead** | Analisa custos, controla orçamento e gerencia contratos |
| **Security Lead** | Cuida da segurança e conformidade |
| **Ops Lead** | Monitoramento, backup e manutenção |

### 📋 Kanban

Quadro visual de tarefas com colunas:
- **A Fazer** (todo)
- **Em Andamento** (in_progress)
- **Em Revisão** (review)
- **Concluída** (done)

Prioridades: Urgente → Alta → Média → Baixa

### 📄 Contratos

Gestão completa de contratos com:
- Tipos: NDA, Serviço, Parceria, Outro
- Status: Rascunho → Ativo → Expirado → Encerrado
- Busca semântica para encontrar contratos relacionados

### 💰 Financeiro

Controle de receitas e despesas com:
- Categorias personalizáveis
- Relatórios por período
- Vinculação a contratos e tarefas

### 🔍 Busca Semântica

Sistema inteligente que encontra tarefas e contratos relacionados, mesmo usando palavras diferentes. Ex: busca por "problema com pagamento" encontra contratos de pagamento.

---

## Arquitetura

```
┌─────────────────────────────┐
│      Aplicação Web         │
│     (Next.js - Futuro)     │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│        API (FastAPI)        │
│   BACKEND + AGENTES IA      │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│      Supabase               │
│  (PostgreSQL + pgVector)    │
└─────────────────────────────┘
```

### Stack Tecnológica

- **Frontend**: Next.js (em desenvolvimento)
- **Backend**: FastAPI (Python)
- **Banco de Dados**: Supabase (PostgreSQL + pgVector)
- **IA**: OpenClaw com OpenRouter
- **Infraestrutura**: VPS Ubuntu + Docker

---

## Como Usar

### Falando com os Agentes

Você pode interagir com os agentes de diferentes formas:

1. **Via Chat Web** (quando disponível)
2. **Via Terminal** (acesso SSH)
3. **Via Tailscale** (acesso remoto seguro)

### Exemplos de Comandos

| O que você quer | Agent |
|-----------------|-------|
| "Crie uma tarefa para o Lucas" | Gestao Lead |
| "Liste minhas tarefas de hoje" | Gestao Lead |
| "Quanto gastamos em janeiro?" | Financeiro Lead |
| "Revise o contrato X" | Financeiro Lead |
| "Ajude com um script Python" | Tech Lead |
| "Verifique a segurança do servidor" | Security Lead |

---

## Segurança

- 🔒 Criptografia de dados
- 🔑 Autenticação por chave SSH
- 🛡️ Firewall e Fail2Ban
- 📦 Ambiente sandbox (Docker)
- 💾 Backup criptografado diário
- 🌐 Acesso via VPN (Tailscale)

---

## Custos

> Em definição - valores serão definidos posteriormente.

---

## Documentação

Para desenvolvedores:

| Arquivo | O que contém |
|---------|-------------|
| [docs/platform/BLUEPRINT.md](docs/platform/BLUEPRINT.md) | Visão técnica completa |
| [docs/platform/DATABASE.md](docs/platform/DATABASE.md) | Schema do banco de dados |
| [docs/infra/seguranca.md](docs/infra/seguranca.md) | Boas práticas de segurança |
| [REGRAS.md](REGRAS.md) | Regras de desenvolvimento |
| [CHANGELOG.md](CHANGELOG.md) | Histórico de mudanças |

---

## Equipe

- **Lucas Drummond** - CEO / Desenvolvedor
- **Matheus Guim** - Desenvolvedor
- **Luca Junqueira** - Desenvolvedor
- **João Pedro Santana** - Desenvolvedor

---

## Licença

MIT

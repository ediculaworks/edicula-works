# CHANGELOG - EdiculaWorks

Todas as mudanças significativas neste projeto devem ser documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

> **Nota**: Consulte [REGRAS.md](REGRAS.md) para as regras de desenvolvimento e documentação.

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

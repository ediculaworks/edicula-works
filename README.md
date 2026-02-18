# EdiculaWorks - Infraestrutura VPS Segura

## Visão Geral

Infraestrutura auto-hospedada e segura para a empresa EdiculaWorks, centrada no assistente de IA OpenClaw com acesso remoto seguro via Tailscale.

## Stack de Serviços

| Serviço | Descrição | Porta |
|---------|-----------|-------|
| OpenClaw | Assistente de IA | 18789 (interno) |
| Tailscale | VPN/Acesso remoto | - |
| Nginx | Proxy reverso + SSL | 80/443 |
| UFW | Firewall | - |
| Fail2Ban | Proteção brute force | - |

## Arquitetura de Segurança

```
INTERNET
    │
    ▼
┌─────────────────────────────┐
│      FIREWALL (UFW)         │
│  - 80/443 (HTTP/HTTPS)     │
│  - 22 (SSH limitado)       │
│  - 41641 (Tailscale)       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      NGINX + SSL           │
│  - Rate limiting           │
│  - Headers de segurança    │
│  - HSTS                   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      FAIL2BAN              │
│  - Bloqueio automático    │
│  - Proteção SSH           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      OPENCLAW              │
│  - Usuário dedicado       │
│  - Modo sandbox           │
│  - Comandos restritos     │
└─────────────────────────────┘
               │
               ▼
┌─────────────────────────────┐
│      TAILSCALE             │
│  - Rede VPN privada       │
│  - Acesso seguro          │
└─────────────────────────────┘
```

## Recursos de Segurança

- ✅ Firewall UFW com políticas restritivas
- ✅ SSH com chave pública (porta 2222)
- ✅ Fail2Ban contra brute force
- ✅ SSL Let's Encrypt com HSTS
- ✅ Rate limiting no Nginx
- ✅ Headers de segurança (CSP, XSS, etc)
- ✅ OpenClaw com usuário dedicado
- ✅ Modo sandbox (Docker)
- ✅ Backup criptografado (GPG)
- ✅ Monitoramento com alertas
- ✅ API keys em variáveis de ambiente

## Requisitos

- VPS: 4GB RAM, 2 CPU, 50GB SSD
- Sistema: Ubuntu 22.04 LTS
- Domínio configurado

## Quick Start

```bash
# Clone o repositório
git clone https://github.com/ediculaworks/infra.git
cd infra

# Execute o instalador
chmod +x install-all.sh
sudo ./install-all.sh
```

## Instalação Manual

```bash
# 1. Docker
chmod +x scripts/install-docker.sh
sudo ./scripts/install-docker.sh

# 2. Firewall
chmod +x scripts/install-firewall.sh
sudo ./scripts/install-firewall.sh

# 3. SSH Hardening
chmod +x scripts/install-ssh-hardening.sh
sudo ./scripts/install-ssh-hardening.sh

# 4. OpenClaw
chmod +x scripts/install-openclaw.sh
sudo ./scripts/install-openclaw.sh

# 5. SSL
chmod +x scripts/setup-ssl.sh
sudo ./scripts/setup-ssl.sh dominio.com email@exemplo.com
```

## Estrutura do Projeto

```
.
├── README.md                    # Este arquivo
├── AGENTS.md                   # Configuração do agente
├── SOUL.md                     # Personalidade do agente
├── TOOLS.md                    # Ferramentas customizadas
├── CHANGELOG.md               # Histórico de mudanças
├── REGRAS.md                  # Regras de desenvolvimento
├── docker-compose.yml          # Orquestração Docker
├── .env.example               # Template de variáveis
├── api/                       # Backend FastAPI
│   ├── routes/
│   ├── services/
│   └── schemas/
├── agents/                    # Documentação dos agentes
├── config/                    # Configurações
├── docs/
│   ├── infra/                # Infraestrutura VPS
│   │   ├── arquitetura.md
│   │   ├── seguranca.md
│   │   ├── backup.md
│   │   └── tailscale.md
│   ├── platform/             # Plataforma
│   │   ├── BLUEPRINT.md
│   │   ├── DATABASE.md
│   │   └── COMUNICACAO.md
│   ├── CHECKLIST.md
│   ├── TROUBLESHOOTING.md
│   ├── TUTORIAL-*.md
│   └── *.md
├── scripts/                   # Scripts de instalação
├── skills/                    # Skills reutilizáveis
└── workspace/                # Configuração OpenClaw
    ├── chief/
    ├── tech/
    ├── gestao/
    ├── financeiro/
    ├── security/
    └── ops/
```
│   ├── install-docker.sh      # Instalador Docker
│   ├── install-firewall.sh   # Firewall UFW
│   ├── install-ssh-hardening.sh  # SSH seguro
│   ├── install-openclaw.sh   # Instalador OpenClaw
│   ├── install-tailscale.sh  # Instalador Tailscale
│   ├── install-monitoring.sh  # Monitoramento
│   ├── install-logrotate.sh  # Rotação de logs
│   ├── install-fail2ban.sh   # Fail2Ban customizado
│   ├── install-supabase.sh   # Integração Supabase
│   ├── install-lynis.sh     # Auditoria Lynis
│   ├── setup-ssl.sh          # SSL + Nginx seguro
│   ├── update.sh             # Atualizador
│   ├── backup.sh             # Backup criptografado
│   ├── restore.sh            # Restore seguro
│   ├── audit.sh              # Auditoria de segurança
│   └── test-restore.sh       # Teste de restauração
└── config/
    ├── openclaw.json          # Configuração OpenClaw
    ├── nginx.conf            # Configuração Nginx
    ├── model-config.json     # Modelos e fallback
    ├── logrotate/            # Configuração logrotate
    └── fail2ban/             # Configuração Fail2Ban
```

## Configuração

### 1. Variáveis de Ambiente

```bash
# /etc/openclaw/env
OPENROUTER_API_KEY=sua_api_key_aqui
```

### 2. Configuração OpenClaw

Edite `/etc/openclaw/openclaw.json`:

```json
{
  "gateway": {
    "auth": {
      "password": "SENHA_SEGURA_AQUI"
    }
  }
}
```

## Comandos Úteis

```bash
# Status dos serviços
systemctl status openclaw
systemctl status nginx
systemctl status fail2ban

# Logs
journalctl -u openclaw -f
tail -f /var/log/nginx/access.log
tail -f /var/log/fail2ban.log

# Health check
/opt/monitoring/health-check.sh

# Métricas
/opt/monitoring/metrics.sh

# Backup manual
/opt/scripts/backup.sh

# Restore
/opt/scripts/restore.sh 20240115_030000
```

## Documentação

- [Arquitetura](docs/arquitetura.md)
- [OpenClaw](docs/openclaw.md)
- [Tailscale](docs/tailscale.md)
- [Backup](docs/backup.md)
- [Segurança](docs/seguranca.md)
- [CHECKLIST](docs/CHECKLIST.md)
- [TROUBLESHOOTING](docs/TROUBLESHOOTING.md)
- [DISASTER_RECOVERY](docs/DISASTER_RECOVERY.md)

## Regras de Desenvolvimento

> ⚠️ **IMPORTANTE**: Antes de marcar qualquer tarefa como concluída, atualize a documentação!

Consulte [REGRAS.md](REGRAS.md) para:
- Padrões de nomenclatura
- Checklist de documentação
- Regras de segurança
- Formato de commits
- Versionamento

Referências:
- [CHANGELOG.md](CHANGELOG.md) - Histórico de mudanças
- [docs/platform/BLUEPRINT.md](docs/platform/BLUEPRINT.md) - Visão geral (atualizar sempre)

## Custos

| Item | Custo |
|------|-------|
| VPS 4GB | ~R$100/mês |
| Domínio | ~R$40/ano |
| OpenRouter | Grátis/R$5/mês |
| **Total** | **~R$100-105/mês** |

## Manutenção

### Atualizações de Segurança

```bash
# Sistema
apt update && apt upgrade -y

# OpenClaw
npm update -g openclaw@latest
systemctl restart openclaw
```

### Verificação de Saúde

```bash
# Executar health check
/opt/monitoring/health-check.sh
```

## Licença

MIT

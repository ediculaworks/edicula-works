# Segurança - Boas Práticas e Configurações

## Visão Geral

Este documento lista as práticas de segurança implementadas e recomendadas para a infraestrutura EdiculaWorks.

## Arquitetura de Segurança

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
│                                                                  │
│   ┌──────────────┐              ┌──────────────────┐             │
│   │  Usuários    │              │  Ameaças         │             │
│   │  Legítimos   │              │  (bloqueadas)    │             │
│   └──────┬───────┘              └────────┬─────────┘             │
│          │                                │                       │
│          │        ┌───────────────────────┘                       │
│          │        │                                              │
│          ▼        ▼                                              │
│   ┌──────────────────────────────────────────────┐              │
│   │           FIREWALL (UFW)                      │              │
│   │  - Porta 22 (SSH)   → Taxa limitada          │              │
│   │  - Porta 80/443    → HTTP/HTTPS              │              │
│   │  - Porta 18789     → BLOQUEADA (interno)      │              │
│   │  - Porta 41641     → Tailscale               │              │
│   └──────────────────────┬───────────────────────┘              │
│                          │                                       │
│                          ▼                                       │
│   ┌──────────────────────────────────────────────┐              │
│   │              NGINX (Proxy Reverso)            │              │
│   │  - Rate limiting                             │              │
│   │  - SSL/TLS                                   │              │
│   │  - Headers de segurança                      │              │
│   │  - HSTS                                      │              │
│   └──────────────────────┬───────────────────────┘              │
│                          │                                       │
│                          ▼                                       │
│   ┌──────────────────────────────────────────────┐              │
│   │           FAIL2BAN                            │              │
│   │  - Bloqueio de brute force                   │              │
│   │  - Limite de tentativas                      │              │
│   └──────────────────────┬───────────────────────┘              │
│                          │                                       │
│                          ▼                                       │
│   ┌──────────────────────────────────────────────┐              │
│   │         OPENCLAW (Sandbox)                   │              │
│   │  - Usuário dedicado                          │              │
│   │  - Modo container                            │              │
│   │  - Comandos restritos                       │              │
│   └──────────────────────┬───────────────────────┘              │
│                          │                                       │
│                          ▼                                       │
│              ┌────────────────────────┐                          │
│              │    TAILSCALE          │                          │
│              │  (Rede VPN Privada)  │                          │
│              └────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

## Camadas de Proteção

### 1. Firewall (UFW)

### Instalação e Configuração

```bash
# Instalação
apt install -y ufw

# Políticas padrão
ufw default deny incoming
ufw default allow outgoing

# Regras básicas
ufw limit 22/tcp   # SSH com rate limiting
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 41641/udp # Tailscale
ufw allow 123/udp   # NTP

# Ativar
ufw enable
```

### Verificar Status

```bash
ufw status verbose
```

### 2. SSH Seguro

### Configuração Recomendada

Editar `/etc/ssh/sshd_config`:

```bash
# Porta alternativa
Port 2222

# Desabilitar root
PermitRootLogin no

# Autenticação por chave
PubkeyAuthentication yes
PasswordAuthentication no

# Timeout
ClientAliveInterval 300
ClientAliveCountMax 2

# Limitar tentativas
MaxAuthTries 3

# Criptografia forte
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com
```

### Conexão SSH

```bash
# Gerar chave (no seu computador)
ssh-keygen -t ed25519 -C "seu@email.com"

# Copiar para VPS
ssh-copy-id -p 2222 usuario@IP_DA_VPS

# Conectar
ssh -p 2222 usuario@IP_DA_VPS
```

### 3. Fail2Ban

### Instalação

```bash
apt install -y fail2ban
```

### Configuração

Criar `/etc/fail2ban/jail.local`:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
```

### Comandos

```bash
# Ver status
fail2ban-client status

# Ver logs
tail -f /var/log/fail2ban.log
```

### 4. SSL/TLS

### Certificados Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx

certbot --nginx -d openclaw.seudominio.com \
    --agree-tos --email seu@email.com \
    --redirect --hsts --staple-ocsp
```

### Headers de Segurança

O Nginx já está configurado com:

| Header | Função |
|--------|--------|
| X-Frame-Options | Previne clickjacking |
| X-Content-Type-Options | Previne MIME sniffing |
| X-XSS-Protection | Proteção XSS |
| Referrer-Policy | Controle de referenciador |
| Content-Security-Policy | CSP restritivo |

### Renovar Certificado

```bash
# Testar renovação
certbot renew --dry-run

# Renovar manualmente
certbot renew
```

### 5. OpenClaw Seguro

### Usuário Dedicado

O OpenClaw roda sob usuário `openclaw` com permissões limitadas:

```bash
# Verificar usuário
systemctl status openclaw
# User=openclaw
```

### Modo Sandbox

Configuração em `/etc/openclaw/openclaw.json`:

```json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "docker",
        "allowlist": ["bash", "read", "write", "edit", "grep", "glob"],
        "denylist": ["browser", "system", "admin"]
      }
    }
  }
}
```

### Variáveis de Ambiente

API keys são configuradas via variáveis de ambiente, não em texto:

```bash
# /etc/openclaw/env
OPENROUTER_API_KEY=sua_chave_aqui
```

### 6. Rate Limiting

O Nginx limita requisições:

| Endpoint | Limite |
|----------|--------|
| `/api` | 10 req/s |
| `/auth` | 3 req/s |
| `/` | 5 req/s |

### 7. Backup Criptografado

### Configuração G
# Gerar chave (uma vez)
PG

```bashgpg --full-generate-key

# Configurar recipient
export GPG_RECIPIENT=seu@email.com

# O backup.sh já criptografa automaticamente
/opt/scripts/backup.sh
```

## Monitoramento

### Health Check

```bash
# Executar verificação
/opt/monitoring/health-check.sh

# Ver métricas
/opt/monitoring/metrics.sh
```

### Alertas

Configure em `/opt/monitoring/notify.sh`:
- Telegram
- Slack
- Email

## Checklist de Segurança

- [x] Firewall UFW configurado
- [x] SSH com chave pública
- [x] SSH sem senha root
- [x] Porta SSH alterada (2222)
- [x] Fail2Ban ativo
- [x] SSL Let's Encrypt
- [x] Headers de segurança
- [x] Rate limiting
- [x] OpenClaw com usuário dedicado
- [x] Modo sandbox
- [x] API keys em variáveis de ambiente
- [x] Backups criptografados
- [x] Monitoramento ativo

## Procedimentos de Emergência

### Se Comprometido

1. **Isolar servidor**:
```bash
ufw disable
tailscale down
```

2. **Verificar acesso**:
```bash
last
who
ps aux
netstat -tulpn
```

3. **Restaurar backup**:
```bash
/opt/scripts/restore.sh <data_backup>
```

4. **Analisar logs**:
```bash
/var/log/auth.log
journalctl -u openclaw
```

## Atualizações de Segurança

### Atualizar Sistema

```bash
apt update && apt upgrade -y
```

### Atualizar OpenClaw

```bash
npm update -g openclaw@latest
systemctl restart openclaw
```

### Atualizações Automáticas

```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

## Referências

- [Hardening SSH](https://www.ssh.com/academy/ssh/sshd_config)
- [Nginx Security Headers](https://nginx.org/en/docs/http/ngx_http_headers_module.html)
- [Fail2Ban Docs](https://www.fail2ban.org/)
- [OpenClaw Security](https://docs.openclaw.ai/gateway/security)

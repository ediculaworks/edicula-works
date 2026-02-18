# Tutorial de Instalação - EdiculaWorks

## Visão Geral

Este guia passo a passo configura toda a infraestrutura EdiculaWorks em uma VPS Ubuntu 22.04.

---

## Pré-Requisitos

| Item | Mínimo | Recomendado |
|------|--------|-------------|
| VPS | 2GB RAM, 1 CPU, 20GB SSD | 4GB RAM, 2 CPU, 50GB SSD |
| SO | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Domínio | Opcional | configurado |
| Acesso | SSH root | Chave SSH |

---

## Passo 1: Preparação do Servidor

### Conectar via SSH
```bash
ssh root@IP_DA_VPS
```

### Atualizar sistema
```bash
apt update && apt upgrade -y
```

### Criar usuário admin (recomendado)
```bash
adduser admin
usermod -aG sudo admin
mkdir -p /home/admin/.ssh
cp ~/.ssh/authorized_keys /home/admin/.ssh/
chown -R admin:admin /home/admin/.ssh
```

---

## Passo 2: Clonar Repositório

```bash
cd /opt
git clone https://github.com/ediculaworks/infra.git
cd infra
chmod +x install-all.sh
```

---

## Passo 3: Instalação Automática (Recomendado)

```bash
sudo ./install-all.sh
```

Siga as instruções na tela. O script instalará:
1. Docker
2. Firewall (UFW)
3. SSH Hardening
4. OpenClaw
5. Tailscale
6. SSL
7. Backup
8. Monitoramento

---

## Passo 4: Instalação Manual (Opcional)

### 4.1 Docker
```bash
sudo apt install docker.io docker-compose
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 4.2 Firewall
```bash
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp   # SSH (porta alterada)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 41641/udp  # Tailscale
sudo ufw enable
```

### 4.3 OpenClaw
```bash
# Criar usuário
sudo useradd -r -s /bin/false openclaw

# Criar diretórios
sudo mkdir -p /etc/openclaw /var/lib/openclaw /var/log/openclaw
sudo chown openclaw:openclaw /var/lib/openclaw /var/log/openclaw

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar OpenClaw
sudo npm install -g openclaw

# Configurar
sudo cp config/openclaw.json /etc/openclaw/openclaw.json
sudo cp .env.example /etc/openclaw/env
sudo nano /etc/openclaw/env  # Adicione sua API Key
```

### 4.4 Docker Compose
```bash
sudo cp docker-compose.yml /etc/openclaw/docker-compose.yml
cd /etc/openclaw
sudo docker-compose up -d
```

---

## Passo 5: Configurar OpenClaw

### Editar credenciais
```bash
sudo nano /etc/openclaw/env
```

```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxx...
```

### Alterar senha do gateway
```bash
sudo nano /etc/openclaw/openclaw.json
```

Altere `"password": "CHANGE_ME_IN_PRODUCTION"` para uma senha segura.

### Reiniciar
```bash
sudo systemctl restart openclaw
```

---

## Passo 6: Configurar SSL (Opcional)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com --agree-tos --email seu@email.com --redirect --hsts
```

---

## Passo 7: Configurar Supabase

### Criar projeto
1. Acesse supabase.com
2. Crie novo projeto
3. Anote URL e ANON_KEY

### Executar script
```bash
sudo ./scripts/install-supabase.sh
```

### Executar schema
Abra o SQL Editor no painel Supabase e execute o conteúdo de `docs/TUTORIAL-SUPABASE.md`.

---

## Passo 8: Configurar Backup

```bash
# Gerar chave GPG
gpg --full-generate-key

# Configurar variáveis
export GPG_RECIPIENT=seu@email.com
export RCLONE_REMOTE=backup-edicula

# Testar backup
sudo /opt/scripts/backup.sh
```

---

## Passo 9: Verificar Instalação

### Status dos serviços
```bash
systemctl status openclaw
systemctl status nginx
docker ps
```

### Health check
```bash
/opt/monitoring/health-check.sh
```

### Testar API
```bash
curl http://localhost:18789/api/health
```

---

## Configuração de Produção

### Variáveis Obrigatórias
```bash
# /etc/openclaw/env
OPENROUTER_API_KEY=sk-or-v1-...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
```

### Variáveis Opcionais
```bash
# Backup
GPG_RECIPIENT=admin@seudominio.com
RCLONE_REMOTE=backup-edicula

# Monitoramento  
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
SLACK_WEBHOOK=...
```

---

## Troubleshooting

### OpenClaw não inicia
```bash
journalctl -u openclaw -n 50
```

### Porta já em uso
```bash
lsof -i :18789
```

### Problemas com Docker
```bash
docker logs edicula-openclaw
docker-compose -f /etc/openclaw/docker-compose.yml logs
```

---

## Próximos Passos

1. ✅ Servidor configurado
2. ✅ OpenClaw rodando
3. ☐ Testar API localmente
4. ☐ Configurar domínio
5. ☐ Adicionar usuários
6. ☐ Configurar agentes

---

## Suporte

- Logs: `journalctl -u openclaw -f`
- Backup: `/opt/scripts/backup.sh`
- Restore: `/opt/scripts/restore.sh DATA`
- Documentação: `docs/`

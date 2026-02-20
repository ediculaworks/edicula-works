#!/bin/bash
set -e

echo "============================================"
echo "  SETUP AUTOMÁTICO - EdiculaWorks VPS"
echo "============================================"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

read -p "Domínio (ex: ediculaworks.com): " DOMAIN
read -p "Email para SSL: " EMAIL
read -p "Usuário non-root (padrão: edicula): " USER
USER=${USER:-edicula}

echo ""
echo "Configurando para: $DOMAIN"
echo "Email: $EMAIL"
echo "Usuário: $USER"
echo ""
read -p "Confirma? [s/n] " confirm
if [ "$confirm" != "s" ]; then
    echo "Cancelado."
    exit 0
fi

# ======== 1. Atualizar Sistema ========
echo ""
echo "[1/15] Atualizando sistema..."
apt update && apt upgrade -y
apt install -y curl wget git nano ufw fail2ban

# ======== 2. Criar Usuário ========
echo ""
echo "[2/15] Criando usuário $USER..."
if ! id "$USER" &>/dev/null; then
    adduser --gecos "" $USER
    usermod -aG sudo $USER
    usermod -aG docker $USER 2>/dev/null || true
    echo "Usuário $USER criado!"
else
    echo "Usuário $USER já existe."
fi

# ======== 3. Hardening SSH ========
echo ""
echo "[3/15] Configurando SSH seguro..."
mkdir -p /etc/ssh/sshd_config.d
cat > /etc/ssh/sshd_config.d/99-hardening.conf << 'EOF'
Port 2222
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication no
PermitEmptyPasswords no
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
MaxSessions 10
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
LogLevel VERBOSE
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com
EOF
ssh -t && systemctl restart ssh

# ======== 4. Firewall ========
echo ""
echo "[4/15] Configurando firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw limit 2222/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 123/udp comment 'NTP'
ufw --force enable

# ======== 5. Fail2Ban ========
echo ""
echo "[5/15] Configurando Fail2Ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
ignoreip = 127.0.0.1/8

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF
systemctl enable fail2ban
systemctl start fail2ban

# ======== 6. Docker ========
echo ""
echo "[6/15] Instalando Docker..."
if ! command -v docker &> /dev/null; then
    apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json << 'EOF'
{
    "storage-driver": "overlay2",
    "log-driver": "json-file",
    "log-opts": {"max-size": "10m", "max-file": "3"},
    "live-restore": true,
    "userland-proxy": false,
    "no-new-privileges": true
}
EOF
    systemctl enable docker
    systemctl start docker
    usermod -aG docker $USER
else
    echo "Docker já instalado."
fi

# ======== 7. Clonar Repositório ========
echo ""
echo "[7/15] Clonando repositório..."
mkdir -p /opt/ediculaworks
if [ ! -d "/opt/ediculaworks/.git" ]; then
    read -p "URL do repositório Git: " REPO_URL
    git clone "$REPO_URL" /opt/ediculaworks
else
    echo "Repositório já existe. Pulling..."
    cd /opt/ediculaworks && git pull
fi
chown -R $USER:$USER /opt/ediculaworks

# ======== 8. Configurar Variáveis ========
echo ""
echo "[8/15] Configurando variáveis de ambiente..."
read -p "DATABASE_URL: " DB_URL
read -p "SUPABASE_URL: " SUPA_URL
read -p "SUPABASE_ANON_KEY: " SUPA_KEY
read -p "SUPABASE_SERVICE_KEY: " SUPA_SERVICE
read -p "BETTER_AUTH_SECRET (min 32 chars): " AUTH_SECRET

cat > /opt/ediculaworks/api/.env << EOF
SUPABASE_URL=$SUPA_URL
SUPABASE_ANON_KEY=$SUPA_KEY
SUPABASE_SERVICE_KEY=$SUPA_SERVICE
DATABASE_URL=$DB_URL
BETTER_AUTH_SECRET=$AUTH_SECRET
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=["https://$DOMAIN"]
EOF

cat > /opt/ediculaworks/frontend/.env.local << EOF
DATABASE_URL=$DB_URL
BETTER_AUTH_SECRET=$AUTH_SECRET
BETTER_AUTH_URL=https://$DOMAIN
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXT_PUBLIC_BETTER_AUTH_URL=https://$DOMAIN
EOF

chmod 600 /opt/ediculaworks/api/.env
chmod 600 /opt/ediculaworks/frontend/.env.local

# ======== 9. OpenClaw ========
echo ""
echo "[9/15] Configurando OpenClaw..."
mkdir -p /etc/openclaw
read -p "OPENROUTER_API_KEY: " OPENROUTER_KEY

cat > /etc/openclaw/env << EOF
OPENROUTER_API_KEY=$OPENROUTER_KEY
EOF
chmod 600 /etc/openclaw/env

cat > /etc/openclaw/openclaw.json << 'EOF'
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "openrouter/anthropic/claude-3-haiku",
        "fallbacks": ["openrouter/google/gemini-2.0-flash-001"]
      }
    },
    "list": [
      {"id": "chief", "name": "Chief"},
      {"id": "tech", "name": "Tech Lead"},
      {"id": "gestao", "name": "Gestão"},
      {"id": "financeiro", "name": "Financeiro"},
      {"id": "security", "name": "Security"},
      {"id": "ops", "name": "Ops"}
    ]
  }
}
EOF

# ======== 10. Atualizar Nginx Config ========
echo ""
echo "[10/15] Atualizando configuração do Nginx..."
sed -i "s/ediculaworks.com/$DOMAIN/g" /opt/ediculaworks/config/nginx.conf

# ======== 11. Build Docker ========
echo ""
echo "[11/15] Building containers..."
cd /opt/ediculaworks
docker compose build

# ======== 12. SSL ========
echo ""
echo "[12/15] Configurando SSL..."
apt install -y nginx certbot python3-certbot-nginx
systemctl stop nginx
certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# ======== 13. Nginx ========
echo ""
echo "[13/15] Configurando Nginx..."
cp /opt/ediculaworks/config/nginx.conf /etc/nginx/sites-available/ediculaworks
ln -sf /etc/nginx/sites-available/ediculaworks /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl start nginx

# ======== 14. Iniciar Containers ========
echo ""
echo "[14/15] Iniciando containers..."
docker compose up -d

# ======== 15. Configurar Auto-renovação SSL ========
echo ""
echo "[15/15] Configurando auto-renovação SSL..."
systemctl enable certbot.timer
systemctl start certbot.timer

# ======== Backup Automatizado ========
echo ""
echo "Configurando backup automatizado..."
chmod +x /opt/ediculaworks/scripts/*.sh 2>/dev/null || true
(crontab -l 2>/dev/null | grep -v "backup.sh"; echo "0 3 * * * /opt/ediculaworks/scripts/backup.sh >> /var/log/backup.log 2>&1") | crontab -

# ======== Atualizações Automáticas ========
echo ""
echo "Configurando atualizações automáticas..."
apt install -y unattended-upgrades
echo "unattended-upgrades unattended-upgrades/enable_auto_updates boolean true" | debconf-set-selections
dpkg-reconfigure -f noninteractive unattended-upgrades

# ======== Resumo ========
echo ""
echo "============================================"
echo "  SETUP CONCLUÍDO!"
echo "============================================"
echo ""
echo "DOMÍNIO: https://$DOMAIN"
echo ""
echo "SERVIÇOS ATIVOS:"
echo "  - Docker: $(docker --version)"
echo "  - Nginx: $(nginx -v 2>&1)"
echo "  - Fail2Ban: $(systemctl is-active fail2ban)"
echo "  - Firewall: $(ufw status | head -1)"
echo ""
echo "PRÓXIMOS PASSOS:"
echo "  1. Configure DNS: A record -> $(curl -s ifconfig.me)"
echo "  2. Acesse: https://$DOMAIN"
echo "  3. Login: admin@ediculaworks.com / EdiculaWorks@2024"
echo "  4. ALTERE A SENHA!"
echo ""
echo "ACESSO SSH:"
echo "  ssh -p 2222 $USER@$(curl -s ifconfig.me)"
echo ""
echo "Configure sua chave SSH AGVA:"
echo "  ssh-copy-id -p 2222 $USER@$(curl -s ifconfig.me)"
echo ""
echo "============================================"

# Setup Completo VPS - EdiculaWorks

Guia passo-a-passo para configurar a VPS do zero.

---

## Informações do Servidor

| Item | Valor |
|------|-------|
| IP | 31.97.164.206 |
| OS | Ubuntu 24.04 |
| RAM | 4GB |
| CPU | 2 vCPU |
| Usuário inicial | root |

---

## Passo 1: Conectar ao Servidor

No seu computador (Windows PowerShell ou Terminal):

```bash
ssh root@31.97.164.206
```

Digite a senha quando solicitado.

---

## Passo 2: Atualizar Sistema

```bash
apt update && apt upgrade -y
apt install -y curl wget git nano ufw fail2ban
```

---

## Passo 3: Criar Usuário Non-Root

**NÃO pule este passo.** É essencial para segurança.

```bash
# Criar usuário
adduser edicula

# Adicionar ao grupo sudo
usermod -aG sudo edicula

# Copiar arquivos de configuração
rsync --archive --chown=edicula:edicula ~/.ssh /home/edicula
```

Defina uma senha forte para o usuário `edicula`.

---

## Passo 4: Configurar Chave SSH

**No seu computador** (não na VPS):

```bash
# Gerar chave SSH (se não tiver uma)
ssh-keygen -t ed25519 -C "seu@email.com"

# Copiar chave para VPS
ssh-copy-id edicula@31.97.164.206
```

**De volta na VPS** (como root):

```bash
# Testar login com o novo usuário
su - edicula

# Verificar se a chave está configurada
cat ~/.ssh/authorized_keys

# Se funcionou, voltar ao root
exit
```

---

## Passo 5: Hardening SSH

```bash
# Backup da configuração original
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Criar configuração segura
cat > /etc/ssh/sshd_config.d/99-hardening.conf << 'EOF'
# Porta alternativa (evita bots na porta 22)
Port 2222

# Desabilitar login root
PermitRootLogin no

# Apenas autenticação por chave
PubkeyAuthentication yes
PasswordAuthentication no
PermitEmptyPasswords no

# Timeout de sessão
ClientAliveInterval 300
ClientAliveCountMax 2

# Limitar tentativas
MaxAuthTries 3
MaxSessions 10

# Desabilitar encaminhamentos
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no

# Logs detalhados
LogLevel VERBOSE

# Criptografia forte
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com
EOF

# Verificar configuração
sshd -t

# Reiniciar SSH
systemctl restart sshd
```

---

## Passo 6: Configurar Firewall

```bash
# Resetar regras existentes
ufw --force reset

# Políticas padrão (negar entrada, permitir saída)
ufw default deny incoming
ufw default allow outgoing

# SSH na nova porta (com rate limiting)
ufw limit 2222/tcp comment 'SSH'

# HTTP e HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# NTP (necessário para SSL)
ufw allow 123/udp comment 'NTP'

# Ativar firewall
ufw --force enable

# Verificar regras
ufw status numbered
```

---

## Passo 7: Configurar Fail2Ban

```bash
cat > /etc/fail2ban/jail.local << 'EOF'
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
```

---

## Passo 8: Instalar Docker

```bash
# Instalar dependências
apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Adicionar repositório Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Configurar Docker com segurança
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
    "storage-driver": "overlay2",
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "live-restore": true,
    "userland-proxy": false,
    "no-new-privileges": true
}
EOF

# Iniciar Docker
systemctl enable docker
systemctl start docker

# Adicionar usuário edicula ao grupo docker
usermod -aG docker edicula

# Verificar instalação
docker --version
docker compose version
```

---

## Passo 9: Clonar Repositório

```bash
# Criar diretório
mkdir -p /opt/ediculaworks
cd /opt/ediculaworks

# Clonar repositório
git clone https://github.com/seu-repo/EdiculaWorks.git .

# Ajustar permissões
chown -R edicula:edicula /opt/ediculaworks
```

---

## Passo 10: Configurar Variáveis de Ambiente

```bash
# Criar arquivo de ambiente para a API
cat > /opt/ediculaworks/api/.env << 'EOF'
# Supabase
SUPABASE_URL=https://blipomkndlrewoftvjao.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaXBvbWtuZGxyZXdvZnR2amFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODE4MjAsImV4cCI6MjA4NTY1NzgyMH0.uJB3_OHR2wMrALSSj7S_uNI_F8yjo3MLVaBsyjQ-oXE
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaXBvbWtuZGxyZXdvZnR2amFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA4MTgyMCwiZXhwIjoyMDg1NjU3ODIwfQ.fMBPEqq0IjVNkU25OqiAzvm4vkBr1hJDrBQ4_K-O6HE

# Database
DATABASE_URL=postgresql://postgres.blipomkndlrewoftvjao:lLCpckkKykNBZFCE@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Better Auth
BETTER_AUTH_SECRET=ediculaworks-secret-key-min-32-characters-1234567890

# API
PORT=8000
HOST=0.0.0.0

# CORS
CORS_ORIGINS=["https://ediculaworks.com"]
EOF

# Criar arquivo de ambiente para o Frontend
cat > /opt/ediculaworks/frontend/.env.local << 'EOF'
# Database
DATABASE_URL=postgresql://postgres.blipomkndlrewoftvjao:lLCpckkKykNBZFCE@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Better Auth
BETTER_AUTH_SECRET=ediculaworks-secret-key-min-32-characters-1234567890
BETTER_AUTH_URL=https://ediculaworks.com

# API
NEXT_PUBLIC_API_URL=https://ediculaworks.com/api
NEXT_PUBLIC_BETTER_AUTH_URL=https://ediculaworks.com
EOF

# Proteger arquivos
chmod 600 /opt/ediculaworks/api/.env
chmod 600 /opt/ediculaworks/frontend/.env.local
```

---

## Passo 11: Configurar OpenClaw

```bash
# Criar diretório de configuração
mkdir -p /etc/openclaw

# Criar arquivo de ambiente
cat > /etc/openclaw/env << 'EOF'
OPENROUTER_API_KEY=SUA_CHAVE_AQUI
EOF

chmod 600 /etc/openclaw/env

# Criar config do OpenClaw
cat > /etc/openclaw/openclaw.json << 'EOF'
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "openrouter/anthropic/claude-3-haiku",
        "fallbacks": [
          "openrouter/google/gemini-2.0-flash-001"
        ]
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
```

---

## Passo 12: Fazer Build e Iniciar

```bash
cd /opt/ediculaworks

# Build das imagens
docker compose build

# Iniciar containers
docker compose up -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f
```

---

## Passo 13: Instalar Nginx e SSL

```bash
# Instalar Nginx e Certbot
apt install -y nginx certbot python3-certbot-nginx

# Parar Nginx temporariamente
systemctl stop nginx

# Obter certificado SSL (substitua pelo seu domínio)
certbot certonly --standalone -d ediculaworks.com -d www.ediculaworks.com

# Copiar configuração do projeto
cp /opt/ediculaworks/config/nginx.conf /etc/nginx/sites-available/ediculaworks

# Editar domínio no arquivo
nano /etc/nginx/sites-available/ediculaworks
# Substitua ediculaworks.com pelo seu domínio

# Ativar site
ln -sf /etc/nginx/sites-available/ediculaworks /etc/nginx/sites-enabled/

# Remover site padrão
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Iniciar Nginx
systemctl enable nginx
systemctl start nginx
```

---

## Passo 14: Configurar Auto-renovação SSL

```bash
# Testar renovação
certbot renew --dry-run

# O Certbot já configura o timer automaticamente
systemctl enable certbot.timer
systemctl start certbot.timer
```

---

## Passo 15: Configurar Backup Automatizado

```bash
# Tornar scripts executáveis
chmod +x /opt/ediculaworks/scripts/*.sh

# Configurar cron para backup diário às 3h
(crontab -l 2>/dev/null | grep -v "backup.sh"; echo "0 3 * * * /opt/ediculaworks/scripts/backup.sh >> /var/log/backup.log 2>&1") | crontab -

# Verificar
crontab -l
```

---

## Passo 16: Atualizações Automáticas de Segurança

```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

---

## Passo 17: Testar Conexão

No seu computador:

```bash
# Conectar com novo usuário e porta
ssh -p 2222 edicula@31.97.164.206

# Verificar serviços
sudo docker compose ps
sudo systemctl status nginx
sudo ufw status
```

---

## Passo 18: Configurar DNS

No seu provedor de domínio, configure:

| Tipo | Nome | Valor |
|------|------|-------|
| A | @ | 31.97.164.206 |
| A | www | 31.97.164.206 |

---

## Resumo Final

### Portas Abertas

| Porta | Serviço | Acesso |
|-------|---------|--------|
| 2222 | SSH | Apenas chaves autorizadas |
| 80 | HTTP | Redireciona para HTTPS |
| 443 | HTTPS | Aplicação |

### Comandos Úteis

```bash
# Status dos containers
docker compose ps

# Logs
docker compose logs -f api
docker compose logs -f frontend

# Reiniciar serviços
docker compose restart

# Atualizar aplicação
cd /opt/ediculaworks
git pull
docker compose up -d --build

# Status do firewall
sudo ufw status

# Status do Fail2Ban
sudo fail2ban-client status

# Verificar SSL
curl -I https://ediculaworks.com
```

### Credenciais Iniciais

- **Login:** admin@ediculaworks.com
- **Senha:** EdiculaWorks@2024

**ALTERE A SENHA APÓS PRIMEIRO LOGIN!**

---

## Troubleshooting

### Container não inicia

```bash
docker compose logs nome_do_servico
```

### Erro de SSL

```bash
certbot certificates
certbot renew --force-renewal
```

### Acesso SSH bloqueado

```bash
# Conectar via console do provedor VPS
sudo fail2ban-client unban-all
sudo ufw status
```

### Reverter configuração SSH

```bash
sudo cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
sudo systemctl restart sshd
```

---

## Próximos Passos

1. Configurar domínio DNS
2. Obter certificado SSL
3. Adicionar chave API do OpenRouter em `/etc/openclaw/env`
4. Reiniciar containers: `docker compose restart openclaw`
5. Fazer login e alterar senha padrão
6. Configurar OAuth (Google/GitHub) se desejado

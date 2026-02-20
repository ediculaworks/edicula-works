#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PROJECT_DIR="/opt/ediculaworks"
DOMAIN="edicula.publicvm.com"
EMAIL="admin@edicula.publicvm.com"
USER="edicula"
SSH_PORT=2222

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

usage() {
    echo "EdiculaWorks Setup - Uso: $0 [opção]"
    echo ""
    echo "Opções:"
    echo "  all           Executar setup completo"
    echo "  1             Atualizar sistema"
    echo "  2             Criar usuário"
    echo "  3             Configurar SSH"
    echo "  4             Configurar Firewall"
    echo "  5             Instalar Docker"
    echo "  6             Clonar Repositório"
    echo "  7             Configurar Variáveis de Ambiente"
    echo "  8             Configurar OpenClaw"
    echo "  9             Build Docker"
    echo "  10            Configurar SSL"
    echo "  11            Configurar Nginx"
    echo "  12            Iniciar Containers"
    echo "  13            Configurar Chave SSH"
    echo "  status        Ver status dos serviços"
    echo "  restart       Reiniciar serviços"
    echo ""
    exit 0
}

if [ $# -eq 0 ]; then
    usage
fi

[ "$EUID" -eq 0 ] || { log_error "Execute como root"; exit 1; }

MODULE="$1"

run_module() {
    local num="$1"
    local name="$2"
    local func="$3"
    
    log_info "[$num/$12] $name"
    
    case "$num" in
        1)  apt update && apt upgrade -y
            apt install -y curl wget git nano ufw fail2ban ca-certificates gnupg lsb-release
            ;;
        2)  if ! id "$USER" &>/dev/null; then
                adduser --gecos "" "$USER"
                usermod -aG sudo "$USER"
                usermod -aG docker "$USER" 2>/dev/null || true
            fi
            ;;
        3)  mkdir -p /etc/ssh/sshd_config.d
            cat > /etc/ssh/sshd_config.d/99-hardening.conf << 'EOF'
Port 2222
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication no
ClientAliveInterval 300
MaxAuthTries 3
X11Forwarding no
AllowTcpForwarding no
LogLevel VERBOSE
EOF
            ssh -t && systemctl restart ssh
            ;;
        4)  ufw --force reset
            ufw default deny incoming
            ufw default allow outgoing
            ufw limit $SSH_PORT/tcp comment 'SSH'
            ufw allow 80/tcp && ufw allow 443/tcp
            ufw --force enable
            ;;
        5)  if ! command -v docker &> /dev/null; then
                curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list
                apt update && apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
                systemctl enable docker && systemctl start docker
                usermod -aG docker "$USER"
            fi
            ;;
        6)  mkdir -p "$PROJECT_DIR"
            if [ ! -d "$PROJECT_DIR/.git" ]; then
                read -p "Git URL: " REPO_URL
                git clone "$REPO_URL" "$PROJECT_DIR"
            else
                cd "$PROJECT_DIR"
                git config --global --add safe.directory "$PROJECT_DIR"
                git pull
            fi
            chown -R "$USER:$USER" "$PROJECT_DIR"
            ;;
        7)  if [ ! -f "$PROJECT_DIR/api/.env" ]; then
                read -p "DATABASE_URL (ENTER=padrão): " DB_URL
                DB_URL=${DB_URL:-postgresql://postgres:lLCpckkKykNBZFCE@db.blipomkndlrewoftvjao.supabase.co:5432/postgres}
                read -p "SUPABASE_URL (ENTER=padrão): " SUPA_URL
                SUPA_URL=${SUPA_URL:-https://blipomkndlrewoftvjao.supabase.co}
                read -p "SUPABASE_ANON_KEY (ENTER=padrão): " SUPA_KEY
                SUPA_KEY=${SUPA_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaXBvbWtuZGxyZXdvZnR2amFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODE4MjAsImV4cCI6MjA4NTY1NzgyMH0.uJB3_OHR2wMrALSSj7S_uNI_F8yjo3MLVaBsyjQ-oXE}
                read -p "SUPABASE_SERVICE_KEY (ENTER=padrão): " SUPA_SERVICE
                SUPA_SERVICE=${SUPA_SERVICE:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaXBvbWtuZGxyZXdvZnR2amFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA4MTgyMCwiZXhwIjoyMDg1NjU3ODIwfQ.fMBPEqq0IjVNkU25OqiAzvm4vkBr1hJDrBQ4_K-O6HE}
                read -p "BETTER_AUTH_SECRET (ENTER=padrão): " AUTH_SECRET
                AUTH_SECRET=${AUTH_SECRET:-ediculaworks-secret-key-min-32-characters-1234567890}
                
                cat > "$PROJECT_DIR/api/.env" << ENVEOF
SUPABASE_URL=$SUPA_URL
SUPABASE_ANON_KEY=$SUPA_KEY
SUPABASE_SERVICE_KEY=$SUPA_SERVICE
DATABASE_URL=$DB_URL
BETTER_AUTH_SECRET=$AUTH_SECRET
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=["https://$DOMAIN"]
ENVEOF
                cat > "$PROJECT_DIR/frontend/.env.local" << ENVEOF
BETTER_AUTH_SECRET=$AUTH_SECRET
BETTER_AUTH_URL=https://$DOMAIN
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_BETTER_AUTH_URL=https://$DOMAIN
ENVEOF
                chmod 600 "$PROJECT_DIR/api/.env" "$PROJECT_DIR/frontend/.env.local"
            fi
            ;;
        8)  mkdir -p /etc/openclaw
            if [ ! -f "/etc/openclaw/env" ]; then
                read -p "OPENROUTER_API_KEY: " OPENROUTER_KEY
                cat > /etc/openclaw/env << EOF
OPENROUTER_API_KEY=$OPENROUTER_KEY
EOF
                chmod 600 /etc/openclaw/env
            fi
            cat > /etc/openclaw/openclaw.json << 'EOF'
{"agents":{"defaults":{"model":{"primary":"openrouter/anthropic/claude-3-haiku"}},"list":[{"id":"chief","name":"Chief"},{"id":"tech","name":"Tech Lead"},{"id":"gestao","name":"Gestão"},{"id":"financeiro","name":"Financeiro"},{"id":"security","name":"Security"},{"id":"ops","name":"Ops"}]}}
EOF
            ;;
        9)  cd "$PROJECT_DIR" && docker compose build ;;
        10) apt install -y nginx certbot python3-certbot-nginx
            if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
                systemctl stop nginx
                certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive
            fi
            systemctl enable certbot.timer
            ;;
        11) mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
            sed -i "s/ediculaworks.com/$DOMAIN/g" "$PROJECT_DIR/config/nginx.conf"
            cp "$PROJECT_DIR/config/nginx.conf" /etc/nginx/sites-available/ediculaworks
            ln -sf /etc/nginx/sites-available/ediculaworks /etc/nginx/sites-enabled/
            rm -f /etc/nginx/sites-enabled/default
            nginx -t && systemctl enable nginx && systemctl restart nginx
            ;;
        12) cd "$PROJECT_DIR" && docker compose up -d
            log_info "Containers iniciados"
            docker compose ps
            ;;
        13) log_info "Configurando chave SSH..."
            mkdir -p /home/$USER/.ssh
            chmod 700 /home/$USER/.ssh
            
            if [ ! -f "/home/$USER/.ssh/authorized_keys" ]; then
                read -p "Cole sua chave SSH pública: " SSH_KEY
                echo "$SSH_KEY" > /home/$USER/.ssh/authorized_keys
            fi
            
            chmod 600 /home/$USER/.ssh/authorized_keys
            chown -R $USER:$USER /home/$USER/.ssh
            
            log_info "Chave SSH configurada ✓"
            ;;
    esac
    
    log_info "$name ✓"
}

case "$MODULE" in
    all)
        for i in $(seq 1 13); do
            run_module $i "Step $i" func
        done
        log_info "Setup completo!"
        ;;
    status)
        log_info "Docker: $(systemctl is-active docker 2>/dev/null || echo 'inativo')"
        log_info "Nginx: $(systemctl is-active nginx 2>/dev/null || echo 'inativo')"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        ;;
    restart)
        systemctl restart docker nginx 2>/dev/null || true
        cd "$PROJECT_DIR" && docker compose restart 2>/dev/null || true
        ;;
    *)
        if [[ "$MODULE" =~ ^[0-9]+$ ]]; then
            run_module "$MODULE" "Module $MODULE" func
        else
            log_error "Opção inválida"
            usage
        fi
        ;;
esac

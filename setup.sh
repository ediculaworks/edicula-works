#!/bin/bash
set -e

PROJECT_DIR="/opt/ediculaworks"
DOMAIN="edihub.work.gd"
REPO_URL="https://github.com/ediculaworks/edicula-works.git"

# Credenciais (hardcoded para facilitar)
DB_URL="postgresql://postgres:lLCpckkKykNBZFCE@db.blipomkndlrewoftvjao.supabase.co:5432/postgres"
SUPA_URL="https://blipomkndlrewoftvjao.supabase.co"
SUPA_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaXBvbWtuZGxyZXdvZnR2amFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODE4MjAsImV4cCI6MjA4NTY1NzgyMH0.uJB3_OHR2wMrALSSj7S_uNI_F8yjo3MLVaBsyjQ-oXE"
SUPA_SERVICE="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaXBvbWtuZGxyZXdvZnR2amFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA4MTgyMCwiZXhwIjoyMDg1NjU3ODIwfQ.fMBPEqq0IjVNkU25OqiAzvm4vkBr1hJDrBQ4_K-O6HE"
AUTH_SECRET="ediculaworks-secret-key-min-32-characters-1234567890"

GREEN='\033[0;32m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }

if [ "$EUID" -ne 0 ]; then
   echo "Execute como root"
   exit 1
fi

case "$1" in
    all|install)
        log_info "=== INSTALAÇÃO EDICULAWORKS ==="
        
        # 1. Atualizar sistema e instalar Docker
        log_info "1/5 - Atualizando sistema..."
        apt update && apt upgrade -y
        apt install -y curl wget git nano
        
        if ! command -v docker &> /dev/null; then
            log_info "Instalando Docker..."
            curl -fsSL https://get.docker.com | sh
            systemctl enable docker
            systemctl start docker
        fi
        
        # 2. Clonar repositório
        log_info "2/5 - Clonando repositório..."
        mkdir -p "$PROJECT_DIR"
        if [ ! -d "$PROJECT_DIR/.git" ]; then
            git clone "$REPO_URL" "$PROJECT_DIR"
        else
            cd "$PROJECT_DIR" && git pull
        fi
        
        # 3. Criar variáveis de ambiente
        log_info "3/5 - Criando variáveis de ambiente..."
        
        cat > "$PROJECT_DIR/api/.env" << EOF
SUPABASE_URL=$SUPA_URL
SUPABASE_ANON_KEY=$SUPA_KEY
SUPABASE_SERVICE_KEY=$SUPA_SERVICE
DATABASE_URL=$DB_URL
BETTER_AUTH_SECRET=$AUTH_SECRET
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=["http://$DOMAIN"]
EOF
        
        cat > "$PROJECT_DIR/frontend/.env.local" << EOF
DATABASE_URL=$DB_URL
BETTER_AUTH_SECRET=$AUTH_SECRET
BETTER_AUTH_URL=http://$DOMAIN
NEXT_PUBLIC_API_URL=http://$DOMAIN/api
NEXT_PUBLIC_BETTER_AUTH_URL=http://$DOMAIN
EOF
        
        chmod 600 "$PROJECT_DIR/api/.env" "$PROJECT_DIR/frontend/.env.local"
        
        # 4. Build Docker
        log_info "4/5 - Build Docker..."
        cd "$PROJECT_DIR"
        docker compose build
        
        # 5. Nginx + Iniciar
        log_info "5/5 - Configurando Nginx..."
        
        # Usar config HTTP simples
        cat > /etc/nginx/sites-available/ediculaworks << 'NGINX'
server {
    listen 80;
    server_name edihub.work.gd www.edihub.work.gd;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX
        
        ln -sf /etc/nginx/sites-available/ediculaworks /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        nginx -t && systemctl enable nginx && systemctl restart nginx
        
        # Iniciar containers
        docker compose up -d
        
        log_info "=== INSTALAÇÃO CONCLUÍDA ==="
        echo ""
        echo "Acesse: http://$DOMAIN"
        echo ""
        docker compose ps
        ;;
        
    restart)
        cd "$PROJECT_DIR" && docker compose restart
        systemctl restart nginx
        ;;
        
    stop)
        cd "$PROJECT_DIR" && docker compose stop
        systemctl stop nginx
        ;;
        
    status)
        echo "=== STATUS ==="
        systemctl is-active docker && echo "Docker: OK" || echo "Docker: PARADO"
        systemctl is-active nginx && echo "Nginx: OK" || echo "Nginx: PARADO"
        cd "$PROJECT_DIR" && docker compose ps
        ;;
        
    pull)
        cd "$PROJECT_DIR"
        git pull
        docker compose build
        docker compose up -d
        ;;
        
    logs)
        cd "$PROJECT_DIR" && docker compose logs -f
        ;;
        
    *)
        echo "EdiculaWorks Setup"
        echo ""
        echo "用法 (Usage):"
        echo "  $0 install     - Instalação completa"
        echo "  $0 restart     - Reiniciar containers"
        echo "  $0 stop        - Parar containers"
        echo "  $0 status      - Ver status"
        echo "  $0 pull        - Atualizar código"
        echo "  $0 logs        - Ver logs"
        echo ""
        ;;
esac

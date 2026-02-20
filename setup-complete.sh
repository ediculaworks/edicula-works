#!/bin/bash
set -e

echo "============================================"
echo "  SETUP VPS - PASSOS RESTANTES"
echo "  Domínio: edicula.publicvm.com"
echo "============================================"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root"
    exit 1
fi

PROJECT_DIR="/opt/ediculaworks"
DOMAIN="edicula.publicvm.com"
EMAIL="admin@edicula.publicvm.com"

# ======== 1. Atualizar código ========
echo ""
echo "[1/6] Atualizando código..."
cd $PROJECT_DIR
git pull
echo "   ✓ Código atualizado"

# ======== 2. Build ========
echo ""
echo "[2/6] Building containers..."
docker compose build --no-cache
echo "   ✓ Build concluído"

# ======== 3. Iniciar containers ========
echo ""
echo "[3/6] Iniciando containers..."
docker compose up -d
echo "   ✓ Containers iniciados"

# ======== 4. Aguardar saúde ========
echo ""
echo "[4/6] Aguardando containers..."
sleep 15
for i in {1..20}; do
    API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ 2>/dev/null || echo "000")
    if [ "$API_HEALTH" = "200" ]; then
        echo "   ✓ API saudável"
        break
    fi
    echo "   Aguardando API... ($i/20)"
    sleep 5
done

# ======== 5. Nginx e SSL ========
echo ""
echo "[5/6] Instalando Nginx e SSL..."
apt install -y nginx certbot python3-certbot-nginx > /dev/null 2>&1

# Parar nginx para obter certificado
systemctl stop nginx > /dev/null 2>&1 || true

# Obter certificado SSL
echo "   Obtendo certificado SSL..."
certbot certonly --standalone -d $DOMAIN --email $EMAIL --agree-tos --non-interactive
echo "   ✓ SSL obtido"

# Configurar nginx
echo "   Configurando Nginx..."
cp $PROJECT_DIR/config/nginx.conf /etc/nginx/sites-available/ediculaworks
ln -sf /etc/nginx/sites-available/ediculaworks /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar e iniciar
nginx -t
systemctl enable nginx > /dev/null 2>&1
systemctl start nginx
echo "   ✓ Nginx configurado"

# ======== 6. Auto-renovação SSL ========
echo ""
echo "[6/6] Configurando auto-renovação SSL..."
systemctl enable certbot.timer > /dev/null 2>&1
systemctl start certbot.timer > /dev/null 2>&1
echo "   ✓ Auto-renovação ativada"

# ======== Status ========
echo ""
echo "============================================"
echo "  STATUS DOS CONTAINERS"
echo "============================================"
docker compose ps

# ======== Resumo ========
echo ""
echo "============================================"
echo "  SETUP CONCLUÍDO!"
echo "============================================"
echo ""
echo "  Acesse: https://$DOMAIN"
echo ""
echo "  Login: admin@ediculaworks.com"
echo "  Senha: EdiculaWorks@2024"
echo ""
echo "  ⚠️  ALTERE A SENHA APÓS O LOGIN!"
echo ""
echo "============================================"
echo ""
echo "Para configurar SSH seguro:"
echo "  bash $PROJECT_DIR/setup-ssh.sh"
echo ""

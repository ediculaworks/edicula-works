#!/bin/bash
set -e

echo "============================================"
echo "  SETUP VPS - EdiculaWorks"
echo "  Domínio: edicula.publicvm.com"
echo "============================================"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

# ======== CONFIGURAÇÕES ========
OPENROUTER_KEY="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"
DOMAIN="edicula.publicvm.com"
EMAIL="admin@edicula.publicvm.com"
PROJECT_DIR="/opt/ediculaworks"

# ======== PASSO 6: OpenClaw ========
echo ""
echo "[1/8] Configurando OpenClaw..."
mkdir -p /etc/openclaw

cat > /etc/openclaw/env << EOF
OPENROUTER_API_KEY=$OPENROUTER_KEY
EOF
chmod 600 /etc/openclaw/env

cat > /etc/openclaw/openclaw.json << 'EOF'
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "openrouter/free"
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
echo "   ✓ OpenClaw configurado"

# ======== PASSO 7: Firewall ========
echo ""
echo "[2/8] Configurando Firewall..."
ufw --force reset > /dev/null 2>&1
ufw default deny incoming > /dev/null 2>&1
ufw default allow outgoing > /dev/null 2>&1
ufw limit 22/tcp comment 'SSH' > /dev/null 2>&1
ufw allow 80/tcp comment 'HTTP' > /dev/null 2>&1
ufw allow 443/tcp comment 'HTTPS' > /dev/null 2>&1
ufw allow 123/udp comment 'NTP' > /dev/null 2>&1
ufw --force enable > /dev/null 2>&1
echo "   ✓ Firewall ativo"

# ======== PASSO 8: Build ========
echo ""
echo "[3/8] Building containers (pode demorar 5-10 min)..."
cd $PROJECT_DIR
docker compose build
echo "   ✓ Build concluído"

# ======== PASSO 9: Iniciar Containers ========
echo ""
echo "[4/8] Iniciando containers..."
docker compose up -d
echo "   ✓ Containers iniciados"

# ======== Aguardar saúde dos containers ========
echo ""
echo "[5/8] Aguardando containers ficarem saudáveis..."
sleep 10
for i in {1..30}; do
    if docker compose ps | grep -q "healthy\|running"; then
        echo "   ✓ Containers saudáveis"
        break
    fi
    echo "   Aguardando... ($i/30)"
    sleep 5
done

# ======== PASSO 11: Nginx e SSL ========
echo ""
echo "[6/8] Instalando Nginx e Certbot..."
apt install -y nginx certbot python3-certbot-nginx > /dev/null 2>&1

echo "   Obtendo certificado SSL..."
systemctl stop nginx > /dev/null 2>&1 || true
certbot certonly --standalone -d $DOMAIN --email $EMAIL --agree-tos --non-interactive
echo "   ✓ Certificado SSL obtido"

echo "   Configurando Nginx..."
cp $PROJECT_DIR/config/nginx.conf /etc/nginx/sites-available/ediculaworks
ln -sf /etc/nginx/sites-available/ediculaworks /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx > /dev/null 2>&1
systemctl start nginx
echo "   ✓ Nginx configurado"

# ======== PASSO 12: Restart nginx container ========
echo ""
echo "[7/8] Reiniciando nginx no Docker..."
docker compose restart nginx > /dev/null 2>&1
echo "   ✓ Nginx reiniciado"

# ======== Status Final ========
echo ""
echo "[8/8] Verificando status..."
echo ""
docker compose ps
echo ""

# ======== RESUMO ========
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
echo "  ⚠️  ALTERE A SENHA APÓS PRIMEIRO LOGIN!"
echo ""
echo "============================================"
echo ""
echo "Próximo passo recomendado: Configurar SSH seguro"
echo "Execute: bash $PROJECT_DIR/setup-ssh.sh"
echo ""

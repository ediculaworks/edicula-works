#!/bin/bash
set -e

echo "============================================"
echo "  INSTALAR OPENCLAW DIRETAMENTE"
echo "============================================"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root"
    exit 1
fi

# ======== 1. Instalar Node.js ========
echo ""
echo "[1/4] Instalando Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo "   ✓ Node.js instalado: $(node --version)"
else
    echo "   ✓ Node.js já instalado: $(node --version)"
fi

# ======== 2. Criar usuário openclaw ========
echo ""
echo "[2/4] Criando usuário openclaw..."
if ! id "openclaw" &>/dev/null; then
    useradd -r -s /bin/bash -c "OpenClaw user" openclaw
    echo "   ✓ Usuário criado"
else
    echo "   ✓ Usuário já existe"
fi

# ======== 3. Instalar OpenClaw ========
echo ""
echo "[3/4] Instalando OpenClaw..."
npm install -g openclaw
echo "   ✓ OpenClaw instalado"

# ======== 4. Configurar ========
echo ""
echo "[4/4] Configurando OpenClaw..."
mkdir -p /etc/openclaw
mkdir -p /var/lib/openclaw
mkdir -p /var/log/openclaw

chown -R openclaw:openclaw /var/lib/openclaw
chown -R openclaw:openclaw /var/log/openclaw

# Criar systemd service
cat > /etc/systemd/system/openclaw.service << 'EOF'
[Unit]
Description=OpenClaw AI Agent
After=network.target

[Service]
Type=simple
User=openclaw
Group=openclaw
WorkingDirectory=/var/lib/openclaw
EnvironmentFile=/etc/openclaw/env
ExecStart=/usr/bin/openclaw start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable openclaw
echo "   ✓ Serviço configurado"

# ======== Resumo ========
echo ""
echo "============================================"
echo "  OPENCLAW INSTALADO!"
echo "============================================"
echo ""
echo "Configuração:"
echo "  1. Edite /etc/openclaw/env com sua API key"
echo "  2. Execute: openclaw onboard"
echo "  3. Inicie: systemctl start openclaw"
echo ""
echo "Comandos úteis:"
echo "  systemctl status openclaw"
echo "  journalctl -u openclaw -f"
echo ""

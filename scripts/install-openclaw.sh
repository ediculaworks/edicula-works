#!/bin/bash
set -e

echo "=== Instalando OpenClaw com Segurança ==="

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

echo "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "Node.js não encontrado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt install -y nodejs
fi

NODE_VERSION=$(node --version)
echo "Node.js detectado: $NODE_VERSION"

echo "Instalando OpenClaw..."
npm install -g openclaw@latest

echo "Verificando instalação..."
openclaw --version

echo "Criando usuário dedicado..."
if ! id "openclaw" &>/dev/null; then
    useradd -r -s /bin/false -c "OpenClaw service user" openclaw
fi

echo "Criando diretório de configuração..."
mkdir -p /etc/openclaw
chown openclaw:openclaw /etc/openclaw

echo "Criando arquivo de configuração segura..."
cat > /etc/openclaw/openclaw.json <<'EOF'
{
  "gateway": {
    "bind": "127.0.0.1",
    "port": 18789,
    "auth": {
      "mode": "password",
      "password": "CHANGE_ME",
      "allowTailscale": true
    }
  },
  "agent": {
    "model": "openrouter/anthropic/claude-3-haiku",
    "systemPrompt": "Você é o assistente IA da EdiculaWorks, uma empresa de tecnologia."
  },
  "models": {
    "providers": [
      {
        "name": "openrouter",
        "apiKey": "${OPENROUTER_API_KEY}"
      }
    ]
  },
  "channels": {
    "telegram": { "enabled": false, "dmPolicy": "pairing" },
    "discord": { "enabled": false, "dmPolicy": "pairing" }
  },
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "docker",
        "allowlist": ["bash", "read", "write", "edit", "grep", "glob"],
        "denylist": ["browser", "system", "admin"]
      }
    }
  },
  "browser": { "enabled": false }
}
EOF

chmod 640 /etc/openclaw/openclaw.json
chown openclaw:openclaw /etc/openclaw/openclaw.json

echo "Criando serviço systemd seguro..."
cat > /etc/systemd/system/openclaw.service <<'EOF'
[Unit]
Description=OpenClaw Gateway
After=network.target
StartLimitIntervalSec=300
StartLimitBurst=5

[Service]
Type=simple
User=openclaw
Group=openclaw
WorkingDirectory=/var/lib/openclaw
ExecStart=/usr/bin/openclaw gateway --port 18789
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=-/etc/openclaw/env

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/openclaw,/var/log/openclaw
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
RestrictRealtime=true
RestrictNamespaces=true
LockPersonality=true
MemoryDenyWriteExecute=false
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
SystemCallFilter=@system-service
SystemCallErrorNumber=EPERM

[Install]
WantedBy=multi-user.target
EOF

echo "Criando diretórios necessários..."
mkdir -p /var/lib/openclaw /var/log/openclaw
chown -R openclaw:openclaw /var/lib/openclaw /var/log/openclaw

echo "Configurando variáveis de ambiente..."
cat > /etc/openclaw/env <<'EOF'
# Configure sua API Key aqui (NUNCA exponha em texto)
# OPENROUTER_API_KEY=sua_chave_aqui
EOF

chmod 600 /etc/openclaw/env
chown openclaw:openclaw /etc/openclaw/env

echo "Recarregando systemd e iniciando serviço..."
systemctl daemon-reload
systemctl enable openclaw
systemctl start openclaw

echo "Verificando status..."
sleep 3
systemctl status openclaw --no-pager || true

echo ""
echo "=== OpenClaw instalado com segurança! ==="
echo ""
echo "CONFIGURAÇÃO NECESSÁRIA:"
echo "1. Edite /etc/openclaw/env e adicione sua API Key:"
echo "   OPENROUTER_API_KEY=sua_chave_aqui"
echo ""
echo "2. Altere a senha em /etc/openclaw/openclaw.json:"
echo "   gateway.auth.password"
echo ""
echo "3. Recarregue: systemctl reload openclaw"
echo ""
echo "ACESSO:"
echo "  - Local: http://localhost:18789"
echo "  - Via Tailscale: http://IP_TAILSCALE:18789"

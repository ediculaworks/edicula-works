#!/bin/bash
set -e

echo "=== [08] Configurando OpenClaw ==="

mkdir -p /etc/openclaw

if [ ! -f "/etc/openclaw/env" ]; then
    read -p "OPENROUTER_API_KEY: " OPENROUTER_KEY
    
    cat > /etc/openclaw/env << EOF
OPENROUTER_API_KEY=$OPENROUTER_KEY
EOF
    chmod 600 /etc/openclaw/env
fi

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

echo "✓ OpenClaw configurado"

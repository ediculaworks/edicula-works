#!/bin/bash
set -e

echo "============================================"
echo "  Instalador Supabase - EdiculaWorks"
echo "============================================"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

echo "Este script configurará a integração com Supabase."
echo ""

confirm() {
    while true; do
        read -p "$1 [s/n] " yn
        case $yn in
            [Ss] ) return 0;;
            [Nn] ) return 1;;
            * ) echo "Por favor, responda s ou n.";;
        esac
    done
}

echo "=== Configuração do Supabase ==="
echo ""
echo "Você precisa de:"
echo "  1. Conta em supabase.com"
echo "  2. Projeto criado"
echo "  3. URL e ANON KEY do projeto"
echo ""

if ! confirm "Continuar?"; then
    exit 0
fi

echo ""
echo "=== Credenciais ==="
echo ""

read -p "URL do Supabase (https://xxxxx.supabase.co): " SUPABASE_URL
read -p "ANON KEY: " SUPABASE_ANON_KEY
read -p "SERVICE ROLE KEY (opcional, ENTER para pular): " SUPABASE_SERVICE_KEY

echo ""
echo "=== Instalando dependências ==="
apt install -y curl jq

echo "=== Criando diretório de configuração ==="
mkdir -p /etc/openclaw

if [ ! -f /etc/openclaw/env ]; then
    touch /etc/openclaw/env
fi

echo "=== Configurando variáveis de ambiente ==="

grep -v "^SUPABASE" /etc/openclaw/env > /tmp/env.tmp || true
mv /tmp/env.tmp /etc/openclaw/env

cat >> /etc/openclaw/env <<EOF

# Supabase
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

if [ -n "$SUPABASE_SERVICE_KEY" ]; then
    echo "SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY" >> /etc/openclaw/env
fi

chmod 600 /etc/openclaw/env

if id "openclaw" &>/dev/null; then
    chown openclaw:openclaw /etc/openclaw/env
fi

echo "=== Atualizando configuração do OpenClaw ==="

if [ -f /etc/openclaw/openclaw.json ]; then
    TEMP_CONFIG=$(mktemp)
    cat > "$TEMP_CONFIG" <<EOF
{
  "tools": {
    "supabase": {
      "url": "$SUPABASE_URL",
      "anonKey": "$SUPABASE_ANON_KEY"
    }
  }
}
EOF
    
    if command -v jq &> /dev/null; then
        jq -s '.[0] * .[1]' /etc/openclaw/openclaw.json "$TEMP_CONFIG" > /tmp/openclaw_merged.json
        mv /tmp/openclaw_merged.json /etc/openclaw/openclaw.json
    else
        cat "$TEMP_CONFIG" >> /etc/openclaw/openclaw.json
    fi
    rm -f "$TEMP_CONFIG"
else
    cat > /etc/openclaw/openclaw.json <<EOF
{
  "tools": {
    "supabase": {
      "url": "$SUPABASE_URL",
      "anonKey": "$SUPABASE_ANON_KEY"
    }
  }
}
EOF
fi

if id "openclaw" &>/dev/null; then
    chown openclaw:openclaw /etc/openclaw/openclaw.json
    chmod 640 /etc/openclaw/openclaw.json
fi

echo ""
echo "=== Verificando conexão com Supabase ==="
if curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" \
    -H "apikey: $SUPABASE_ANON_KEY" | grep -q "200\|400\|401"; then
    echo "✓ Conexão com Supabase OK!"
else
    echo "⚠ AVISO: Não foi possível verificar conexão"
fi

if systemctl is-active --quiet openclaw 2>/dev/null; then
    echo ""
    echo "=== Reiniciando OpenClaw ==="
    systemctl restart openclaw
    sleep 3
    
    echo ""
    echo "=== Verificando ==="
    if systemctl is-active --quiet openclaw; then
        echo "✓ OpenClaw iniciado com sucesso!"
    else
        echo "⚠ AVISO: OpenClaw pode não ter iniciado corretamente"
        journalctl -u openclaw -n 10 --no-pager
    fi
else
    echo "⚠ OpenClaw não está instalado. Configure manualmente após instalar."
fi

echo ""
echo "=== Supabase configurado! ==="
echo ""
echo "URL: $SUPABASE_URL"
echo ""
echo "Próximos passos:"
echo "  1. Acesse o painel do Supabase"
echo "  2. Execute o schema SQL em docs/TUTORIAL-SUPABASE.md"
echo "  3. Teste a conexão"
echo ""

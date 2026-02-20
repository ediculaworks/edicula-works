#!/bin/bash
set -e

echo "=== [07] Configurando Variáveis de Ambiente ==="

if [ ! -f "$PROJECT_DIR/api/.env" ]; then
    read -p "DATABASE_URL: " DB_URL
    read -p "SUPABASE_URL: " SUPA_URL
    read -p "SUPABASE_ANON_KEY: " SUPA_KEY
    read -p "SUPABASE_SERVICE_KEY: " SUPA_SERVICE
    read -p "BETTER_AUTH_SECRET (min 32 chars): " AUTH_SECRET
else
    echo "Arquivo .env já existe, pulando..."
    return 0
fi

cat > "$PROJECT_DIR/api/.env" << EOF
SUPABASE_URL=$SUPA_URL
SUPABASE_ANON_KEY=$SUPA_KEY
SUPABASE_SERVICE_KEY=$SUPA_SERVICE
DATABASE_URL=$DB_URL
BETTER_AUTH_SECRET=$AUTH_SECRET
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=["https://$DOMAIN"]
EOF

cat > "$PROJECT_DIR/frontend/.env.local" << EOF
DATABASE_URL=$DB_URL
BETTER_AUTH_SECRET=$AUTH_SECRET
BETTER_AUTH_URL=https://$DOMAIN
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_BETTER_AUTH_URL=https://$DOMAIN
EOF

chmod 600 "$PROJECT_DIR/api/.env"
chmod 600 "$PROJECT_DIR/frontend/.env.local"

echo "✓ Variáveis de ambiente configuradas"

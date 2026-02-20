#!/bin/bash
set -e

echo "=== [06] Clonando Repositório ==="

mkdir -p "$PROJECT_DIR"

if [ ! -d "$PROJECT_DIR/.git" ]; then
    read -p "URL do repositório Git: " REPO_URL
    git clone "$REPO_URL" "$PROJECT_DIR"
else
    cd "$PROJECT_DIR"
    git config --global --add safe.directory "$PROJECT_DIR"
    git pull
fi

chown -R "$USER:$USER" "$PROJECT_DIR"
echo "✓ Repositório configurado"

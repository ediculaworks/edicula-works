#!/bin/bash
set -e

echo "=== [12] Iniciando Containers ==="

cd "$PROJECT_DIR"
docker compose up -d

echo "✓ Containers iniciados"
echo ""
echo "=== STATUS ==="
docker compose ps

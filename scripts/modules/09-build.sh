#!/bin/bash
set -e

echo "=== [09] Build Docker ==="

cd "$PROJECT_DIR"
docker compose build

echo "✓ Build concluído"

#!/bin/bash
set -e

echo "=== [02] Criando usuário ==="

if ! id "$USER" &>/dev/null; then
    adduser --gecos "" "$USER"
    usermod -aG sudo "$USER"
    usermod -aG docker "$USER" 2>/dev/null || true
    echo "✓ Usuário $USER criado"
else
    echo "✓ Usuário $USER já existe"
fi

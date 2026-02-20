#!/bin/bash
set -e

echo "=== [01] Atualizando sistema ==="

apt update && apt upgrade -y
apt install -y curl wget git nano ufw fail2ban ca-certificates gnupg lsb-release

echo "✓ Sistema atualizado"

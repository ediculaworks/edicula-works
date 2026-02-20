#!/bin/bash
set -e

echo "=== [04] Configurando Firewall ==="

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw limit $SSH_PORT/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 123/udp comment 'NTP'
ufw --force enable

echo "✓ Firewall configurado"

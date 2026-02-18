#!/bin/bash
set -e

echo "=== Configurando Firewall Seguro ==="

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

echo "Instalando UFW..."
apt install -y ufw

echo "Definindo políticas padrão..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

echo "Detectando porta SSH..."
SSH_PORT=$(grep -E "^Port\s+" /etc/ssh/sshd_config 2>/dev/null | awk '{print $2}' || echo "22")
echo "Porta SSH detectada: $SSH_PORT"

echo "Configurando regras básicas..."

# SSH - taxa limitada para evitar brute force
echo "Configurando SSH seguro (porta $SSH_PORT)..."
ufw limit $SSH_PORT/tcp comment "SSH with rate limiting"

# HTTP/HTTPS
echo "Abrindo HTTP/HTTPS..."
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Tailscale
echo "Abrindo portas Tailscale..."
ufw allow 41641/udp comment 'Tailscale'
ufw allow 3478/udp comment 'Tailscale STUN'

# NTP - necessário para certificados
echo "Abrindo NTP..."
ufw allow 123/udp comment 'NTP'

echo "Habilitando firewall..."
ufw --force enable

echo ""
echo "=== Firewall configurado! ==="
echo ""
echo "Regras ativas:"
ufw status numbered

echo ""
echo "NOTA: A porta 18789 (OpenClaw) está BLOQUEADA por padrão."
echo "Acesso via: Tailscale ou Nginx reverso"
echo ""
echo "Para abrir uma porta temporariamente:"
echo "  ufw allow 18789/tcp comment 'OpenClaw temp'"
echo ""
echo "Para remover uma regra:"
echo "  ufw delete 2"

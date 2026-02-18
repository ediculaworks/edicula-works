#!/bin/bash
set -e

echo "=== Instalando Tailscale ==="

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

# Verificar se já está instalado
if command -v tailscale &> /dev/null; then
    echo "Tailscale já está instalado."
    tailscale --version
    echo ""
    echo "Para conectar, execute: tailscale up"
    exit 0
fi

# Instalar Tailscale
echo "Instalando Tailscale..."
curl -fsSL https://tailscale.com/install.sh | sh

# Verificar instalação
echo "Verificando instalação..."
tailscale --version

echo ""
echo "=== Tailscale instalado com sucesso! ==="
echo ""
echo "Próximos passos:"
echo "1. Execute: tailscale up --accept-routes --accept-dns"
echo "2. Acesse a URL exibida para autenticar"
echo "3. Após conectado, execute: tailscale funnel 18789 (opcional)"
echo ""
echo "Comandos úteis:"
echo "  - Ver status: tailscale status"
echo "  - Desconectar: tailscale down"
echo "  - Ver IPs: tailscale ip -4"

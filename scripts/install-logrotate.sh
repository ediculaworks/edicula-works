#!/bin/bash
set -e

echo "=== Configurando Logrotate ==="

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

echo "Instalando logrotate..."
apt install -y logrotate

echo "Criando diretório de logs..."
mkdir -p /var/log/openclaw /var/log/nginx

echo "Copiando configuração..."
cp config/logrotate/edicula /etc/logrotate.d/edicula

echo "Verificando configuração..."
logrotate -d /etc/logrotate.d/edicula

echo ""
echo "=== Logrotate configurado! ==="
echo ""
echo "Os logs serão rotacionados automaticamente:"
echo "  - OpenClaw: diariamente, mantém 7 dias"
echo "  - Nginx: diariamente, mantém 14 dias"
echo "  - Backup: diariamente, mantém 30 dias"
echo "  - Fail2Ban: semanalmente, mantém 12 semanas"
echo "  - Auth: semanalmente, mantém 52 semanas"
echo ""
echo "Para testar: logrotate -f /etc/logrotate.d/edicula"

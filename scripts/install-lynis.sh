#!/bin/bash
set -e

echo "============================================"
echo "  Instalador Lynis - Auditoria de Segurança"
echo "============================================"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

echo "Instalando Lynis..."
apt update
apt install -y lynis

echo "Criando diretório de relatórios..."
mkdir -p /var/log/lynis

echo "Executando auditoria inicial..."
lynis audit system

echo ""
echo "=== Lynis instalado! ==="
echo ""
echo "Comandos:"
echo "  lynis audit system         - Auditoria completa"
echo "  lynis audit system --quick - Auditoria rápida"
echo "  lynis update info          - Verificar atualizações"
echo ""
echo "Relatórios:"
echo "  /var/log/lynis/ - Histórico de auditorias"
echo ""
echo "Agendar auditoria semanal:"
echo "  crontab -e"
echo "  0 4 * * 0 lynis audit system --quiet >> /var/log/lynis/weekly.log 2>&1"

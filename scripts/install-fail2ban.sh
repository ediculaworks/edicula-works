#!/bin/bash
set -e

echo "=== Configurando Fail2Ban com Regras Personalizadas ==="

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

echo "Instalando Fail2Ban..."
apt install -y fail2ban

echo "Criando diretórios..."
mkdir -p /etc/fail2ban/filter.d

echo "Copiando filtros personalizados..."
cp config/fail2ban/filter.d/openclaw.conf /etc/fail2ban/filter.d/
cp config/fail2ban/filter.d/nginx-http-auth.conf /etc/fail2ban/filter.d/

echo "Copiando configuração de jails..."
cp config/fail2ban/jail.local /etc/fail2ban/

echo "Verificando configuração..."
fail2ban-client -d

echo "Reiniciando Fail2Ban..."
systemctl enable fail2ban
systemctl restart fail2ban

echo ""
echo "=== Fail2Ban configurado! ==="
echo ""
echo "Jails ativos:"
fail2ban-client status
echo ""
echo "Para ver logs: tail -f /var/log/fail2ban.log"
echo "Para testar: fail2ban-client set openclaw unbanip IP"

#!/bin/bash

echo "============================================"
echo "  Auditoria de Segurança - EdiculaWorks"
echo "============================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_pass() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}"
    else
        echo -e "${RED}✗ FAIL${NC}"
    fi
}

echo "=== 1. Verificando Portas Abertas ==="
echo ""
OPEN_PORTS=$(ss -tuln | grep -v "State" | awk '{print $5}' | grep -oE ':[0-9]+' | sort -u)
echo "Portas abertas:"
echo "$OPEN_PORTS"
echo ""

EXPECTED_PORTS=":22 :80 :443 :2222 :41641"
for port in $EXPECTED_PORTS; do
    if echo "$OPEN_PORTS" | grep -q "$port"; then
        echo -e "  $port: ${GREEN}OK${NC}"
    else
        echo -e "  $port: ${YELLOW}NÃO ENCONTRADO${NC}"
    fi
done
echo ""

echo "=== 2. Verificando Serviços ==="
for service in sshd nginx docker fail2ban openclaw; do
    if systemctl is-active --quiet $service 2>/dev/null; then
        echo -e "  $service: ${GREEN}ATIVO${NC}"
    else
        echo -e "  $service: ${RED}INATIVO${NC}"
    fi
done
echo ""

echo "=== 3. Verificando Firewall ==="
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(ufw status | head -1)
    echo "  Status: $UFW_STATUS"
    echo "  Regras:"
    ufw status numbered | grep -E "^\[" | head -10
else
    echo -e "  ${YELLOW}UFW não instalado${NC}"
fi
echo ""

echo "=== 4. Verificando Tentativas de Login SSH ==="
echo "  Últimos logsins bem-sucedidos:"
last -10 | head -5
echo ""
echo "  Últimas tentativas falhadas:"
if [ -f /var/log/auth.log ]; then
    grep -i "failed" /var/log/auth.log | tail -5
else
    echo "  (log não disponível)"
fi
echo ""

echo "=== 5. Verificando Fail2Ban ==="
if command -v fail2ban-client &> /dev/null; then
    fail2ban-client status 2>/dev/null || echo "  Fail2Ban não responding"
else
    echo -e "  ${YELLOW}Fail2Ban não instalado${NC}"
fi
echo ""

echo "=== 6. Verificando Certificado SSL ==="
if [ -d /etc/letsencrypt/live ]; then
    DOMAIN=$(ls /etc/letsencrypt/live/ | head -1)
    if [ -n "$DOMAIN" ]; then
        EXPIRY=$(openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -noout -enddate 2>/dev/null | cut -d= -f2)
        echo "  Domínio: $DOMAIN"
        echo "  Expira: $EXPIRY"
        
        DAYS_LEFT=$(openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -noout -days 2>/dev/null)
        if [ "$DAYS_LEFT" -lt 30 ]; then
            echo -e "  ${YELLOW}AVISO: Certificado expira em menos de 30 dias${NC}"
        else
            echo -e "  ${GREEN}Validade OK ($DAYS_LEFT dias)${NC}"
        fi
    fi
else
    echo -e "  ${YELLOW}SSL não configurado${NC}"
fi
echo ""

echo "=== 7. Verificando Backups ==="
if [ -d /var/backups/edicula ]; then
    LAST_BACKUP=$(ls -t /var/backups/edicula/ 2>/dev/null | head -1)
    if [ -n "$LAST_BACKUP" ]; then
        echo "  Último backup: $LAST_BACKUP"
    else
        echo -e "  ${YELLOW}Nenhum backup local encontrado${NC}"
    fi
else
    echo -e "  ${YELLOW}Diretório de backup não existe${NC}"
fi
echo ""

echo "=== 8. Verificando Configurações SSH ==="
if [ -f /etc/ssh/sshd_config ]; then
    ROOT_LOGIN=$(grep "^PermitRootLogin" /etc/ssh/sshd_config | awk '{print $2}')
    PWD_AUTH=$(grep "^PasswordAuthentication" /etc/ssh/sshd_config | awk '{print $2}')
    PORT=$(grep "^Port" /etc/ssh/sshd_config | awk '{print $2}')
    
    echo "  Porta SSH: $PORT"
    echo "  Root login: $ROOT_LOGIN"
    echo "  Password auth: $PWD_AUTH"
    
    if [ "$ROOT_LOGIN" = "no" ]; then
        echo -e "  Root login: ${GREEN}OK${NC}"
    else
        echo -e "  ${RED}ALERTA: Root login permitido!${NC}"
    fi
    
    if [ "$PWD_AUTH" = "no" ]; then
        echo -e "  Password auth: ${GREEN}OK${NC}"
    else
        echo -e "  ${RED}ALERTA: Password auth ativado!${NC}"
    fi
fi
echo ""

echo "=== 9. Verificando Atualizações ==="
if command -v apt-get &> /dev/null; then
    UPDATES=$(apt-get -s upgrade 2>/dev/null | grep -i "upgraded" | awk '{print $1}')
    if [ "$UPDATES" -gt 0 ]; then
        echo -e "  ${YELLOW}Atualizações disponíveis: $UPDATES${NC}"
    else
        echo -e "  ${GREEN}Sistema atualizado${NC}"
    fi
fi
echo ""

echo "=== 10. Verificando Espaço em Disco ==="
df -h / | awk 'NR==1{print "  " $0} NR==2{print "  " $0, " (" $5 " usado)"}'
echo ""

echo "============================================"
echo "  Auditoria Concluída"
echo "============================================"

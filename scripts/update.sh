#!/bin/bash
set -e

echo "============================================"
echo "  Atualizador - EdiculaWorks"
echo "============================================"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

confirm() {
    while true; do
        read -p "$1 [s/n] " yn
        case $yn in
            [Ss] ) return 0;;
            [Nn] ) return 1;;
            * ) echo "Por favor, responda s ou n.";;
        esac
    done
}

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

echo "Este script atualizará:"
echo "  1. Sistema (apt)"
echo "  2. OpenClaw (npm)"
echo "  3. Docker"
echo "  4. Tailscale"
echo "  5. Certificados SSL"
echo ""

if ! confirm "Continuar?"; then
    echo "Atualização cancelada."
    exit 0
fi

ERRORS=0

# ======== 1. Backup ========
echo ""
echo "============================================"
echo "  1/5 - Fazendo backup antes de atualizar"
echo "============================================"
if confirm "Fazer backup antes?"; then
    if [ -f "/opt/scripts/backup.sh" ]; then
        /opt/scripts/backup.sh
    else
        log "Script de backup não encontrado, pulando..."
    fi
fi

# ======== 2. Sistema ========
echo ""
echo "============================================"
echo "  2/5 - Atualizando sistema"
echo "============================================"
log "Atualizando lista de pacotes..."
apt update

log "Verificando atualizações de segurança..."
SECURITY_UPDATES=$(apt-get -s upgrade 2>/dev/null | grep -i security | wc -l)
if [ "$SECURITY_UPDATES" -gt 0 ]; then
    log "Atualizações de segurança disponíveis: $SECURITY_UPDATES"
    if confirm "Aplicar atualizações?"; then
        apt upgrade -y
    fi
else
    log "Nenhuma atualização de segurança pendente."
fi

# ======== 3. OpenClaw ========
echo ""
echo "============================================"
echo "  3/5 - Atualizando OpenClaw"
echo "============================================"
log "Versão atual do OpenClaw:"
openclaw --version 2>/dev/null || echo "OpenClaw não instalado"

if command -v npm &> /dev/null; then
    if confirm "Atualizar OpenClaw?"; then
        log "Atualizando OpenClaw..."
        npm install -g openclaw@latest
        
        log "Reiniciando serviço..."
        systemctl restart openclaw
        
        log "Verificando status..."
        sleep 3
        if systemctl is-active --quiet openclaw; then
            log "OpenClaw atualizado com sucesso!"
        else
            log "ERRO: OpenClaw não iniciou corretamente"
            ERRORS=$((ERRORS + 1))
            journalctl -u openclaw -n 20 --no-pager
        fi
    fi
else
    log "npm não encontrado, pulando atualização do OpenClaw"
fi

# ======== 4. Docker ========
echo ""
echo "============================================"
echo "  4/5 - Atualizando Docker"
echo "============================================"
if command -v docker &> /dev/null; then
    log "Versão atual do Docker:"
    docker --version
    
    if confirm "Atualizar Docker?"; then
        log "Atualizando Docker..."
        apt update
        apt upgrade -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        
        log "Reiniciando Docker..."
        systemctl restart docker
        
        log "Docker atualizado!"
    fi
else
    log "Docker não instalado, pulando..."
fi

# ======== 5. Certificados ========
echo ""
echo "============================================"
echo "  5/5 - Verificando certificados SSL"
echo "============================================"
if command -v certbot &> /dev/null; then
    log "Verificando certificados..."
    certbot certificates 2>/dev/null || true
    
    DAYS_LEFT=$(certbot certificates 2>/dev/null | grep -A2 "VALID" | grep "Expiry" | grep -oE "[0-9]+" | head -1)
    
    if [ -n "$DAYS_LEFT" ]; then
        log "Certificados expiram em $DAYS_LEFT dias"
        
        if [ "$DAYS_LEFT" -lt 30 ]; then
            log "AVISO: Certificados expiram em menos de 30 dias"
            if confirm "Renovar certificados?"; then
                certbot renew
                systemctl reload nginx
                log "Certificados renovados!"
            fi
        else
            log "Certificados válidos por mais de 30 dias."
        fi
    else
        log "Nenhum certificado encontrado"
    fi
else
    log "certbot não instalado, pulando..."
fi

# ======== 6. Tailscale ========
echo ""
echo "============================================"
echo "  Extra - Atualizando Tailscale"
echo "============================================"
if command -v tailscale &> /dev/null; then
    log "Versão atual:"
    tailscale --version
    
    if confirm "Atualizar Tailscale?"; then
        log "Atualizando Tailscale..."
        apt update && apt upgrade -y tailscale
        log "Tailscale atualizado!"
    fi
else
    log "Tailscale não instalado, pulando..."
fi

# ======== Resultado ========
echo ""
echo "============================================"
echo "  Atualização Concluída"
echo "============================================"
echo ""

if [ $ERRORS -eq 0 ]; then
    log "Atualização concluída com sucesso!"
else
    log "Atualização concluída com $ERRORS erro(s)"
    log "Verifique os serviços com: systemctl status openclaw nginx docker"
fi

echo ""
echo "PRÓXIMOS PASSOS:"
echo "  1. Verificar serviços: systemctl status openclaw nginx docker"
echo "  2. Verificar health: /opt/monitoring/health-check.sh"
echo "  3. Testar acesso: curl https://seudominio.com/api/health"
echo ""

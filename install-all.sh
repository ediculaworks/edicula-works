#!/bin/bash
set -e

echo "============================================"
echo "  Instalador Seguro - EdiculaWorks"
echo "============================================"
echo ""

if [ "$EUID" -eq 0 ]; then
    echo "⚠️  AVISO: Você está executando como root."
    echo "   Recomendamos criar um usuário não-root primeiro."
    echo ""
    read -p "Continuar mesmo assim? (s/n): " confirm
    if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
        echo "Instalação cancelada."
        exit 0
    fi
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

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

echo "Este script instalará com SEGURANÇA:"
echo "  1. Docker (usuário dedicado)"
echo "  2. Firewall (UFW)"
echo "  3. SSH Hardening + Fail2Ban"
echo "  4. OpenClaw (usuário dedicado + sandbox)"
echo "  5. Tailscale (VPN)"
echo "  6. Nginx + SSL (rate limiting + headers)"
echo "  7. Backup automatizado (criptografado)"
echo "  8. Monitoramento"
echo ""

if ! confirm "Continuar?"; then
    echo "Instalação cancelada."
    exit 0
fi

# ======== 1. Docker ========
echo ""
echo "============================================"
echo "  1/8 - Instalando Docker"
echo "============================================"
if confirm "Instalar Docker?"; then
    bash "$SCRIPT_DIR/scripts/install-docker.sh"
fi

# ======== 2. Firewall ========
echo ""
echo "============================================"
echo "  2/8 - Configurando Firewall"
echo "============================================"
if confirm "Configurar Firewall (UFW)?"; then
    bash "$SCRIPT_DIR/scripts/install-firewall.sh"
fi

# ======== 3. SSH Hardening ========
echo ""
echo "============================================"
echo "  3/8 - Hardening SSH"
echo "============================================"
if confirm "Aplicar hardening SSH? (ALTERARÁ PORTA SSH PARA 2222)"; then
    bash "$SCRIPT_DIR/scripts/install-ssh-hardening.sh"
    echo ""
    echo "⚠️  IMPORTANTE: Anote a nova porta SSH: 2222"
    echo "   Configure sua chave SSH ANTES de desconectar!"
fi

# ======== 4. OpenClaw ========
echo ""
echo "============================================"
echo "  4/8 - Instalando OpenClaw"
echo "============================================"
if confirm "Instalar OpenClaw?"; then
    bash "$SCRIPT_DIR/scripts/install-openclaw.sh"
    
    echo ""
    echo "CONFIGURAR API KEY:"
    echo "Edite /etc/openclaw/env e adicione:"
    echo "  OPENROUTER_API_KEY=sua_chave_aqui"
    echo ""
    confirm "Deseja configurar agora?" && nano /etc/openclaw/env
fi

# ======== 5. Tailscale ========
echo ""
echo "============================================"
echo "  5/8 - Instalando Tailscale"
echo "============================================"
if confirm "Instalar Tailscale?"; then
    bash "$SCRIPT_DIR/scripts/install-tailscale.sh"
    
    echo ""
    echo "Para conectar, execute:"
    echo "  tailscale up --accept-routes --accept-dns"
    echo ""
    if confirm "Conectar agora?"; then
        tailscale up --accept-routes --accept-dns
    fi
fi

# ======== 6. SSL ========
echo ""
echo "============================================"
echo "  6/8 - Configurando SSL"
echo "============================================"
if confirm "Configurar SSL (precisa domínio configurado)?"; then
    echo "Digite o domínio (ex: openclaw.ediculaworks.com):"
    read -r DOMAIN
    echo "Digite seu email:"
    read -r EMAIL
    
    bash "$SCRIPT_DIR/scripts/setup-ssl.sh" "$DOMAIN" "$EMAIL"
fi

# ======== 7. Backup ========
echo ""
echo "============================================"
echo "  7/8 - Configurando Backup"
echo "============================================"
if confirm "Configurar backup automatizado?"; then
    # Tornar executável
    chmod +x "$SCRIPT_DIR/scripts/backup.sh"
    chmod +x "$SCRIPT_DIR/scripts/restore.sh"
    
    # Configurar cron
    echo "Agendando backup diário às 3h..."
    (crontab -l 2>/dev/null | grep -v "backup.sh"; echo "0 3 * * * $SCRIPT_DIR/scripts/backup.sh >> /var/log/backup.log 2>&1") | crontab -
    
    echo "Backup configurado!"
    echo ""
    echo "Configure GPG para criptografia:"
    echo "  gpg --full-gen-key"
    echo "  export GPG_RECIPIENT=seu@email.com"
fi

# ======== 8. Monitoramento ========
echo ""
echo "============================================"
echo "  8/8 - Configurando Monitoramento"
echo "============================================"
if confirm "Configurar monitoramento?"; then
    bash "$SCRIPT_DIR/scripts/install-monitoring.sh"
    
    echo ""
    if confirm "Ativar verificações automáticas (a cada 5 min)?"; then
        systemctl enable edicula-healthcheck.timer
        systemctl start edicula-healthcheck.timer
    fi
fi

# ======== Resumo ========
echo ""
echo "============================================"
echo "  Instalação Concluída!"
echo "============================================"
echo ""
echo "RESUMO DAS ALTERAÇÕES:"
echo ""
echo "  🔐 SEGURANÇA:"
echo "     - Firewall UFW ativo"
echo "     - SSH na porta 2222 (chave obrigatória)"
echo "     - Fail2Ban ativo"
echo "     - OpenClaw com usuário dedicado"
echo "     - SSL com rate limiting"
echo ""
echo "  📋 CONFIGURAÇÕES:"
echo "     - Docker instalado"
echo "     - OpenClaw instalado"
echo "     - Tailscale instalado"
echo "     - Backup automatizado"
echo "     - Monitoramento ativo"
echo ""
echo "  ⚠️  PRÓXIMOS PASSOS OBRIGATÓRIOS:"
echo "     1. Configure API Key: nano /etc/openclaw/env"
echo "     2. Altere senha: nano /etc/openclaw/openclaw.json"
echo "     3. Reinicie: systemctl restart openclaw"
echo "     4. Configure domínio DNS para VPS"
echo "     5. Configure GPG: gpg --full-gen-key"
echo ""
echo "  📝 COMANDOS ÚTEIS:"
echo "     - Status: systemctl status openclaw"
echo "     - Logs: journalctl -u openclaw -f"
echo "     - Health: /opt/monitoring/health-check.sh"
echo "     - Métricas: /opt/monitoring/metrics.sh"
echo ""
echo "  🔌 ACESSO:"
echo "     - SSH: ssh -p 2222 usuario@IP"
echo "     - Local: http://localhost:18789"
echo "     - HTTPS: https://seudominio.com"
echo ""
echo "============================================"

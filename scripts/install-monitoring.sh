#!/bin/bash
set -e

echo "=== Instalando Sistema de Monitoramento ==="

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

echo "Instalando dependências..."
apt install -y curl jq

echo "Criando diretório..."
mkdir -p /opt/monitoring

echo "Criando script de health check..."
cat > /opt/monitoring/health-check.sh <<'EOF'
#!/bin/bash

# Configurações
ALERT_EMAIL="${ALERT_EMAIL:-admin@ediculaworks.com}"
OPENCLAW_URL="http://127.0.0.1:18789"
MAX_MEM_PERCENT=90
MAX_CPU_PERCENT=80

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

check_openclaw() {
    if curl -sf "$OPENCLAW_URL/api/health" > /dev/null 2>&1; then
        log "✓ OpenClaw: OK"
        return 0
    else
        log "✗ OpenClaw: FALHOU"
        return 1
    fi
}

check_memory() {
    MEM_PERCENT=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
    if [ "$MEM_PERCENT" -gt "$MAX_MEM_PERCENT" ]; then
        log "⚠ Memória: ${MEM_PERCENT}% (limite: ${MAX_MEM_PERCENT}%)"
        return 1
    else
        log "✓ Memória: ${MEM_PERCENT}%"
        return 0
    fi
}

check_cpu() {
    CPU_PERCENT=$(top -bn1 | grep "Cpu(s)" | awk '{printf "%.0f", $2}')
    if [ "$CPU_PERCENT" -gt "$MAX_CPU_PERCENT" ]; then
        log "⚠ CPU: ${CPU_PERCENT}% (limite: ${MAX_CPU_PERCENT}%)"
        return 1
    else
        log "✓ CPU: ${CPU_PERCENT}%"
        return 0
    fi
}

check_disk() {
    DISK_PERCENT=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
    if [ "$DISK_PERCENT" -gt 90 ]; then
        log "⚠ Disco: ${DISK_PERCENT}%"
        return 1
    else
        log "✓ Disco: ${DISK_PERCENT}%"
        return 0
    fi
}

check_services() {
    FAILED=0
    
    for service in openclaw nginx docker; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            log "✓ $service: ativo"
        else
            log "✗ $service: inativo"
            FAILED=1
        fi
    done
    
    return $FAILED
}

send_alert() {
    local message="$1"
    log "ALERTA: $message"
    
    # Aqui você pode adicionar integração com email, Slack, etc
    # Exemplo: mail, curl para webhook, etc
    
    echo "$message" | tee /tmp/edicula-alert.log
}

# Executar verificações
ERRORS=0

log "=== Verificação de Saúde - EdiculaWorks ==="

check_openclaw || ((ERRORS++))
check_memory || ((ERRORS++))
check_cpu || ((ERRORS++))
check_disk || ((ERRORS++))
check_services || ((ERRORS++))

log "============================================"

if [ $ERRORS -gt 0 ]; then
    log "Verificação falhou com $ERRORS erro(s)"
    send_alert "Health check falhou: $ERRORS erros detectados"
    exit 1
else
    log "Todos os serviços OK"
    exit 0
fi
EOF

chmod +x /opt/monitoring/health-check.sh

echo "Criando script de métricas..."
cat > /opt/monitoring/metrics.sh <<'EOF'
#!/bin/bash

echo "=== Métricas do Sistema ==="
echo ""

echo "--- Uptime ---"
uptime

echo ""
echo "--- Memória ---"
free -h

echo ""
echo "--- Disco ---"
df -h /

echo ""
echo "--- Carga ---"
cat /proc/loadavg

echo ""
echo "--- Serviços ---"
for service in openclaw nginx docker tailscaled; do
    status=$(systemctl is-active "$service" 2>/dev/null || echo "inactive")
    echo "$service: $status"
done

echo ""
echo "--- OpenClaw ---"
curl -s http://127.0.0.1:18789/api/health 2>/dev/null || echo "OpenClaw não responde"

echo ""
echo "--- Conexões ---"
netstat -tun 2>/dev/null | ESTABLISHED | wc -l || echo "netstat não disponível"
EOF

chmod +x /opt/monitoring/metrics.sh

echo "Criando serviço de health check..."
cat > /etc/systemd/system/edicula-healthcheck.service <<'EOF'
[Unit]
Description=EdiculaWorks Health Check
After=network.target

[Service]
Type=oneshot
ExecStart=/opt/monitoring/health-check.sh
StandardOutput=journal
StandardError=journal
EOF

cat > /etc/systemd/system/edicula-healthcheck.timer <<'EOF'
[Unit]
Description=EdiculaWorks Health Check Timer
Requires=edicula-healthcheck.service

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable edicula-healthcheck.timer

echo "Criando script de notificação..."
cat > /opt/monitoring/notify.sh <<'EOF'
#!/bin/bash

# Configuração de notificações
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"

send_telegram() {
    local message="$1"
    if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
        curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
            -d "chat_id=$TELEGRAM_CHAT_ID" \
            -d "text=$message" \
            -d "parse_mode=Markdown"
    fi
}

send_slack() {
    local message="$1"
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK"
    fi
}

# Ler mensagem do argumento
if [ -n "$1" ]; then
    send_telegram "$1"
    send_slack "$1"
fi
EOF

chmod +x /opt/monitoring/notify.sh

echo ""
echo "=== Monitoramento instalado! ==="
echo ""
echo "Comandos:"
echo "  /opt/monitoring/health-check.sh  - Verificar saúde"
echo "  /opt/monitoring/metrics.sh       - Ver métricas"
echo "  systemctl start edicula-healthcheck.timer - Ativar verificações automáticas"
echo ""
echo "Configure notificações em /opt/monitoring/notify.sh"

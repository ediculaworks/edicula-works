#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODULES_DIR="$SCRIPT_DIR/modules"

source "$SCRIPT_DIR/env.sh"

echo "============================================"
echo "  EdiculaWorks Setup Universal"
echo "============================================"
echo ""

usage() {
    echo "Uso: $0 [opção]"
    echo ""
    echo "Opções:"
    echo "  all           Executar setup completo"
    echo "  1             Atualizar sistema"
    echo "  2             Criar usuário"
    echo "  3             Configurar SSH"
    echo "  4             Configurar Firewall"
    echo "  5             Instalar Docker"
    echo "  6             Clonar Repositório"
    echo "  7             Configurar Variáveis de Ambiente"
    echo "  8             Configurar OpenClaw"
    echo "  9             Build Docker"
    echo "  10            Configurar SSL"
    echo "  11            Configurar Nginx"
    echo "  12            Iniciar Containers"
    echo "  status        Ver status dos serviços"
    echo "  restart       Reiniciar serviços"
    echo ""
    exit 0
}

if [ $# -eq 0 ]; then
    usage
fi

OPTION="$1"

case "$OPTION" in
    all)
        echo "Executando setup completo..."
        for i in $(seq 1 12); do
            MODULE="$MODULES_DIR/$(printf "%02d" $i)-*.sh"
            for f in $MODULE; do
                if [ -f "$f" ]; then
                    echo ""
                    echo "==> Executando: $(basename $f)"
                    source "$f"
                fi
            done
        done
        ;;
    status)
        echo "=== Status dos Serviços ==="
        echo ""
        echo "Docker: $(systemctl is-active docker 2>/dev/null || echo 'inativo')"
        echo "Nginx: $(systemctl is-active nginx 2>/dev/null || echo 'inativo')"
        echo "Fail2Ban: $(systemctl is-active fail2ban 2>/dev/null || echo 'inativo')"
        echo ""
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        ;;
    restart)
        echo "Reiniciando serviços..."
        systemctl restart docker nginx 2>/dev/null || true
        docker compose -f /opt/ediculaworks/docker-compose.yml restart 2>/dev/null || true
        ;;
    *)
        if [[ "$OPTION" =~ ^[0-9]+$ ]]; then
            MODULE="$MODULES_DIR/$(printf "%02d" $OPTION)-*.sh"
            for f in $MODULE; do
                if [ -f "$f" ]; then
                    source "$f"
                else
                    echo "Módulo não encontrado: $MODULE"
                    exit 1
                fi
            done
        else
            echo "Opção inválida: $OPTION"
            usage
        fi
        ;;
esac

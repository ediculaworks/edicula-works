#!/bin/bash
set -e

echo "=== Restore Seguro - EdiculaWorks ==="

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

if [ -z "$1" ]; then
    echo "Uso: $0 <backup-date> [--dry-run]"
    echo ""
    echo "Backups disponíveis:"
    if command -v rclone &> /dev/null; then
        rclone lsd backup-edicula:backups/vps/ 2>/dev/null || echo "Nenhum backup encontrado"
    else
        ls -la /var/backups/edicula/ 2>/dev/null || echo "Nenhum backup local encontrado"
    fi
    exit 1
fi

DATE=$1
DRY_RUN=false
if [ "$2" = "--dry-run" ]; then
    DRY_RUN=true
fi

REMOTE_NAME="backup-edicula"
REMOTE_PATH="backups/vps"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Iniciando restauração do backup: $DATE"

if [ "$DRY_RUN" = true ]; then
    log "MODO DRY-RUN - Nenhuma alteração será feita"
fi

TEMP_DIR="/tmp/restore-$DATE"
mkdir -p "$TEMP_DIR"

log "Baixando backup..."
if command -v rclone &> /dev/null && rclone listremotes 2>/dev/null | grep -q "$REMOTE_NAME"; then
    rclone copy "$REMOTE_NAME:$REMOTE_PATH/$DATE" "$TEMP_DIR/" 2>/dev/null || {
        log "Erro ao baixar backup"
        exit 1
    }
else
    if [ -d "/var/backups/edicula/$DATE" ]; then
        cp -r "/var/backups/edicula/$DATE" "$TEMP_DIR/"
    else
        log "Backup local não encontrado"
        exit 1
    fi
fi

log "Verificando integridade..."
if [ -f "$TEMP_DIR/checksums.sha256" ]; then
    cd "$TEMP_DIR"
    sha256sum -c checksums.sha256 || {
        log "ERRO: Checksum inválido!"
        exit 1
    }
    log "Checksum verificado!"
fi

log "Arquivos do backup:"
ls -la "$TEMP_DIR/"

log "Iniciando restauração..."

# Restaurar configurações
if [ -f "$TEMP_DIR/etc.openclaw.tar.gz" ]; then
    if [ "$DRY_RUN" = false ]; then
        log "Restaurando configurações OpenClaw..."
        tar -xzf "$TEMP_DIR/etc.openclaw.tar.gz" -C /etc/ --overwrite
        log "Configurações OpenClaw restauradas!"
    else
        log "[DRY-RUN] Restauraria: etc.openclaw"
    fi
fi

# Restaurar Nginx
if [ -f "$TEMP_DIR/etc.nginx.sites-available.tar.gz" ]; then
    if [ "$DRY_RUN" = false ]; then
        log "Restaurando configurações Nginx..."
        tar -xzf "$TEMP_DIR/etc.nginx.sites-available.tar.gz" -C /etc/nginx/ --overwrite
        nginx -t && systemctl reload nginx
        log "Configurações Nginx restauradas!"
    else
        log "[DRY-RUN] Restauraria: etc.nginx"
    fi
fi

# Restaurar scripts
if [ -f "$TEMP_DIR/opt.scripts.tar.gz" ]; then
    if [ "$DRY_RUN" = false ]; then
        log "Restaurando scripts..."
        tar -xzf "$TEMP_DIR/opt.scripts.tar.gz" -C /opt/ --overwrite
        chmod +x /opt/scripts/*.sh
        log "Scripts restaurados!"
    else
        log "[DRY-RUN] Restauraria: opt.scripts"
    fi
fi

rm -rf "$TEMP_DIR"

log "Restauração concluída!"

if [ "$DRY_RUN" = false ]; then
    log "Reinicie os serviços:"
    echo ""
    echo "  systemctl restart openclaw"
    echo "  systemctl reload nginx"
fi

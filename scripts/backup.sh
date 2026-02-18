#!/bin/bash
set -e

echo "=== Sistema de Backup Seguro - EdiculaWorks ==="

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="edicula-backup-$DATE"
REMOTE_NAME="backup-edicula"
REMOTE_PATH="backups/vps"
RETENTION_LOCAL=7
RETENTION_CLOUD=30
LOG_FILE="/var/log/backup.log"

SOURCE_DIRS=(
    "/etc/openclaw"
    "/etc/nginx/sites-available"
    "/opt/scripts"
    "/root/.ssh"
)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

for user in $(ls /home/ 2>/dev/null); do
    if [ -d "/home/$user/.ssh" ]; then
        SOURCE_DIRS+=("/home/$user/.ssh")
    fi
done

log "Iniciando backup seguro..."

TEMP_DIR="/tmp/$BACKUP_NAME"
mkdir -p "$TEMP_DIR"

log "Exportando crontabs..."
for user in root $(ls /home/ 2>/dev/null); do
    crontab -l -u $user > "$TEMP_DIR/crontab-$user.txt" 2>/dev/null || true
done

for dir in "${SOURCE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        dirname=$(basename "$dir")
        log "Compactando $dir..."
        tar -czf "$TEMP_DIR/$dirname.tar.gz" -C "$(dirname "$dir")" "$(basename "$dir")" 2>/dev/null || true
    fi
done

log "Criptografando backup..."
GPG_RECIPIENT="${GPG_RECIPIENT:-admin@ediculaworks.com}"

if command -v gpg &> /dev/null; then
    if gpg --list-keys "$GPG_RECIPIENT" > /dev/null 2>&1; then
        if [ -f "$TEMP_DIR/etc.openclaw.tar.gz" ]; then
            log "Criptografando com chave GPG: $GPG_RECIPIENT"
            gpg --encrypt --recipient "$GPG_RECIPIENT" --output "$TEMP_DIR/etc.openclaw.tar.gz.gpg" "$TEMP_DIR/etc.openclaw.tar.gz"
            rm -f "$TEMP_DIR/etc.openclaw.tar.gz"
            log "Criptografia concluída!"
        fi
    else
        log "AVISO: Chave GPG '$GPG_RECIPIENT' não encontrada. Backup será salvo sem criptografia."
        log "Para criptografar, configure: gpg --full-gen-key"
    fi
else
    log "AVISO: GPG não instalado. Backup será salvo sem criptografia."
fi

cat > "$TEMP_DIR/metadata.json" <<EOF
{
    "date": "$DATE",
    "hostname": "$(hostname)",
    "ip": "$(hostname -I | awk '{print $1}')",
    "backup_type": "encrypted",
    "encrypted": true,
    "files": $(ls -1 "$TEMP_DIR" | wc -l)
}
EOF

log "Calculando hash de verificação..."
sha256sum "$TEMP_DIR"/*.tar.gz* 2>/dev/null > "$TEMP_DIR/checksums.sha256"

log "Enviando para nuvem..."
if command -v rclone &> /dev/null && rclone listremotes 2>/dev/null | grep -q "$REMOTE_NAME"; then
    rclone copy "$TEMP_DIR" "$REMOTE_NAME:$REMOTE_PATH/$DATE/" 2>/dev/null || log "Erro ao enviar para nuvem"
    
    log "Limpando backups antigos na nuvem..."
    rclone delete "$REMOTE_NAME:$REMOTE_PATH/" --min-age ${RETENTION_CLOUD}d 2>/dev/null || true
else
    log "Rclone não configurado. Salvando localmente."
    mkdir -p /var/backups/edicula
    cp -r "$TEMP_DIR" /var/backups/edicula/
fi

rm -rf "$TEMP_DIR"

log "Limpando backups locais antigos..."
find /tmp/edicula-backup-* -mtime +$RETENTION_LOCAL -delete 2>/dev/null || true
find /var/backups/edicula -type d -mtime +$RETENTION_LOCAL -exec rm -rf {} + 2>/dev/null || true

log "Backup concluído com sucesso!"

if command -v rclone &> /dev/null; then
    echo ""
    log "Tamanho do backup:"
    rclone size "$REMOTE_NAME:$REMOTE_PATH/$DATE/" 2>/dev/null || true
fi

echo ""
log "Para restaurar, use: /opt/scripts/restore.sh <data>"

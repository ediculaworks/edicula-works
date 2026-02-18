#!/bin/bash
set -e

echo "============================================"
echo "  Teste de Restore - EdiculaWorks"
echo "============================================"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo $0"
    exit 1
fi

REMOTE_NAME="backup-edicula"
REMOTE_PATH="backups/vps"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Iniciando teste de restore..."

echo "=== Backups Disponíveis ==="
echo ""

if command -v rclone &> /dev/null && rclone listremotes 2>/dev/null | grep -q "$REMOTE_NAME"; then
    echo "Backups na nuvem:"
    rclone lsd "$REMOTE_NAME:$REMOTE_PATH/" 2>/dev/null || echo "Nenhum backup na nuvem"
    BACKUP_SOURCE="cloud"
else
    if [ -d "/var/backups/edicula" ]; then
        echo "Backups locais:"
        ls -la /var/backups/edicula/
        BACKUP_SOURCE="local"
    else
        echo "Nenhum backup encontrado!"
        exit 1
    fi
fi

echo ""
echo "Selecione o backup para testar:"
if [ "$BACKUP_SOURCE" = "cloud" ]; then
    BACKUPS=$(rclone lsd "$REMOTE_NAME:$REMOTE_PATH/" 2>/dev/null | awk '{print $5}' | grep -E "^[0-9]{8}_[0-9]{6}$")
else
    BACKUPS=$(ls -1 /var/backups/edicula/ 2>/dev/null | grep -E "^[0-9]{8}_[0-9]{6}$")
fi

select DATE in $BACKUPS "Sair"; do
    if [ "$DATE" = "Sair" ]; then
        echo "Saindo..."
        exit 0
    elif [ -n "$DATE" ]; then
        break
    fi
done

log "Testando backup: $DATE"

TEMP_DIR="/tmp/test-restore-$DATE"
mkdir -p "$TEMP_DIR"

log "Baixando backup..."
if [ "$BACKUP_SOURCE" = "cloud" ]; then
    rclone copy "$REMOTE_NAME:$REMOTE_PATH/$DATE" "$TEMP_DIR/" 2>/dev/null || {
        log "Erro ao baixar backup"
        exit 1
    }
else
    cp -r "/var/backups/edicula/$DATE" "$TEMP_DIR/"
fi

echo ""
log "Arquivos no backup:"
ls -la "$TEMP_DIR/"

echo ""
log "Verificando checksums..."
if [ -f "$TEMP_DIR/checksums.sha256" ]; then
    cd "$TEMP_DIR"
    if sha256sum -c checksums.sha256 > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Checksums OK${NC}"
    else
        echo -e "  ${RED}✗ Checksums FALHARAM!${NC}"
        echo "  Backup pode estar corrompido!"
    fi
else
    echo -e "  ${YELLOW}⚠ Arquivo de checksums não encontrado${NC}"
fi

echo ""
log "Verificando metadados..."
if [ -f "$TEMP_DIR/metadata.json" ]; then
    cat "$TEMP_DIR/metadata.json" | python3 -m json.tool 2>/dev/null || cat "$TEMP_DIR/metadata.json"
else
    echo -e "  ${YELLOW}⚠ Metadata não encontrada${NC}"
fi

echo ""
log "Testando extração (sem restaurar)..."
for file in "$TEMP_DIR"/*.tar.gz*; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "  Testando: $filename"
        
        if [[ "$file" == *.gpg ]]; then
            echo "    (arquivo GPG - não é possível testar sem chave)"
        else
            if tar -tzf "$file" > /dev/null 2>&1; then
                echo -e "    ${GREEN}✓ Válido${NC}"
            else
                echo -e "    ${RED}✗ Corrompido${NC}"
            fi
        fi
    fi
done

echo ""
echo "=== Resultado do Teste ==="
echo ""
echo "Backup: $DATE"
echo "Fonte: $BACKUP_SOURCE"
echo "Tamanho: $(du -sh "$TEMP_DIR" | cut -f1)"

rm -rf "$TEMP_DIR"

echo ""
log "Teste de restore concluído!"
echo ""
echo "Para restaurar definitivamente:"
echo "  /opt/scripts/restore.sh $DATE"
echo ""

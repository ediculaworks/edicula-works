# Backup - Sistema de Backup Seguro

## Visão Geral

Este documento descreve o sistema de backup seguro da infraestrutura EdiculaWorks, incluindo criptografia, verificação de integridade e procedimentos de recuperação.

## Estratégia de Backup

### O que fazer backup

| Dado | Prioridade | Frequência | Criptografado |
|------|------------|------------|---------------|
| Configurações OpenClaw | 🔴 Crítica | Diária | Sim |
| Configurações Nginx | 🔴 Alta | Diária | Sim |
| Scripts | 🟡 Média | Semanal | Sim |
| Logs | 🟢 Baixa | Mensal | Não |

### Retenção

- **Local**: 7 dias
- **Nuvem**: 30 dias
- **Verificação**: Semanal

## Arquitetura do Backup

```
┌─────────────────────────────────────────────────────────────────┐
│                     SERVIDOR VPS                                 │
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│   │  Sources    │───▶│  Compact     │───▶│  Encrypt     │    │
│   │  /etc/      │    │  .tar.gz     │    │  .gpg        │    │
│   │  /opt/      │    │              │    │              │    │
│   └──────────────┘    └──────────────┘    └──────────────┘    │
│                                                   │             │
│                                                   ▼             │
│                                    ┌──────────────────────┐    │
│                                    │  Verificação        │    │
│                                    │  SHA256              │    │
│                                    └──────────┬───────────┘    │
│                                               │                 │
└───────────────────────────────────────────────┼─────────────────┘
                                                │
                                                ▼
                        ┌─────────────────────────────────────────┐
                        │              NUVEM                      │
                        │  (Google Drive / Dropbox / S3)        │
                        │                                         │
                        │  backups/vps/20240115_030000/          │
                        │    ├── etc.openclaw.tar.gz.gpg         │
                        │    ├── etc.nginx.tar.gz               │
                        │    ├── metadata.json                   │
                        │    └── checksums.sha256               │
                        └─────────────────────────────────────────┘
```

## Instalação

### 1. Instalar Rclone

```bash
curl https://rclone.org/install.sh | sudo bash
```

### 2. Configurar armazenamento

```bash
rclone config
```

Escolha seu provedor:
- `drive` - Google Drive
- `dropbox` - Dropbox
- `s3` - AWS S3
- `b2` - Backblaze B2

### 3. Testar configuração

```bash
rclone listremotes
rclone lsd backup-edicula:
```

## Scripts de Backup

### Backup Automático

```bash
# Executar backup
/opt/scripts/backup.sh

# Ver logs
tail -f /var/log/backup.sh.log
```

### Restaurar Backup

```bash
# Listar backups disponíveis
/opt/scripts/restore.sh

# Restaurar backup específico
/opt/scripts/restore.sh 20240115_030000

# Modo teste (dry-run)
/opt/scripts/restore.sh 20240115_030000 --dry-run
```

### Configurar Cron

```bash
crontab -e

# Backup diário às 3h
0 3 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
```

## Criptografia

### Como funciona

1. O script compacta os arquivos em `.tar.gz`
2. Usa GPG para criptografar com chave pública
3. Apenas você (com chave privada) pode descriptografar

### Configurar Chave GPG

```bash
# Gerar chave (uma vez)
gpg --full-generate-key

# Listar chaves
gpg --list-keys

# Exportar chave pública (para backup)
gpg --armor --export seu@email.com > public.key
```

### Restaurar backup criptografado

```bash
# Descriptografar
gpg --decrypt backup.tar.gz.gpg > backup.tar.gz

# Extrair
tar -xzf backup.tar.gz
```

## Verificação de Integridade

### Checksums

Cada backup inclui um arquivo `checksums.sha256`:

```
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  etc.openclaw.tar.gz
```

### Verificar

```bash
cd /caminho/backup
sha256sum -c checksums.sha256
```

## Tabela de Referência

| Ação | Comando |
|------|---------|
| Executar backup | `/opt/scripts/backup.sh` |
| Listar backups | `/opt/scripts/restore.sh` |
| Restaurar | `/opt/scripts/restore.sh DATA` |
| Testar restore | `/opt/scripts/restore.sh DATA --dry-run` |
| Verificar | `sha256sum -c checksums.sha256` |
| Ver logs | `tail -f /var/log/backup.log` |

## Boas Práticas

1. **Teste a restauração** pelo menos uma vez por mês
2. **Mantenha chave GPG segura** - sem ela não há restore
3. **Verifique logs** após cada backup
4. **Monitore espaço** em disco
5. **Documente o processo** de recuperação

## Troubleshooting

### Backup falha

```bash
# Ver logs
tail -50 /var/log/backup.log

# Verificar espaço
df -h

# Testar rclone
rclone lsd backup-edicula:
```

### Restore falha

```bash
# Verificar data
ls /var/backups/edicula/

# Baixar manualmente
rclone copy backup-edicula:backups/vps/20240115_030000 /tmp/test/
```

## Recuperação de Desastre

### Cenário: Servidor completo perdido

1. Provisionar novo servidor
2. Instalar sistema base
3. Copiar scripts de instalação
4. Executar restore:
```bash
/opt/scripts/restore.sh 20240115_030000
```
5. Reiniciar serviços

### Cenário: Apenas configuração perdida

1. Acessar servidor
2. Executar restore parcial:
```bash
/opt/scripts/restore.sh 20240115_030000
```
3. Reiniciar serviço específico:
```bash
systemctl restart openclaw
```

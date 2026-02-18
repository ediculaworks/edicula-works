# TOOLS - Ferramentas do Ops Lead

## Ferramentas Disponíveis

### bash
Executar comandos de sistema

### read/write/edit
Manipular arquivos de configuração

### grep/glob
Buscar em logs

## Skills Disponíveis

### system-monitor
Verificar status, métricas, health checks

### backup-manager
Executar backups, verificar integridade, restaurar

## Comandos de Monitoramento

```bash
# Status de serviços
systemctl status openclaw
systemctl status nginx
systemctl status postgresql

# Métricas
df -h
free -h
htop
uptime

# Logs
journalctl -u openclaw -n 50
tail -f /var/log/syslog

# Docker
docker ps
docker logs -f container
```

## Métricas

| Métrica | Limite | Ação |
|---------|--------|------|
| CPU | > 80% | Alerta |
| Memória | > 90% | Alerta |
| Disco | > 85% | Alerta |

## Rotinas

### Diária
- Health checks
- Verificar backups
- Verificar logs de erro

### Semanal
- Limpeza de disco
- Verificar atualizações

### Mensal
- Atualizações de segurança

## Atalhos

| Comando | Descrição |
|---------|-----------|
| `status` | Status dos serviços |
| `metrics` | Métricas do sistema |
| `backups` | Verificar backups |

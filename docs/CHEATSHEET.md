# Cheatsheet - EdiculaWorks

Referencia rapida para comandos e tarefas mais comuns.

---

## Servicos

### OpenClaw

```bash
# Status
systemctl status openclaw

# Reiniciar
systemctl restart openclaw

# Parar
systemctl stop openclaw

# Logs
journalctl -u openclaw -f
journalctl -u openclaw -n 100 --no-pager

# Versao
openclaw --version

# Health check
curl http://localhost:18789/api/health
```

### Nginx

```bash
# Status
systemctl status nginx

# Testar config
nginx -t

# Reiniciar
systemctl restart nginx

# Recarregar
systemctl reload nginx

# Logs
tail -f /var/log/nginx/openclaw_access.log
tail -f /var/log/nginx/openclaw_error.log
```

### Docker

```bash
# Status
systemctl status docker

# Containers
docker ps
docker ps -a

# Logs
docker logs edicula-openclaw -f

# Reiniciar container
docker restart edicula-openclaw
```

### Fail2Ban

```bash
# Status
fail2ban-client status

# Ver jail especifico
fail2ban-client status sshd
fail2ban-client status nginx-http-auth

# Desbanir IP
fail2ban-client set sshd unbanip 1.2.3.4

# Banir IP
fail2ban-client set sshd banip 1.2.3.4
```

---

## Rede

### Verificar Portas

```bash
# Portas abertas
ss -tuln
netstat -tuln

# Conexoes ativas
ss -tuwn
netstat -tuwn

# Firewall
ufw status verbose
ufw status numbered
```

### SSH

```bash
# Conectar
ssh -p 2222 usuario@ip

# Copiar chave
ssh-copy-id -p 2222 usuario@ip

# Testar conexao
ssh -v -p 2222 usuario@ip
```

### Tailscale

```bash
# Status
tailscale status

# IP
tailscale ip -4
tailscale ip -6

# Conectar
tailscale up

# Desconectar
tailscale down

# Dispositivos
tailscale status --json | jq '.Peer'
```

---

## Backup

```bash
# Executar backup
/opt/scripts/backup.sh

# Listar backups
ls -la /var/backups/edicula/

# Testar restore
/opt/scripts/test-restore.sh

# Restaurar
/opt/scripts/restore.sh 20260218_030000

# Restore dry-run
/opt/scripts/restore.sh 20260218_030000 --dry-run

# Verificar espaco
df -h
du -sh /var/backups/edicula/*
```

---

## Monitoramento

```bash
# Health check
/opt/monitoring/health-check.sh

# Metricas
/opt/monitoring/metrics.sh

# Auditoria
/opt/scripts/audit.sh

# Verificar timers
systemctl list-timers

# Timer status
systemctl status edicula-healthcheck.timer
```

---

## Atualizacao

```bash
# Atualizar tudo
/opt/scripts/update.sh

# Atualizar apenas sistema
apt update && apt upgrade -y

# Atualizar OpenClaw
npm update -g openclaw@latest
systemctl restart openclaw

# Atualizar Docker
apt upgrade docker-ce

# Renovar SSL
certbot renew
systemctl reload nginx
```

---

## SSL

```bash
# Ver certificados
certbot certificates

# Testar renovacao
certbot renew --dry-run

# Renovar
certbot renew

# Gerar novo
certbot certonly --standalone -d dominio.com

# Verificar SSL online
curl -I https://seudominio.com
openssl s_client -connect seudominio.com:443
```

---

## Seguranca

```bash
# Auditoria completa
/opt/scripts/audit.sh

# Ver logs de login
last
last -10
lastb

# Ver tentativas falhadas
grep -i "failed" /var/log/auth.log
grep -i "invalid" /var/log/nginx/error.log

# Ver IPs bloqueados
iptables -L -n
ufw status numbered

# Mudar senha OpenClaw
nano /etc/openclaw/openclaw.json
systemctl restart openclaw
```

---

## Disco

```bash
# Uso
df -h

# Diretorios grandes
du -sh /var/*
du -sh /var/log/*

# Limpar Docker
docker system prune -a
docker volume prune -f

# Limpar apt
apt clean
apt autoremove
```

---

## Memória

```bash
# Ver uso
free -h
cat /proc/meminfo

# Processos
ps aux --sort=-%mem | head
htop

# Limpar cache
sync && echo 3 > /proc/sys/vm/drop_caches
```

---

## Troubleshooting

```bash
# Ver todos os servicos
systemctl status openclaw nginx docker fail2ban

# Ver todos os logs
journalctl -xe --no-pager -u openclaw

# Debug rede
ip addr
ip route
ping -c 4 google.com

# DNS
nslookup seudominio.com
dig seudominio.com
```

---

## Arquivos Importantes

| Arquivo | Descricao |
|---------|-----------|
| `/etc/openclaw/openclaw.json` | Configuracao OpenClaw |
| `/etc/openclaw/env` | Variaveis de ambiente |
| `/etc/nginx/sites-available/openclaw-ssl` | Configuracao Nginx |
| `/etc/fail2ban/jail.local` | Regras Fail2Ban |
| `/etc/logrotate.d/edicula` | Rotacao de logs |
| `/var/log/openclaw/` | Logs OpenClaw |
| `/var/log/nginx/` | Logs Nginx |
| `/var/backups/edicula/` | Backups locais |

---

## Portas Padrao

| Porta | Servico |
|-------|---------|
| 22/2222 | SSH |
| 80 | HTTP |
| 443 | HTTPS |
| 18789 | OpenClaw |
| 41641 | Tailscale |
| 3478 | Tailscale STUN |
| 123 | NTP |

# Troubleshooting - EdiculaWorks

## Problemas Comuns e Soluções

---

## OpenClaw

### Porta em Uso

**Sintoma**: `Error: listen EADDRINUSE: address already in use :::18789`

**Solução**:
```bash
lsof -i :18789
kill -9 <PID>
systemctl restart openclaw
```

---

### API Key Inválida

**Sintoma**: `Error: Invalid API key` ou `401 Unauthorized`

**Solução**:
```bash
nano /etc/openclaw/env
# Verificar se a chave está correta
#GET https://openrouter.ai/settings/keys

systemctl restart openclaw
journalctl -u openclaw -f
```

---

### Memória Insuficiente

**Sintoma**: `JavaScript heap out of memory` ou sistema lento

**Solução**:
```bash
free -h
htop

# Aumentar limite de memória no systemd
nano /etc/systemd/system/openclaw.service
# Adicionar: Environment=NODE_OPTIONS="--max-old-space-size=1024"

systemctl daemon-reload
systemctl restart openclaw
```

---

### WebSocket Falhando

**Sintoma**: Conexão cai constantemente ou não conecta

**Solução**:
```bash
# Verificar configuração Nginx
nginx -t

# Verificar headers WebSocket
curl -I -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  http://localhost:18789/ws
```

---

## Nginx

### Certificado SSL Expira

**Sintoma**: `ERR_CERT_DATE_INVALID` no navegador

**Solução**:
```bash
# Verificar expiração
certbot certificates

# Renovar
certbot renew

# Se não funcionar, renovar manualmente
certbot renew --force-renewal

systemctl reload nginx
```

---

### 502 Bad Gateway

**Sintoma**: Erro 502 ao acessar

**Solução**:
```bash
# Verificar se OpenClaw está rodando
systemctl status openclaw

# Ver logs
journalctl -u openclaw -n 50

# Reiniciar
systemctl restart openclaw nginx
```

---

### Rate Limiting Bloqueando

**Sintoma**: `429 Too Many Requests`

**Solução**:
```bash
# Ver configuração de rate limiting
cat /etc/nginx/sites-enabled/openclaw-ssl | grep limit_req

# Aumentar limites temporariamente (se necessário)
# Edite /etc/nginx/nginx.conf
```

---

## SSH

### Bloqueado do Servidor

**Sintoma**: Não consegue acessar SSH

**Solução**:

1. **Via Tailscale** (se instalado):
```bash
tailscale ssh usuario@100.x.x.x
```

2. **Via Console VPS** (painel do provedor):
```bash
# Acesse o console
sudo ufw allow 2222/tcp
sudo systemctl restart ssh
```

3. **Via modo recovery**:
   - Inicie em modo recovery
   - Monte o sistema
   - Edite `/etc/ssh/sshd_config` para reativar password auth
   - Reinicie

---

### chave SSH Não Funciona

**Sintoma**: `Permission denied (publickey)`

**Solução**:
```bash
# No seu computador
ssh-copy-id -p 2222 usuario@IP

# No servidor, verificar
cat ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

---

## Firewall

### Porta Bloqueada

**Sintoma**: Não consegue acessar serviço

**Solução**:
```bash
# Ver regras
ufw status numbered

# Abrir porta
ufw allow 18789/tcp comment 'OpenClaw'

# Remover regra
ufw delete <numero>
```

---

### SSH Rate Limiting Muito Restritivo

**Sintoma**: Bloqueado ao tentar conectar

**Solução**:
```bash
# Ver status
ufw status

# Temporariamente desativar
ufw disable

# Acessar e reconfigurar
# Editar /etc/ufw/user.rules
# Mudar LIMIT para ACCEPT para SSH

ufw enable
```

---

## Backup

### Backup Falhando

**Sintoma**: `Error` no log de backup

**Solução**:
```bash
# Ver logs
tail -f /var/log/backup.log

# Verificar espaço
df -h

# Testar rclone
rclone lsd backup-edicula:

# Verificar GPG
gpg --list-keys
```

---

### Restore Não Funciona

**Sintoma**: Restore falha ou arquivos não restauram

**Solução**:
```bash
# Verificar backup disponível
/opt/scripts/test-restore.sh

# Dry run
/opt/scripts/restore.sh DATA --dry-run

# Verificar checksums
cd /var/backups/edicula/DATA
sha256sum -c checksums.sha256
```

---

## Tailscale

### Não Conecta

**Sintoma**: `tailscale status` mostra offline

**Solução**:
```bash
# Ver serviço
systemctl status tailscaled

# Reiniciar
systemctl restart tailscaled

# Ver logs
journalctl -u tailscaled -f

# Verificar portas
ss -uln | grep 41641
```

---

### Funnel Não Funciona

**Sintoma**: `tailscale funnel` falha

**Solução**:
```bash
# Ver status
tailscale funnel status

# Recriar
tailscale funnel 18789

# Verificar DNS
dig +short tailscalehost.local
```

---

## Docker

### Docker Não Inicia

**Sintoma**: `Failed to start Docker`

**Solução**:
```bash
# Ver logs
journalctl -u docker -n 50

# Verificar configuração
docker info

# Recriar configuração
rm /etc/docker/daemon.json
systemctl restart docker
```

---

### Sem Espaço

**Sintoma**: `No space left on device`

**Solução**:
```bash
# Limpar containers parados
docker container prune -f

# Limpar imagens
docker image prune -a -f

# Limpar volumes
docker volume prune -f

# Limpar build cache
docker builder prune -f
```

---

## Rede

### DNS Não Resolvendo

**Sintoma**: Domínio não carrega

**Solução**:
```bash
# Testar DNS
nslookup dominio.com
dig dominio.com

# Mudar DNS
nano /etc/resolv.conf
# Adicionar: nameserver 8.8.8.8
```

---

### Latência Alta

**Sintoma**: Servidor lento

**Solução**:
```bash
# Verificar load
uptime
htop

# Ver rede
iftop
netstat -i

# Ver processos
ps aux --sort=-%cpu | head
```

---

## Monitoramento

### Health Check Falhando

**Sintoma**: Alerta de serviço down

**Solução**:
```bash
# Executar manualmente
/opt/monitoring/health-check.sh

# Verificar cada serviço
systemctl status openclaw nginx docker

# Ver logs
journalctl -u openclaw
```

---

## Comandos de Debug

```bash
# Status de todos os serviços
systemctl status openclaw nginx docker fail2ban tailscaled

# Logs recentes
journalctl -xe --no-pager -u openclaw

# Conexões
ss -tuln
netstat -tulpn

# Processos
ps aux | grep -E "openclaw|nginx|docker"

# Memória
free -h
cat /proc/meminfo

# Disco
df -h
du -sh /var/*

# Rede
ip addr
ip route
```

---

## Emergency Contacts

- **Provedor VPS**: _______________
- **Email**: _______________
- **Telefone**: _______________

---

## Próximos Passos

Se o problema persistir:

1. Execute `/opt/scripts/audit.sh`
2. Verifique `/opt/monitoring/metrics.sh`
3. Consulte `docs/seguranca.md`
4. Execute recovery se necessário: `docs/DISASTER_RECOVERY.md`

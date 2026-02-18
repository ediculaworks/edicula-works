# Disaster Recovery - EdiculaWorks

## Visão Geral

Este documento descreve os procedimentos de recuperação para diferentes cenários de desastre, desde falhas parciais até perda total do servidor.

---

## Cenários de Desastre

### Níveis de Severidade

| Nível | Descrição | RTO | RPO |
|-------|-----------|-----|-----|
| 1 - Baixo | Serviço indisponível | 1h | 0 |
| 2 - Médio | Dados corrompidos | 4h | 24h |
| 3 - Alto | Servidor perdido | 24h | 24h |

---

## Cenário 1: Serviço Indisponível

### Problema: OpenClaw não inicia

**Sintomas**:
- `systemctl status openclaw` mostra failed
- Erros no journal

**Solução**:
```bash
# 1. Verificar logs
journalctl -u openclaw -n 100 --no-pager

# 2. Identificar erro
# Erros comuns:
# - Porta em uso: lsof -i :18789
# - API Key: verificar /etc/openclaw/env
# - Permissão: chown -R openclaw:openclaw /etc/openclaw

# 3. Corrigir
# Se porta em uso:
kill -9 $(lsof -t -i :18789)

# Se permissão:
chown -R openclaw:openclaw /etc/openclaw /var/lib/openclaw

# 4. Reiniciar
systemctl restart openclaw
systemctl status openclaw
```

---

### Problema: Nginx não inicia

**Solução**:
```bash
# 1. Verificar configuração
nginx -t

# 2. Ver certificados SSL
ls -la /etc/letsencrypt/live/

# 3. Regenerar certificados se necessário
certbot certonly --standalone -d dominio.com

# 4. Reiniciar
systemctl restart nginx
```

---

### Problema: Banco de dados corrompido

**Solução**:
```bash
# Se usando SQLite (padrão OpenClaw)
/var/lib/openclaw/*.db

# Verificar integridade
sqlite3 /var/lib/openclaw/openclaw.db "PRAGMA integrity_check;"

# Se corrompido, restaurar do backup
/opt/scripts/restore.sh DATA
```

---

## Cenário 2: Dados Corrompidos ou Perdidos

### Problema: Configurações perdidas

**Solução**:
```bash
# 1. Listar backups disponíveis
/opt/scripts/test-restore.sh

# 2. Restaurar configurações
/opt/scripts/restore.sh 20260218_030000

# 3. Reiniciar serviços
systemctl restart openclaw nginx docker
```

---

### Problema: Senha perdida

**Solução**:
```bash
# 1. Gerar nova senha
openssl rand -base64 32

# 2. Atualizar configuração
nano /etc/openclaw/openclaw.json
# Alterar "password": "NOVA_SENHA"

# 3. Criptografar se necessário (se usar hash)
# Consultar docs do OpenClaw

# 4. Reiniciar
systemctl restart openclaw
```

---

### Problema: API Key comprometida

**Solução**:
```bash
# 1. Revogar chave no provedor (OpenRouter)
# Acesse: https://openrouter.ai/settings/keys

# 2. Gerar nova chave
# Acesse: https://openrouter.ai/keys

# 3. Atualizar
nano /etc/openclaw/env
# OPENROUTER_API_KEY=nova_chave

# 4. Reiniciar
systemctl restart openclaw
```

---

## Cenário 3: Servidor Completo Perdido

### Preparação (antes do desastre)

Mantenha sempre em local seguro:
- [ ] Backups na nuvem (rclone)
- [ ] Chave GPG privada (backup seguro)
- [ ] Credenciais OpenRouter
- [ ] Credenciais Tailscale
- [ ] Chave SSH privada
- [ ] Documentação

### Recuperação

#### Passo 1: Provisionar novo servidor

```bash
# Criar nova VPS
# Ubuntu 22.04 LTS
# 4GB RAM, 2 CPU, 50GB SSD
```

#### Passo 2:Clone do repositório

```bash
git clone https://github.com/ediculaworks/infra.git
cd infra
chmod +x install-all.sh
```

#### Passo 3: Instalação base

```bash
# Instalação interativa
sudo ./install-all.sh
```

#### Passo 4: Restaurar backup

```bash
# Escolher backup mais recente
/opt/scripts/restore.sh 20260218_030000
```

#### Passo 5: Configurar credenciais

```bash
# API Key
nano /etc/openclaw/env

# Senha
nano /etc/openclaw/openclaw.json

# Tailscale
tailscale up --accept-routes --accept-dns
```

#### Passo 6: Verificar

```bash
# Health check
/opt/monitoring/health-check.sh

# Testar acesso
curl https://seudominio.com/api/health

# Ver logs
journalctl -u openclaw -f
```

---

## Recuperação Parcial

### Apenas Nginx

```bash
# Reinstallar Nginx
apt install --reinstall nginx

# Regenerar SSL
certbot certonly --standalone -d dominio.com --force-renewal

# Copiar configuração do repo
cp config/nginx.conf /etc/nginx/sites-available/openclaw
systemctl restart nginx
```

### Apenas OpenClaw

```bash
# Reinstalar
npm install -g openclaw@latest

# Copiar configuração
cp config/openclaw.json /etc/openclaw/

# Restaurar do backup se necessário
/opt/scripts/restore.sh DATA

systemctl restart openclaw
```

### Apenas Backup

```bash
# Verificar Cloud
rclone lsd backup-edicula:backups/vps/

# Baixar backup específico
rclone copy backup-edicula:backups/vps/20260218_030000 /tmp/restore/

# Extrair
cd /tmp/restore
tar -xzf etc.openclaw.tar.gz -C /
```

---

## Rollback

### Voltar para versão anterior

```bash
# Listar versões
ls /var/backups/edicula/

# Parar serviços
systemctl stop openclaw nginx

# Restaurar
/opt/scripts/restore.sh DATA_ANTERIOR

# Iniciar
systemctl start openclaw nginx
```

---

## Verificação Pós-Recuperação

### Checklist de Validação

```bash
# 1. Serviços
systemctl status openclaw nginx docker

# 2. Health check
/opt/monitoring/health-check.sh

# 3. SSL
curl -I https://seudominio.com

# 4. API
curl http://localhost:18789/api/health

# 5. Tailscale
tailscale status

# 6. Backup
/opt/scripts/test-restore.sh
```

---

## Prevenção

### Backups Automatizados

Configure crontab:
```bash
crontab -e

# Backup diário às 3h
0 3 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1

# Teste semanal
0 4 * * 0 /opt/scripts/test-restore.sh >> /var/log/test-restore.log 2>&1
```

### Monitoramento

```bash
# Ativar timer
systemctl enable edicula-healthcheck.timer
systemctl start edicula-healthcheck.timer

# Verificar
systemctl list-timers
```

### Snapshots (VPS)

Ative snapshots automáticos no painel do provedor:
- Frequência: diária
- Retenção: 7 dias

---

## Contatos de Emergência

| Serviço | Contato |
|---------|---------|
| Provedor VPS | _______________ |
| Domínio | _______________ |
| OpenRouter | openrouter.ai/support |
| Tailscale | tailscale.com/support |

---

## Tempo de Recuperação Estimado

| Cenário | Tempo |
|---------|-------|
| Reiniciar serviço | 5 min |
| Restore parcial | 15 min |
| Servidor novo | 1-2 horas |
| Configuração completa | 2-4 horas |

---

## Lições Aprendidas

Documente每次 incidente:
- O que aconteceu
- Como foi resolvido
- Quanto tempo demorou
- O que pode ser melhorado

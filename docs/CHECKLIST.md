# Checklist de Segurança - EdiculaWorks

## Visão Geral

Este checklist deve ser seguido para garantir a segurança da infraestrutura EdiculaWorks. Execute as verificações regularmente e após qualquer alteração na configuração.

---

## Pré-Instalação

- [ ] VPS provisioning concluída
- [ ] Ubuntu 22.04 LTS instalado
- [ ] Acesso root obtido
- [ ] Domínio configurado (DNS apontando para VPS)
- [ ] Email válido para Let's Encrypt

---

## Instalação

### Sistema Base

- [ ] Usuário não-root criado
- [ ] Chave SSH configurada para usuário
- [ ] sudo configurado para usuário
- [ ] Atualizações aplicadas: `apt update && apt upgrade`

### Firewall

- [ ] UFW instalado
- [ ] Política padrão: deny incoming
- [ ] Porta SSH (2222) aberta com rate limiting
- [ ] Portas 80/443 (HTTP/HTTPS) abertas
- [ ] Porta 41641 (Tailscale) aberta
- [ ] Firewall habilitado

### SSH

- [ ] Porta alterada para 2222
- [ ] Root login desabilitado
- [ ] Autenticação por chave obrigatória
- [ ] Password authentication desabilitado
- [ ] Protocolo 2 apenas
- [ ] Criptografia forte configurada
- [ ] Banner de aviso instalado
- [ ] Fail2Ban instalado e configurado

### Docker

- [ ] Docker instalado
- [ ] Usuário dockerapp criado
- [ ] Socket protegido (660)
- [ ] daemon.json com segurança configurado
- [ ] Docker iniciado e enabled

### OpenClaw

- [ ] Node.js 22.x instalado
- [ ] OpenClaw instalado globalmente
- [ ] Usuário openclaw criado
- [ ] Configuração em /etc/openclaw/
- [ ] Senha alterada (não padrão)
- [ ] API Key configurada
- [ ] Serviço systemd criado
- [ ] Serviço enabled e running
- [ ] Modo sandbox verificado

### Nginx + SSL

- [ ] Nginx instalado
- [ ] Certbot instalado
- [ ] Certificado Let's Encrypt gerado
- [ ] Redirect HTTP → HTTPS
- [ ] HSTS habilitado
- [ ] Headers de segurança
- [ ] Rate limiting configurado
- [ ] OCSP Stapling configurado

### Tailscale

- [ ] Tailscale instalado
- [ ] Autenticado com conta
- [ ] Conectado à rede
- [ ] Status verificado

### Backup

- [ ] Rclone instalado
- [ ] Storage configurado (Google Drive/S3)
- [ ] Chave GPG gerada
- [ ] GPG_RECIPIENT configurado
- [ ] Script backup.sh configurado
- [ ] Cron job configurado (3h diário)
- [ ] Backup manual executado com sucesso
- [ ] Restore testado

### Monitoramento

- [ ] Script health-check.sh instalado
- [ ] Script metrics.sh instalado
- [ ] Timer systemd configurado
- [ ] Notificações configuradas (Telegram/Slack)
- [ ] Verificação manual executada

---

## Verificações Diárias

### Manhã

```bash
# Verificar status dos serviços
systemctl status openclaw nginx docker fail2ban

# Verificar health check
/opt/monitoring/health-check.sh

# Verificar logs
journalctl -u openclaw -n 50 --no-pager
```

### Semanal

```bash
# Executar auditoria
/opt/scripts/audit.sh

# Verificar backups
/opt/scripts/test-restore.sh

# Verificar espaço em disco
df -h /

# Verificar atualizações
apt list --upgradable
```

### Mensal

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Atualizar OpenClaw
npm update -g openclaw@latest

# Atualizar Docker
apt upgrade docker-ce

# Atualizar Tailscale
apt upgrade tailscale

# Reiniciar serviços
systemctl restart openclaw nginx
```

---

## Verificações de Segurança

### Autenticação

- [ ] SSH usa apenas chave pública
- [ ] Senha OpenClaw forte (12+ caracteres)
- [ ] API Key do OpenClaw em variável de ambiente
- [ ] senhas não expostas em arquivos

### Rede

- [ ] Apenas portas necessárias abertas
- [ ] Firewall UFW ativo
- [ ] Rate limiting funcionando
- [ ] SSL/TLS moderno (TLS 1.2+)
- [ ] Headers de segurança presentes

### Sistema

- [ ] Usuários desnecessários removidos
- [ ] Pacotes desnecessários removidos
- [ ] Logs sendo monitorados
- [ ] Fail2Ban banindo atacantes

### Dados

- [ ] Backups automáticos funcionando
- [ ] Backups criptografados
- [ ] Backups testados (restore)
- [ ] Chave GPG segura (não perdida)
- [ ] Backups offsite (nuvem)

---

## Recuperação

### Plano de Recuperação

- [ ] Backup recente disponível
- [ ] Credenciais anotadas em local seguro
- [ ] Documentação atualizada
- [ ] Procedimento documentado
- [ ] Teste de restore realizado

### Contatos de Emergência

- [ ] Provedor VPS: _______________
- [ ] Email: _______________
- [ ] Telefone: _______________

---

## Auditoria Trimestral

Execute `/opt/scripts/audit.sh` e verifique:

1. **Acesso**: Revogue acessos desnecessários
2. **Logs**: Analise padrões suspeitos
3. **Certificados**: Renew se necessário
4. **Backups**: Teste restore
5. **Atualizações**: Aplique security patches

---

## Comandos de Referência

| Ação | Comando |
|------|---------|
| Ver serviços | `systemctl status openclaw nginx docker fail2ban` |
| Ver logs | `journalctl -u openclaw -f` |
| Health check | `/opt/monitoring/health-check.sh` |
| Auditoria | `/opt/scripts/audit.sh` |
| Métricas | `/opt/monitoring/metrics.sh` |
| Backup | `/opt/scripts/backup.sh` |
| Test restore | `/opt/scripts/test-restore.sh` |
| Ver backups | `ls -la /var/backups/edicula/` |
| Ver firewall | `ufw status verbose` |
| Ver SSL | `certbot certificates` |
| Atualizar sistema | `apt update && apt upgrade -y` |

---

## Assinatura

**Última verificação**: __/__/____

**Realizado por**: _______________

**Próxima verificação**: __/__/____

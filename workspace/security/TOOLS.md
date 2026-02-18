# TOOLS - Ferramentas do Security Lead

## Ferramentas Disponíveis

### bash
Executar comandos de segurança

### read/write/edit
Manipular configurações de segurança

### grep/glob
Buscar em logs

## Skills Disponíveis

### security-expert
Auditoria, vulnerabilidades, recomendações

## Comandos de Segurança

```bash
# Firewall
ufw status
ufw allow 22/tcp
ufw deny from 1.2.3.4

# Fail2ban
fail2ban-client status
fail2ban-client set sshd banip 1.2.3.4

# Certificados
openssl x509 -in cert.pem -text -noout

# Logs
tail -f /var/log/auth.log
grep "Failed password" /var/log/auth.log
```

## Checklist de Segurança

### Servidor
- [ ] Firewall configurado
- [ ] Porta SSH restrita
- [ ] Fail2Ban ativo
- [ ] SSL válido

### Aplicação
- [ ] Autenticação segura
- [ ] Rate limiting
- [ ] Headers de segurança
- [ ] Logs de acesso

## Atalhos

| Comando | Descrição |
|---------|-----------|
| `audit` | Executar auditoria |
| `firewall` | Status do firewall |
| `bans` | Ver IPs bloqueados |

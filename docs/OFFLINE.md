# Operação Offline - EdiculaWorks

## Visão Geral

Este documento explica como operar o OpenClaw em cenários de conectividade limitada ou indisponível.

---

## Cenários

### 1. Internet Indisponível Temporariamente

O OpenClaw pode continuar funcionando se já estiver com o modelo carregado em cache.

**O que continua funcionando:**
- Conversas ativas
- Ferramentas locais (bash, read, write, edit)
- Plugins já carregados

**O que para de funcionar:**
- Novas requisições à API (OpenRouter)
- Renovação de certificados SSL
- Atualizações
- Backups para nuvem

---

### 2. Modo Offline Completo

Para operação sem internet, configure modelos locais.

### Instalando Ollama (Modelos Locais)

```bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Baixar modelo (requer internet temporariamente)
ollama pull llama2
ollama pull codellama

# Configurar OpenClaw para usar Ollama
nano /etc/openclaw/openclaw.json
```

```json
{
  "models": {
    "providers": [
      {
        "name": "ollama",
        "baseUrl": "http://localhost:11434",
        "models": ["llama2", "codellama"]
      }
    ]
  }
}
```

### Modelos Recomendados para Offline

| Modelo | Tamanho | Uso |
|--------|---------|-----|
| llama2:7b | 3.8GB | Geral |
| codellama:7b | 3.8GB | Código |
| mistral:7b | 4.1GB | Geral |
| neural-chat:7b | 4.1GB | Chat |

---

### 3. Operando via Tailscale Offline

Se a internet cair mas Tailscale ainda funcionar (rede local):

```bash
# Verificar status Tailscale
tailscale status

# Acessar via IP Tailscale
ssh -p 2222 usuario@100.x.x.x

# OpenClaw continua acessível
curl http://100.x.x.x:18789/api/health
```

---

## Estratégias de Resiliência

### Cache de Certificados

Os certificados Let's Encrypt são válidos por 90 dias. Configure renovação automática:

```bash
# Adicionar ao crontab
crontab -e

# Renovar automaticamente quando próximo do vencimento
0 3 * * * /usr/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

### Backup Local

Quando a internet falha, mantenha backups locais:

```bash
# Modificar backup.sh para sempre manter local
nano /opt/scripts/backup.sh

# Comentar linha de upload para nuvem
# rclone copy "$TEMP_DIR" ...

# Apenas copiar localmente
cp -r "$TEMP_DIR" /var/backups/edicula/
```

### Monitoramento Local

Configure alertas que não dependam de internet:

```bash
# Alertas via Tailscale (se ainda conectado)
# ou

# Enviar email local (Postfix)
apt install -y postfix
```

---

## Checklist de Preparação

### Antes de Ficar Offline

- [ ] Certificados SSL válidos (mínimo 30 dias)
- [ ] Backups locais recentes
- [ ] Modelos Ollama baixados (se planejado offline)
- [ ] Configuração de serviços verificada
- [ ] Documentação offline disponível

### Durante Offline

- [ ] Monitorar serviços localmente
- [ ] Manter backups locais
- [ ] Não tentar renovações SSL
- [ ] Documentar incidentes

### Após Voltar Online

- [ ] Verificar certificados
- [ ] Executar backup para nuvem
- [ ] Sincronizar dados
- [ ] Atualizar sistema

---

## Solução de Problemas

### OpenClaw não responde

```bash
# Verificar se ainda está rodando
systemctl status openclaw

# Verificar logs
journalctl -u openclaw -n 50

# Testar localmente
curl http://localhost:18789/api/health
```

### Certificado expirou

```bash
# Verificar validade
certbot certificates

# Quando internet voltar
certbot renew --force-renewal

# ou gerar novo
certbot certonly --standalone -d dominio.com
```

### Backup para nuvem falha

```bash
# Verificar conexão
ping -c 4 8.8.8.8

# Testar rclone
rclone listremotes

# Quando voltar, fazer backup manual
/opt/scripts/backup.sh
```

---

## Configuração de Emergência

### DNS Offline

Se DNS falhar, use IPs diretos:

```bash
# Adicionar ao /etc/hosts
echo "100.x.x.x seudominio.com" >> /etc/hosts
```

### Servidor de Emergência

Mantenha um servidor secundário com backup:

```bash
# No servidor secundário
git clone https://github.com/ediculaworks/infra.git
./install-all.sh

# Restaurar do backup
/opt/scripts/restore.sh
```

---

## Recursos

- [Ollama](https://ollama.ai) - Modelos locais
- [LocalAI](https://localai.io) - Alternativa com API compatível
- [Text Generation Webui](https://github.com/oobabooga/text-generation-webui) - Interface web local

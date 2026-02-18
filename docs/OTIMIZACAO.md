# Otimização de Custos - EdiculaWorks

## Visão Geral

Este documento detalha estratégias para minimizar custos mantendo performance e funcionalidade.

---

## Análise de Custos

### Custos Atuais (Estimativa Mensal)

| Serviço | Plano | Custo |
|---------|-------|-------|
| VPS 4GB/2CPU | Cloud | R$100 |
| Domínio | Anual | R$3.33/mês |
| OpenRouter | Grátis | R$0 |
| Tailscale | Grátis | R$0 |
| **Total** | | **R$103/mês** |

### Custos Potenciais a Evitar

| Serviço | Plano | Custo | Quando Usar |
|---------|-------|-------|-------------|
| OpenRouter Plus | Paid | R$5-50/mês | Apenas se necessário |
| VPS maior | 8GB | +R$80/mês | Evitar |
| Banco de dados | Managed | +R$50/mês | Evitar |
| Monitoramento | SaaS | +R$50/mês | Evitar |

---

## Estratégias de Otimização

### 1. Modelos de IA

#### Stack Recomendada (Ordem de Prioridade)

```json
{
  "models": {
    "providers": [
      {
        "name": "openrouter",
        "apiKey": "${OPENROUTER_API_KEY}",
        "fallback": [
          "openrouter/google/gemini-2.0-flash-001",
          "openrouter/meta-llama/llama-3.1-8b-instruct",
          "openrouter/anthropic/claude-3-haiku"
        ]
      }
    ]
  }
}
```

#### Comparativo de Custo

| Modelo | Input | Output | Recomendação |
|--------|-------|--------|--------------|
| claude-3-haiku | $0.08 | $0.40 | Padrão |
| llama-3.1-8b | $0.05 | $0.40 | Tarefas simples |
| gemini-2.0-flash | $0.00 | $0.00 | Grátis (200/dia) |

#### Dicas

- Use `haiku` para conversas simples
- Use `llama` para tarefas de código
- Use `gemini-flash` como backupgratuito
- Configure cache de prompts

---

### 2. Otimização de Tokens

#### System Prompt Compacto

```markdown
# Evite prompts longos
Você é EdiculaBot. Seja conciso.Código: Use markdown.
```

#### Técnicas

1. **Resumo de Histórico**: A cada 20 mensagens, resuma
2. **Cache de Contexto**: Repita apenas o necessário
3. **Compression**: Use abreviações em prompts de sistema
4. **Streaming**: Use para respostas longas

#### Exemplo de Economia

```
✗ Antes: "Por favor, você poderia me ajudar a verificar..."
✓ Depois: "Verifique status dos serviços"
```

**Economia**: ~70% tokens em requests simples

---

### 3. Recursos de VPS

#### Otimizações Recomendadas

```bash
# Kernel tweaks para menor uso de memória
echo 'vm.swappiness=10' >> /etc/sysctl.conf

# Limit Docker memory
# /etc/docker/daemon.json
{
  "default-ulimits": {
    "nofile": {"Hard": 64000, "Soft": 64000}
  }
}

# Nginx worker processes
worker_processes auto;
worker_connections 1024;
```

#### Serviços Essenciais vs Opcionais

| Serviço | Essencial | Alternativa |
|---------|-----------|-------------|
| OpenClaw | ✅ | - |
| Nginx | ✅ | Caddy (mais leve) |
| Fail2Ban | ✅ | UFW rate limit only |
| Docker | ⚠️ | Opcional |
| Tailscale | ⚠️ | VPN manual |

---

### 4. Backup

#### Estratégia de Custo Zero

```bash
#-backup.sh - Otimizado para custo zero

# 1. Local apenas (sem nuvem paga)
LOCAL_BACKUP_DIR="/var/backups/edicula"

# 2. Compressão máxima
tar -czf ...

# 3. Retention curto (7 dias local)
find ... -mtime +7 -delete
```

#### Quando Usar Nuvem

- Rclone com Google Drive (15GB grátis)
- Backblaze B2 ($0.006/GB)
- Evitar S3 (caro)

---

### 5. Monitoramento

#### Soluções Gratuitas

| Ferramenta | Custo | Uso |
|------------|-------|-----|
| systemd timer | R$0 | Health check |
| df/free | R$0 | Recursos |
| fail2ban | R$0 | Segurança |
| certbot | R$0 | SSL |

#### O que Evitar

- Datadog ($15+/mês)
- New Relic ($15+/mês)
- Prometheus (complexo demais)

---

### 6. Rede

#### Otimizações

```nginx
# nginx.conf
gzip on;
gzip_types text/plain application/json;
gzip_min_length 1000;

# Cache agressivo
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=cache:10m max_size=100m;
```

#### CDN

Se necessário, use Cloudflare GRÁTIS (não pro).

---

## Configuração Otimizada

### openclaw.json

```json5
{
  "gateway": {
    "mode": "local",
    "bind": "loopback",
    "port": 18789,
    "auth": {
      "mode": "password",
      "password": "senha_segura"
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "openrouter/anthropic/claude-3-haiku",
        "fallbacks": [
          "openrouter/google/gemini-2.0-flash-001"
        ]
      }
    }
  },
  "tools": {
    "browser": {
      "enabled": false
    }
  }
}
```

### Variáveis de Ambiente

```bash
# Não é necessário definir variáveis para OpenRouter
# A API key é configurada automaticamente pelo OpenClaw
# Use: openclaw configure models.providers.openrouter.apiKey "sua-chave"
NODE_ENV=production
```

---

## Métricas de Economia

### KPls a Monitorar

| Métrica | Meta |
|---------|------|
| Custo OpenRouter | < R$10/mês |
| Uso de tokens | < 1M/mês |
| Tempo de resposta | < 2s |
| Uptime | > 99.5% |

### Verificação Mensal

```bash
# Custo OpenRouter (verificar dashboard)
# Tokens usados (verificar dashboard)
# Tempo de resposta (curl -w)
# Backups (verificar espaço)
```

---

## Resumo

| Estratégia | Economia Potencial |
|------------|-------------------|
| Modelo gratuito (gemini-flash) | R$5-20/mês |
| Otimização de prompts | 30-50% tokens |
| Sem serviços desnecessários | R$50+/mês |
| Backup local | R$5-10/mês |
| Monitoramento gratuito | R$15+/mês |
| **Total** | **R$70-95/mês** |

---

## Alertas

Configure alertas para evitar custos inesperados:

```bash
# No /opt/monitoring/notify.sh
if [ "$COST" -gt 15 ]; then
    send_alert "Custo OpenRouter excedeu R$15!"
fi
```

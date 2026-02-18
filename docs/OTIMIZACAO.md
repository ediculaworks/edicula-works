# Otimização - EdiculaWorks

## Visão Geral

Este documento detalha estratégias para otimizar performance e recursos.

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

#### Princípios

- **Gratuito primeiro**: Gemini Flash e Haiku são gratuitos
- **Fallback chain**: Se um modelo falha, usa o próximo
- **Tokens**: Configure limites para evitar gastos excessivos

---

### 2. Cache

#### Nginx

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=edicula:10m inactive=60m;

server {
    proxy_cache edicula;
    proxy_cache_valid 200 60m;
}
```

#### API

- Use cache em memória (Redis) para consultas frequentes
- Cache de embeddings (não regenerar para mesmo texto)

---

### 3. Database

#### Índices

Sempre crie índices para consultas frequentes:

```sql
CREATE INDEX idx_tarefas_coluna ON tarefas(coluna);
CREATE INDEX idx_tarefas_prioridade ON tarefas(prioridade);
```

#### Query Optimization

- Evite SELECT * - especifique colunas
- Use paginação para grandes resultados
- Cache queries agregadas

---

### 4. Docker

#### Imagens Leves

```dockerfile
# Use imagens alpine
FROM node:22-alpine

# Multi-stage build
FROM node:22-alpine AS builder
RUN npm ci --only=production
```

#### Recursos

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

---

### 5. Monitoring

#### O que Monitorar

| Métrica | Ferramenta |
|---------|------------|
| Uptime | Health checks |
| Erros | Logs |
| Performance | APM básico |
| Recursos | df, free |

#### Ferramentas Gratuitas

- systemd timers (health checks)
- logs nativos
- fail2ban
- certbot (SSL)

---

### 6. Backup

#### Estratégia

- Local: 7 dias
- Nuvem: 30 dias
- Verificação: Semanal

#### Scripts Otimizados

```bash
# Compressão máxima
tar -czf backup.tar.gz -C /etc openclaw

# Criptografia
gpg --encrypt --recipient $GPG_RECIPIENT backup.tar.gz
```

---

### 7. Rede

#### Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

#### Compression

```nginx
gzip on;
gzip_types text/plain application/json;
```

---

## Boas Práticas

1. **Meça antes de otimizar** - Não otimize sem dados
2. **Cache tudo que puder** - Reduz chamadas
3. **Use serviços gratuitos** - Gemini, Haiku, etc
4. **Monitore limites** - Evite surpresas
5. **Documente** - Explicite o que foi otimizado

---

## Referências

- [OpenRouter Pricing](https://openrouter.ai/pricing)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

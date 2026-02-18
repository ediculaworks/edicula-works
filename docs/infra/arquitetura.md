# EdiculaWorks - Arquitetura da Infraestrutura

## Visão Geral

Este documento descreve a arquitetura técnica da infraestrutura VPS da EdiculaWorks.

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
│                                                                  │
│   ┌──────────────┐              ┌──────────────────┐             │
│   │  Usuários    │              │  Plataforma      │             │
│   │  (Browser)   │              │  Externa         │             │
│   └──────┬───────┘              └────────┬─────────┘             │
│          │                                │                       │
│          │        ┌───────────────────────┘                       │
│          │        │                                              │
│          ▼        ▼                                              │
│   ┌──────────────────────────────────────────────┐              │
│   │              NGINX (Proxy Reverso)            │              │
│   │              openclaw.ediculaworks.com         │              │
│   └──────────────────────┬───────────────────────┘              │
│                          │                                       │
│                          │ SSL (Let's Encrypt)                   │
│                          ▼                                       │
│   ┌──────────────────────────────────────────────┐              │
│   │           OPENCLAW GATEWAY (Porta 18789)      │              │
│   │                                                │              │
│   │  ┌────────────┐  ┌────────────┐              │              │
│   │  │  Gateway   │  │   Agent    │              │              │
│   │  │  WebSocket │  │    (IA)    │              │              │
│   │  └────────────┘  └────────────┘              │              │
│   │                                                │              │
│   └──────────────────────┬───────────────────────┘              │
│                          │                                       │
│                          ▼                                       │
│   ┌──────────────────────────────────────────────┐              │
│   │              TAILSCALE                        │              │
│   │         (Rede VPN Privada)                    │              │
│   └──────────────────────┬───────────────────────┘              │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │    SUPABASE            │
              │   (Banco de Dados)    │
              └────────────────────────┘
```

## Componentes

### 1. OpenClaw Gateway

- **Porta**: 18789
- **Protocolo**: WebSocket + HTTP
- **Modelo padrão**: openrouter/anthropic/claude-3-haiku
- **Recursos**: Chat, automação, integrações

### 2. Nginx Proxy

- **Porta HTTP**: 80
- **Porta HTTPS**: 443
- **SSL**: Let's Encrypt (automático)
- **Função**: Proxy reverso + SSL

### 3. Tailscale

- **Função**: VPN para acesso remoto seguro
- **Rede**: 100.x.x.x (rede privada Tailscale)
- **Acesso**: Dispositivos autorizados apenas

### 4. Supabase (Externo)

- **Função**: Banco de dados
- **Conexão**: Via API REST
- **Free tier**: 500MB, 2 projetos

## Fluxo de Dados

### Acesso Público

1. Usuário acessa `https://openclaw.ediculaworks.com`
2. Nginx recebe requisição (porta 443)
3. Certifica SSL (Let's Encrypt)
4. Encaminha para OpenClaw (porta 18789)
5. OpenClaw processa requisição
6. Resposta retorna ao usuário

### Acesso via Tailscale

1. Usuário conecta ao Tailscale
2. Acessa `http://100.x.x.x:18789`
3. Conexão direta (criptografada)
4. OpenClaw processa requisição

### Integração com Plataforma Externa

1. Plataforma externa envia webhook
2. OpenClaw recebe e processa
3. Consulta Supabase se necessário
4. Retorna resposta para plataforma

## Segurança

### Camadas de Proteção

| Camada | Tecnologia | Função |
|--------|-----------|--------|
| Rede | Tailscale | VPN criptografada |
| SSL | Let's Encrypt | HTTPS obrigatório |
| API | Token auth | Autenticação |
| Firewall | UFW | Portas limitadas |

### Portas Abertas

| Porta | Serviço | Acesso |
|-------|---------|--------|
| 22 | SSH | Apenas Tailscale |
| 80 | HTTP | Redirect to HTTPS |
| 443 | HTTPS | Público |
| 18789 | OpenClaw | Tailscale only |

## Backup e Recuperação

### Estratégia de Backup

- **Frequência**: Diária (3h)
- **Retenção**: 7 dias local, 30 dias na nuvem
- **O que**: Configurações, credenciais

### Rcovery Point Objective (RPO)

- **Dados**: 24 horas
- **Configurações**: 1 hora

### Recovery Time Objective (RTO)

- **Estimativa**: 30 minutos a 2 horas

## Escalabilidade

### Limitações Atuais

- **RAM**: 4GB (limitante para múltiplos agentes)
- **CPU**: 2 vCPU (suficiente para uso leve)
- **Armazenamento**: 50GB SSD

### Possíveis Upgrades

1. Upgrade para 6-8GB RAM
2. Adicionar mais agentes
3. Cache Redis para sessões
4. Balanceador de carga

## Monitoramento

### Métricas Monitoradas

- Uptime do serviço
- Uso de RAM/CPU
- Requisições por dia
- Erros e alertas

### Ferramentas

- `systemctl status` - Status dos serviços
- `htop` - Uso de recursos
- `journalctl` - Logs
- Tailscale admin dashboard

## Manutenção

### Tarefas Recorrentes

| Frequência | Tarefa |
|------------|--------|
| Diária | Verificar logs |
| Semanal | Backup manual |
| Mensal | Atualizações de segurança |
| Trimestral | Revisão de segurança |

### Atualizações

```bash
# Sistema
apt update && apt upgrade -y

# OpenClaw
npm update -g openclaw@latest
systemctl restart openclaw

# Docker
apt upgrade docker-ce
```

## Limitações Conhecidas

1. **RAM limitada**: 4GB pode ser insuficiente para uso intenso
2. **Um único ponto de falha**: Sem cluster
3. **Backup manual**: Ainda não automatizado completamente
4. **Domínio necessário**: Para HTTPS público

## Próximos Passos

1. Implementar plataforma de tarefas
2. Integrar com Supabase
3. Configurar mais agentes
4. Adicionar monitoramento avançado

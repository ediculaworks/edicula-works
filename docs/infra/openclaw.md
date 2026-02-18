# OpenClaw - Guia de Instalação e Configuração

## Visão Geral

OpenClaw é o assistente de IA central da infraestrutura EdiculaWorks. Este documento cobre instalação, configuração e operação.

## Requisitos

- Ubuntu 22.04 LTS
- Node.js 22+
- 2GB RAM livre
- Acesso à internet

## Instalação

### 1. Instalar Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
```

Verifique a instalação:

```bash
node --version  # Deve mostrar v22.x.x
npm --version
```

### 2. Instalar OpenClaw

```bash
npm install -g openclaw@latest
```

Verifique:

```bash
openclaw --version
```

### 3. Configuração Inicial

Crie o diretório de configuração:

```bash
mkdir -p ~/.openclaw
```

Crie o arquivo de configuração:

```bash
nano ~/.openclaw/openclaw.json
```

Configuração básica:

```json5
{
  "gateway": {
    "mode": "local",
    "bind": "loopback",
    "port": 18789,
    "auth": {
      "mode": "password",
      "password": "senha_secreta"
    }
  },
  "agents": {
    "defaults": {
      "workspace": "~/.openclaw/workspace",
      "model": {
        "primary": "openrouter/anthropic/claude-3-haiku",
        "fallbacks": [
          "openrouter/meta-llama/llama-3.1-8b-instruct"
        ]
      }
    }
  },
  "channels": {
    "telegram": {
      "enabled": false,
      "dmPolicy": "pairing"
    }
  }
}
```

## Configuração de Modelos

### OpenRouter (Recomendado)

Crie uma conta em [openrouter.ai](https://openrouter.ai) e pegue sua API key gratuita.

Modelos gratuitos disponíveis:

| Modelo | Qualidade | Velocidade |
|--------|-----------|------------|
| openrouter/anthropic/claude-3-haiku | Boa | Rápido |
| openrouter/google/gemini-2.0-flash-001 | Excelente | Rápido (grátis) |
| openrouter/meta-llama/llama-3.1-8b-instruct | Boa | Rápido |

### Configuração Avançada de Modelos

```json5
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "openrouter/anthropic/claude-3-haiku",
        "fallbacks": [
          "openrouter/meta-llama/llama-3.1-8b-instruct",
          "openrouter/google/gemini-2.0-flash-001"
        ]
      },
      "models": {
        "openrouter/anthropic/claude-3-haiku": { "alias": "Haiku" },
        "openrouter/meta-llama/llama-3.1-8b-instruct": { "alias": "Llama" },
        "openrouter/google/gemini-2.0-flash-001": { "alias": "Gemini Flash" }
      }
    }
  }
}
```

## Executando o OpenClaw

### Modo Interativo (Teste)

```bash
openclaw gateway --port 18789 --verbose
```

### Como Serviço Systemd (Produção)

Crie o arquivo de serviço:

```bash
nano /etc/systemd/system/openclaw.service
```

Contenido:

```ini
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root
ExecStart=/usr/bin/openclaw gateway --port 18789
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Ative o serviço:

```bash
systemctl daemon-reload
systemctl enable openclaw
systemctl start openclaw
```

Verifique o status:

```bash
systemctl status openclaw
```

## Configuração de Canais

### WebChat (Interface Web)

O WebChat já vem incluído. Acesse via:
- `http://localhost:18789` (local)
- `https://seudominio.com` (via Nginx)

### Telegram

1. Crie um bot via @BotFather
2. Pegue o token do bot

Adicione ao config:

```json
{
  "channels": {
    "telegram": {
      "botToken": "SEU_BOT_TOKEN"
    }
  }
}
```

### Discord

1. Crie um aplicativo em [Discord Developer Portal](https://discord.com/developers/applications)
2. Pegue o bot token

Adicione ao config:

```json
{
  "channels": {
    "discord": {
      "token": "SEU_DISCORD_TOKEN"
    }
  }
}
```

### WhatsApp

Execute o comando de pareamento:

```bash
openclaw channels login whatsapp
```

Siga as instruções na tela para escanear o QR code.

## Configuração de Segurança

### Autenticação

O OpenClaw oferece várias opções de autenticação:

```json
{
  "gateway": {
    "auth": {
      "mode": "password",
      "password": "senha_muito_segura",
      "allowTailscale": true
    }
  }
}
```

Modos disponíveis:
- `none`: Sem autenticação (apenas para desenvolvimento)
- `password`: Senha única
- `token`: Token de acesso

### DM Policy

Para segurança, configure quem pode enviar mensagens:

```json
{
  "channels": {
    "telegram": {
      "dmPolicy": "pairing"
    }
  }
}
```

Opções:
- `pairing`: Usuários precisam ser aprovados
- `open`: Qualquer um pode enviar
- `closed`: Ninguém pode enviar DM

## Integração com Plataformas Externas

### Webhooks

Webhooks são configurados via hooks, não diretamente no gateway. Veja a documentação oficial.

### API REST

O OpenClaw expõe endpoints REST:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/message | Enviar mensagem |
| GET | /api/sessions | Listar sessões |
| POST | /api/sessions/:id/reset | Resetar sessão |
| GET | /api/health | Verificar saúde |

Exemplo de envio de mensagem:

```bash
curl -X POST http://localhost:18789/api/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá!", "session": "main"}'
```

### Conexão com Supabase

Adicione configuração do Supabase:

```json
{
  "tools": {
    "supabase": {
      "url": "https://seu-projeto.supabase.co",
      "key": "SUA_ANON_KEY"
    }
  }
}
```

## Comandos Úteis

### Ver Logs

```bash
# Logs em tempo real
journalctl -u openclaw -f

# Últimas 100 linhas
journalctl -u openclaw -n 100
```

### Reiniciar Serviço

```bash
systemctl restart openclaw
```

### Atualizar OpenClaw

```bash
npm update -g openclaw@latest
systemctl restart openclaw
```

### Verificar Saúde

```bash
curl http://localhost:18789/api/health
```

### Resetar Sessão Principal

```bash
openclaw session reset main
```

## Troubleshooting

### Problema: Porta em uso

```bash
# Verificar o que está usando a porta
lsof -i :18789

# Matar o processo
kill -9 PID
```

### Problema: API Key inválida

1. Verifique se a API key está correta
2. Confirme que tem créditos no OpenRouter
3. Verifique os logs: `journalctl -u openclaw -f`

### Problema: Conexão WebSocket falha

1. Verifique se o Nginx está configurado corretamente
2. Confirme que o proxy está passando headers WS:

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

### Problema: Memória insuficiente

Monitore o uso de RAM:

```bash
free -h
htop
```

Considere:
- Fechar abas/desconectar canais não usados
- Adicionar mais RAM à VPS
- Usar modelos menores

## Comandos Avançados

### Ver configuração atual

```bash
openclaw config show
```

### Diagnosticar problemas

```bash
openclaw doctor
```

### Listar sessões ativas

```bash
openclaw sessions list
```

### Executar comando específico

```bash
openclaw agent --message "Liste os arquivos na pasta /tmp"
```

### Mode de desenvolvimento

```bash
openclaw gateway --verbose --debug
```

## Recursos Adicionais

- [Documentação oficial](https://docs.openclaw.ai)
- [GitHub](https://github.com/openclaw/openclaw)
- [Discord community](https://discord.gg/clawd)

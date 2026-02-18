# Agentes - OpenClaw EdiculaWorks

## Visão Geral

Este documento define os agentes e configurações do OpenClaw para a EdiculaWorks.

## Configuração Global

### Agentes

O OpenClaw suporta múltiplos agentes com workspaces isolados:

```json5
{
  "agents": {
    "defaults": {
      "workspace": "~/.openclaw/workspace",
      "model": {
        "primary": "openrouter/anthropic/claude-3-haiku",
        "fallbacks": [
          "openrouter/google/gemini-2.0-flash-001",
          "openrouter/meta-llama/llama-3.1-8b-instruct"
        ]
      },
      "systemPrompt": "Você é EdiculaBot, assistente da EdiculaWorks. Seja conciso, eficiente e otimize custos."
    },
    "list": [
      {
        "id": "chief",
        "name": "Chief",
        "workspace": "~/.openclaw/workspace/chief"
      },
      {
        "id": "tech",
        "name": "Tech Lead",
        "workspace": "~/.openclaw/workspace/tech"
      },
      {
        "id": "gestao",
        "name": "Gestão",
        "workspace": "~/.openclaw/workspace/gestao"
      },
      {
        "id": "financeiro",
        "name": "Financeiro",
        "workspace": "~/.openclaw/workspace/financeiro"
      },
      {
        "id": "security",
        "name": "Security",
        "workspace": "~/.openclaw/workspace/security"
      },
      {
        "id": "ops",
        "name": "Ops",
        "workspace": "~/.openclaw/workspace/ops"
      }
    ]
  }
}
```

## Ferramentas

### Habilitadas

- `bash` - Comandos
- `read` - Ler arquivos
- `write` - Criar arquivos
- `edit` - Editar
- `grep` - Buscar
- `glob` - Listar

### Desabilitadas (Segurança)

```json5
{
  "tools": {
    "browser": {
      "enabled": false
    }
  }
}
```

## Canais

### Telegram

```json5
{
  "channels": {
    "telegram": {
      "enabled": false,
      "dmPolicy": "pairing"
    }
  }
}
```

### Discord

```json5
{
  "channels": {
    "discord": {
      "enabled": false,
      "dmPolicy": "pairing"
    }
  }
}
```

### WebChat (Padrão)

- URL: `https://seudominio.com`
- Auth: Senha obrigatória

## Integrações

### Supabase (Opcional)

```json5
{
  "tools": {
    "supabase": {
      "url": "${SUPABASE_URL}",
      "key": "${SUPABASE_ANON_KEY}"
    }
  }
}
```

## Otimização

### Custo Zero

- Modelo: `haiku` (padrão) ou `gemini-flash` (grátis)
- Fallback chain configurada

### Performance

- Max tokens: 2048 (via config do modelo)
- Temperature: 0.7 (via config do modelo)
- Resumo histórico automático (via sessão)

## Níveis de Pensamento

| Nível | Uso | Custo |
|-------|-----|-------|
| `off` | Info rápida | Baixo |
| `minimal` | Tarefas simples | Baixo |
| `low` | Comandos | Médio |
| `medium` | Padrão | Médio |
| `high` | Problemas complexos | Alto |
| `xhigh` | Depuração | Alto |

## Workspace

- Local: `~/.openclaw/workspace`
- Arquivos por agente: `SOUL.md`, `TOOLS.md`, `skills/`

## Habilidades (Skills)

Disponíveis em `skills/`:

- `devops-engineer` - DevOps e infra
- `code-reviewer` - Revisão de código
- `security-expert` - Segurança

## Referências

- `SOUL.md` - Personalidade
- `TOOLS.md` - Ferramentas
- `docs/OTIMIZACAO.md` - Economia

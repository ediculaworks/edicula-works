# Quick Start - EdiculaWorks

## Primeiros Passos

### 1. Acesse o OpenClaw

**Via Navegador (público):**
```
https://seudominio.com
```

**Via Tailscale (rede privada):**
```
http://100.x.x.x:18789
```

**Via localhost:**
```
http://localhost:18789
```

---

### 2. Faça Login

Use a senha configurada em `/etc/openclaw/openclaw.json`:

```json
{
  "gateway": {
    "auth": {
      "password": "SUA_SENHA"
    }
  }
}
```

---

### 3. Comece a Conversar

O OpenClaw está pronto para ajudar! Exemplos de comandos:

---

## Comandos Básicos

### Programação

```
"Me ajude a criar um script em Python que faz backup de arquivos"
"Revise este código e sugira melhorias"
"Explique como funciona async/await em JavaScript"
```

### Arquivos

```
"Liste os arquivos na pasta /var/log"
"Crie um arquivo de configuração para Nginx"
"Leia o conteúdo deste arquivo e explique"
```

### Sistema

```
"Verifique o status dos serviços"
"Quanto de memória está sendo usada?"
"Liste os processos rodando no servidor"
```

### IA Generativa

```
"Escreva um artigo sobre boas práticas de segurança"
"Crie um logo para minha empresa"
"Resuma este texto em 3 parágrafos"
```

---

## Ferramentas Disponíveis

O OpenClaw pode usar estas ferramentas:

| Ferramenta | Descrição | Exemplo |
|------------|-----------|---------|
| `bash` | Executar comandos | `ls -la` |
| `read` | Ler arquivos | `read file=/etc/passwd` |
| `write` | Criar arquivos | `write file=/tmp/test.txt` |
| `edit` | Editar arquivos | `edit file=/etc/nginx/nginx.conf` |
| `grep` | Buscar em arquivos | `grep pattern="error" file="/var/log/syslog"` |
| `glob` | Listar arquivos | `glob pattern="**/*.js"` |

---

## Atalhos Úteis

### Keyboard Shortcuts

| Atalho | Função |
|--------|--------|
| `Ctrl + Enter` | Enviar mensagem |
| `Ctrl + Shift + C` | Copiar código selecionado |
| `Ctrl + L` | Limpar conversa |
| `Escape` | Cancelar resposta |

---

## Dicas

### 1. Seja Específico

```
❌ "Me ajude"
✓ "Me ajude a configurar um servidor Nginx com SSL"
```

### 2. Forneça Contexto

```
❌ "Revise isso"
✓ "Revise este código Python e sugira melhorias de performance"
```

### 3. Use step-by-step

Para tarefas complexas, peça:

```
"Liste os passos para configurar Fail2Ban"
```

### 4. Peça Exemplos

```
"Mostre um exemplo de configuração Docker Compose"
```

---

## Limitações

- **Sem acesso à internet** (a menos que configurado)
- **Sem browser** (por segurança)
- **Rate limit**: 10 requisições/segundo
- **Timeout**: 60 segundos por resposta

---

## Problemas?

Consulte [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) ou execute:

```bash
/opt/monitoring/health-check.sh
```

---

## Próximos Passos

1. Configure a API Key do OpenClaw
2. Configure canais (Telegram, Discord)
3. Configure webhooks
4. Configure Supabase para persistência

Veja [openclaw.md](docs/openclaw.md) para detalhes.

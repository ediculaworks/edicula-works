# TOOLS - Ferramentas Customizadas EdiculaWorks

## Visão Geral

Este documento define as ferramentas disponíveis para o agente EdiculaBot, incluindo comandos customizados e atalhos.

---

## Ferramentas Padrão

### bash
Executar comandos no servidor

```bash
# Executar comando
bash command="apt update"

# Múltiplos comandos
bash command="cd /var/log && tail -f syslog"
```

### read
Ler arquivos do sistema

```bash
read file="/etc/nginx/nginx.conf"
read file="/var/log/openclaw/access.log" limit=50
```

### write
Criar/sobrescrever arquivos

```bash
write content="#!/bin/bash\necho hello" file="/tmp/script.sh"
```

### edit
Editar arquivos existentes

```bash
edit file="/etc/nginx/nginx.conf" oldString="worker_processes 1;" newString="worker_processes auto;"
```

### grep
Buscar em arquivos

```bash
grep pattern="error" path="/var/log"
grep include="*.js" pattern="function"
```

### glob
Listar arquivos por padrão

```bash
glob pattern="/var/log/*.log"
glob pattern="**/*.config"
```

---

## Ferramentas Customizadas

### sistema
Verificar status do sistema

```bash
sistema status
sistema recursos
sistema processos
```

### rede
Diagnóstico de rede

```bash
rede portas
rede conexoes
rede dns teste
```

### seguranca
Auditoria rápida

```bash
seguranca audit
seguranca firewall status
seguranca fail2ban
```

### backup
Operações de backup

```bash
backup executar
backup listar
backup restaurar DATA=20260218
```

### servico
Gerenciar serviços

```bash
servico status openclaw
servico restart nginx
servico logs openclaw
```

---

## Atalhos de Comandos

| Atal | Comando Original |
|------|------------------|
| `ss` | systemctl status |
| `sr` | systemctl restart |
| `sl` | systemctl list-units --type=service |
| `ll` | ls -lah |
| `la` | ls -A |
| `eg` | grep -E |
| `hd` | head -20 |
| `tl` | tail -f |

---

## Comandos de Emergência

### Bloqueado do SSH

```bash
emergencia ssh-recovery
# 1. Verifica porta SSH
# 2. Testa conexão local
# 3. Oferece soluções
```

### Serviço Down

```bash
emergencia service-check openclaw
# 1. Verifica logs
# 2. Identifica erro
# 3. Sugere correção
```

### Disco Cheio

```bash
emergencia disco
# 1. Identifica maiores diretórios
# 2. Limpa logs antigos
# 3. Oferece limpeza Docker
```

---

## Configuração de Tools

Local: `/etc/openclaw/tools.json`

```json
{
  "enabled": ["bash", "read", "write", "edit", "grep", "glob"],
  "custom": {
    "sistema": {
      "command": "/opt/tools/sistema.sh",
      "description": "Verificar status do sistema"
    },
    "rede": {
      "command": "/opt/tools/rede.sh",
      "description": "Diagnóstico de rede"
    }
  },
  "denylist": ["browser", "system", "admin"]
}
```

---

## Permissões

O agente roda como usuário `openclaw` com permissões limitadas:

- ✅ Ler arquivos
- ✅ Escrever em /tmp e /opt
- ✅ Executar scripts permitidos
- ❌ Acessar /etc/shadow
- ❌ Modificar configurações de segurança
- ❌ Executar comandos root (sem sudo)

---

## Boas Práticas

1. **Sempre verifique permissões** antes de executar
2. **Use caminhos absolutos** para evitar ambiguidade
3. **Documente scripts customizados** em /opt/tools/
4. **Teste localmente** antes de aplicar em produção

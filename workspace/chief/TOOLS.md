# TOOLS - Ferramentas do Chief

## Ferramentas Disponíveis

### bash
Executar comandos no servidor

### read/write/edit
Manipular arquivos

### grep/glob
Buscar arquivos e conteúdo

## Ferramentas de Agentes

### sessions_spawn
Usar para delegate para outros agentes

### sessions_send
Enviar mensagens para agentes específicos

## Skills Disponíveis

- `search-similar` - Busca semântica
- `task-creator` - Criar tarefas (via Gestao)
- `financial-analyst` - Análise financeira (via Financeiro)
- `contract-manager` - Gerenciar contratos (via Financeiro)
- `system-monitor` - Monitoramento (via Ops)
- `security-expert` - Segurança (via Security)

## Comandos de Delegação

```bash
# Delegar para Tech
sessions_spawn(agent="tech", message="...")

# Delegar para Gestao
sessions_spawn(agent="gestao", message="...")

# Delegar para Financeiro
sessions_spawn(agent="financeiro", message="...")

# Delegar para Ops
sessions_spawn(agent="ops", message="...")

# Delegar para Security
sessions_spawn(agent="security", message="...")
```

## Atalhos

| Comando | Descrição |
|---------|-----------|
| `delegar tech` | Delegate para Tech Lead |
| `delegar gestao` | Delegate para Gestao Lead |
| `delegar financeiro` | Delegate para Financeiro Lead |
| `delegar ops` | Delegate para Ops Lead |
| `delegar security` | Delegate para Security Lead |

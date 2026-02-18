# TOOLS - Ferramentas do Gestao Lead

## Ferramentas Disponíveis

### bash
Executar comandos (scripts de gestão)

### read/write/edit
Manipular arquivos de configuração

### grep/glob
Buscar em documentos

## Skills Disponíveis

### kanban-manager
Gerenciar tarefas: criar, atualizar, mover, listar

### task-creator
Criar tarefas com validação completa

### search-similar
Busca semântica em tarefas

## Campos de Tarefa

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| titulo | texto | ✅ |
| descricao | texto longo | ❌ |
| coluna | todo/in_progress/review/done | ✅ |
| prioridade | urgente/alta/media/baixa | ✅ |
| responsaveis | lista | ❌ |
| projeto | texto | ❌ |
| cliente | texto | ❌ |
| prazo | data | ❌ |
| estimativa | horas | ❌ |
| tags | lista | ❌ |

## Comandos

```bash
# Listar tarefas por coluna
listar_tarefas(coluna="todo")

# Listar tarefas urgentes
listar_tarefas(prioridade="urgente")

# Criar tarefa
criar_tarefa(titulo="...", prioridade="alta")

# Mover tarefa
mover_tarefa(id=123, coluna="done")
```

## Atalhos

| Comando | Descrição |
|---------|-----------|
| `minhas tarefas` | Listar minhas tarefas |
| `tarefas urgentes` | Listar tarefas urgentes |
| `criar tarefa` | Criar nova tarefa |

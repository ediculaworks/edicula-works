# Regras de Desenvolvimento - EdiculaWorks

> **Última atualização**: 2026-02-18
> **Versão**: 1.0

---

## 1. Documentação

### 1.1 Regra de Ouro

> **Toda mudança no código = documentação atualizada**

Antes de marcar qualquer tarefa como **concluída**, verifique:
- [ ] Blueprint atualizado? (se mudou arquitetura)
- [ ] Novo tutorial necessário? (se nova feature)
- [ ] README.md atualizado? (se novos arquivos/scripts)
- [ ] CHANGELOG.md registrado? (se mudança significativa)
- [ ] Variáveis documentadas em .env.example?

### 1.2 Prioridade de Documentação

| Prioridade | Quando atualizar | Responsável |
|------------|-----------------|-------------|
| 🔴 Crítica | Blueprint | Sempre que架构 mudar |
| 🔴 Crítica | CHANGELOG | Toda mudança significativa |
| 🟡 Média | README | Novos arquivos/scripts |
| 🟢 Baixa | Tutoriais | Novas features |

### 1.3 Estrutura de Documentos

```
docs/
├── TUTORIAL-*.md       # Passo a passo (como fazer)
├── *.md               # Guias e referências
└── platform/
    └── BLUEPRINT.md   # Visão geral (ATUALIZAR SEMPRE)
```

---

## 2. Nomenclatura

### 2.1 Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Tutorial | TUTORIAL-[TEMA].md | TUTORIAL-SUPABASE.md |
| Script | kebab-case.sh | install-firewall.sh |
| Configuração | kebab-case | docker-compose.yml |
| Variáveis env | UPPER_SNAKE_CASE | OPENROUTER_API_KEY |

### 2.2 Agentes

```
# ID do agente (snake_case)
chief, tech_lead, gestao_lead, financeiro_lead, security_lead, ops_lead

# Workspace
~/.openclaw/workspace/{agent_id}/
```

### 2.3 Commits

```bash
# Formato: tipo: descrição

feat:     # Nova funcionalidade
fix:      # Correção de bug
docs:     # Documentação
security: # Segurança
refactor: # Reorganização
chore:    # Tarefas menores
```

---

## 3. Segurança

### 3.1 Regras Obrigatórias

- ❌ **NUNCA** exponha API keys em código
- ❌ **NUNCA** use `allow_origins=["*"]` em produção
- ✅ Sempre use variáveis de ambiente para segredos
- ✅ Sempre valide inputs
- ✅ Sempre faça backup antes de modificar config

### 3.2 Checklist de Segurança

- [ ] CORS restrito a domínios conhecidos
- [ ] API keys em .env (não versionar)
- [ ] Usuário dedicado para serviços
- [ ] Firewall com políticas deny-by-default
- [ ] Backup criptografado
- [ ] Logs sendo monitorados

---

## 4. Versionamento

### 4.1 SemVer

```
vMAJOR.MINOR.PATCH

MAJOR: Breaking change (incompatível)
MINOR: Nova feature (compatível)
PATCH: Bug fix (compatível)
```

### 4.2 Releases

```bash
# Patch
v1.0.0 → v1.0.1 (bug fix)

# Minor  
v1.0.0 → v1.1.0 (nova feature)

# Major
v1.0.0 → v2.0.0 (breaking change)
```

---

## 5. Estrutura de Arquivos

### 5.1 Organização

```
EdiculaWorks/
├── api/                    # Backend FastAPI
│   ├── routes/
│   ├── services/
│   └── main.py
├── agents/                 # Definições de agentes
├── skills-platform/        # Skills da plataforma
├── docs/                   # Documentação
│   ├── platform/          # Docs da plataforma
│   ├── TUTORIAL-*.md     # Tutoriais
│   └── *.md              # Guias
├── scripts/               # Scripts de instalação
├── config/                # Configurações
└── workspace/             # Workspaces dos agentes
```

### 5.2 Arquivos Obrigatórios

| Arquivo | Quando criar |
|---------|-------------|
| CHANGELOG.md | Sempre que houver mudança |
| .env.example | Quando adicionar variável de ambiente |
| SKILL.md | Quando criar nova skill |
| TUTORIAL-*.md | Quando feature requer passo a passo |

---

## 6. Código

### 6.1 Boas Práticas

- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It

### 6.2 Python

```python
# ✅ Bom
def criar_tarefa(titulo: str, prioridade: str = "media") -> dict:
    """Cria uma nova tarefa."""
    if not titulo:
        raise ValueError("Título é obrigatório")
    return {"success": True, "titulo": titulo}

# ❌ Ruim
def criar_tarefa(titulo, prioridade="media"):
    return {"success": True}  # Sem validação, sem type hints
```

### 6.3 Shell Scripts

```bash
# ✅ Bom
#!/bin/bash
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
    echo "Execute como root"
    exit 1
fi

# ❌ Ruim
#!/bin/bash
# Sem set -e, sem checagem de root
```

---

## 7. Testing

### 7.1 Checklist Pré-Deploy

- [ ] Código executado localmente
- [ ] Scripts testados
- [ ] Backup feito
- [ ] Documentação atualizada
- [ ] CHANGELOG atualizado

---

## 8. Referências

| Recurso | Link |
|---------|------|
| Blueprint | docs/platform/BLUEPRINT.md |
| Changelog | CHANGELOG.md |
| Checklist | docs/CHECKLIST.md |
| Troubleshooting | docs/TROUBLESHOOTING.md |

---

## Resumo Visual

```
Mudança no código
       │
       ▼
┌──────────────────┐
│  Feito?         │
└────────┬─────────┘
         │ Sim
         ▼
┌──────────────────┐
│ Atualiza docs?  │───Sim──► Blueprint + CHANGELOG
└────────┬─────────┘
         │ Não
         ▼
    Marcado como concluído ❌
```

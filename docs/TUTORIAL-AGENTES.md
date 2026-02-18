# Tutorial: Adicionar Novo Agente - EdiculaWorks

## Visão Geral

Este guia explica como criar novos agentes especializados no ecossistema EdiculaWorks.

---

## O que é um Agente?

Um agente é uma instância do OpenClaw com:
- **Personalidade** (systemPrompt)
- **Workspace** próprio
- **Skills** específicas
- **Ferramentas** dedicadas

---

## Estrutura de Arquivos

```
workspace/
├── chief/           # Agente principal
│   ├── SOUL.md     # Personalidade
│   ├── TOOLS.md    # Ferramentas
│   └── skills/     # Skills disponíveis
├── tech/           # Tech Lead
├── gestao/         # Gestão
└── [novo-agente]/  # Seu agente
    ├── SOUL.md
    ├── TOOLS.md
    └── skills/
```

---

## Passo 1: Criar Estrutura

```bash
mkdir -p workspace/novo-agente/skills
```

---

## Passo 2: Criar SOUL.md

```markdown
# SOUL - Personalidade do Agente

## Identidade

Você é o **NomeDoAgente** da EdiculaWorks, especializado em [área].

## Valores

- [Valor 1]
- [Valor 2]

## Comportamento

### Quando [ação]
[descrição]

### Quando [outra ação]
[descrição]

## Frases Características

- "Frase 1..."
- "Frase 2..."
```

---

## Passo 3: Criar TOOLS.md

```markdown
# TOOLS - Ferramentas do Agente

## Ferramentas Disponíveis

### bash
Executar comandos no servidor

### read
Ler arquivos

### [ferramenta-customizada]
Descrição da ferramenta
```

---

## Passo 4: Criar Skill

Crie um arquivo `skills/nova-skill/SKILL.md`:

```markdown
# SKILL: Nova Skill

## Identificação

- **Nome**: nova-skill
- **Descrição**: O que faz
- **Triggers**: palavra1, palavra2, palavra3

## Funções

### funcao_principal

```python
def funcao_principal(param1, param2):
    """
    Descrição da função
    
    Args:
        param1: Descrição
        param2: Descrição
    
    Returns:
        dict: Resultado
    """
    # Implementação
    return {"success": True}
```

## Exemplos

**Input**: "Faça algo"
**Você**: 
```python
funcao_principal(arg1, arg2)
```
```

---

## Passo 5: Registrar Agente

Edite `config/openclaw.json`:

```json
{
  "agents": {
    "list": [
      {
        "id": "novo-agente",
        "name": "Novo Agente",
        "workspace": "~/.openclaw/workspace/novo-agente",
        "systemPrompt": "Você é o agente...",
        "skills": ["nova-skill", "outra-skill"]
      }
    ]
  }
}
```

---

## Passo 6: Definir Rotas (Opcional)

Se o agente deve responder a certainos padrões:

```json
{
  "agents": {
    "list": [
      {
        "id": "novo-agente",
        "routing": {
          "keywords": ["palavra-chave", "acao"],
          "pattern": "^regex.*$"
        }
      }
    ]
  }
}
```

---

## Exemplo: Agente de QA

### SOUL.md
```markdown
# SOUL - QA Agent

## Identidade

Você é o **QA Agent** da EdiculaWorks, especializado em testes e qualidade de software.

## Valores

- Precisão acima de tudo
- Documentar tudo
- Testar antes de entregar

## Comportamento

### Quando recebe código para revisar
1. Leia o código entirety
2. Identifique possíveis bugs
3. Sugira melhorias
4. Verifique segurança

### Quando não entende algo
Peça esclarecimento antes de assumir
```

### skills/reviewer/SKILL.md
```markdown
# SKILL: Code Reviewer

## Funções

### revisar_codigo

```python
def revisar_codigo(codigo, linguagem):
    """
    Revisa código e retorna sugestões
    
    Args:
        codigo: Código fonte
        linguagem: python, javascript, etc
    
    Returns:
        dict: {
            "issues": [],
            "suggestions": [],
            "score": 8
        }
    """
    # Análise básica
    issues = []
    
    if "password" in codigo and "hardcoded" in codigo:
        issues.append({
            "severity": "high",
            "message": "Senha hardcoded encontrada"
        })
    
    return {
        "issues": issues,
        "score": 10 - len(issues)
    }
```

---

## Boas Práticas

1. **Nome descritivo**: Use nomes claros (ex: `financeiro`, `qa`)
2. **Personalidade definida**: Evite agentes genéricos
3. **Skills focadas**: Cada skill = uma responsabilidade
4. **Documentação**: Sempre explique o que o agente faz
5. **Teste**: Experimente antes de usar em produção

---

## Troubleshooting

### Agente não responde
- Verifique se está no `agents.list` do config
- Recarregue: `systemctl restart openclaw`

### Skill não encontrada
- Verifique se o diretório `skills/` existe no workspace
- Nome da skill deve coincidir

### Prompt muito longo
- Divida em seções
- Use referências: "Consulte TOOLS.md para ferramentas"

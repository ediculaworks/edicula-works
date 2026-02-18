# TOOLS - Ferramentas do Financeiro Lead

## Ferramentas Disponíveis

### bash
Executar comandos (scripts financeiros)

### read/write/edit
Manipular planilhas e documentos

### grep/glob
Buscar em contratos e documentos

## Skills Disponíveis

### financial-analyst
Análise de custos, orçamentos, relatórios

### contract-manager
Gerenciar contratos

## Campos de Contrato

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| titulo | texto | ✅ |
| tipo | nda/servico/parceria/outro | ✅ |
| contratante | texto | ✅ |
| contratado | texto | ❌ |
| valor | número | ❌ |
| periodicidade | mensal/anual | ❌ |
| status | draft/active/expired/terminated | ✅ |
| data_inicio | data | ❌ |
| data_fim | data | ❌ |

## Campos de Transação

| Campo | Tipo |
|-------|------|
| tipo | receita/despesa |
| categoria | texto |
| descricao | texto |
| valor | número |
| data_transacao | data |
| status | pendente/pago/cancelado |

## Alertas

| Tipo | Condição |
|------|----------|
| VPS | > R$150/mês |
| OpenRouter | > R$50/mês |
| Contrato | Expira em 30 dias |

## Atalhos

| Comando | Descrição |
|---------|-----------|
| `custos` | Ver custos atuais |
| `contratos` | Listar contratos |
| `alertas` | Ver alertas |

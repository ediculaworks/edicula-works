// Tipos base para a aplicação EdiculaWorks

// Enum de prioridades
export type Prioridade = 'urgente' | 'alta' | 'media' | 'baixa'

// Enum de colunas do Kanban
export type ColunaKanban = 'todo' | 'in_progress' | 'review' | 'done'

// Status de tarefas
export type StatusTarefa = 'ativa' | 'pausada' | 'abandonada' | 'suspensa' | 'concluida'

// Status de contratos
export type StatusContrato = 'rascunho' | 'ativo' | 'expirado' | 'encerrado' | 'cancelado'

// Status de sprint
export type StatusSprint = 'planejada' | 'ativa' | 'concluida' | 'cancelada'

// Tipos de transação
export type TipoTransacao = 'receita' | 'despesa' | 'transferencia'
export type StatusTransacao = 'pendente' | 'pago' | 'cancelado' | 'estornado'

// Agentes do sistema
export type Agente = 'chief' | 'tech' | 'gestao' | 'financeiro' | 'security' | 'ops'

// Interfaces base
export interface Usuario {
  id: string
  empresa_id?: number
  nome: string
  email: string
  username?: string
  avatar_url?: string
  cargo?: string
  departamento?: string
  role: 'admin' | 'manager' | 'member'
  perfil_id?: number
  ativo: boolean
  email_verificado: boolean
  ultimo_login?: string
  tema?: string
  linguagem?: string
  created_at: string
  updated_at: string
}

export interface Tarefa {
  id: number
  empresa_id: number
  projeto_id?: number
  titulo: string
  descricao?: string
  coluna: ColunaKanban
  prioridade: Prioridade
  estimativa_horas?: number
  estimativa_pontos?: number
  prazo?: string
  data_conclusao?: string
  tempo_gasto_minutos: number
  responsaveis: string[]  // UUID[]
  created_by?: string     // UUID
  cliente_nome?: string
  tarefa_pai_id?: number
  eh_subtarefa: boolean
  ordem: number
  tags: string[]
  
  // Novos campos
  status: StatusTarefa
  sprint_id?: number
  grupo_id?: number
  observadores: string[]  // UUID[]
  previsao_entrega?: string
  estimativa_horas_prevista?: number
  data_inicio?: string
  motivo_pausa?: string
  motivo_suspensao?: string
  motivo_abandono?: string
  data_pausa?: string
  data_suspensao?: string
  data_abandono?: string
  
  created_at: string
  updated_at: string
}

export interface Projeto {
  id: number
  empresa_id: number
  nome: string
  descricao?: string
  cor?: string
  icone?: string
  cliente_nome?: string
  data_inicio?: string
  data_fim?: string
  status: 'ativo' | 'pausado' | 'arquivado' | 'concluido'
  progresso: number
  created_by?: number
  created_at: string
  updated_at: string
}

export interface Contrato {
  id: number
  empresa_id: number
  titulo: string
  descricao?: string
  numero?: string
  tipo: string
  cliente_id?: number
  fornecedor_id?: number
  contraparte_nome?: string
  valor?: number
  valor_mensal?: number
  periodicidade?: string
  data_assinatura?: string
  data_inicio?: string
  data_fim?: string
  status: StatusContrato
  renovacao_automatica: boolean
  arquivo_url?: string
  created_by?: number
  created_at: string
  updated_at: string
}

export interface Transacao {
  id: number
  empresa_id: number
  tipo: TipoTransacao
  categoria_id?: number
  centro_custo_id?: number
  valor: number
  descricao?: string
  data_transacao: string
  data_vencimento?: string
  data_pagamento?: string
  status: StatusTransacao
  conta_bancaria_id?: number
  contrato_id?: number
  projeto_id?: number
  created_by?: number
  created_at: string
  updated_at: string
}

export interface Conversa {
  id: number
  agente: Agente
  titulo?: string
  status: 'ativa' | 'arquivada' | 'excluida'
  mensagens_count: number
  created_at: string
  updated_at: string
}

export interface Mensagem {
  id: number
  conversa_id: number
  role: 'user' | 'assistant' | 'system'
  conteudo: string
  created_at: string
}

export interface Grupo {
  id: number
  empresa_id: number
  nome: string
  descricao?: string
  cor: string
  icone?: string
  ativo: boolean
  ordem: number
  created_at: string
  updated_at: string
}

export interface Sprint {
  id: number
  empresa_id: number
  projeto_id?: number
  nome: string
  objetivo?: string
  data_inicio: string
  data_fim: string
  data_conclusao?: string
  status: StatusSprint
  meta_pontos?: number
  pontos_concluidos: number
  ordem: number
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  empresa_id: number
  nome: string
  cor?: string
  icone?: string
  escopo: string
  created_at: string
  updated_at: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erro desconhecido' }))
    throw new ApiError(response.status, error.detail || 'Erro na requisição')
  }
  return response.json()
}

export const api = {
  // Tarefas
  async getTarefas(params?: {
    empresa_id?: number
    coluna?: string
    prioridade?: string
    responsavel?: number
    projeto_id?: number
    status?: string
    skip?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.empresa_id) searchParams.set('empresa_id', params.empresa_id.toString())
    if (params?.coluna) searchParams.set('coluna', params.coluna)
    if (params?.prioridade) searchParams.set('prioridade', params.prioridade)
    if (params?.responsavel) searchParams.set('responsavel', params.responsavel.toString())
    if (params?.projeto_id) searchParams.set('projeto_id', params.projeto_id.toString())
    if (params?.status) searchParams.set('status', params.status)
    if (params?.skip) searchParams.set('skip', params.skip.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    
    const url = `${API_BASE}/tarefas${searchParams.toString() ? '?' + searchParams : ''}`
    const response = await fetch(url)
    return handleResponse<Tarefa[]>(response)
  },

  async getTarefa(id: number) {
    const response = await fetch(`${API_BASE}/tarefas/${id}`)
    return handleResponse<Tarefa>(response)
  },

  async createTarefa(data: Partial<Tarefa>) {
    const response = await fetch(`${API_BASE}/tarefas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<Tarefa>(response)
  },

  async updateTarefa(id: number, data: Partial<Tarefa>) {
    const response = await fetch(`${API_BASE}/tarefas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<Tarefa>(response)
  },

  async deleteTarefa(id: number) {
    const response = await fetch(`${API_BASE}/tarefas/${id}`, {
      method: 'DELETE',
    })
    if (response.status !== 204) {
      throw new ApiError(response.status, 'Erro ao deletar')
    }
  },

  async moverTarefa(id: number, coluna: ColunaKanban) {
    const response = await fetch(`${API_BASE}/tarefas/${id}/mover?coluna=${coluna}`, {
      method: 'POST',
    })
    return handleResponse<Tarefa>(response)
  },

  async iniciarTarefa(id: number) {
    const response = await fetch(`${API_BASE}/tarefas/${id}/iniciar`, {
      method: 'POST',
    })
    return handleResponse<Tarefa>(response)
  },

  async pausarTarefa(id: number, motivo?: string) {
    const response = await fetch(`${API_BASE}/tarefas/${id}/pausar?motivo=${encodeURIComponent(motivo || '')}`, {
      method: 'POST',
    })
    return handleResponse<Tarefa>(response)
  },

  async abandonarTarefa(id: number, motivo?: string) {
    const response = await fetch(`${API_BASE}/tarefas/${id}/abandonar?motivo=${encodeURIComponent(motivo || '')}`, {
      method: 'POST',
    })
    return handleResponse<Tarefa>(response)
  },

  async suspenderTarefa(id: number, motivo?: string) {
    const response = await fetch(`${API_BASE}/tarefas/${id}/suspender?motivo=${encodeURIComponent(motivo || '')}`, {
      method: 'POST',
    })
    return handleResponse<Tarefa>(response)
  },

  async finalizarTarefa(id: number) {
    const response = await fetch(`${API_BASE}/tarefas/${id}/finalizar`, {
      method: 'POST',
    })
    return handleResponse<Tarefa>(response)
  },

  // Grupos
  async getGrupos(empresaId: number = 1, ativo?: boolean) {
    const params = new URLSearchParams({ empresa_id: empresaId.toString() })
    if (ativo !== undefined) params.set('ativo', ativo.toString())
    const response = await fetch(`${API_BASE}/grupos?${params}`)
    return handleResponse<Grupo[]>(response)
  },

  async getGrupo(id: number) {
    const response = await fetch(`${API_BASE}/grupos/${id}`)
    return handleResponse<Grupo>(response)
  },

  async createGrupo(data: Partial<Grupo>) {
    const response = await fetch(`${API_BASE}/grupos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<Grupo>(response)
  },

  async updateGrupo(id: number, data: Partial<Grupo>) {
    const response = await fetch(`${API_BASE}/grupos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<Grupo>(response)
  },

  async deleteGrupo(id: number) {
    const response = await fetch(`${API_BASE}/grupos/${id}`, {
      method: 'DELETE',
    })
    if (response.status !== 204) {
      throw new ApiError(response.status, 'Erro ao deletar')
    }
  },

  // Sprints
  async getSprints(params?: {
    empresa_id?: number
    projeto_id?: number
    status?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.empresa_id) searchParams.set('empresa_id', params.empresa_id.toString())
    if (params?.projeto_id) searchParams.set('projeto_id', params.projeto_id.toString())
    if (params?.status) searchParams.set('status', params.status)
    
    const url = `${API_BASE}/sprints${searchParams.toString() ? '?' + searchParams : ''}`
    const response = await fetch(url)
    return handleResponse<Sprint[]>(response)
  },

  async getSprintAtiva(empresaId: number = 1) {
    const response = await fetch(`${API_BASE}/sprints/ativa?empresa_id=${empresaId}`)
    return handleResponse<Sprint>(response)
  },

  async getSprint(id: number) {
    const response = await fetch(`${API_BASE}/sprints/${id}`)
    return handleResponse<Sprint>(response)
  },

  async createSprint(data: Partial<Sprint>) {
    const response = await fetch(`${API_BASE}/sprints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<Sprint>(response)
  },

  async updateSprint(id: number, data: Partial<Sprint>) {
    const response = await fetch(`${API_BASE}/sprints/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<Sprint>(response)
  },

  async deleteSprint(id: number) {
    const response = await fetch(`${API_BASE}/sprints/${id}`, {
      method: 'DELETE',
    })
    if (response.status !== 204) {
      throw new ApiError(response.status, 'Erro ao deletar')
    }
  },

  async iniciarSprint(id: number) {
    const response = await fetch(`${API_BASE}/sprints/${id}/iniciar`, {
      method: 'POST',
    })
    return handleResponse<Sprint>(response)
  },

  async concluirSprint(id: number) {
    const response = await fetch(`${API_BASE}/sprints/${id}/concluir`, {
      method: 'POST',
    })
    return handleResponse<Sprint>(response)
  },

  // Contratos
  async getContratos(params?: {
    empresa_id?: number
    status?: string
    tipo?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.empresa_id) searchParams.set('empresa_id', params.empresa_id.toString())
    if (params?.status) searchParams.set('status', params.status)
    if (params?.tipo) searchParams.set('tipo', params.tipo)
    
    const url = `${API_BASE}/contratos${searchParams.toString() ? '?' + searchParams : ''}`
    const response = await fetch(url)
    return handleResponse<Contrato[]>(response)
  },

  // Usuarios
  async getUsuarios(params?: {
    empresa_id?: number
    ativo?: boolean
    role?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.empresa_id) searchParams.set('empresa_id', params.empresa_id.toString())
    if (params?.ativo !== undefined) searchParams.set('ativo', params.ativo.toString())
    if (params?.role) searchParams.set('role', params.role)
    
    const url = `${API_BASE}/usuarios${searchParams.toString() ? '?' + searchParams : ''}`
    const response = await fetch(url)
    return handleResponse<Usuario[]>(response)
  },

  async getUsuario(id: string) {
    const response = await fetch(`${API_BASE}/usuarios/${id}`)
    return handleResponse<Usuario>(response)
  },

  async getUsuarioByEmail(email: string) {
    const response = await fetch(`${API_BASE}/usuarios/email/${encodeURIComponent(email)}`)
    return handleResponse<Usuario>(response)
  },

  // Tags
  async getTags(params?: {
    empresa_id?: number
    escopo?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.empresa_id) searchParams.set('empresa_id', params.empresa_id.toString())
    if (params?.escopo) searchParams.set('escopo', params.escopo)
    
    const url = `${API_BASE}/tags${searchParams.toString() ? '?' + searchParams : ''}`
    const response = await fetch(url)
    return handleResponse<Tag[]>(response)
  },

  async createTag(data: { nome: string; cor?: string; icone?: string; escopo?: string }) {
    const response = await fetch(`${API_BASE}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<Tag>(response)
  },

  // Projetos
  async getProjetos(empresaId: number = 1) {
    const response = await fetch(`${API_BASE}/projetos?empresa_id=${empresaId}`)
    return handleResponse<Projeto[]>(response)
  },

  // Transações
  async getTransacoes(params?: {
    empresa_id?: number
    tipo?: string
    categoria_id?: number
    status?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.empresa_id) searchParams.set('empresa_id', params.empresa_id.toString())
    if (params?.tipo) searchParams.set('tipo', params.tipo)
    if (params?.categoria_id) searchParams.set('categoria_id', params.categoria_id.toString())
    if (params?.status) searchParams.set('status', params.status)
    
    const url = `${API_BASE}/transacoes${searchParams.toString() ? '?' + searchParams : ''}`
    const response = await fetch(url)
    return handleResponse<Transacao[]>(response)
  },

  async getResumoMensal(ano: number, mes: number, empresaId: number = 1) {
    const response = await fetch(`${API_BASE}/transacoes/resumo/mensal?ano=${ano}&mes=${mes}&empresa_id=${empresaId}`)
    return handleResponse<{ receitas: number; despesas: number; saldo: number }>(response)
  },

  // Chat
  async sendMessage(agente: string, mensagem: string, contexto?: object) {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agente, mensagem, contexto }),
    })
    return handleResponse<{ resposta: string; conversa_id: number }>(response)
  },

  async getConversas(agente?: string) {
    const url = `${API_BASE}/conversas${agente ? '?agente=' + agente : ''}`
    const response = await fetch(url)
    return handleResponse<Conversa[]>(response)
  },

  async getMensagens(conversaId: number) {
    const response = await fetch(`${API_BASE}/conversas/${conversaId}/mensagens`)
    return handleResponse<Mensagem[]>(response)
  },
}

// Types inline (importados do types/index)
import type { Tarefa, Contrato, Projeto, Transacao, Conversa, Mensagem, Grupo, Sprint, ColunaKanban, Usuario, Tag } from '@/types'

export type { Tarefa, Contrato, Projeto, Transacao, Conversa, Mensagem, Grupo, Sprint, Usuario, Tag }

const API_BASE = '/api'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

function removeUndefined(obj: any): any {
  if (obj === undefined) return null
  if (obj === null) return null
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item))
  }
  if (typeof obj === 'object') {
    const result: any = {}
    for (const key in obj) {
      result[key] = removeUndefined(obj[key])
    }
    return result
  }
  return obj
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
    sprint_id?: number
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
    if (params?.sprint_id) searchParams.set('sprint_id', params.sprint_id.toString())
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
    const cleanData = removeUndefined(data)
    if (cleanData.responsaveis) {
      cleanData.responsaveis = cleanData.responsaveis.map(String)
    }
    const response = await fetch(`${API_BASE}/tarefas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanData),
    })
    return handleResponse<Tarefa>(response)
  },

  async updateTarefa(id: number, data: Partial<Tarefa>) {
    const cleanData = removeUndefined(data)
    if (cleanData.responsaveis) {
      cleanData.responsaveis = cleanData.responsaveis.map(String)
    }
    const response = await fetch(`${API_BASE}/tarefas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanData),
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

  async uploadContratoArquivo(contratoId: number, arquivo: File, empresaId: number = 1) {
    const formData = new FormData()
    formData.append('arquivo', arquivo)
    
    const response = await fetch(`${API_BASE}/contratos/${contratoId}/upload?empresa_id=${empresaId}`, {
      method: 'POST',
      body: formData,
    })
    return handleResponse<{ url: string; filename: string }>(response)
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

  async createUsuario(data: { empresa_id: number; nome: string; email: string; role?: string }) {
    const cleanData = removeUndefined(data)
    const response = await fetch(`${API_BASE}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanData),
    })
    return handleResponse<Usuario>(response)
  },

  async updateUsuario(id: string, data: { nome?: string; email?: string }) {
    const cleanData = removeUndefined(data)
    const response = await fetch(`${API_BASE}/usuarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanData),
    })
    return handleResponse<Usuario>(response)
  },

  async deleteUsuario(id: string) {
    const response = await fetch(`${API_BASE}/usuarios/${id}`, {
      method: 'DELETE',
    })
    if (response.status !== 204) {
      throw new ApiError(response.status, 'Erro ao deletar')
    }
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

  // System
  async getSystemStats() {
    const response = await fetch(`${API_BASE}/system`)
    return handleResponse<SystemStats>(response)
  },

  async getSystemHealth() {
    const response = await fetch(`${API_BASE}/system/health`)
    return handleResponse<SystemHealth>(response)
  },

  // Eventos
  async getEventos(params?: {
    empresa_id?: number
    tipo?: string
    data_inicio?: string
    data_fim?: string
    membro_id?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.empresa_id) searchParams.set('empresa_id', params.empresa_id.toString())
    if (params?.tipo) searchParams.set('tipo', params.tipo)
    if (params?.data_inicio) searchParams.set('data_inicio', params.data_inicio)
    if (params?.data_fim) searchParams.set('data_fim', params.data_fim)
    if (params?.membro_id) searchParams.set('membro_id', params.membro_id)
    
    const url = `${API_BASE}/eventos${searchParams.toString() ? '?' + searchParams : ''}`
    const response = await fetch(url)
    return handleResponse<Evento[]>(response)
  },

  async getEventosDoDia(data: string, empresaId: number = 1) {
    const response = await fetch(`${API_BASE}/eventos/dia/${data}?empresa_id=${empresaId}`)
    return handleResponse<Evento[]>(response)
  },

  async getTimeline(inicio: string, fim: string, empresaId: number = 1, membroId?: string) {
    const params = new URLSearchParams({
      inicio,
      fim,
      empresa_id: empresaId.toString()
    })
    if (membroId) params.set('membro_id', membroId)
    
    const response = await fetch(`${API_BASE}/eventos/timeline?${params}`)
    return handleResponse<Evento[]>(response)
  },

  async getEvento(eventoId: string, empresaId: number = 1) {
    const response = await fetch(`${API_BASE}/eventos/${eventoId}?empresa_id=${empresaId}`)
    return handleResponse<Evento>(response)
  },

  async createEvento(data: Partial<Evento>) {
    const response = await fetch(`${API_BASE}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<Evento>(response)
  },

  async updateEvento(eventoId: string, data: Partial<Evento>, empresaId: number = 1) {
    const response = await fetch(`${API_BASE}/eventos/${eventoId}?empresa_id=${empresaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<Evento>(response)
  },

  async deleteEvento(eventoId: string, empresaId: number = 1) {
    const response = await fetch(`${API_BASE}/eventos/${eventoId}?empresa_id=${empresaId}`, {
      method: 'DELETE',
    })
    if (response.status !== 204) {
      throw new Error('Erro ao deletar evento')
    }
  },
}

// Types inline (importados do types/index)
import type { Tarefa, Contrato, Projeto, Transacao, Conversa, Mensagem, Grupo, Sprint, ColunaKanban, Usuario, Tag, Evento } from '@/types'

export type { Tarefa, Contrato, Projeto, Transacao, Conversa, Mensagem, Grupo, Sprint, Usuario, Tag, Evento }

export interface SystemStats {
  cpu: { percent: number; count: number }
  memory: { total: number; available: number; percent: number; used: number }
  disk: { total: number; used: number; free: number; percent: number }
  network: { bytes_sent: number; bytes_recv: number }
  uptime: { boot_time: number }
}

export interface SystemHealth {
  status: string
  services: { api: string; database: string; frontend: string }
  metrics: { cpu_percent: number; memory_percent: number; disk_percent: number }
}

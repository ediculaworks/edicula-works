import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Tarefa, ColunaKanban } from '@/types'

interface UseTarefasOptions {
  empresaId?: number
  coluna?: string
  prioridade?: string
  sprintId?: number
  status?: string
}

export function useTarefas(options: UseTarefasOptions = {}) {
  const { empresaId = 1, coluna, prioridade, sprintId, status } = options
  
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTarefas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getTarefas({
        empresa_id: empresaId,
        coluna,
        prioridade,
        sprint_id: sprintId,
        status,
      })
      setTarefas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas')
      console.error('Erro ao carregar tarefas:', err)
    } finally {
      setLoading(false)
    }
  }, [empresaId, coluna, prioridade, sprintId, status])

  useEffect(() => {
    fetchTarefas()
  }, [fetchTarefas])

  const createTarefa = async (tarefa: Partial<Tarefa>) => {
    try {
      const nova = await api.createTarefa(tarefa)
      setTarefas(prev => [nova, ...prev])
      return nova
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar tarefa')
      throw err
    }
  }

  const updateTarefa = async (id: number, data: Partial<Tarefa>) => {
    try {
      const atualizada = await api.updateTarefa(id, data)
      setTarefas(prev => prev.map(t => t.id === id ? atualizada : t))
      return atualizada
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar tarefa')
      throw err
    }
  }

  const deleteTarefa = async (id: number) => {
    try {
      await api.deleteTarefa(id)
      setTarefas(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar tarefa')
      throw err
    }
  }

  const moveTarefa = async (id: number, coluna: ColunaKanban) => {
    try {
      const atualizada = await api.moverTarefa(id, coluna)
      setTarefas(prev => prev.map(t => t.id === id ? { ...t, coluna } : t))
      return atualizada
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao mover tarefa')
      throw err
    }
  }

  const iniciarTarefa = async (id: number) => {
    try {
      const atualizada = await api.iniciarTarefa(id)
      setTarefas(prev => prev.map(t => t.id === id ? atualizada : t))
      return atualizada
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar tarefa')
      throw err
    }
  }

  const pausarTarefa = async (id: number, motivo?: string) => {
    try {
      const atualizada = await api.pausarTarefa(id, motivo)
      setTarefas(prev => prev.map(t => t.id === id ? atualizada : t))
      return atualizada
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao pausar tarefa')
      throw err
    }
  }

  const finalizarTarefa = async (id: number) => {
    try {
      const atualizada = await api.finalizarTarefa(id)
      setTarefas(prev => prev.map(t => t.id === id ? atualizada : t))
      return atualizada
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar tarefa')
      throw err
    }
  }

  const abandonarTarefa = async (id: number, motivo?: string) => {
    try {
      const atualizada = await api.abandonarTarefa(id, motivo)
      setTarefas(prev => prev.map(t => t.id === id ? atualizada : t))
      return atualizada
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao abandonar tarefa')
      throw err
    }
  }

  const suspenderTarefa = async (id: number, motivo?: string) => {
    try {
      const atualizada = await api.suspenderTarefa(id, motivo)
      setTarefas(prev => prev.map(t => t.id === id ? atualizada : t))
      return atualizada
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao suspender tarefa')
      throw err
    }
  }

  return {
    tarefas,
    loading,
    error,
    refetch: fetchTarefas,
    createTarefa,
    updateTarefa,
    deleteTarefa,
    moveTarefa,
    iniciarTarefa,
    pausarTarefa,
    finalizarTarefa,
    abandonarTarefa,
    suspenderTarefa,
  }
}

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Evento } from '@/types'

interface UseEventosOptions {
  empresaId?: number
  tipo?: string
  dataInicio?: string
  dataFim?: string
  membroId?: string
}

export function useEventos(options: UseEventosOptions = {}) {
  const { empresaId = 1, tipo, dataInicio, dataFim, membroId } = options
  
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEventos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getEventos({
        empresa_id: empresaId,
        tipo,
        data_inicio: dataInicio,
        data_fim: dataFim,
        membro_id: membroId,
      })
      setEventos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos')
      console.error('Erro ao carregar eventos:', err)
    } finally {
      setLoading(false)
    }
  }, [empresaId, tipo, dataInicio, dataFim, membroId])

  useEffect(() => {
    fetchEventos()
  }, [fetchEventos])

  const getEventoById = useCallback((id: string) => {
    return eventos.find(e => e.id === id)
  }, [eventos])

  const createEvento = useCallback(async (data: Partial<Evento>) => {
    const novoEvento = await api.createEvento(data)
    setEventos(prev => [...prev, novoEvento])
    return novoEvento
  }, [])

  const updateEvento = useCallback(async (id: string, data: Partial<Evento>) => {
    const atualizado = await api.updateEvento(id, data)
    setEventos(prev => prev.map(e => e.id === id ? atualizado : e))
    return atualizado
  }, [])

  const deleteEvento = useCallback(async (id: string) => {
    await api.deleteEvento(id)
    setEventos(prev => prev.filter(e => e.id !== id))
  }, [])

  return {
    eventos,
    loading,
    error,
    refetch: fetchEventos,
    getEventoById,
    createEvento,
    updateEvento,
    deleteEvento,
  }
}

export function useTimeline(inicio: string, fim: string, empresaId: number = 1, membroId?: string) {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeline = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getTimeline(inicio, fim, empresaId, membroId)
      setEventos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar timeline')
      console.error('Erro ao carregar timeline:', err)
    } finally {
      setLoading(false)
    }
  }, [inicio, fim, empresaId, membroId])

  useEffect(() => {
    fetchTimeline()
  }, [fetchTimeline])

  return {
    eventos,
    loading,
    error,
    refetch: fetchTimeline,
  }
}

export function useEventosDoDia(dataStr: string, empresaId: number = 1) {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEventosDoDia = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.getEventosDoDia(dataStr, empresaId)
      setEventos(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos do dia')
      console.error('Erro ao carregar eventos do dia:', err)
    } finally {
      setLoading(false)
    }
  }, [dataStr, empresaId])

  useEffect(() => {
    fetchEventosDoDia()
  }, [fetchEventosDoDia])

  return {
    eventos,
    loading,
    error,
    refetch: fetchEventosDoDia,
  }
}

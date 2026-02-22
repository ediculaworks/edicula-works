import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Sprint } from '@/types'

interface UseSprintsOptions {
  empresaId?: number
  projetoId?: number
  status?: string
}

export function useSprints(options: UseSprintsOptions = {}) {
  const { empresaId = 1, projetoId, status } = options
  
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSprints = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getSprints({
        empresa_id: empresaId,
        projeto_id: projetoId,
        status,
      })
      setSprints(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar sprints')
      console.error('Erro ao carregar sprints:', err)
    } finally {
      setLoading(false)
    }
  }, [empresaId, projetoId, status])

  useEffect(() => {
    fetchSprints()
  }, [fetchSprints])

  const getSprintById = useCallback((id: number) => {
    return sprints.find(s => s.id === id)
  }, [sprints])

  const createSprint = useCallback(async (data: Partial<Sprint>) => {
    const novoSprint = await api.createSprint({ ...data, empresa_id: empresaId })
    setSprints(prev => [...prev, novoSprint])
    return novoSprint
  }, [empresaId])

  const updateSprint = useCallback(async (id: number, data: Partial<Sprint>) => {
    const atualizado = await api.updateSprint(id, data)
    setSprints(prev => prev.map(s => s.id === id ? atualizado : s))
    return atualizado
  }, [])

  const deleteSprint = useCallback(async (id: number) => {
    await api.deleteSprint(id)
    setSprints(prev => prev.filter(s => s.id !== id))
  }, [])

  const iniciarSprint = useCallback(async (id: number) => {
    const atualizado = await api.iniciarSprint(id)
    setSprints(prev => prev.map(s => s.id === id ? atualizado : s))
    return atualizado
  }, [])

  const concluirSprint = useCallback(async (id: number) => {
    const atualizado = await api.concluirSprint(id)
    setSprints(prev => prev.map(s => s.id === id ? atualizado : s))
    return atualizado
  }, [])

  return {
    sprints,
    loading,
    error,
    refetch: fetchSprints,
    getSprintById,
    createSprint,
    updateSprint,
    deleteSprint,
    iniciarSprint,
    concluirSprint,
  }
}

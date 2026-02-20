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

  return {
    sprints,
    loading,
    error,
    refetch: fetchSprints,
    getSprintById,
  }
}

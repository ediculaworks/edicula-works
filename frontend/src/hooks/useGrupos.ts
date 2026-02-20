import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Grupo } from '@/types'

interface UseGruposOptions {
  empresaId?: number
  ativo?: boolean
}

export function useGrupos(options: UseGruposOptions = {}) {
  const { empresaId = 1, ativo } = options
  
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGrupos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getGrupos(empresaId, ativo)
      setGrupos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar grupos')
      console.error('Erro ao carregar grupos:', err)
    } finally {
      setLoading(false)
    }
  }, [empresaId, ativo])

  useEffect(() => {
    fetchGrupos()
  }, [fetchGrupos])

  const getGrupoById = useCallback((id: number) => {
    return grupos.find(g => g.id === id)
  }, [grupos])

  return {
    grupos,
    loading,
    error,
    refetch: fetchGrupos,
    getGrupoById,
  }
}

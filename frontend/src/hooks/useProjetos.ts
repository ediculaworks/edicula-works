import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Projeto } from '@/types'

interface UseProjetosOptions {
  empresaId?: number
}

export function useProjetos(options: UseProjetosOptions = {}) {
  const { empresaId = 1 } = options
  
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjetos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getProjetos(empresaId)
      setProjetos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar projetos')
      console.error('Erro ao carregar projetos:', err)
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => {
    fetchProjetos()
  }, [fetchProjetos])

  const getProjetoById = useCallback((id: number | undefined) => {
    if (!id) return undefined
    return projetos.find(p => p.id === id)
  }, [projetos])

  return {
    projetos,
    loading,
    error,
    refetch: fetchProjetos,
    getProjetoById,
  }
}

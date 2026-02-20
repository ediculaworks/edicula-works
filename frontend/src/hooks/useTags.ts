import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Tag } from '@/types'

interface UseTagsOptions {
  empresaId?: number
  escopo?: string
}

export function useTags(options: UseTagsOptions = {}) {
  const { empresaId = 1, escopo } = options
  
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getTags({
        empresa_id: empresaId,
        escopo,
      })
      setTags(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tags')
      console.error('Erro ao carregar tags:', err)
    } finally {
      setLoading(false)
    }
  }, [empresaId, escopo])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const getTagById = useCallback((id: number) => {
    return tags.find(t => t.id === id)
  }, [tags])

  const getTagByNome = useCallback((nome: string) => {
    return tags.find(t => t.nome.toLowerCase() === nome.toLowerCase())
  }, [tags])

  return {
    tags,
    loading,
    error,
    refetch: fetchTags,
    getTagById,
    getTagByNome,
  }
}

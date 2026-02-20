import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Usuario } from '@/types'

interface UseUsuariosOptions {
  empresaId?: number
  ativo?: boolean
  role?: string
}

export function useUsuarios(options: UseUsuariosOptions = {}) {
  const { empresaId = 1, ativo, role } = options
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getUsuarios({
        empresa_id: empresaId,
        ativo,
        role,
      })
      setUsuarios(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários')
      console.error('Erro ao carregar usuários:', err)
    } finally {
      setLoading(false)
    }
  }, [empresaId, ativo, role])

  useEffect(() => {
    fetchUsuarios()
  }, [fetchUsuarios])

  const getUsuarioById = useCallback((id: string) => {
    return usuarios.find(u => u.id === id)
  }, [usuarios])

  const getUsuariosByIds = useCallback((ids: string[]) => {
    return ids.map(id => getUsuarioById(id)).filter((u): u is Usuario => u !== undefined)
  }, [getUsuarioById])

  return {
    usuarios,
    loading,
    error,
    refetch: fetchUsuarios,
    getUsuarioById,
    getUsuariosByIds,
  }
}

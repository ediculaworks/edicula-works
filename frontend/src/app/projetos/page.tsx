"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton, CardSkeleton, StatsSkeleton } from "@/components/ui/skeleton"
import { 
  FolderKanban, 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  FolderOpen
} from "lucide-react"
import { cn } from "@/lib/utils"

const EMPRESA_ID = 1

interface Projeto {
  id: number
  nome: string
  descricao?: string
  cor?: string
  cliente_nome?: string
  data_inicio?: string
  data_fim?: string
  status: 'ativo' | 'pausado' | 'arquivado' | 'concluido'
  progresso: number
  created_at: string
}

const statusColors = {
  ativo: "bg-green-500/10 text-green-500",
  pausado: "bg-yellow-500/10 text-yellow-500",
  arquivado: "bg-gray-500/10 text-gray-500",
  concluido: "bg-blue-500/10 text-blue-500"
}

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("")

  useEffect(() => {
    fetchProjetos()
  }, [filterStatus])

  const fetchProjetos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ empresa_id: String(EMPRESA_ID) })
      if (filterStatus) params.append("status", filterStatus)
      
      const response = await fetch(`/api/projetos?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProjetos(data)
      }
    } catch (error) {
      console.error("Erro ao buscar projetos:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjetos = projetos.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: projetos.length,
    ativos: projetos.filter(p => p.status === 'ativo').length,
    concluidos: projetos.filter(p => p.status === 'concluido').length,
    pausados: projetos.filter(p => p.status === 'pausado').length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Projetos</h1>
            <p className="text-sm text-[var(--foreground)]/50">
              Gerencie seus projetos e acompanhe o progresso
            </p>
          </div>
          <Button className="glow-button">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bento-item p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-[var(--foreground)]/50">Total</p>
          </div>
          <div className="bento-item p-4">
            <p className="text-2xl font-bold text-green-500">{stats.ativos}</p>
            <p className="text-xs text-[var(--foreground)]/50">Ativos</p>
          </div>
          <div className="bento-item p-4">
            <p className="text-2xl font-bold text-blue-500">{stats.concluidos}</p>
            <p className="text-xs text-[var(--foreground)]/50">Concluídos</p>
          </div>
          <div className="bento-item p-4">
            <p className="text-2xl font-bold text-yellow-500">{stats.pausados}</p>
            <p className="text-xs text-[var(--foreground)]/50">Pausados</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/40" />
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="pausado">Pausado</option>
            <option value="concluido">Concluído</option>
            <option value="arquivado">Arquivado</option>
          </select>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProjetos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-[var(--surface-hover)] flex items-center justify-center mb-4">
              <FolderOpen className="h-10 w-10 text-[var(--foreground)]/30" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
            <p className="text-sm text-[var(--foreground)]/50 mb-4">
              {searchTerm ? "Tente buscar por outro termo" : "Comece criando seu primeiro projeto"}
            </p>
            {!searchTerm && (
              <Button className="glow-button">
                <Plus className="mr-2 h-4 w-4" />
                Novo Projeto
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjetos.map((projeto) => (
              <div
                key={projeto.id}
                className="bento-item p-4 hover:border-[var(--border-hover)] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${projeto.cor || '#3b82f6'}20` }}
                    >
                      <FolderKanban className="h-5 w-5" style={{ color: projeto.cor || '#3b82f6' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{projeto.nome}</h3>
                      {projeto.cliente_nome && (
                        <p className="text-xs text-[var(--foreground)]/50">{projeto.cliente_nome}</p>
                      )}
                    </div>
                  </div>
                  <button className="p-1 hover:bg-[var(--surface-hover)] rounded">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {projeto.descricao && (
                  <p className="text-sm text-[var(--foreground)]/70 mb-3 line-clamp-2">
                    {projeto.descricao}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progresso</span>
                    <span>{projeto.progresso}%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${projeto.progresso}%`,
                        backgroundColor: projeto.cor || '#3b82f6'
                      }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[projeto.status])}>
                    {projeto.status}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[var(--foreground)]/50">
                    {projeto.data_inicio && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(projeto.data_inicio).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

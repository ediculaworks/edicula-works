"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  FolderOpen,
  X,
  Check,
  Clock,
  Play,
  Pause,
  Archive,
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

const statusIcons = {
  ativo: Play,
  pausado: Pause,
  arquivado: Archive,
  concluido: Check,
}

const CORES = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', 
  '#ec4899', '#14b8a6', '#f97316', '#6366f1'
]

export default function ProjetosPage() {
  const router = useRouter()
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingProjeto, setEditingProjeto] = useState<Projeto | null>(null)
  const [selectedColor, setSelectedColor] = useState("#3b82f6")

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

  const handleSaveProjeto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const data = {
      empresa_id: EMPRESA_ID,
      nome: formData.get('nome'),
      descricao: formData.get('descricao') || null,
      cor: selectedColor,
      cliente_nome: formData.get('cliente_nome') || null,
      data_inicio: formData.get('data_inicio') || null,
      data_fim: formData.get('data_fim') || null,
      status: formData.get('status') || 'ativo',
      progresso: parseInt(formData.get('progresso') as string) || 0,
    }

    try {
      const url = editingProjeto 
        ? `/api/projetos/${editingProjeto.id}`
        : '/api/projetos'
      const method = editingProjeto ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowModal(false)
        setEditingProjeto(null)
        fetchProjetos()
      }
    } catch (error) {
      console.error("Erro ao salvar projeto:", error)
    }
  }

  const handleDeleteProjeto = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return
    
    try {
      const response = await fetch(`/api/projetos/${id}?empresa_id=${EMPRESA_ID}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchProjetos()
      }
    } catch (error) {
      console.error("Erro ao deletar projeto:", error)
    }
  }

  const openEditModal = (projeto: Projeto) => {
    setEditingProjeto(projeto)
    setSelectedColor(projeto.cor || "#3b82f6")
    setShowModal(true)
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
          <Button className="glow-button" onClick={() => { setEditingProjeto(null); setSelectedColor("#3b82f6"); setShowModal(true) }}>
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
              <Button className="glow-button" onClick={() => { setEditingProjeto(null); setSelectedColor("#3b82f6"); setShowModal(true) }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Projeto
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjetos.map((projeto) => {
              const StatusIcon = statusIcons[projeto.status]
              return (
                <div
                  key={projeto.id}
                  className="bento-item p-4 hover:border-[var(--border-hover)] transition-colors cursor-pointer group"
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
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-1 hover:bg-[var(--surface-hover)] rounded"
                        onClick={(e) => { e.stopPropagation(); openEditModal(projeto) }}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 hover:bg-[var(--surface-hover)] rounded text-red-500"
                        onClick={(e) => { e.stopPropagation(); handleDeleteProjeto(projeto.id) }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1", statusColors[projeto.status])}>
                      <StatusIcon className="h-3 w-3" />
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
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProjeto ? 'Editar Projeto' : 'Novo Projeto'}
            </h2>
            <form onSubmit={handleSaveProjeto} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome *</label>
                <Input 
                  name="nome" 
                  required
                  defaultValue={editingProjeto?.nome || ''}
                  placeholder="Nome do projeto" 
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Descrição</label>
                <textarea 
                  name="descricao" 
                  rows={3}
                  defaultValue={editingProjeto?.descricao || ''}
                  placeholder="Descrição do projeto..."
                  className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Cliente</label>
                <Input 
                  name="cliente_nome" 
                  defaultValue={editingProjeto?.cliente_nome || ''}
                  placeholder="Nome do cliente (opcional)" 
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {CORES.map((cor) => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setSelectedColor(cor)}
                      className={cn(
                        "h-8 w-8 rounded-lg transition-transform",
                        selectedColor === cor && "ring-2 ring-white ring-offset-2 ring-offset-[var(--surface)] scale-110"
                      )}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Data Início</label>
                  <Input 
                    name="data_inicio" 
                    type="date"
                    defaultValue={editingProjeto?.data_inicio?.split('T')[0] || ''}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Data Fim</label>
                  <Input 
                    name="data_fim" 
                    type="date"
                    defaultValue={editingProjeto?.data_fim?.split('T')[0] || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingProjeto?.status || 'ativo'}
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="pausado">Pausado</option>
                    <option value="concluido">Concluído</option>
                    <option value="arquivado">Arquivado</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Progresso (%)</label>
                  <Input 
                    name="progresso" 
                    type="number" 
                    min="0"
                    max="100"
                    defaultValue={editingProjeto?.progresso || 0}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => { setShowModal(false); setEditingProjeto(null) }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 glow-button">
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

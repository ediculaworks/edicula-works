"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton, CardSkeleton, ListItemSkeleton, StatsSkeleton } from "@/components/ui/skeleton"
import { 
  Plus, 
  FileSignature, 
  FileText, 
  Calendar, 
  DollarSign, 
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  AlertCircle,
  AlertTriangle,
  Edit,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

const EMPRESA_ID = 1

interface Contrato {
  id: number
  titulo: string
  descricao?: string
  numero?: string
  tipo: string
  contraparte_nome?: string
  valor?: number
  valor_mensal?: number
  data_inicio?: string
  data_fim?: string
  data_assinatura?: string
  status: 'rascunho' | 'ativo' | 'expirado' | 'encerrado' | 'cancelado'
  renovacao_automatica: boolean
  periodicidade?: string
  created_at: string
}

const statusColors = {
  rascunho: "bg-gray-500/10 text-gray-500",
  ativo: "bg-green-500/10 text-green-500",
  expirado: "bg-red-500/10 text-red-500",
  encerrado: "bg-yellow-500/10 text-yellow-500",
  cancelado: "bg-red-500/10 text-red-500"
}

const tipoLabels: Record<string, string> = {
  servico: "Serviço",
  nda: "NDA",
  parceria: "Parceria",
  locacao: "Locação",
  licenca: "Licença",
  outro: "Outro",
}

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null)

  useEffect(() => {
    fetchContratos()
  }, [filterStatus])

  const fetchContratos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ empresa_id: String(EMPRESA_ID) })
      if (filterStatus) params.append("status", filterStatus)
      
      const response = await fetch(`/api/contratos?${params}`)
      if (response.ok) {
        const data = await response.json()
        setContratos(data)
      }
    } catch (error) {
      console.error("Erro ao buscar contratos:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContratos = contratos

  const stats = {
    total: contratos.length,
    ativos: contratos.filter(c => c.status === 'ativo').length,
    valorTotal: contratos.reduce((sum, c) => sum + (c.valor || 0), 0),
    valorMensal: contratos.reduce((sum, c) => sum + (c.valor_mensal || 0), 0),
    expirando: contratos.filter(c => {
      if (!c.data_fim || c.status !== 'ativo') return false
      const daysUntilEnd = Math.ceil((new Date(c.data_fim).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysUntilEnd <= 30 && daysUntilEnd > 0
    }).length,
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getDaysUntilEnd = (dataFim: string) => {
    if (!dataFim) return null
    const days = Math.ceil((new Date(dataFim).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  const handleSaveContrato = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const data = {
      empresa_id: EMPRESA_ID,
      titulo: formData.get('titulo'),
      descricao: formData.get('descricao') || null,
      numero: formData.get('numero') || null,
      tipo: formData.get('tipo'),
      contraparte_nome: formData.get('contraparte_nome') || null,
      valor: formData.get('valor') ? parseFloat(formData.get('valor') as string) : null,
      valor_mensal: formData.get('valor_mensal') ? parseFloat(formData.get('valor_mensal') as string) : null,
      data_assinatura: formData.get('data_assinatura') || null,
      data_inicio: formData.get('data_inicio') || null,
      data_fim: formData.get('data_fim') || null,
      status: formData.get('status'),
      renovacao_automatica: formData.get('renovacao_automatica') === 'on',
      periodicidade: formData.get('periodicidade') || null,
    }

    try {
      const url = editingContrato 
        ? `/api/contratos/${editingContrato.id}`
        : '/api/contratos'
      const method = editingContrato ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowModal(false)
        setEditingContrato(null)
        fetchContratos()
      }
    } catch (error) {
      console.error("Erro ao salvar contrato:", error)
    }
  }

  const handleDeleteContrato = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este contrato?')) return
    
    try {
      const response = await fetch(`/api/contratos/${id}?empresa_id=${EMPRESA_ID}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchContratos()
      }
    } catch (error) {
      console.error("Erro ao deletar contrato:", error)
    }
  }

  const openEditModal = (contrato: Contrato) => {
    setEditingContrato(contrato)
    setShowModal(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Contratos</h1>
            <p className="text-sm text-[var(--foreground)]/50">
              Gerencie contratos e acordos
            </p>
          </div>
          <Button className="glow-button" onClick={() => { setEditingContrato(null); setShowModal(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Contrato
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bento-item p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-[var(--foreground)]/50">Total</p>
          </div>
          <div className="bento-item p-4">
            <p className="text-2xl font-bold text-green-500">{stats.ativos}</p>
            <p className="text-xs text-[var(--foreground)]/50">Ativos</p>
          </div>
          <div className="bento-item p-4">
            <p className="text-2xl font-bold text-blue-500">{formatCurrency(stats.valorMensal)}</p>
            <p className="text-xs text-[var(--foreground)]/50">Valor Mensal</p>
          </div>
          <div className="bento-item p-4">
            <p className="text-2xl font-bold text-yellow-500">{formatCurrency(stats.valorTotal)}</p>
            <p className="text-xs text-[var(--foreground)]/50">Valor Total</p>
          </div>
          <div className="bento-item p-4 border-l-4 border-l-orange-500">
            <p className="text-2xl font-bold text-orange-500">{stats.expirando}</p>
            <p className="text-xs text-[var(--foreground)]/50">Expirando em 30 dias</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
          >
            <option value="">Todos os status</option>
            <option value="rascunho">Rascunho</option>
            <option value="ativo">Ativo</option>
            <option value="expirado">Expirado</option>
            <option value="encerrado">Encerrado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Contracts List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        ) : filteredContratos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-[var(--surface-hover)] flex items-center justify-center mb-4">
              <FileSignature className="h-10 w-10 text-[var(--foreground)]/30" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum contrato encontrado</h3>
            <p className="text-sm text-[var(--foreground)]/50 mb-4">
              {filterStatus ? "Tente ajustar os filtros" : "Comece criando seu primeiro contrato"}
            </p>
            {!filterStatus && (
              <Button className="glow-button" onClick={() => { setEditingContrato(null); setShowModal(true) }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Contrato
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContratos.map((contrato) => {
              const daysUntil = getDaysUntilEnd(contrato.data_fim || '')
              const isExpiring = daysUntil !== null && daysUntil > 0 && daysUntil <= 30
              
              return (
                <div
                  key={contrato.id}
                  className="bento-item p-4 hover:border-[var(--border-hover)] transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-[var(--primary)]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{contrato.titulo}</h3>
                          {contrato.numero && (
                            <span className="text-xs text-[var(--foreground)]/50">#{contrato.numero}</span>
                          )}
                          {isExpiring && (
                            <span className="flex items-center gap-1 text-xs text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="h-3 w-3" />
                              {daysUntil}d
                            </span>
                          )}
                        </div>
                        {contrato.contraparte_nome && (
                          <p className="text-sm text-[var(--foreground)]/70">{contrato.contraparte_nome}</p>
                        )}
                        <p className="text-xs text-[var(--foreground)]/50 mt-1">
                          {tipoLabels[contrato.tipo] || contrato.tipo}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-1 hover:bg-[var(--surface-hover)] rounded"
                          onClick={(e) => { e.stopPropagation(); openEditModal(contrato) }}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1 hover:bg-[var(--surface-hover)] rounded text-red-500"
                          onClick={(e) => { e.stopPropagation(); handleDeleteContrato(contrato.id) }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[contrato.status])}>
                        {contrato.status}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-6 mt-4 pt-3 border-t border-[var(--border)]">
                    {contrato.valor_mensal && (
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-green-500 font-medium">{formatCurrency(contrato.valor_mensal)}/mês</span>
                      </div>
                    )}
                    {contrato.data_inicio && (
                      <div className="flex items-center gap-1 text-xs text-[var(--foreground)]/50">
                        <Calendar className="h-3 w-3" />
                        {new Date(contrato.data_inicio).toLocaleDateString("pt-BR")}
                        {contrato.data_fim && (
                          <> até {new Date(contrato.data_fim).toLocaleDateString("pt-BR")}</>
                        )}
                      </div>
                    )}
                    {contrato.renovacao_automatica && (
                      <div className="flex items-center gap-1 text-xs text-blue-500">
                        <Clock className="h-3 w-3" />
                        Renovação automática
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingContrato ? 'Editar Contrato' : 'Novo Contrato'}
            </h2>
            <form onSubmit={handleSaveContrato} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Título *</label>
                <Input 
                  name="titulo" 
                  required
                  defaultValue={editingContrato?.titulo || ''}
                  placeholder="Nome do contrato" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Número</label>
                  <Input 
                    name="numero" 
                    defaultValue={editingContrato?.numero || ''}
                    placeholder="Nº do contrato" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tipo</label>
                  <select 
                    name="tipo" 
                    defaultValue={editingContrato?.tipo || 'servico'}
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                  >
                    <option value="servico">Serviço</option>
                    <option value="nda">NDA</option>
                    <option value="parceria">Parceria</option>
                    <option value="locacao">Locação</option>
                    <option value="licenca">Licença</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Contraparte</label>
                <Input 
                  name="contraparte_nome" 
                  defaultValue={editingContrato?.contraparte_nome || ''}
                  placeholder="Nome da contraparte" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Valor Total</label>
                  <Input 
                    name="valor" 
                    type="number" 
                    step="0.01"
                    defaultValue={editingContrato?.valor || ''}
                    placeholder="0,00" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Valor Mensal</label>
                  <Input 
                    name="valor_mensal" 
                    type="number" 
                    step="0.01"
                    defaultValue={editingContrato?.valor_mensal || ''}
                    placeholder="0,00" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Data Assinatura</label>
                  <Input 
                    name="data_assinatura" 
                    type="date"
                    defaultValue={editingContrato?.data_assinatura?.split('T')[0] || ''}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingContrato?.status || 'rascunho'}
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                  >
                    <option value="rascunho">Rascunho</option>
                    <option value="ativo">Ativo</option>
                    <option value="encerrado">Encerrado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Data Início</label>
                  <Input 
                    name="data_inicio" 
                    type="date"
                    defaultValue={editingContrato?.data_inicio?.split('T')[0] || ''}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Data Fim</label>
                  <Input 
                    name="data_fim" 
                    type="date"
                    defaultValue={editingContrato?.data_fim?.split('T')[0] || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Periodicidade</label>
                  <select 
                    name="periodicidade" 
                    defaultValue={editingContrato?.periodicidade || ''}
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                  >
                    <option value="">Selecione</option>
                    <option value="mensal">Mensal</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                    <option value="unico">Único</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input 
                    type="checkbox" 
                    name="renovacao_automatica" 
                    id="renovacao_automatica"
                    defaultChecked={editingContrato?.renovacao_automatica || false}
                    className="toggle"
                  />
                  <label htmlFor="renovacao_automatica" className="text-sm">Renovação automática</label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Descrição</label>
                <textarea 
                  name="descricao" 
                  rows={3}
                  defaultValue={editingContrato?.descricao || ''}
                  placeholder="Descrição do contrato..."
                  className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => { setShowModal(false); setEditingContrato(null) }}
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

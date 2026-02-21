"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton, CardSkeleton, ListItemSkeleton, StatsSkeleton } from "@/components/ui/skeleton"
import { 
  FileText, 
  Plus, 
  Search, 
  MoreVertical,
  Calendar,
  DollarSign,
  User,
  Clock,
  FileSignature
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
  status: 'rascunho' | 'ativo' | 'expirado' | 'encerrado' | 'cancelado'
  renovacao_automatica: boolean
  created_at: string
}

const statusColors = {
  rascunho: "bg-gray-500/10 text-gray-500",
  ativo: "bg-green-500/10 text-green-500",
  expirado: "bg-red-500/10 text-red-500",
  encerrado: "bg-yellow-500/10 text-yellow-500",
  cancelado: "bg-red-500/10 text-red-500"
}

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

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

  const filteredContratos = contratos.filter(c =>
    c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contraparte_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.numero?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: contratos.length,
    ativos: contratos.filter(c => c.status === 'ativo').length,
    valorTotal: contratos.reduce((sum, c) => sum + (c.valor || 0), 0),
    valorMensal: contratos.reduce((sum, c) => sum + (c.valor_mensal || 0), 0),
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
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
          <Button className="glow-button">
            <Plus className="mr-2 h-4 w-4" />
            Novo Contrato
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
            <p className="text-2xl font-bold text-blue-500">{formatCurrency(stats.valorTotal)}</p>
            <p className="text-xs text-[var(--foreground)]/50">Valor Total</p>
          </div>
          <div className="bento-item p-4">
            <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.valorMensal)}</p>
            <p className="text-xs text-[var(--foreground)]/50">Valor Mensal</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/40" />
            <Input
              placeholder="Buscar contratos..."
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
              {searchTerm || filterStatus ? "Tente ajustar os filtros" : "Comece criando seu primeiro contrato"}
            </p>
            {!searchTerm && !filterStatus && (
              <Button className="glow-button">
                <Plus className="mr-2 h-4 w-4" />
                Novo Contrato
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContratos.map((contrato) => (
              <div
                key={contrato.id}
                className="bento-item p-4 hover:border-[var(--border-hover)] transition-colors cursor-pointer"
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
                      </div>
                      {contrato.contraparte_nome && (
                        <p className="text-sm text-[var(--foreground)]/70">{contrato.contraparte_nome}</p>
                      )}
                      <p className="text-xs text-[var(--foreground)]/50 mt-1">{contrato.tipo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[contrato.status])}>
                      {contrato.status}
                    </span>
                    <button className="p-1 hover:bg-[var(--surface-hover)] rounded">
                      <MoreVertical className="h-4 w-4" />
                    </button>
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
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Wallet, 
  Plus, 
  Search, 
  MoreVertical,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"

const EMPRESA_ID = 1

interface Transacao {
  id: number
  tipo: 'receita' | 'despesa' | 'transferencia'
  categoria_id?: number
  valor: number
  descricao?: string
  data_transacao: string
  data_vencimento?: string
  data_pagamento?: string
  status: 'pendente' | 'pago' | 'cancelado' | 'estornado'
  conta_bancaria_id?: number
  created_at: string
}

const statusColors = {
  pendente: "bg-yellow-500/10 text-yellow-500",
  pago: "bg-green-500/10 text-green-500",
  cancelado: "bg-red-500/10 text-red-500",
  estornado: "bg-blue-500/10 text-blue-500"
}

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  useEffect(() => {
    fetchTransacoes()
  }, [filterTipo, filterStatus])

  const fetchTransacoes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ empresa_id: String(EMPRESA_ID) })
      if (filterTipo) params.append("tipo", filterTipo)
      if (filterStatus) params.append("status", filterStatus)
      
      const response = await fetch(`/api/transacoes?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTransacoes(data)
      }
    } catch (error) {
      console.error("Erro ao buscar transações:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransacoes = transacoes.filter(t =>
    t.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    receitas: transacoes.filter(t => t.tipo === 'receita' && t.status === 'pago').reduce((sum, t) => sum + t.valor, 0),
    despesas: transacoes.filter(t => t.tipo === 'despesa' && t.status === 'pago').reduce((sum, t) => sum + t.valor, 0),
    pendentes: transacoes.filter(t => t.status === 'pendente').reduce((sum, t) => sum + t.valor, 0),
    saldo: transacoes.filter(t => t.status === 'pago').reduce((sum, t) => {
      if (t.tipo === 'receita') return sum + t.valor
      if (t.tipo === 'despesa') return sum - t.valor
      return sum
    }, 0),
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
            <h1 className="text-2xl font-bold">Financeiro</h1>
            <p className="text-sm text-[var(--foreground)]/50">
              Controle de receitas e despesas
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <Button className="glow-button">
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bento-item p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.receitas)}</p>
            <p className="text-xs text-[var(--foreground)]/50">Receitas</p>
          </div>
          <div className="bento-item p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(stats.despesas)}</p>
            <p className="text-xs text-[var(--foreground)]/50">Despesas</p>
          </div>
          <div className="bento-item p-4">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-500">{formatCurrency(stats.pendentes)}</p>
            <p className="text-xs text-[var(--foreground)]/50">Pendente</p>
          </div>
          <div className="bento-item p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={cn("text-lg font-bold", stats.saldo >= 0 ? "text-green-500" : "text-red-500")}>
                {stats.saldo >= 0 ? "+" : "-"}
              </span>
            </div>
            <p className={cn("text-2xl font-bold", stats.saldo >= 0 ? "text-green-500" : "text-red-500")}>
              {formatCurrency(Math.abs(stats.saldo))}
            </p>
            <p className="text-xs text-[var(--foreground)]/50">Saldo</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/40" />
            <Input
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
          >
            <option value="">Todos os tipos</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
            <option value="transferencia">Transferência</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
            <option value="estornado">Estornado</option>
          </select>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="text-center py-12 text-[var(--foreground)]/50">
            Carregando...
          </div>
        ) : filteredTransacoes.length === 0 ? (
          <div className="text-center py-12 text-[var(--foreground)]/50">
            Nenhuma transação encontrada
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransacoes.map((transacao) => (
              <div
                key={transacao.id}
                className="bento-item p-4 hover:border-[var(--border-hover)] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      transacao.tipo === 'receita' ? "bg-green-500/10" : "bg-red-500/10"
                    )}>
                      {transacao.tipo === 'receita' ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transacao.descricao || 'Sem descrição'}</p>
                      <p className="text-xs text-[var(--foreground)]/50 capitalize">{transacao.tipo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={cn(
                        "font-bold",
                        transacao.tipo === 'receita' ? "text-green-500" : "text-red-500"
                      )}>
                        {transacao.tipo === 'receita' ? '+' : '-'} {formatCurrency(transacao.valor)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-[var(--foreground)]/50">
                        <Calendar className="h-3 w-3" />
                        {new Date(transacao.data_transacao).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[transacao.status])}>
                      {transacao.status}
                    </span>
                    <button className="p-1 hover:bg-[var(--surface-hover)] rounded">
                      <MoreVertical className="h-4 w-4" />
                    </button>
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

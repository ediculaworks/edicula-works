"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton, CardSkeleton, ListItemSkeleton, StatsSkeleton } from "@/components/ui/skeleton"
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
  Filter,
  Receipt,
  Users,
  DollarSign,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from "recharts"

const EMPRESA_ID = 1

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4']

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
  const [showModal, setShowModal] = useState(false)
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null)

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

  const receitas = transacoes.filter(t => t.tipo === 'receita' && t.status === 'pago').reduce((sum, t) => sum + t.valor, 0)
  const despesas = transacoes.filter(t => t.tipo === 'despesa' && t.status === 'pago').reduce((sum, t) => sum + t.valor, 0)
  const pendentes = transacoes.filter(t => t.status === 'pendente').reduce((sum, t) => sum + t.valor, 0)
  const saldo = receitas - despesas

  const receitasPendentes = transacoes.filter(t => t.tipo === 'receita' && t.status === 'pendente').reduce((sum, t) => sum + t.valor, 0)
  const despesasPendentes = transacoes.filter(t => t.tipo === 'despesa' && t.status === 'pendente').reduce((sum, t) => sum + t.valor, 0)

  const esperadoReceber = receitas + receitasPendentes
  const esperadoPagar = despesas + despesasPendentes

  const transactionsByMonth = transacoes
    .filter(t => t.status === 'pago')
    .reduce((acc: any, t) => {
      const month = new Date(t.data_transacao).toLocaleDateString('pt-BR', { month: 'short' })
      if (!acc[month]) {
        acc[month] = { name: month, receitas: 0, despesas: 0 }
      }
      if (t.tipo === 'receita') acc[month].receitas += t.valor
      if (t.tipo === 'despesa') acc[month].despesas += t.valor
      return acc
    }, {})

  const chartData = Object.values(transactionsByMonth).slice(-6)

  const tipoData = [
    { name: 'Receitas', value: receitas, color: '#22c55e' },
    { name: 'Despesas', value: despesas, color: '#ef4444' },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const handleSaveTransacao = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const data = {
      empresa_id: EMPRESA_ID,
      tipo: formData.get('tipo'),
      valor: parseFloat(formData.get('valor') as string),
      descricao: formData.get('descricao'),
      data_transacao: formData.get('data_transacao'),
      data_vencimento: formData.get('data_vencimento'),
      status: formData.get('status'),
    }

    try {
      const url = editingTransacao 
        ? `/api/transacoes/${editingTransacao.id}`
        : '/api/transacoes'
      const method = editingTransacao ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowModal(false)
        setEditingTransacao(null)
        fetchTransacoes()
      }
    } catch (error) {
      console.error("Erro ao salvar transação:", error)
    }
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
            <Button variant="outline" onClick={() => setShowModal(true)}>
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <Button className="glow-button" onClick={() => { setEditingTransacao(null); setShowModal(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Stats - Enhanced */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bento-item p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(receitas)}</p>
            <p className="text-xs text-[var(--foreground)]/50">Receitas Recebidas</p>
          </div>
          <div className="bento-item p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(despesas)}</p>
            <p className="text-xs text-[var(--foreground)]/50">Despesas Pagas</p>
          </div>
          <div className="bento-item p-4">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-500">{formatCurrency(pendentes)}</p>
            <p className="text-xs text-[var(--foreground)]/50">Pendentes</p>
          </div>
          <div className="bento-item p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className={cn("h-5 w-5", saldo >= 0 ? "text-green-500" : "text-red-500")} />
            </div>
            <p className={cn("text-2xl font-bold", saldo >= 0 ? "text-green-500" : "text-red-500")}>
              {formatCurrency(saldo)}
            </p>
            <p className="text-xs text-[var(--foreground)]/50">Saldo Atual</p>
          </div>
        </div>

        {/* Expected Calculations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bento-item p-4 border-l-4 border-l-green-500">
            <p className="text-sm text-[var(--foreground)]/70">A Receber</p>
            <p className="text-xl font-bold text-green-500">{formatCurrency(receitasPendentes)}</p>
          </div>
          <div className="bento-item p-4 border-l-4 border-l-red-500">
            <p className="text-sm text-[var(--foreground)]/70">A Pagar</p>
            <p className="text-xl font-bold text-red-500">{formatCurrency(despesasPendentes)}</p>
          </div>
          <div className="bento-item p-4 border-l-4 border-l-blue-500">
            <p className="text-sm text-[var(--foreground)]/70">Esperado Receber</p>
            <p className="text-xl font-bold text-blue-500">{formatCurrency(esperadoReceber)}</p>
          </div>
          <div className="bento-item p-4 border-l-4 border-l-purple-500">
            <p className="text-sm text-[var(--foreground)]/70">Esperado Pagar</p>
            <p className="text-xl font-bold text-purple-500">{formatCurrency(esperadoPagar)}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bento-item p-4">
            <h3 className="text-sm font-semibold mb-4">Receitas vs Despesas</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--surface)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-[var(--foreground)]/50">
                Sem dados suficientes
              </div>
            )}
          </div>

          <div className="bento-item p-4">
            <h3 className="text-sm font-semibold mb-4">Distribuição</h3>
            {receitas > 0 || despesas > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={tipoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {tipoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--surface)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-[var(--foreground)]/50">
                Sem dados
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/40 z-20 pointer-events-none" />
            <Input
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11"
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
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        ) : filteredTransacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-[var(--surface-hover)] flex items-center justify-center mb-4">
              <Receipt className="h-10 w-10 text-[var(--foreground)]/30" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma transação encontrada</h3>
            <p className="text-sm text-[var(--foreground)]/50 mb-4">
              {searchTerm || filterTipo || filterStatus ? "Tente ajustar os filtros" : "Comece registrando sua primeira transação"}
            </p>
            {!searchTerm && !filterTipo && !filterStatus && (
              <Button className="glow-button" onClick={() => { setEditingTransacao(null); setShowModal(true) }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransacoes.map((transacao) => (
              <div
                key={transacao.id}
                className="bento-item p-4 hover:border-[var(--border-hover)] transition-colors cursor-pointer"
                onClick={() => { setEditingTransacao(transacao); setShowModal(true) }}
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
                    <button className="p-1 hover:bg-[var(--surface-hover)] rounded" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingTransacao ? 'Editar Transação' : 'Nova Transação'}
            </h2>
            <form onSubmit={handleSaveTransacao} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Tipo</label>
                <select 
                  name="tipo" 
                  required
                  defaultValue={editingTransacao?.tipo || 'despesa'}
                  className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                  <option value="transferencia">Transferência</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Descrição</label>
                <Input 
                  name="descricao" 
                  required
                  defaultValue={editingTransacao?.descricao || ''}
                  placeholder="Ex: Pagamento do cliente X" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Valor</label>
                  <Input 
                    name="valor" 
                    type="number" 
                    step="0.01"
                    required
                    defaultValue={editingTransacao?.valor || ''}
                    placeholder="0,00" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingTransacao?.status || 'pendente'}
                    className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Data Transação</label>
                  <Input 
                    name="data_transacao" 
                    type="date" 
                    required
                    defaultValue={editingTransacao?.data_transacao?.split('T')[0] || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Data Vencimento</label>
                  <Input 
                    name="data_vencimento" 
                    type="date"
                    defaultValue={editingTransacao?.data_vencimento?.split('T')[0] || ''}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => { setShowModal(false); setEditingTransacao(null) }}
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

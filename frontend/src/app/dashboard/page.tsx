"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  FolderKanban,
  Wallet,
  Users,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"

const EMPRESA_ID = 1

export default function DashboardPage() {
  const [projetos, setProjetos] = useState<any[]>([])
  const [tarefas, setTarefas] = useState<any[]>([])
  const [transacoes, setTransacoes] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [projetosRes, tarefasRes, transacoesRes, usuariosRes] = await Promise.all([
          fetch(`/api/projetos?empresa_id=${EMPRESA_ID}`),
          fetch(`/api/tarefas?empresa_id=${EMPRESA_ID}&limit=50`),
          fetch(`/api/transacoes?empresa_id=${EMPRESA_ID}&limit=20`),
          fetch(`/api/usuarios?empresa_id=${EMPRESA_ID}`),
        ])

        if (projetosRes.ok) setProjetos(await projetosRes.json())
        if (tarefasRes.ok) setTarefas(await tarefasRes.json())
        if (transacoesRes.ok) setTransacoes(await transacoesRes.json())
        if (usuariosRes.ok) setUsuarios(await usuariosRes.json())
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const tarefasAtivas = tarefas.filter(t => t.status === "ativa").length
  const tarefasConcluidas = tarefas.filter(t => t.status === "concluida").length
  const projetosAtivos = projetos.filter(p => p.status === "ativo").length

  const receitas = transacoes.filter(t => t.tipo === 'receita' && t.status === 'pago').reduce((sum, t) => sum + t.valor, 0)
  const despesas = transacoes.filter(t => t.tipo === 'despesa' && t.status === 'pago').reduce((sum, t) => sum + t.valor, 0)
  const saldo = receitas - despesas

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const stats = [
    { label: "Tarefas Ativas", value: tarefasAtivas, icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Concluídas", value: tarefasConcluidas, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Projetos", value: projetosAtivos, icon: FolderKanban, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Saldo", value: formatCurrency(saldo), icon: Wallet, color: saldo >= 0 ? "text-green-500" : "text-red-500", bg: saldo >= 0 ? "bg-green-500/10" : "bg-red-500/10", isCurrency: true },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[var(--surface-hover)] rounded w-48"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-[var(--surface-hover)] rounded-xl"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-[var(--foreground)]/60">Visão geral do seu negócio</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </div>
              <p className={cn("text-2xl font-bold", stat.color)}>
                {stat.isCurrency ? stat.value : stat.value}
              </p>
              <p className="text-xs text-[var(--foreground)]/50">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarefas Recentes */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Tarefas Recentes</h2>
              <a href="/tarefas" className="text-sm text-[var(--primary)] hover:underline">Ver todas</a>
            </div>
            <div className="space-y-2">
              {tarefas.length === 0 ? (
                <p className="text-sm text-[var(--foreground)]/50 text-center py-4">Nenhuma tarefa</p>
              ) : (
                tarefas.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface-hover)]">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", 
                        task.status === 'ativa' ? 'bg-green-500' : 
                        task.status === 'concluida' ? 'bg-blue-500' : 'bg-yellow-500'
                      )} />
                      <span className="text-sm truncate max-w-[200px]">{task.titulo}</span>
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full",
                      task.status === 'ativa' ? 'bg-green-500/10 text-green-500' :
                      task.status === 'concluida' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    )}>
                      {task.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Projetos Ativos */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Projetos Ativos</h2>
              <a href="/projetos" className="text-sm text-[var(--primary)] hover:underline">Ver todos</a>
            </div>
            <div className="space-y-2">
              {projetosAtivos === 0 ? (
                <p className="text-sm text-[var(--foreground)]/50 text-center py-4">Nenhum projeto ativo</p>
              ) : (
                projetos.filter(p => p.status === 'ativo').slice(0, 5).map((proj) => (
                  <div key={proj.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface-hover)]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: proj.cor || '#3b82f6' }} />
                      <span className="text-sm truncate max-w-[200px]">{proj.nome}</span>
                    </div>
                    <span className="text-xs text-[var(--foreground)]/50">{proj.progresso || 0}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Financeiro</h2>
              <a href="/financeiro" className="text-sm text-[var(--primary)] hover:underline">Ver detalhes</a>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--foreground)]/70">Receitas</span>
                <span className="text-sm text-green-500 font-medium">{formatCurrency(receitas)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--foreground)]/70">Despesas</span>
                <span className="text-sm text-red-500 font-medium">{formatCurrency(despesas)}</span>
              </div>
              <div className="pt-2 border-t border-[var(--border)]">
                <div className="flex justify-between">
                  <span className="font-medium">Saldo</span>
                  <span className={cn("font-bold", saldo >= 0 ? "text-green-500" : "text-red-500")}>
                    {formatCurrency(saldo)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Equipe */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Equipe</h2>
              <span className="text-xs text-[var(--foreground)]/50">{usuarios.length} membros</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {usuarios.length === 0 ? (
                <p className="text-sm text-[var(--foreground)]/50">Nenhum membro</p>
              ) : (
                usuarios.slice(0, 8).map((user) => (
                  <div key={user.id} className="flex items-center gap-2 bg-[var(--surface-hover)] px-3 py-1.5 rounded-full">
                    <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-xs text-white font-medium">
                      {user.nome?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm">{user.nome?.split(' ')[0]}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

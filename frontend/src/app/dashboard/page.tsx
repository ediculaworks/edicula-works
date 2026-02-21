"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  Target,
  FolderKanban,
  Wallet,
  FileText,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton, StatsSkeleton } from "@/components/ui/skeleton"
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
  LineChart,
  Line
} from "recharts"

const EMPRESA_ID = 1

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
}

const sectionVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  }
}

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
          fetch(`/api/tarefas?empresa_id=${EMPRESA_ID}&limit=100`),
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
  const tarefasPausadas = tarefas.filter(t => t.status === "pausada").length

  const projetosAtivos = projetos.filter(p => p.status === "ativo").length
  const projetosConcluidos = projetos.filter(p => p.status === "concluido").length

  const receitas = transacoes.filter(t => t.tipo === 'receita' && t.status === 'pago').reduce((sum, t) => sum + t.valor, 0)
  const despesas = transacoes.filter(t => t.tipo === 'despesa' && t.status === 'pago').reduce((sum, t) => sum + t.valor, 0)
  const saldo = receitas - despesas

  const tarefasPorStatus = [
    { name: 'Ativas', value: tarefasAtivas, color: '#22c55e' },
    { name: 'Concluídas', value: tarefasConcluidas, color: '#3b82f6' },
    { name: 'Pausadas', value: tarefasPausadas, color: '#f59e0b' },
  ].filter(t => t.value > 0)

  const tarefasPorPrioridade = [
    { name: 'Alta', value: tarefas.filter(t => t.prioridade === 'alta').length, color: '#ef4444' },
    { name: 'Média', value: tarefas.filter(t => t.prioridade === 'media').length, color: '#f59e0b' },
    { name: 'Baixa', value: tarefas.filter(t => t.prioridade === 'baixa').length, color: '#22c55e' },
  ].filter(t => t.value > 0)

  const projetosPorStatus = [
    { name: 'Ativos', value: projetosAtivos, color: '#22c55e' },
    { name: 'Concluídos', value: projetosConcluidos, color: '#3b82f6' },
    { name: 'Pausados', value: projetos.filter(p => p.status === 'pausado').length, color: '#f59e0b' },
  ].filter(t => t.value > 0)

  const gastosPorCategoria = transacoes
    .filter(t => t.tipo === 'despesa')
    .slice(0, 5)
    .map(t => ({
      name: t.descricao?.substring(0, 15) || 'Sem desc',
      value: t.valor
    }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const stats = [
    { label: "Tarefas Ativas", value: tarefasAtivas, icon: Activity, color: "#22c55e", bg: "#22c55e20" },
    { label: "Concluídas", value: tarefasConcluidas, icon: CheckCircle2, color: "#3b82f6", bg: "#3b82f620" },
    { label: "Projetos Ativos", value: projetosAtivos, icon: FolderKanban, color: "#8b5cf6", bg: "#8b5cf620" },
    { label: "Receitas", value: formatCurrency(receitas), icon: TrendingUp, color: "#22c55e", bg: "#22c55e20", isCurrency: true },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 mb-4" />
          <StatsSkeleton />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 h-full overflow-hidden">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bento-item p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: stat.bg }}
                >
                  <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.isCurrency ? stat.value : stat.value}
              </p>
              <p className="text-xs text-[var(--foreground)]/50">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          
          {/* Main Content - Charts */}
          <div className="lg:col-span-8 space-y-4 overflow-hidden">
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tarefas por Status */}
              <motion.div variants={sectionVariants} className="bento-item p-4">
                <h3 className="text-sm font-semibold mb-2">Tarefas por Status</h3>
                {tarefasPorStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={tarefasPorStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {tarefasPorStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'var(--surface)', 
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-sm text-[var(--foreground)]/50">
                    Sem dados
                  </div>
                )}
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {tarefasPorStatus.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Projetos por Status */}
              <motion.div variants={sectionVariants} className="bento-item p-4">
                <h3 className="text-sm font-semibold mb-2">Projetos</h3>
                {projetosPorStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={projetosPorStatus} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'var(--surface)', 
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {projetosPorStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-sm text-[var(--foreground)]/50">
                    Sem projetos
                  </div>
                )}
              </motion.div>
            </div>

            {/* Tarefas Recentes */}
            <motion.div variants={sectionVariants} className="bento-item p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-[var(--primary)]" />
                  Tarefas Recentes
                </h3>
                <a href="/tarefas" className="text-xs text-[var(--primary)] hover:underline">
                  Ver todas
                </a>
              </div>
              {tarefas.length === 0 ? (
                <div className="text-center py-4 text-sm text-[var(--foreground)]/50">
                  Nenhuma tarefa encontrada
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {tarefas.slice(0, 8).map((task) => (
                    <div 
                      key={task.id}
                      className="flex items-center justify-between rounded-lg bg-[var(--surface-hover)] p-3 hover:bg-[var(--surface-hover)]/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          task.status === 'ativa' ? 'bg-green-500' : 
                          task.status === 'concluida' ? 'bg-blue-500' : 'bg-yellow-500'
                        )} />
                        <div>
                          <p className="font-medium text-sm">{task.titulo}</p>
                          <p className="text-xs text-[var(--foreground)]/50">{task.prioridade}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        task.status === 'ativa' ? 'bg-green-500/10 text-green-500' :
                        task.status === 'concluida' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-yellow-500/10 text-yellow-500'
                      )}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar - 2 columns */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Resumo Financeiro */}
            <motion.div variants={sectionVariants} className="bento-item p-3">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-green-500" />
                Resumo Financeiro
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--foreground)]/70">Receitas</span>
                  <span className="text-sm font-medium text-green-500">{formatCurrency(receitas)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--foreground)]/70">Despesas</span>
                  <span className="text-sm font-medium text-red-500">{formatCurrency(despesas)}</span>
                </div>
                <div className="pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Saldo</span>
                    <span className={cn("text-sm font-bold", saldo >= 0 ? "text-green-500" : "text-red-500")}>
                      {formatCurrency(saldo)}
                    </span>
                  </div>
                </div>
              </div>
              <a href="/financeiro" className="block mt-2 text-center text-xs text-[var(--primary)] hover:underline">
                Ver detalhes
              </a>
            </motion.div>

            {/* Projetos Ativos */}
            <motion.div variants={sectionVariants} className="bento-item p-3">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-purple-500" />
                Projetos Ativos
              </h3>
              {projetosAtivos === 0 ? (
                <div className="text-center py-2 text-sm text-[var(--foreground)]/50">
                  Nenhum projeto ativo
                </div>
              ) : (
                <div className="space-y-2">
                  {projetos.filter(p => p.status === 'ativo').slice(0, 4).map((proj) => (
                    <div 
                      key={proj.id}
                      className="flex items-center justify-between rounded-lg bg-[var(--surface-hover)] p-2"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-2 w-2 rounded-full" 
                          style={{ backgroundColor: proj.cor || '#3b82f6' }}
                        />
                        <span className="text-sm truncate max-w-[100px]">{proj.nome}</span>
                      </div>
                      <span className="text-xs text-[var(--foreground)]/50">{proj.progresso || 0}%</span>
                    </div>
                  ))}
                </div>
              )}
              <a href="/projetos" className="block mt-2 text-center text-xs text-[var(--primary)] hover:underline">
                Ver todos
              </a>
            </motion.div>

            {/* Membros */}
            <motion.div variants={sectionVariants} className="bento-item p-3">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Equipe
              </h3>
              {usuarios.length === 0 ? (
                <div className="text-center py-2 text-sm text-[var(--foreground)]/50">
                  Nenhum membro
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {usuarios.slice(0, 4).map((user) => (
                    <div 
                      key={user.id}
                      className="flex items-center gap-1 rounded-full bg-[var(--surface-hover)] px-2 py-1"
                    >
                      <div className="h-5 w-5 rounded-full bg-[var(--primary)] flex items-center justify-center text-[10px] text-white">
                        {user.nome?.charAt(0) || '?'}
                      </div>
                      <span className="text-xs">{user.nome?.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

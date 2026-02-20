"use client"

import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Target,
  DollarSign,
  CreditCard,
  Users,
  Bot,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTarefas } from "@/hooks/useTarefas"
import { useUsuarios } from "@/hooks/useUsuarios"

const EMPRESA_ID = 1

const recentTasks = [
  { id: 1, title: "Setup API REST", status: "done", priority: "alta", responsavel: "Lucas" },
  { id: 2, title: "Criar schema DB", status: "done", priority: "alta", responsavel: "Ana" },
  { id: 3, title: "Implementar rotas", status: "in_progress", priority: "media", responsavel: "Carlos" },
  { id: 4, title: "Testar conexão", status: "todo", priority: "baixa", responsavel: "Maria" },
  { id: 5, title: "Revisar código", status: "in_progress", priority: "alta", responsavel: "Lucas" },
]

const meetings = [
  { id: 1, title: "Daily Standup", hora: "09:00", participantes: 4, tipo: "interna" },
  { id: 2, title: "Review Sprint", hora: "14:00", participantes: 6, tipo: "equipe" },
  { id: 3, title: "Planning", hora: "10:00", participantes: 5, tipo: "planejamento" },
]

const expenses = [
  { id: 1, descricao: "AWS Services", categoria: "Infraestrutura", valor: 1250.00, data: "18/02" },
  { id: 2, descricao: "Domain renewal", categoria: "Domínios", valor: 180.00, data: "17/02" },
  { id: 3, descricao: "Team lunch", categoria: "Misc", valor: 320.00, data: "16/02" },
]

const payments = [
  { id: 1, descricao: "Salary February", valor: 15000.00, data: "25/02", tipo: "saida" },
  { id: 2, descricao: "Client Invoice #42", valor: 8500.00, data: "20/02", tipo: "entrada" },
  { id: 3, descricao: "AWS bill", valor: 1250.00, data: "22/02", tipo: "saida" },
]

const agentActivity = [
  { agent: "Chief", action: "Analisando objetivos estratégicos", avatar: "CH", color: "#8b5cf6" },
  { agent: "Tech Lead", action: "Revisando código PR #45", avatar: "TL", color: "#3b82f6" },
  { agent: "Financeiro", action: "Processando relatórios", avatar: "FI", color: "#10b981" },
  { agent: "Gestão", action: "Atualizando métricas", avatar: "GE", color: "#f59e0b" },
]

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

function getStatusStyle(status: string) {
  switch (status) {
    case "done":
    case "concluida":
      return { bg: "bg-green-500/10", text: "text-green-500", icon: CheckCircle2 }
    case "in_progress":
    case "review":
      return { bg: "bg-yellow-500/10", text: "text-yellow-500", icon: Clock }
    default:
      return { bg: "bg-gray-500/10", text: "text-gray-500", icon: Clock }
  }
}

function getPriorityStyle(priority: string) {
  switch (priority) {
    case "alta":
      return "bg-red-500/10 text-red-500"
    case "media":
      return "bg-yellow-500/10 text-yellow-500"
    default:
      return "bg-green-500/10 text-green-500"
  }
}

export default function DashboardPage() {
  const { tarefas: apiTarefas, loading } = useTarefas({ empresaId: EMPRESA_ID })
  const { usuarios, getUsuarioById } = useUsuarios({ empresaId: EMPRESA_ID })

  const tarefasAtivas = apiTarefas.filter(t => t.status === "ativa").length
  const tarefasConcluidas = apiTarefas.filter(t => t.status === "concluida").length
  const tarefasPausadas = apiTarefas.filter(t => t.status === "pausada").length
  
  const tarefasOrdenadas = [...apiTarefas]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  function getUsuarioNome(id: string) {
    const usuario = getUsuarioById(id)
    return usuario?.nome || `User ${id?.substring(0, 8) || 'Unknown'}`
  }

  const stats = [
    { label: "Tarefas Ativas", value: tarefasAtivas, icon: Activity, color: "var(--success)", trend: "+5%" },
    { label: "Concluídas", value: tarefasConcluidas, icon: CheckCircle2, color: "var(--primary)", trend: "+12%" },
    { label: "Pausadas", value: tarefasPausadas, icon: Clock, color: "var(--warning)", trend: "-3%" },
    { label: "Total", value: apiTarefas.length, icon: Target, color: "var(--accent)", trend: null },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-4">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
                {stat.trend && (
                  <span className={cn(
                    "text-xs font-medium",
                    stat.trend.startsWith("+") ? "text-green-500" : "text-red-500"
                  )}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold">{loading ? "-" : stat.value}</p>
              <p className="text-xs text-[var(--foreground)]/50">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-12">
          
          {/* Main Content - Left */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Últimas Tarefas */}
            <motion.div variants={sectionVariants} className="bento-item">
              <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-[var(--primary)]" />
                Últimas Tarefas
              </h2>
              <a href="/tarefas" className="text-sm text-[var(--primary)] hover:underline">
                Ver todas
              </a>
            </div>
            
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4 text-sm text-[var(--foreground)]/50">Carregando...</div>
              ) : tarefasOrdenadas.length === 0 ? (
                <div className="text-center py-4 text-sm text-[var(--foreground)]/50">Nenhuma tarefa encontrada</div>
              ) : (
                tarefasOrdenadas.map((task, i) => {
                  const statusStyle = getStatusStyle(task.coluna)
                  const StatusIcon = statusStyle.icon
                  const responsavelNome = task.responsaveis?.[0] ? getUsuarioNome(task.responsaveis[0]) : "Sem responsável"
                  
                  return (
                    <motion.div 
                      key={task.id}
                      className="flex items-center justify-between rounded-xl bg-[var(--surface-hover)] p-3 hover:bg-[var(--surface-hover)]/80 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-1.5 rounded-lg", statusStyle.bg)}>
                          <StatusIcon className={cn("h-3.5 w-3.5", statusStyle.text)} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{task.titulo}</p>
                          <p className="text-xs text-[var(--foreground)]/50">{responsavelNome}</p>
                        </div>
                      </div>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getPriorityStyle(task.prioridade))}>
                        {task.prioridade}
                      </span>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Próximas Reuniões */}
            <motion.div variants={sectionVariants} className="bento-item">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[var(--accent)]" />
                  Reuniões
                </h2>
              </div>
              
              <div className="space-y-2">
                {meetings.map((meeting, i) => (
                  <motion.div 
                    key={meeting.id}
                    className="flex items-center justify-between rounded-lg bg-[var(--surface-hover)] p-2.5"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-[var(--primary)]">{meeting.hora}</div>
                      <div>
                        <p className="text-sm font-medium">{meeting.title}</p>
                        <p className="text-xs text-[var(--foreground)]/50">{meeting.participantes} participantes</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Gastos Recentes */}
            <motion.div variants={sectionVariants} className="bento-item">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[var(--error)]" />
                  Gastos
                </h2>
                <span className="text-xs text-[var(--error)] flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +12%
                </span>
              </div>
              
              <div className="space-y-2">
                {expenses.map((expense, i) => (
                  <motion.div 
                    key={expense.id}
                    className="flex items-center justify-between rounded-lg bg-[var(--surface-hover)] p-2.5"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div>
                      <p className="text-sm font-medium">{expense.descricao}</p>
                      <p className="text-xs text-[var(--foreground)]/50">{expense.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--error)]">
                        R$ {expense.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-[var(--foreground)]/50">{expense.data}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Pagamentos */}
          <motion.div variants={sectionVariants} className="bento-item">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[var(--success)]" />
                Pagamentos
              </h2>
              <a href="/financeiro" className="text-sm text-[var(--primary)] hover:underline">
                Ver financeiro
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {payments.map((payment, i) => (
                <motion.div 
                  key={payment.id}
                  className="rounded-xl bg-[var(--surface-hover)] p-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      payment.tipo === "entrada" 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-red-500/10 text-red-500"
                    )}>
                      {payment.tipo === "entrada" ? "Entrada" : "Saída"}
                    </span>
                    <span className="text-xs text-[var(--foreground)]/50">{payment.data}</span>
                  </div>
                  <p className="text-sm font-medium mb-1">{payment.descricao}</p>
                  <p className={cn(
                    "text-lg font-bold",
                    payment.tipo === "entrada" ? "text-[var(--success)]" : "text-[var(--error)]"
                  )}>
                    {payment.tipo === "entrada" ? "+" : "-"} R$ {payment.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Right */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Agentes */}
          <motion.div variants={sectionVariants} className="bento-item">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bot className="h-5 w-5 text-[var(--primary)]" />
                Agentes
              </h2>
              <span className="text-xs text-[var(--foreground)]/50">IA Active</span>
            </div>
            
            <div className="space-y-3">
              {agentActivity.map((agent, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div 
                    className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{agent.agent}</p>
                    <p className="text-xs text-[var(--foreground)]/50 truncate">{agent.action}</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={sectionVariants} className="bento-item">
            <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                className="flex flex-col items-center gap-2 rounded-xl bg-[var(--primary)]/10 p-4 transition-all hover:bg-[var(--primary)]/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium">Nova Tarefa</span>
              </motion.button>
              
              <motion.button
                className="flex flex-col items-center gap-2 rounded-xl bg-[var(--accent)]/10 p-4 transition-all hover:bg-[var(--accent)]/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium">Agendar</span>
              </motion.button>
              
              <motion.button
                className="flex flex-col items-center gap-2 rounded-xl bg-[var(--success)]/10 p-4 transition-all hover:bg-[var(--success)]/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--success)]">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium">Despesa</span>
              </motion.button>
              
              <motion.button
                className="flex flex-col items-center gap-2 rounded-xl bg-[var(--warning)]/10 p-4 transition-all hover:bg-[var(--warning)]/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--warning)]">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium">Contrato</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}

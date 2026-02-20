"use client"

import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Activity,
  Calendar,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTarefas } from "@/hooks/useTarefas"
import { useUsuarios } from "@/hooks/useUsuarios"

const EMPRESA_ID = 1

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
          <div className="grid grid-cols-1 gap-4">
            {/* Próximas Reuniões */}
            <motion.div variants={sectionVariants} className="bento-item">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[var(--accent)]" />
                  Reuniões
                </h2>
              </div>
              <div className="text-center py-8 text-sm text-[var(--foreground)]/50">
                Nenhuma reunião agendada
              </div>
            </motion.div>

            {/* Gastos Recentes */}
            <motion.div variants={sectionVariants} className="bento-item">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[var(--error)]" />
                  Gastos
                </h2>
              </div>
              <div className="text-center py-8 text-sm text-[var(--foreground)]/50">
                Nenhum gasto registrado
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}

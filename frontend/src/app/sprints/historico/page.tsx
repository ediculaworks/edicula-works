"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useSprints } from "@/hooks/useSprints"
import { useTarefas } from "@/hooks/useTarefas"
import { useUsuarios } from "@/hooks/useUsuarios"
import { api } from "@/lib/api"
import type { Sprint, Tarefa } from "@/types"
import { 
  ArrowLeft,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const EMPRESA_ID = 1

interface SprintEstatisticas {
  sprint: Sprint
  totalTarefas: number
  tarefasConcluidas: number
  tarefasAndamento: number
  tarefasAguardando: number
  tarefasAbandonadas: number
  taxaConclusao: number
  pontosPlanejados: number
  pontosConcluidos: number
  tarefasPorUsuario: Record<string, { total: number; concluidas: number }>
}

export default function SprintsHistoricoPage() {
  const router = useRouter()
  const { sprints, loading } = useSprints({ empresaId: EMPRESA_ID, status: "concluida" })
  const { usuarios } = useUsuarios({ empresaId: EMPRESA_ID })
  const [sprintSelecionada, setSprintSelecionada] = useState<SprintEstatisticas | null>(null)
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loadingTarefas, setLoadingTarefas] = useState(false)

  const estatisticasSprints = useMemo(() => {
    return sprints.map(sprint => ({
      sprint,
      totalTarefas: 0,
      tarefasConcluidas: 0,
      tarefasAndamento: 0,
      tarefasAguardando: 0,
      tarefasAbandonadas: 0,
      taxaConclusao: 0,
      pontosPlanejados: sprint.meta_pontos || 0,
      pontosConcluidos: sprint.pontos_concluidos || 0,
      tarefasPorUsuario: {} as Record<string, { total: number; concluidas: number }>,
    }))
  }, [sprints])

  const carregarTarefasSprint = async (sprint: Sprint) => {
    setLoadingTarefas(true)
    try {
      const data = await api.getTarefas({ empresa_id: EMPRESA_ID, sprint_id: sprint.id })
      setTarefas(data)

      const tarefasConcluidas = data.filter(t => t.coluna === "done").length
      const tarefasAndamento = data.filter(t => t.coluna === "in_progress").length
      const tarefasAguardando = data.filter(t => t.coluna === "todo").length
      const tarefasAbandonadas = data.filter(t => t.status === "abandonada").length

      const tarefasPorUsuario: Record<string, { total: number; concluidas: number }> = {}
      data.forEach(tarefa => {
        tarefa.responsaveis?.forEach(respId => {
          if (!tarefasPorUsuario[respId]) {
            tarefasPorUsuario[respId] = { total: 0, concluidas: 0 }
          }
          tarefasPorUsuario[respId].total++
          if (tarefa.coluna === "done") {
            tarefasPorUsuario[respId].concluidas++
          }
        })
      })

      setSprintSelecionada({
        sprint,
        totalTarefas: data.length,
        tarefasConcluidas,
        tarefasAndamento,
        tarefasAguardando,
        tarefasAbandonadas,
        taxaConclusao: data.length > 0 ? Math.round((tarefasConcluidas / data.length) * 100) : 0,
        pontosPlanejados: sprint.meta_pontos || 0,
        pontosConcluidos: sprint.pontos_concluidos || 0,
        tarefasPorUsuario,
      })
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err)
    } finally {
      setLoadingTarefas(false)
    }
  }

  const getUsuarioNome = (id: string) => {
    return usuarios.find(u => u.id === id)?.nome || "Desconhecido"
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/sprints">
            <button className="p-2 rounded-lg hover:bg-[var(--surface-hover)]">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Histórico de Sprints</h1>
            <p className="text-[var(--foreground)]/60">Visualize o desempenho das sprints concluídas</p>
          </div>
        </div>

        {sprintSelecionada ? (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sprintSelecionada.totalTarefas}</p>
                    <p className="text-sm text-[var(--foreground)]/60">Total de Tarefas</p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sprintSelecionada.taxaConclusao}%</p>
                    <p className="text-sm text-[var(--foreground)]/60">Taxa de Conclusão</p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Target className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sprintSelecionada.pontosConcluidos}/{sprintSelecionada.pontosPlanejados}</p>
                    <p className="text-sm text-[var(--foreground)]/60">Pontos</p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sprintSelecionada.tarefasAndamento}</p>
                    <p className="text-sm text-[var(--foreground)]/60">Em Andamento</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks by Status */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Tarefas por Status</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 rounded-lg bg-gray-500/10">
                  <p className="text-3xl font-bold text-gray-500">{sprintSelecionada.tarefasAguardando}</p>
                  <p className="text-sm text-gray-500">A Fazer</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-500/10">
                  <p className="text-3xl font-bold text-blue-500">{sprintSelecionada.tarefasAndamento}</p>
                  <p className="text-sm text-blue-500">Em Andamento</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/10">
                  <p className="text-3xl font-bold text-green-500">{sprintSelecionada.tarefasConcluidas}</p>
                  <p className="text-sm text-green-500">Concluídas</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-500/10">
                  <p className="text-3xl font-bold text-red-500">{sprintSelecionada.tarefasAbandonadas}</p>
                  <p className="text-sm text-red-500">Abandonadas</p>
                </div>
              </div>
            </div>

            {/* Productivity by User */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Produtividade por Usuário</h3>
              {Object.keys(sprintSelecionada.tarefasPorUsuario).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(sprintSelecionada.tarefasPorUsuario).map(([usuarioId, stats]) => (
                    <div key={usuarioId} className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-hover)]">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                          <Users className="h-4 w-4 text-[var(--primary)]" />
                        </div>
                        <span className="font-medium">{getUsuarioNome(usuarioId)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-[var(--foreground)]/60">
                          {stats.concluidas}/{stats.total} tarefas
                        </span>
                        <div className="w-32 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${stats.total > 0 ? (stats.concluidas / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--foreground)]/60 text-center py-4">
                  Nenhuma tarefa com responsáveis cadastrados
                </p>
              )}
            </div>

            {/* Back button */}
            <button
              onClick={() => setSprintSelecionada(null)}
              className="text-[var(--primary)] hover:underline"
            >
              ← Voltar para lista de sprints
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {estatisticasSprints.map((item) => (
              <button
                key={item.sprint.id}
                onClick={() => carregarTarefasSprint(item.sprint)}
                disabled={loadingTarefas}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 text-left hover:border-[var(--primary)]/50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{item.sprint.nome}</h4>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-500">
                    Concluída
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-[var(--foreground)]/60 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(item.sprint.data_inicio).toLocaleDateString("pt-BR")} - {new Date(item.sprint.data_fim).toLocaleDateString("pt-BR")}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-lg font-bold">{item.sprint.pontos_concluidos || 0}</p>
                    <p className="text-xs text-[var(--foreground)]/60">pts concluídos</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{item.sprint.meta_pontos || 0}</p>
                    <p className="text-xs text-[var(--foreground)]/60">pts meta</p>
                  </div>
                </div>
              </button>
            ))}

            {estatisticasSprints.length === 0 && (
              <div className="col-span-full text-center py-8 text-[var(--foreground)]/60">
                Nenhuma sprint concluída ainda
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

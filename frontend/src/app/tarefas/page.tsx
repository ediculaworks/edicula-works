"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { formatDate } from "@/lib/date-utils"
import type { Tarefa, Prioridade, StatusTarefa, Grupo, Sprint, Projeto } from "@/types"
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Flag,
  Clock,
  Users,
  Eye,
  MoreVertical,
  Play,
  Pause,
  XCircle,
  Ban,
  CheckCircle,
  ChevronRight,
  X,
} from "lucide-react"

const prioridades: { id: Prioridade; cor: string; label: string }[] = [
  { id: "urgente", cor: "#ef4444", label: "Urgente" },
  { id: "alta", cor: "#f97316", label: "Alta" },
  { id: "media", cor: "#eab308", label: "Média" },
  { id: "baixa", cor: "#22c55e", label: "Baixa" },
]

const statusTarefas: { id: StatusTarefa; cor: string; label: string }[] = [
  { id: "ativa", cor: "#22c55e", label: "Ativa" },
  { id: "pausada", cor: "#f59e0b", label: "Pausada" },
  { id: "suspensa", cor: "#8b5cf6", label: "Suspensa" },
  { id: "abandonada", cor: "#ef4444", label: "Abandonada" },
  { id: "concluida", cor: "#6b7280", label: "Concluída" },
]

function getPrioridadeConfig(p: Prioridade) {
  return prioridades.find((pr) => pr.id === p) || prioridades[2]
}

function getStatusConfig(s: StatusTarefa) {
  return statusTarefas.find((st) => st.id === s) || statusTarefas[0]
}

interface Filtros {
  projeto_id?: number
  responsavel?: number
  grupo_id?: number
  sprint_id?: number
  prioridade?: Prioridade
  status?: StatusTarefa
  busca?: string
}

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<Filtros>({})
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [filtros])

  async function loadData() {
    setLoading(true)
    try {
      const [tarefasData, gruposData, sprintsData] = await Promise.all([
        api.getTarefas({ empresa_id: 1, ...filtros }),
        api.getGrupos(1),
        api.getSprints({ empresa_id: 1 }),
      ])
      setTarefas(tarefasData)
      setGrupos(gruposData)
      setSprints(sprintsData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleMudarStatus(tarefaId: number, novoStatus: StatusTarefa, motivo?: string) {
    try {
      let tarefaAtualizada: Tarefa
      switch (novoStatus) {
        case "ativa":
          tarefaAtualizada = await api.iniciarTarefa(tarefaId)
          break
        case "pausada":
          tarefaAtualizada = await api.pausarTarefa(tarefaId, motivo)
          break
        case "abandonada":
          tarefaAtualizada = await api.abandonarTarefa(tarefaId, motivo)
          break
        case "suspensa":
          tarefaAtualizada = await api.suspenderTarefa(tarefaId, motivo)
          break
        case "concluida":
          tarefaAtualizada = await api.finalizarTarefa(tarefaId)
          break
        default:
          return
      }
      setTarefas((prev) => prev.map((t) => (t.id === tarefaId ? tarefaAtualizada : t)))
      if (tarefaSelecionada?.id === tarefaId) {
        setTarefaSelecionada(tarefaAtualizada)
      }
    } catch (error) {
      console.error("Erro ao mudar status:", error)
    }
  }

  function openTarefaDetail(tarefa: Tarefa) {
    setTarefaSelecionada(tarefa)
    setShowModal(true)
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-7rem)] flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Tarefas</h1>
            <p className="text-[var(--foreground)]/60">Gerencie suas tarefas</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {/* Filtros */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/40" />
            <Input
              placeholder="Buscar tarefas..."
              className="pl-9"
              value={filtros.busca || ""}
              onChange={(e) => setFiltros((prev) => ({ ...prev, busca: e.target.value }))}
            />
          </div>

          <select
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={filtros.projeto_id || ""}
            onChange={(e) => setFiltros((prev) => ({ ...prev, projeto_id: e.target.value ? Number(e.target.value) : undefined }))}
          >
            <option value="">Todos os Projetos</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>

          <select
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={filtros.grupo_id || ""}
            onChange={(e) => setFiltros((prev) => ({ ...prev, grupo_id: e.target.value ? Number(e.target.value) : undefined }))}
          >
            <option value="">Todos os Grupos</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>{g.nome}</option>
            ))}
          </select>

          <select
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={filtros.sprint_id || ""}
            onChange={(e) => setFiltros((prev) => ({ ...prev, sprint_id: e.target.value ? Number(e.target.value) : undefined }))}
          >
            <option value="">Todas as Sprints</option>
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>

          <select
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={filtros.prioridade || ""}
            onChange={(e) => setFiltros((prev) => ({ ...prev, prioridade: e.target.value as Prioridade || undefined }))}
          >
            <option value="">Todas as Prioridades</option>
            {prioridades.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>

          <select
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={filtros.status || ""}
            onChange={(e) => setFiltros((prev) => ({ ...prev, status: e.target.value as StatusTarefa || undefined }))}
          >
            <option value="">Todos os Status</option>
            {statusTarefas.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Lista de Tarefas */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            </div>
          ) : tarefas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[var(--foreground)]/60">
              <p>Nenhuma tarefa encontrada</p>
              <Button variant="link" className="mt-2">
                Criar primeira tarefa
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {tarefas.map((tarefa) => {
                const prioridade = getPrioridadeConfig(tarefa.prioridade)
                const status = getStatusConfig(tarefa.status)
                const grupo = grupos.find((g) => g.id === tarefa.grupo_id)
                const sprint = sprints.find((s) => s.id === tarefa.sprint_id)

                return (
                  <Card
                    key={tarefa.id}
                    className="cursor-pointer p-4 transition-colors hover:bg-[var(--surface-hover)]"
                    onClick={() => openTarefaDetail(tarefa)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {/* Status badge */}
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: status.cor + "20", color: status.cor }}
                          >
                            {status.label}
                          </span>
                          
                          {/* Prioridade */}
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: prioridade.cor }}
                          >
                            <Flag className="h-3 w-3" />
                            {prioridade.label}
                          </span>

                          {/* Grupo */}
                          {grupo && (
                            <span
                              className="rounded-full px-2 py-0.5 text-xs"
                              style={{ backgroundColor: grupo.cor + "20", color: grupo.cor }}
                            >
                              {grupo.nome}
                            </span>
                          )}

                          {/* Sprint */}
                          {sprint && (
                            <span className="rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-xs">
                              {sprint.nome}
                            </span>
                          )}
                        </div>

                        <h3 className="font-medium truncate">{tarefa.titulo}</h3>
                        
                        {tarefa.descricao && (
                          <p className="mt-1 text-sm text-[var(--foreground)]/60 line-clamp-2">
                            {tarefa.descricao}
                          </p>
                        )}

                        <div className="mt-2 flex items-center gap-4 text-xs text-[var(--foreground)]/60">
                          {/* Prazo */}
                          {tarefa.prazo && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(tarefa.prazo)}
                            </span>
                          )}

                          {/* Previsão */}
                          {tarefa.previsao_entrega && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Previsão: {formatDate(tarefa.previsao_entrega)}
                            </span>
                          )}

                          {/* Estimativa */}
                          {tarefa.estimativa_horas_prevista && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {tarefa.estimativa_horas_prevista}h
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-[var(--foreground)]/40 shrink-0" />
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showModal && tarefaSelecionada && (
        <TarefaModal
          tarefa={tarefaSelecionada}
          onClose={() => setShowModal(false)}
          onStatusChange={handleMudarStatus}
          grupos={grupos}
          sprints={sprints}
        />
      )}
    </DashboardLayout>
  )
}

interface TarefaModalProps {
  tarefa: Tarefa
  onClose: () => void
  onStatusChange: (id: number, status: StatusTarefa, motivo?: string) => void
  grupos: Grupo[]
  sprints: Sprint[]
}

function TarefaModal({ tarefa, onClose, onStatusChange, grupos, sprints }: TarefaModalProps) {
  const [motivo, setMotivo] = useState("")
  const [showMotivoInput, setShowMotivoInput] = useState<StatusTarefa | null>(null)
  const prioridade = getPrioridadeConfig(tarefa.prioridade)
  const status = getStatusConfig(tarefa.status)
  const grupo = grupos.find((g) => g.id === tarefa.grupo_id)
  const sprint = sprints.find((s) => s.id === tarefa.sprint_id)

  function handleStatusClick(novoStatus: StatusTarefa) {
    if (novoStatus === "pausada" || novoStatus === "abandonada" || novoStatus === "suspensa") {
      setShowMotivoInput(novoStatus)
    } else {
      onStatusChange(tarefa.id, novoStatus)
    }
  }

  function confirmarComMotivo(novoStatus: StatusTarefa) {
    onStatusChange(tarefa.id, novoStatus, motivo)
    setShowMotivoInput(null)
    setMotivo("")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-[var(--surface)] p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: status.cor + "20", color: status.cor }}
              >
                {status.label}
              </span>
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: prioridade.cor }}
              >
                <Flag className="h-3 w-3" />
                {prioridade.label}
              </span>
            </div>
            <h2 className="text-xl font-semibold">{tarefa.titulo}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Descrição */}
        {tarefa.descricao && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-[var(--foreground)]/60">Descrição</h3>
            <p className="text-sm">{tarefa.descricao}</p>
          </div>
        )}

        {/* Grid de informações */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          {/* Grupo */}
          <div>
            <h3 className="mb-1 text-xs font-medium text-[var(--foreground)]/60">Grupo</h3>
            {grupo ? (
              <span
                className="rounded-full px-2 py-1 text-sm"
                style={{ backgroundColor: grupo.cor + "20", color: grupo.cor }}
              >
                {grupo.nome}
              </span>
            ) : (
              <span className="text-sm text-[var(--foreground)]/40">Sem grupo</span>
            )}
          </div>

          {/* Sprint */}
          <div>
            <h3 className="mb-1 text-xs font-medium text-[var(--foreground)]/60">Sprint</h3>
            {sprint ? (
              <span className="text-sm">{sprint.nome}</span>
            ) : (
              <span className="text-sm text-[var(--foreground)]/40">Sem sprint</span>
            )}
          </div>

          {/* Prazo */}
          <div>
            <h3 className="mb-1 text-xs font-medium text-[var(--foreground)]/60">Prazo</h3>
            <span className="flex items-center gap-1 text-sm">
              <Calendar className="h-4 w-4" />
              {tarefa.prazo ? formatDate(tarefa.prazo) : "Sem prazo"}
            </span>
          </div>

          {/* Previsão de Entrega */}
          <div>
            <h3 className="mb-1 text-xs font-medium text-[var(--foreground)]/60">Previsão de Entrega</h3>
            <span className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4" />
              {tarefa.previsao_entrega ? formatDate(tarefa.previsao_entrega) : "Sem previsão"}
              {tarefa.estimativa_horas_prevista && ` (${tarefa.estimativa_horas_prevista}h)`}
            </span>
          </div>

          {/* Data de Início */}
          {tarefa.data_inicio && (
            <div>
              <h3 className="mb-1 text-xs font-medium text-[var(--foreground)]/60">Data de Início</h3>
              <span className="text-sm">{formatDate(tarefa.data_inicio)}</span>
            </div>
          )}

          {/* Data de Conclusão */}
          {tarefa.data_conclusao && (
            <div>
              <h3 className="mb-1 text-xs font-medium text-[var(--foreground)]/60">Data de Conclusão</h3>
              <span className="text-sm">{formatDate(tarefa.data_conclusao)}</span>
            </div>
          )}
        </div>

        {/* Motivo (se aplicável) */}
        {(tarefa.motivo_pausa || tarefa.motivo_suspensao || tarefa.motivo_abandono) && (
          <div className="mb-4 rounded-lg bg-[var(--surface-hover)] p-3">
            <h3 className="mb-1 text-xs font-medium text-[var(--foreground)]/60">Motivo</h3>
            <p className="text-sm">
              {tarefa.motivo_pausa || tarefa.motivo_suspensao || tarefa.motivo_abandono}
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="border-t pt-4">
          <h3 className="mb-3 text-sm font-medium">Ações</h3>
          <div className="flex flex-wrap gap-2">
            {tarefa.status !== "ativa" && (
              <Button size="sm" onClick={() => handleStatusClick("ativa")}>
                <Play className="mr-1 h-4 w-4" />
                Iniciar
              </Button>
            )}
            {tarefa.status === "ativa" && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleStatusClick("pausada")}>
                  <Pause className="mr-1 h-4 w-4" />
                  Pausar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleStatusClick("suspensa")}>
                  <Ban className="mr-1 h-4 w-4" />
                  Suspender
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleStatusClick("abandonada")}>
                  <XCircle className="mr-1 h-4 w-4" />
                  Abandonar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleStatusClick("concluida")}>
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Finalizar
                </Button>
              </>
            )}
          </div>

          {/* Input de motivo */}
          {showMotivoInput && (
            <div className="mt-3">
              <Input
                placeholder={`Motivo da ${showMotivoInput === "pausada" ? "pausa" : showMotivoInput === "suspensa" ? "suspensão" : "abandono"}...`}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setShowMotivoInput(null)}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={() => confirmarComMotivo(showMotivoInput)}>
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

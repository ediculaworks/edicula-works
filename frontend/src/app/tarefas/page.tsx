"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Tarefa, Prioridade, StatusTarefa, ColunaKanban, Usuario, Grupo, Sprint, Tag as TagType } from "@/types"
import { 
  Plus, 
  Calendar, 
  Flag, 
  Clock, 
  GripVertical,
  X,
  Tag,
  Edit,
  Trash2,
  Move,
  Download,
  UserPlus,
  Users,
  Play,
  MoreHorizontal,
  SlidersHorizontal,
  Filter,
  CheckCircle,
  Pause,
  ChevronRight,
  ChevronLeft,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTarefas } from "@/hooks/useTarefas"
import { useUsuarios } from "@/hooks/useUsuarios"
import { useTags } from "@/hooks/useTags"
import { useGrupos } from "@/hooks/useGrupos"
import { useSprints } from "@/hooks/useSprints"

const EMPRESA_ID = 1

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

const ITEMS_PER_PAGE = 15

function getPrioridadeConfig(p: Prioridade) {
  return prioridades.find((pr) => pr.id === p) || prioridades[2]
}

function getStatusConfig(s: StatusTarefa) {
  return statusTarefas.find((st) => st.id === s) || statusTarefas[0]
}

const colunas: { id: ColunaKanban; titulo: string; cor: string }[] = [
  { id: "todo", titulo: "A Fazer", cor: "#6b7280" },
  { id: "in_progress", titulo: "Em Andamento", cor: "#3b82f6" },
  { id: "review", titulo: "Em Revisão", cor: "#f59e0b" },
  { id: "done", titulo: "Concluída", cor: "#22c55e" },
]

interface Filtros {
  prioridade?: Prioridade
  status?: StatusTarefa
  sprintId?: number
  membroId?: number
}

interface ContextMenuProps {
  x: number
  y: number
  tarefa: Tarefa
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onMove: (coluna: ColunaKanban) => void
  onExport: () => void
  onAssign: () => void
  onStart: () => void
  onPause: () => void
  onFinish: () => void
  onAbandon: () => void
}

function ContextMenu({ x, y, tarefa, onClose, onEdit, onDelete, onMove, onExport, onAssign, onStart, onPause, onFinish, onAbandon }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const isAtiva = tarefa.status === "ativa"
  const isPausada = tarefa.status === "pausada"
  const isSuspensa = tarefa.status === "suspensa"
  const isAbandonada = tarefa.status === "abandonada"

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md p-1 shadow-2xl"
      style={{ top: y, left: x }}
    >
      <button
        onClick={() => { onEdit(); onClose() }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-hover)]"
      >
        <Edit className="h-4 w-4" />
        Editar tarefa
      </button>
      <button
        onClick={() => { onDelete(); onClose() }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--surface-hover)]"
      >
        <Trash2 className="h-4 w-4" />
        Excluir
      </button>
      <div className="my-1 border-t border-[var(--border)]" />
      <div className="relative group">
        <button className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-hover)]">
          <span className="flex items-center gap-2"><Move className="h-4 w-4" /> Mover para →</span>
        </button>
        <div className="absolute left-full top-0 ml-1 hidden group-hover:block">
          <div className="min-w-[160px] rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md p-1 shadow-xl">
            {colunas.filter(c => c.id !== tarefa.coluna).map(coluna => (
              <button
                key={coluna.id}
                onClick={() => { onMove(coluna.id); onClose() }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-hover)]"
              >
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: coluna.cor }} />
                {coluna.titulo}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={() => { onExport(); onClose() }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-hover)]"
      >
        <Download className="h-4 w-4" />
        Exportar
      </button>
      <div className="my-1 border-t border-[var(--border)]" />
      <button
        onClick={() => { onAssign(); onClose() }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-hover)]"
      >
        <UserPlus className="h-4 w-4" />
        Assinalar tarefa
      </button>
      
      {isAtiva && (
        <>
          <div className="my-1 border-t border-[var(--border)]" />
          <button
            onClick={() => { onPause(); onClose() }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-hover)]"
          >
            <span className="text-yellow-500">⏸</span>
            Pausar tarefa
          </button>
          <button
            onClick={() => { onFinish(); onClose() }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-hover)]"
          >
            <span className="text-green-500">✓</span>
            Finalizar tarefa
          </button>
          <button
            onClick={() => { onAbandon(); onClose() }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--surface-hover)]"
          >
            <span>✕</span>
            Abandonar tarefa
          </button>
        </>
      )}
      
      {(isPausada || isSuspensa || isAbandonada) && (
        <>
          <div className="my-1 border-t border-[var(--border)]" />
          <button
            onClick={() => { onStart(); onClose() }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-hover)]"
          >
            <Play className="h-4 w-4" />
            Iniciar tarefa
          </button>
        </>
      )}
    </div>
  )
}

export default function TarefasPage() {
  const { tarefas: apiTarefas, loading, error, refetch, createTarefa, updateTarefa, deleteTarefa, iniciarTarefa, pausarTarefa, finalizarTarefa, abandonarTarefa } = useTarefas({ empresaId: EMPRESA_ID })
  const { usuarios, getUsuarioById } = useUsuarios({ empresaId: EMPRESA_ID })
  const { tags, getTagById } = useTags({ empresaId: EMPRESA_ID })
  const { grupos, getGrupoById } = useGrupos({ empresaId: EMPRESA_ID })
  const { sprints } = useSprints({ empresaId: EMPRESA_ID })
  
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [isApiConnected, setIsApiConnected] = useState(false)
  const [filtros, setFiltros] = useState<Filtros>({})
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [openInEditMode, setOpenInEditMode] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tarefa: Tarefa } | null>(null)

  useEffect(() => {
    if (!loading) {
      if (apiTarefas.length > 0) {
        setTarefas(apiTarefas)
        setIsApiConnected(true)
      } else {
        setTarefas([])
        setIsApiConnected(false)
      }
    }
  }, [apiTarefas, loading])

  const handleRefetch = async () => {
    if (isApiConnected) {
      await refetch()
    }
  }

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtros.prioridade && tarefa.prioridade !== filtros.prioridade) {
      return false
    }
    if (filtros.status && tarefa.status !== filtros.status) {
      return false
    }
    if (filtros.sprintId && tarefa.sprint_id !== filtros.sprintId) {
      return false
    }
    if (filtros.membroId) {
      const isResponsavel = tarefa.responsaveis?.includes(filtros.membroId)
      if (!isResponsavel) {
        return false
      }
    }
    return true
  })

  const totalPages = Math.ceil(tarefasFiltradas.length / ITEMS_PER_PAGE)
  const paginatedTarefas = tarefasFiltradas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const startItem = (page - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(page * ITEMS_PER_PAGE, tarefasFiltradas.length)

  const openTarefaDetail = (tarefa: Tarefa) => {
    setTarefaSelecionada(tarefa)
    setOpenInEditMode(false)
  }

  const openTarefaInEditMode = (tarefa: Tarefa) => {
    setTarefaSelecionada(tarefa)
    setOpenInEditMode(true)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, tarefa: Tarefa) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, tarefa })
  }

  const handleDeleteTask = (tarefa: Tarefa) => {
    setTarefas(prev => prev.filter(t => t.id !== tarefa.id))
    setContextMenu(null)
  }

  const handleMoveTask = (tarefa: Tarefa, coluna: ColunaKanban) => {
    setTarefas(prev => prev.map(t => 
      t.id === tarefa.id ? { ...t, coluna } : t
    ))
    setContextMenu(null)
  }

  const handleExportTask = (tarefa: Tarefa) => {
    const data = JSON.stringify(tarefa, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tarefa-${tarefa.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    setContextMenu(null)
  }

  const handleStartTask = (tarefa: Tarefa) => {
    setTarefas(prev => prev.map(t => 
      t.id === tarefa.id ? { ...t, status: "ativa" } : t
    ))
    setContextMenu(null)
  }

  const handlePauseTask = (tarefa: Tarefa) => {
    setTarefas(prev => prev.map(t => 
      t.id === tarefa.id ? { ...t, status: "pausada" } : t
    ))
    setContextMenu(null)
  }

  const handleFinishTask = (tarefa: Tarefa) => {
    setTarefas(prev => prev.map(t => 
      t.id === tarefa.id ? { ...t, status: "concluida", coluna: "done" } : t
    ))
    setContextMenu(null)
  }

  const handleAbandonTask = (tarefa: Tarefa) => {
    setTarefas(prev => prev.map(t => 
      t.id === tarefa.id ? { ...t, status: "abandonada" } : t
    ))
    setContextMenu(null)
  }

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col">
        {/* Filters */}
        <div className="mb-4 flex gap-3 shrink-0">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "glow-button" : ""}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filtros
          </Button>

          <Button className="glow-button" onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shrink-0"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="flex flex-wrap gap-3">
                <select
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-2 text-sm"
                  value={filtros.prioridade || ""}
                  onChange={(e) => {
                    setFiltros((prev) => ({ 
                      ...prev, 
                      prioridade: e.target.value as Prioridade || undefined 
                    }))
                    setPage(1)
                  }}
                >
                  <option value="">Prioridade</option>
                  {prioridades.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>

                <select
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-2 text-sm"
                  value={filtros.status || ""}
                  onChange={(e) => {
                    setFiltros((prev) => ({ 
                      ...prev, 
                      status: e.target.value as StatusTarefa || undefined 
                    }))
                    setPage(1)
                  }}
                >
                  <option value="">Status</option>
                  {statusTarefas.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>

                <select
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-2 text-sm"
                  value={filtros.sprintId ?? ""}
                  onChange={(e) => {
                    setFiltros((prev) => ({ 
                      ...prev, 
                      sprintId: e.target.value ? Number(e.target.value) : undefined 
                    }))
                    setPage(1)
                  }}
                >
                  <option value="">Sprint</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>

                <select
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-2 text-sm"
                  value={filtros.membroId ?? ""}
                  onChange={(e) => {
                    setFiltros((prev) => ({ 
                      ...prev, 
                      membroId: e.target.value ? Number(e.target.value) : undefined 
                    }))
                    setPage(1)
                  }}
                >
                  <option value="">Membro</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>

                {(filtros.prioridade || filtros.status || filtros.sprintId || filtros.membroId) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFiltros({})
                      setPage(1)
                    }}
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de Tarefas */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-4">
          <div className="space-y-3">
            {paginatedTarefas.map((tarefa, index) => {
              const prioridade = getPrioridadeConfig(tarefa.prioridade)
              const status = getStatusConfig(tarefa.status)

              return (
                <motion.div
                  key={tarefa.id}
                  layout
                  className="bento-item cursor-pointer !p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
                  onClick={() => openTarefaDetail(tarefa)}
                  onContextMenu={(e) => handleContextMenu(e, tarefa)}
                  whileHover={{ scale: 1.01, x: 4 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="status-pill"
                          style={{ 
                            backgroundColor: `${status.cor}15`, 
                            color: status.cor 
                          }}
                        >
                          {status.label}
                        </span>
                        
                        <span
                          className="flex items-center gap-1 text-xs"
                          style={{ color: prioridade.cor }}
                        >
                          <Flag className="h-3 w-3" />
                        </span>

                        {tarefa.tags.map((tag) => {
                          const tagConfig = tags.find(t => t.nome === tag) || { nome: tag, cor: "#6b7280" }
                          return (
                            <span
                              key={tag}
                              className="rounded-full px-2 py-0.5 text-xs flex items-center gap-1"
                              style={{ backgroundColor: `${tagConfig.cor}20`, color: tagConfig.cor }}
                            >
                              <Tag className="h-2.5 w-2.5" />
                              {tagConfig.nome}
                            </span>
                          )
                        })}
                      </div>

                      <h3 className="font-semibold truncate text-lg">{tarefa.titulo}</h3>
                      
                      <div className="mt-2 flex items-center gap-4 text-sm text-[var(--foreground)]/50">
                        {tarefa.prazo && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(tarefa.prazo).toLocaleDateString("pt-BR")}
                          </span>
                        )}

                        {tarefa.previsao_entrega && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(tarefa.previsao_entrega).toLocaleDateString("pt-BR")}
                            {tarefa.estimativa_horas_prevista && ` (${tarefa.estimativa_horas_prevista}h)`}
                          </span>
                        )}

                        {tarefa.responsaveis.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {tarefa.responsaveis.length}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-[var(--foreground)]/40 shrink-0" />
                  </div>
                </motion.div>
              )
            })}

            {paginatedTarefas.length === 0 && (
              <motion.div 
                className="flex flex-col items-center justify-center py-20 text-[var(--foreground)]/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Search className="h-12 w-12 mb-4" />
                <p className="text-lg">Nenhuma tarefa encontrada</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4 shrink-0">
            <span className="text-sm text-[var(--foreground)]/50">
              {startItem}-{endItem} de {tarefasFiltradas.length} tarefas
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {(tarefaSelecionada || isCreating) && (
          <TarefaModal
            tarefa={tarefaSelecionada}
            onClose={() => {
              setTarefaSelecionada(null)
              setIsCreating(false)
              setOpenInEditMode(false)
            }}
            onSave={(tarefa) => {
              if (isCreating) {
                setTarefas(prev => [...prev, tarefa])
              } else if (tarefaSelecionada) {
                setTarefas(prev => prev.map(t => t.id === tarefa.id ? tarefa : t))
              }
              setTarefaSelecionada(null)
              setIsCreating(false)
              setOpenInEditMode(false)
            }}
            onStart={() => {
              if (tarefaSelecionada) {
                handleStartTask(tarefaSelecionada)
                setTarefaSelecionada(null)
                setOpenInEditMode(false)
              }
            }}
            onPause={() => {
              if (tarefaSelecionada) {
                handlePauseTask(tarefaSelecionada)
                setTarefaSelecionada(null)
                setOpenInEditMode(false)
              }
            }}
            onFinish={() => {
              if (tarefaSelecionada) {
                handleFinishTask(tarefaSelecionada)
                setTarefaSelecionada(null)
                setOpenInEditMode(false)
              }
            }}
            isCreating={isCreating}
            editMode={openInEditMode}
            usuarios={usuarios}
            grupos={grupos}
            sprints={sprints}
            tags={tags}
          />
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            tarefa={contextMenu.tarefa}
            onClose={() => setContextMenu(null)}
            onEdit={() => {
              openTarefaInEditMode(contextMenu.tarefa)
              setContextMenu(null)
            }}
            onDelete={() => handleDeleteTask(contextMenu.tarefa)}
            onMove={(coluna) => handleMoveTask(contextMenu.tarefa, coluna)}
            onExport={() => handleExportTask(contextMenu.tarefa)}
            onAssign={() => {
              setTarefaSelecionada(contextMenu.tarefa)
              setOpenInEditMode(true)
              setContextMenu(null)
            }}
            onStart={() => handleStartTask(contextMenu.tarefa)}
            onPause={() => handlePauseTask(contextMenu.tarefa)}
            onFinish={() => handleFinishTask(contextMenu.tarefa)}
            onAbandon={() => handleAbandonTask(contextMenu.tarefa)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

interface TarefaModalProps {
  tarefa: Tarefa | null
  onClose: () => void
  onSave: (tarefa: Tarefa) => void
  onStart?: () => void
  onPause?: () => void
  onFinish?: () => void
  isCreating?: boolean
  editMode?: boolean
  usuarios: Usuario[]
  grupos: Grupo[]
  sprints: Sprint[]
  tags: TagType[]
}

function TarefaModal({ tarefa, onClose, onSave, onStart, onPause, onFinish, isCreating = false, editMode = false, usuarios, grupos, sprints, tags }: TarefaModalProps) {
  const [editModeState, setEditModeState] = useState(isCreating || editMode)
  const [selectedResponsaveis, setSelectedResponsaveis] = useState<number[]>(() => {
    if (isCreating) return []
    return tarefa?.responsaveis || []
  })
  const [formData, setFormData] = useState<Tarefa>(() => {
    if (isCreating) {
      return {
        id: Date.now(),
        empresa_id: 1,
        titulo: "",
        descricao: "",
        coluna: "todo",
        prioridade: "media",
        responsaveis: [],
        tags: [],
        sprint_id: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tempo_gasto_minutos: 0,
        ordem: 0,
        eh_subtarefa: false,
        status: "ativa",
        observadores: [],
      }
    }
    return tarefa!
  })

  const prioridade = getPrioridadeConfig(formData.prioridade)
  const status = getStatusConfig(formData.status)
  const responsaveis = formData.responsaveis.map(id => usuarios.find(u => u.id === String(id))).filter(Boolean)
  const grupo = formData.grupo_id ? grupos.find(g => g.id === formData.grupo_id) : null
  const sprint = formData.sprint_id ? sprints.find(s => s.id === formData.sprint_id) : null

  const handleSave = () => {
    onSave({
      ...formData,
      responsaveis: selectedResponsaveis,
      updated_at: new Date().toISOString()
    })
  }

  return (
    <motion.div
      className="modal-backdrop flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            {editModeState ? (
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Título da tarefa"
                className="text-2xl font-bold mb-3"
              />
            ) : (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="status-pill"
                    style={{ 
                      backgroundColor: `${status.cor}15`, 
                      color: status.cor 
                    }}
                  >
                    {status.label}
                  </span>
                  <span
                    className="flex items-center gap-1 text-sm"
                    style={{ color: prioridade.cor }}
                  >
                    <Flag className="h-4 w-4" />
                    {prioridade.label}
                  </span>
                </div>
                <h2 className="text-2xl font-bold">{formData.titulo}</h2>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editModeState && (
              <>
                <Button variant="ghost" onClick={() => {
                  if (isCreating) {
                    onClose()
                  } else {
                    setFormData(tarefa!)
                    setEditModeState(false)
                  }
                }}>
                  Cancelar
                </Button>
                <Button className="glow-button" onClick={handleSave}>
                  Salvar
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {editModeState ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--foreground)]/60 mb-1 block">Descrição</label>
              <textarea
                value={formData.descricao || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição da tarefa..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] p-3 text-sm min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--foreground)]/60 mb-1 block">Prioridade</label>
                <select
                  value={formData.prioridade}
                  onChange={(e) => setFormData(prev => ({ ...prev, prioridade: e.target.value as Prioridade }))}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] p-2 text-sm"
                >
                  {prioridades.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--foreground)]/60 mb-1 block">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as StatusTarefa }))}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] p-2 text-sm"
                >
                  {statusTarefas.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--foreground)]/60 mb-1 block">Responsáveis</label>
                <div className="space-y-2 border border-[var(--border)] rounded-lg p-2 max-h-32 overflow-y-auto">
                  {usuarios.map(u => {
                    const userId = Number(u.id)
                    const isChecked = selectedResponsaveis.includes(userId)
                    return (
                      <label key={u.id} className="flex items-center gap-2 cursor-pointer hover:bg-[var(--surface-hover)] p-1 rounded">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedResponsaveis(prev => [...prev, userId])
                            } else {
                              setSelectedResponsaveis(prev => prev.filter(id => id !== userId))
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{u.nome}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--foreground)]/60 mb-1 block">Grupo</label>
                <select
                  value={formData.grupo_id || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, grupo_id: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] p-2 text-sm"
                >
                  <option value="">Selecione...</option>
                  {grupos.map(g => (
                    <option key={g.id} value={g.id}>{g.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--foreground)]/60 mb-1 block">Sprint</label>
                <select
                  value={formData.sprint_id || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, sprint_id: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] p-2 text-sm"
                >
                  <option value="">Selecione...</option>
                  {sprints.map(s => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--foreground)]/60 mb-1 block">Estimativa (horas)</label>
                <Input
                  type="number"
                  value={formData.estimativa_horas || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimativa_horas: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--foreground)]/60 mb-1 block">Prazo</label>
              <Input
                type="date"
                value={formData.prazo || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, prazo: e.target.value || undefined }))}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--foreground)]/60 mb-1 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      const newTags = formData.tags.includes(tag.nome)
                        ? formData.tags.filter(t => t !== tag.nome)
                        : [...formData.tags, tag.nome]
                      setFormData(prev => ({ ...prev, tags: newTags }))
                    }}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm flex items-center gap-1 transition-colors",
                      formData.tags.includes(tag.nome)
                        ? "ring-2 ring-offset-1"
                        : "opacity-50 hover:opacity-100"
                    )}
                    style={{ 
                      backgroundColor: `${tag.cor}20`, 
                      color: tag.cor,
                      ["--tw-ring-color" as string]: tag.cor
                    }}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {tag.nome}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {formData.descricao && (
              <div className="mb-6">
                <p className="text-[var(--foreground)]/80">{formData.descricao}</p>
              </div>
            )}

            {/* Tags */}
            {formData.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => {
                    const tagConfig = tags.find(t => t.nome === tag) || { nome: tag, cor: "#6b7280" }
                    return (
                      <span
                        key={tag}
                        className="rounded-full px-3 py-1 text-sm flex items-center gap-1"
                        style={{ backgroundColor: `${tagConfig.cor}20`, color: tagConfig.cor }}
                      >
                        <Tag className="h-3.5 w-3.5" />
                        {tagConfig.nome}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[var(--surface-hover)] p-4">
                <h3 className="mb-1 text-xs font-medium text-[var(--foreground)]/60">Responsáveis</h3>
                <div className="flex -space-x-2">
                  {responsaveis.length > 0 ? responsaveis.map((u) => (
                    <div
                      key={u!.id}
                      className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-sm text-white font-medium ring-2 ring-[var(--surface)]"
                      title={u!.nome}
                    >
                      {u!.nome.charAt(0)}
                    </div>
                  )) : <span className="text-[var(--foreground)]/50">—</span>}
                </div>
              </div>

              <div className="rounded-xl bg-[var(--surface-hover)] p-4">
                <h3 className="mb-1 text-xs font-medium text-[var(--foreground)]/60">Grupo</h3>
                {grupo ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: grupo.cor }} />
                    <span>{grupo.nome}</span>
                  </div>
                ) : <span className="text-[var(--foreground)]/50">—</span>}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[var(--surface-hover)] p-4">
                <h3 className="mb-1 text-xs font-medium text-[var(--foreground)]/60">Prazo</h3>
                <p className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-[var(--primary)]" />
                  {formData.prazo 
                    ? new Date(formData.prazo).toLocaleDateString("pt-BR")
                    : "—"}
                </p>
              </div>

              <div className="rounded-xl bg-[var(--surface-hover)] p-4">
                <h3 className="mb-1 text-xs font-medium text-[var(--foreground)]/60">Estimativa</h3>
                <p className="flex items-center gap-2 font-medium">
                  <Clock className="h-4 w-4 text-[var(--accent)]" />
                  {formData.estimativa_horas ? `${formData.estimativa_horas}h` : "—"}
                </p>
              </div>
            </div>

            {sprint && (
              <div className="mb-6 rounded-xl bg-[var(--surface-hover)] p-4">
                <h3 className="mb-1 text-xs font-medium text-[var(--foreground)]/60">Sprint</h3>
                <p className="font-medium">{sprint.nome}</p>
              </div>
            )}

            {(formData.motivo_pausa || formData.motivo_suspensao || formData.motivo_abandono) && (
              <div className="mb-6 rounded-xl bg-[var(--surface-hover)] p-4">
                <p className="text-[var(--foreground)]/80">
                  {formData.motivo_pausa || formData.motivo_suspensao || formData.motivo_abandono}
                </p>
              </div>
            )}
          </>
        )}

        {!editModeState && (
          <div className="border-t border-[var(--border)] pt-4">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="glow-button" onClick={() => setEditModeState(true)}>
                Editar
              </Button>
              {formData.status !== "ativa" && (
                <Button size="sm" className="glow-button" onClick={onStart}>
                  Iniciar
                </Button>
              )}
              {formData.status === "ativa" && (
                <>
                  <Button size="sm" variant="outline" className="glow-button-outline" onClick={onPause}>
                    Pausar
                  </Button>
                  <Button size="sm" variant="outline" className="glow-button-outline" onClick={onFinish}>
                    Finalizar
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

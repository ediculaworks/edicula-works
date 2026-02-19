"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Tarefa, Prioridade, StatusTarefa, ColunaKanban } from "@/types"
import {
  Plus,
  Search,
  Calendar,
  Flag,
  Clock,
  Users,
  ChevronRight,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Tag,
  Edit,
  Trash2,
  Move,
  Download,
  UserPlus,
  Play,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { mockUsuarios, mockGrupos, mockSprints, mockTags } from "@/lib/mock-data"

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

const availableTags = [
  { id: "frontend", cor: "#3b82f6", label: "frontend" },
  { id: "backend", cor: "#8b5cf6", label: "backend" },
  { id: "infra", cor: "#10b981", label: "infra" },
  { id: "ia", cor: "#f59e0b", label: "ia" },
  { id: "qa", cor: "#ef4444", label: "qa" },
  { id: "docs", cor: "#06b6d4", label: "docs" },
]

const ITEMS_PER_PAGE = 15

function getPrioridadeConfig(p: Prioridade) {
  return prioridades.find((pr) => pr.id === p) || prioridades[2]
}

function getStatusConfig(s: StatusTarefa) {
  return statusTarefas.find((st) => st.id === s) || statusTarefas[0]
}

function getTagConfig(tagId: string) {
  return availableTags.find((t) => t.id === tagId) || { id: tagId, cor: "#6b7280", label: tagId }
}

const colunas: { id: ColunaKanban; titulo: string; cor: string }[] = [
  { id: "todo", titulo: "A Fazer", cor: "#6b7280" },
  { id: "in_progress", titulo: "Em Andamento", cor: "#3b82f6" },
  { id: "review", titulo: "Em Revisão", cor: "#f59e0b" },
  { id: "done", titulo: "Concluída", cor: "#22c55e" },
]

interface Filtros {
  busca?: string
  prioridade?: Prioridade
  status?: StatusTarefa
}

// Dados de exemplo
const tarefasExemplo: Tarefa[] = [
  { id: 1, empresa_id: 1, titulo: "Setup inicial do projeto", descricao: "Configurar estrutura base", coluna: "done", prioridade: "alta", responsaveis: [1], tags: ["infra"], created_at: "2026-02-15T10:00:00Z", updated_at: "2026-02-18T15:00:00Z", tempo_gasto_minutos: 120, ordem: 0, eh_subtarefa: false, status: "concluida", observadores: [], previsao_entrega: "2026-02-18", estimativa_horas_prevista: 8 },
  { id: 2, empresa_id: 1, titulo: "Criar schema do banco", descricao: "Schema completo", coluna: "done", prioridade: "alta", responsaveis: [1], tags: ["backend"], created_at: "2026-02-16T10:00:00Z", updated_at: "2026-02-17T15:00:00Z", tempo_gasto_minutos: 180, ordem: 1, eh_subtarefa: false, status: "concluida", observadores: [], previsao_entrega: "2026-02-17", estimativa_horas_prevista: 12 },
  { id: 3, empresa_id: 1, titulo: "Implementar API FastAPI", descricao: "Endpoints REST", coluna: "in_progress", prioridade: "alta", responsaveis: [2], prazo: "2026-02-25", tags: ["backend"], created_at: "2026-02-17T10:00:00Z", updated_at: "2026-02-19T10:00:00Z", tempo_gasto_minutos: 60, ordem: 0, eh_subtarefa: false, status: "ativa", observadores: [], previsao_entrega: "2026-02-25", estimativa_horas_prevista: 16 },
  { id: 4, empresa_id: 1, titulo: "Configurar agentes IA", descricao: "OpenClaw", coluna: "todo", prioridade: "media", responsaveis: [3], tags: ["ia"], created_at: "2026-02-18T10:00:00Z", updated_at: "2026-02-18T10:00:00Z", tempo_gasto_minutos: 0, ordem: 0, eh_subtarefa: false, status: "ativa", observadores: [], previsao_entrega: "2026-02-28", estimativa_horas_prevista: 8 },
  { id: 5, empresa_id: 1, titulo: "Criar interface Kanban", descricao: "Frontend Next.js", coluna: "todo", prioridade: "media", responsaveis: [4], tags: ["frontend"], created_at: "2026-02-18T10:00:00Z", updated_at: "2026-02-18T10:00:00Z", tempo_gasto_minutos: 0, ordem: 1, eh_subtarefa: false, status: "ativa", observadores: [] },
  { id: 6, empresa_id: 1, titulo: "Implementar busca semântica", descricao: "pgVector", coluna: "todo", prioridade: "baixa", responsaveis: [1], tags: ["backend", "ia"], created_at: "2026-02-18T10:00:00Z", updated_at: "2026-02-18T10:00:00Z", tempo_gasto_minutos: 0, ordem: 2, eh_subtarefa: false, status: "pausada", observadores: [], motivo_pausa: "Aguardando definição de requisitos" },
  { id: 7, empresa_id: 1, titulo: "Revisar código", coluna: "review", prioridade: "alta", responsaveis: [1], tags: ["qa"], created_at: "2026-02-19T10:00:00Z", updated_at: "2026-02-19T10:00:00Z", tempo_gasto_minutos: 0, ordem: 0, eh_subtarefa: false, status: "ativa", observadores: [] },
  { id: 8, empresa_id: 1, titulo: "Criar documentação", coluna: "todo", prioridade: "baixa", responsaveis: [1], tags: ["docs"], created_at: "2026-02-19T10:00:00Z", updated_at: "2026-02-19T10:00:00Z", tempo_gasto_minutos: 0, ordem: 3, eh_subtarefa: false, status: "ativa", observadores: [] },
  { id: 9, empresa_id: 1, titulo: "Configurar CI/CD", coluna: "todo", prioridade: "alta", responsaveis: [2], tags: ["infra"], created_at: "2026-02-19T10:00:00Z", updated_at: "2026-02-19T10:00:00Z", tempo_gasto_minutos: 0, ordem: 4, eh_subtarefa: false, status: "ativa", observadores: [] },
  { id: 10, empresa_id: 1, titulo: "Testes unitários", coluna: "in_progress", prioridade: "media", responsaveis: [3], tags: ["qa", "backend"], created_at: "2026-02-19T10:00:00Z", updated_at: "2026-02-19T10:00:00Z", tempo_gasto_minutos: 30, ordem: 1, eh_subtarefa: false, status: "ativa", observadores: [] },
  { id: 11, empresa_id: 1, titulo: "Atualizar dependências", coluna: "done", prioridade: "baixa", responsaveis: [1], tags: ["frontend", "backend"], created_at: "2026-02-19T10:00:00Z", updated_at: "2026-02-19T10:00:00Z", tempo_gasto_minutos: 15, ordem: 2, eh_subtarefa: false, status: "concluida", observadores: [] },
  { id: 12, empresa_id: 1, titulo: "Setup banco de dados", coluna: "done", prioridade: "alta", responsaveis: [2], tags: ["infra", "backend"], created_at: "2026-02-15T10:00:00Z", updated_at: "2026-02-16T10:00:00Z", tempo_gasto_minutos: 240, ordem: 3, eh_subtarefa: false, status: "concluida", observadores: [] },
]

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
  const [tarefas, setTarefas] = useState<Tarefa[]>(tarefasExemplo)
  const [filtros, setFiltros] = useState<Filtros>({})
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [openInEditMode, setOpenInEditMode] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tarefa: Tarefa } | null>(null)

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtros.busca && !tarefa.titulo.toLowerCase().includes(filtros.busca.toLowerCase())) {
      return false
    }
    if (filtros.prioridade && tarefa.prioridade !== filtros.prioridade) {
      return false
    }
    if (filtros.status && tarefa.status !== filtros.status) {
      return false
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
        {/* Search & Filters */}
        <div className="mb-4 flex gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/40" />
            <Input
              placeholder="Buscar..."
              className="pl-10"
              value={filtros.busca || ""}
              onChange={(e) => {
                setFiltros((prev) => ({ ...prev, busca: e.target.value }))
                setPage(1)
              }}
            />
          </div>

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

                {(filtros.prioridade || filtros.status) && (
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
                          const tagConfig = getTagConfig(tag)
                          return (
                            <span
                              key={tag}
                              className="rounded-full px-2 py-0.5 text-xs flex items-center gap-1"
                              style={{ backgroundColor: `${tagConfig.cor}20`, color: tagConfig.cor }}
                            >
                              <Tag className="h-2.5 w-2.5" />
                              {tagConfig.label}
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
                <ChevronRightIcon className="h-4 w-4" />
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
            isCreating={isCreating}
            editMode={openInEditMode}
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
  isCreating?: boolean
  editMode?: boolean
}

function TarefaModal({ tarefa, onClose, onSave, isCreating = false, editMode = false }: TarefaModalProps) {
  const [editModeState, setEditModeState] = useState(!isCreating && editMode)
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
  const responsaveis = formData.responsaveis.map(id => mockUsuarios.find(u => u.id === id)).filter(Boolean)
  const grupo = formData.grupo_id ? mockGrupos.find(g => g.id === formData.grupo_id) : null
  const sprint = formData.sprint_id ? mockSprints.find(s => s.id === formData.sprint_id) : null

  const handleSave = () => {
    onSave({
      ...formData,
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
                <select
                  multiple
                  value={formData.responsaveis.map(String)}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => Number(option.value))
                    setFormData(prev => ({ ...prev, responsaveis: values }))
                  }}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] p-2 text-sm h-24"
                >
                  {mockUsuarios.map(u => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--foreground)]/60 mb-1 block">Grupo</label>
                <select
                  value={formData.grupo_id || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, grupo_id: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] p-2 text-sm"
                >
                  <option value="">Selecione...</option>
                  {mockGrupos.map(g => (
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
                  {mockSprints.map(s => (
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
                {mockTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      const newTags = formData.tags.includes(tag.id)
                        ? formData.tags.filter(t => t !== tag.id)
                        : [...formData.tags, tag.id]
                      setFormData(prev => ({ ...prev, tags: newTags }))
                    }}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm flex items-center gap-1 transition-colors",
                      formData.tags.includes(tag.id)
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
                    {tag.label}
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
                    const tagConfig = getTagConfig(tag)
                    return (
                      <span
                        key={tag}
                        className="rounded-full px-3 py-1 text-sm flex items-center gap-1"
                        style={{ backgroundColor: `${tagConfig.cor}20`, color: tagConfig.cor }}
                      >
                        <Tag className="h-3.5 w-3.5" />
                        {tagConfig.label}
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
                <Button size="sm" className="glow-button">
                  Iniciar
                </Button>
              )}
              {formData.status === "ativa" && (
                <>
                  <Button size="sm" variant="outline" className="glow-button-outline">
                    Pausar
                  </Button>
                  <Button size="sm" variant="outline" className="glow-button-outline">
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

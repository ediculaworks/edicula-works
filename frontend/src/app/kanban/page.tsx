"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Calendar, 
  Flag, 
  Clock,
  GripVertical,
  X,
  ChevronLeft,
  ChevronRight,
  Tag,
  Edit,
  Trash2,
  Move,
  Download,
  UserPlus,
  Play,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Tarefa, Prioridade, ColunaKanban, StatusTarefa, Usuario, Grupo, Sprint, Tag as TagType } from "@/types"
import { useTarefas } from "@/hooks/useTarefas"
import { useUsuarios } from "@/hooks/useUsuarios"
import { useTags } from "@/hooks/useTags"
import { useGrupos } from "@/hooks/useGrupos"
import { useSprints } from "@/hooks/useSprints"

const EMPRESA_ID = 1

const colunas: { id: ColunaKanban; titulo: string; cor: string }[] = [
  { id: "todo", titulo: "A Fazer", cor: "#6b7280" },
  { id: "in_progress", titulo: "Em Andamento", cor: "#3b82f6" },
  { id: "review", titulo: "Em Revisão", cor: "#f59e0b" },
  { id: "done", titulo: "Concluída", cor: "#22c55e" },
]

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

const ITEMS_PER_PAGE = 8

function getPrioridadeConfig(p: Prioridade) {
  return prioridades.find((pr) => pr.id === p) || prioridades[2]
}

function getStatusConfig(s: StatusTarefa) {
  return statusTarefas.find((st) => st.id === s) || statusTarefas[0]
}

interface ContextMenuProps {
  x: number
  y: number
  tarefa: Tarefa
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onMove: () => void
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
  const isConcluida = tarefa.status === "concluida"

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
      <button
        onClick={() => { onMove(); onClose() }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-hover)]"
      >
        <Move className="h-4 w-4" />
        Mover para →
      </button>
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
      
      {/* Status actions based on current status */}
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

interface MoveMenuProps {
  x: number
  y: number
  tarefa: Tarefa
  onClose: () => void
  onMove: (coluna: ColunaKanban) => void
}

function MoveMenu({ x, y, tarefa, onClose, onMove }: MoveMenuProps) {
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

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md p-1 shadow-2xl"
      style={{ top: y, left: x }}
    >
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
  )
}

interface SortableTaskProps {
  tarefa: Tarefa
  onContextMenu: (e: React.MouseEvent, tarefa: Tarefa) => void
  onClick: (tarefa: Tarefa) => void
  getUsuarioById: (id: string) => Usuario | undefined
  getGrupoById: (id: number) => Grupo | undefined
  getTagById: (id: number) => TagType | undefined
}

function SortableTask({ tarefa, onContextMenu, onClick, getUsuarioById, getGrupoById, getTagById }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tarefa.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const prioridade = getPrioridadeConfig(tarefa.prioridade)
  const responsaveis = tarefa.responsaveis.map(id => getUsuarioById(id)).filter(Boolean)
  const grupo = tarefa.grupo_id ? getGrupoById(tarefa.grupo_id) : null
  const status = getStatusConfig(tarefa.status)
  
  // Helper to get tag display config
  function getTagConfig(tagId: string) {
    return { id: tagId, cor: "#6b7280", label: tagId }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onContextMenu={(e) => {
        e.preventDefault()
        onContextMenu(e, tarefa)
      }}
      onClick={() => onClick(tarefa)}
      className={cn(
        "kanban-card group cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div className="pl-4">
        {tarefa.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
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
        )}

        <h4 className="font-medium pr-6">{tarefa.titulo}</h4>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1 text-xs"
              style={{ color: prioridade.cor }}
            >
              <Flag className="h-3 w-3" />
            </div>

            {tarefa.prazo && (
              <div className="flex items-center gap-1 text-xs text-[var(--foreground)]/50">
                <Calendar className="h-3 w-3" />
                {new Date(tarefa.prazo).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
              </div>
            )}

            {tarefa.estimativa_horas && (
              <div className="flex items-center gap-1 text-xs text-[var(--foreground)]/50">
                <Clock className="h-3 w-3" />
                {tarefa.estimativa_horas}h
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {grupo && (
              <div 
                className="h-5 w-5 rounded text-[10px] flex items-center justify-center font-medium text-white"
                style={{ backgroundColor: grupo.cor }}
                title={grupo.nome}
              >
                {grupo.nome[0]}
              </div>
            )}
            {responsaveis.length > 0 && (
              <div className="flex -space-x-1">
                {responsaveis.slice(0, 2).map((usuario) => (
                  <div
                    key={usuario!.id}
                    className="h-5 w-5 rounded-full bg-[var(--primary)] flex items-center justify-center text-[10px] text-white font-medium ring-1 ring-[var(--surface)]"
                    title={usuario!.nome}
                  >
                    {usuario!.nome.charAt(0)}
                  </div>
                ))}
                {responsaveis.length > 2 && (
                  <div className="h-5 w-5 rounded-full bg-[var(--surface-hover)] flex items-center justify-center text-[10px] text-[var(--foreground)] ring-1 ring-[var(--surface)]">
                    +{responsaveis.length - 2}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ColumnProps {
  coluna: typeof colunas[0]
  tarefas: Tarefa[]
  onAddTask: (coluna: ColunaKanban) => void
  onContextMenu: (e: React.MouseEvent, tarefa: Tarefa) => void
  onTaskClick: (tarefa: Tarefa) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  getUsuarioById: (id: string) => Usuario | undefined
  getGrupoById: (id: number) => Grupo | undefined
  getTagById: (id: number) => TagType | undefined
}

function KanbanColumn({ coluna, tarefas, onAddTask, onContextMenu, onTaskClick, page, totalPages, onPageChange, getUsuarioById, getGrupoById, getTagById }: ColumnProps) {
  const paginatedTarefas = tarefas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="kanban-column w-80 shrink-0">
      <div className="kanban-column-header">
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: coluna.cor }}
          />
          <h3 className="font-semibold">{coluna.titulo}</h3>
          <span className="rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-xs">
            {tarefas.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onAddTask(coluna.id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="kanban-column-content">
        <SortableContext
          items={paginatedTarefas.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            {paginatedTarefas.map((tarefa) => (
              <SortableTask 
                key={tarefa.id} 
                tarefa={tarefa} 
                onContextMenu={onContextMenu}
                onClick={onTaskClick}
                getUsuarioById={getUsuarioById}
                getGrupoById={getGrupoById}
                getTagById={getTagById}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {paginatedTarefas.length === 0 && (
          <div className="flex h-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] text-[var(--foreground)]/40">
            <p className="text-sm">Sem tarefas</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-[var(--foreground)]/50">
              {page}/{totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface TaskModalProps {
  tarefa: Tarefa | null
  onClose: () => void
  onSave: (tarefa: Tarefa) => void
  isCreating?: boolean
  initialColumn?: ColunaKanban
  editMode?: boolean
  usuarios: Usuario[]
  grupos: Grupo[]
  sprints: Sprint[]
  tags: TagType[]
}

function TaskModal({ tarefa, onClose, onSave, isCreating = false, initialColumn = "todo", editMode = false, usuarios, grupos, sprints, tags }: TaskModalProps) {
  const [editModeState, setEditModeState] = useState(isCreating || editMode)
  const [formData, setFormData] = useState<Tarefa>(() => {
    if (isCreating) {
      return {
        id: Date.now(),
        empresa_id: 1,
        titulo: "",
        descricao: "",
        coluna: initialColumn,
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
  const responsaveis = formData.responsaveis.map(id => usuarios.find(u => u.id === id)).filter(Boolean)
  const grupo = formData.grupo_id ? grupos.find(g => g.id === formData.grupo_id) : null
  const sprint = formData.sprint_id ? sprints.find(s => s.id === formData.sprint_id) : undefined

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
                  value={formData.responsaveis}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value)
                    setFormData(prev => ({ ...prev, responsaveis: values }))
                  }}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] p-2 text-sm h-24"
                >
                  {usuarios.map(u => (
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

export default function KanbanPage() {
  const [selectedSprintId, setSelectedSprintId] = useState<number | undefined>(undefined)
  const { tarefas: apiTarefas, loading, error, refetch, createTarefa, updateTarefa, deleteTarefa, moveTarefa, iniciarTarefa, pausarTarefa, finalizarTarefa, abandonarTarefa } = useTarefas({ empresaId: EMPRESA_ID, sprintId: selectedSprintId })
  const { usuarios, getUsuarioById } = useUsuarios({ empresaId: EMPRESA_ID })
  const { tags, getTagById } = useTags({ empresaId: EMPRESA_ID })
  const { grupos, getGrupoById } = useGrupos({ empresaId: EMPRESA_ID })
  const { sprints } = useSprints({ empresaId: EMPRESA_ID })
  
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [pages, setPages] = useState<Record<ColunaKanban, number>>({
    todo: 1,
    in_progress: 1,
    review: 1,
    done: 1,
  })
  const [isApiConnected, setIsApiConnected] = useState(false)
  
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
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tarefa: Tarefa } | null>(null)
  const [moveMenu, setMoveMenu] = useState<{ x: number; y: number; tarefa: Tarefa } | null>(null)
  const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [openInEditMode, setOpenInEditMode] = useState(false)
  const [initialColumn, setInitialColumn] = useState<ColunaKanban>("todo")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getTarefasPorColuna = (coluna: ColunaKanban) => {
    return tarefas.filter((t) => t.coluna === coluna)
  }

  const getTotalPages = (coluna: ColunaKanban) => {
    return Math.max(1, Math.ceil(getTarefasPorColuna(coluna).length / ITEMS_PER_PAGE))
  }

  const handlePageChange = (coluna: ColunaKanban, newPage: number) => {
    const totalPages = getTotalPages(coluna)
    if (newPage >= 1 && newPage <= totalPages) {
      setPages((prev) => ({ ...prev, [coluna]: newPage }))
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeTarefa = tarefas.find((t) => t.id === active.id)
    
    if (!activeTarefa) {
      setActiveId(null)
      return
    }

    const overColumn = colunas.find((c) => c.id === over.id)
    if (overColumn) {
      setTarefas((prev) =>
        prev.map((t) =>
          t.id === active.id ? { ...t, coluna: overColumn.id } : t
        )
      )
      setPages((prev) => ({ ...prev, [overColumn.id]: 1 }))
      setActiveId(null)
      return
    }

    const overTarefa = tarefas.find((t) => t.id === over.id)
    if (overTarefa && activeTarefa.coluna !== overTarefa.coluna) {
      setTarefas((prev) =>
        prev.map((t) =>
          t.id === active.id ? { ...t, coluna: overTarefa.coluna } : t
        )
      )
      setPages((prev) => ({ ...prev, [overTarefa.coluna]: 1 }))
    }

    setActiveId(null)
  }

  const handleAddTask = (coluna: ColunaKanban) => {
    setSelectedTask(null)
    setIsCreating(true)
    setOpenInEditMode(true)
    setInitialColumn(coluna)
  }

  const handleContextMenu = (e: React.MouseEvent, tarefa: Tarefa) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, tarefa })
  }

  const handleTaskClick = (tarefa: Tarefa) => {
    setSelectedTask(tarefa)
    setIsCreating(false)
    setOpenInEditMode(false)
  }

  const handleEdit = (tarefa: Tarefa) => {
    setSelectedTask(tarefa)
    setIsCreating(false)
    setOpenInEditMode(true)
  }

  const handleDelete = async (tarefa: Tarefa) => {
    if (isApiConnected) {
      try {
        await deleteTarefa(tarefa.id)
      } catch (err) {
        console.error('Erro ao deletar:', err)
        setTarefas(prev => prev.filter(t => t.id !== tarefa.id))
      }
    } else {
      setTarefas(prev => prev.filter(t => t.id !== tarefa.id))
    }
  }

  const handleMove = (tarefa: Tarefa) => {
    setMoveMenu({ x: contextMenu!.x, y: contextMenu!.y, tarefa })
  }

  const handleMoveToColumn = async (coluna: ColunaKanban) => {
    const tarefaId = moveMenu!.tarefa.id
    if (isApiConnected) {
      try {
        await moveTarefa(tarefaId, coluna)
      } catch (err) {
        console.error('Erro ao mover:', err)
        setTarefas(prev => prev.map(t => t.id === tarefaId ? { ...t, coluna } : t))
      }
    } else {
      setTarefas(prev => prev.map(t => t.id === tarefaId ? { ...t, coluna } : t))
    }
  }

  const handleExport = (tarefa: Tarefa) => {
    const data = JSON.stringify(tarefa, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tarefa-${tarefa.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAssign = (tarefa: Tarefa) => {
    setSelectedTask(tarefa)
    setIsCreating(false)
  }

  const handleStart = async (tarefa: Tarefa) => {
    if (isApiConnected) {
      try {
        await iniciarTarefa(tarefa.id)
      } catch (err) {
        console.error('Erro ao iniciar:', err)
        setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status: "ativa" } : t))
      }
    } else {
      setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status: "ativa" } : t))
    }
  }

  const handlePause = async (tarefa: Tarefa) => {
    if (isApiConnected) {
      try {
        await pausarTarefa(tarefa.id)
      } catch (err) {
        console.error('Erro ao pausar:', err)
        setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status: "pausada" } : t))
      }
    } else {
      setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status: "pausada" } : t))
    }
  }

  const handleFinish = async (tarefa: Tarefa) => {
    if (isApiConnected) {
      try {
        await finalizarTarefa(tarefa.id)
      } catch (err) {
        console.error('Erro ao finalizar:', err)
        setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status: "concluida", coluna: "done" } : t))
      }
    } else {
      setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status: "concluida", coluna: "done" } : t))
    }
  }

  const handleAbandon = async (tarefa: Tarefa) => {
    if (isApiConnected) {
      try {
        await abandonarTarefa(tarefa.id)
      } catch (err) {
        console.error('Erro ao abandonar:', err)
        setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status: "abandonada" } : t))
      }
    } else {
      setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status: "abandonada" } : t))
    }
  }

  const handleSaveTask = async (tarefa: Tarefa) => {
    if (isApiConnected) {
      try {
        if (isCreating) {
          await createTarefa(tarefa)
        } else {
          await updateTarefa(tarefa.id, tarefa)
        }
      } catch (err) {
        console.error('Erro ao salvar:', err)
        if (isCreating) {
          setTarefas(prev => [...prev, tarefa])
        } else {
          setTarefas(prev => prev.map(t => t.id === tarefa.id ? tarefa : t))
        }
      }
    } else {
      if (isCreating) {
        setTarefas(prev => [...prev, tarefa])
      } else {
        setTarefas(prev => prev.map(t => t.id === tarefa.id ? tarefa : t))
      }
    }
    setSelectedTask(null)
    setIsCreating(false)
  }

  const activeTarefa = activeId ? tarefas.find((t) => t.id === activeId) : null

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col">
        {/* Sprint Selector */}
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm font-medium">Sprint:</label>
          <select
            value={selectedSprintId ?? ""}
            onChange={(e) => setSelectedSprintId(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          >
            <option value="">Todos os sprints</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>{sprint.nome}</option>
            ))}
          </select>
          {sprints.length === 0 && (
            <span className="text-xs text-[var(--foreground)]/50">Nenhum sprint cadastrado</span>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 gap-4 pb-4 min-w-0">
            {colunas.map((coluna) => (
              <KanbanColumn
                key={coluna.id}
                coluna={coluna}
                tarefas={getTarefasPorColuna(coluna.id)}
                onAddTask={handleAddTask}
                onContextMenu={handleContextMenu}
                onTaskClick={handleTaskClick}
                page={pages[coluna.id]}
                totalPages={getTotalPages(coluna.id)}
                onPageChange={(page) => handlePageChange(coluna.id, page)}
                getUsuarioById={getUsuarioById}
                getGrupoById={getGrupoById}
                getTagById={getTagById}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTarefa && (
              <div className="kanban-card shadow-2xl ring-2 ring-[var(--primary)] rotate-2">
                <h4 className="font-medium">{activeTarefa.titulo}</h4>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && !moveMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            tarefa={contextMenu.tarefa}
            onClose={() => setContextMenu(null)}
            onEdit={() => handleEdit(contextMenu.tarefa)}
            onDelete={() => handleDelete(contextMenu.tarefa)}
            onMove={() => handleMove(contextMenu.tarefa)}
            onExport={() => handleExport(contextMenu.tarefa)}
            onAssign={() => handleAssign(contextMenu.tarefa)}
            onStart={() => handleStart(contextMenu.tarefa)}
            onPause={() => handlePause(contextMenu.tarefa)}
            onFinish={() => handleFinish(contextMenu.tarefa)}
            onAbandon={() => handleAbandon(contextMenu.tarefa)}
          />
        )}
      </AnimatePresence>

      {/* Move Menu */}
      <AnimatePresence>
        {moveMenu && (
          <MoveMenu
            x={moveMenu.x}
            y={moveMenu.y}
            tarefa={moveMenu.tarefa}
            onClose={() => setMoveMenu(null)}
            onMove={handleMoveToColumn}
          />
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {(selectedTask || isCreating) && (
          <TaskModal
            tarefa={selectedTask}
            onClose={() => {
              setSelectedTask(null)
              setIsCreating(false)
              setOpenInEditMode(false)
            }}
            onSave={handleSaveTask}
            isCreating={isCreating}
            initialColumn={initialColumn}
            editMode={openInEditMode}
            usuarios={usuarios}
            grupos={grupos}
            sprints={sprints}
            tags={tags}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

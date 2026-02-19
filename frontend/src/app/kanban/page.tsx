"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatDate, isOverdue } from "@/lib/date-utils"
import type { Tarefa, Prioridade, ColunaKanban } from "@/types"
import {
  Plus,
  MoreHorizontal,
  Calendar,
  Flag,
  Clock,
  GripVertical,
} from "lucide-react"

const colunas: { id: ColunaKanban; titulo: string; cor: string }[] = [
  { id: "todo", titulo: "A Fazer", cor: "#6b7280" },
  { id: "in_progress", titulo: "Em Andamento", cor: "#3b82f6" },
  { id: "review", titulo: "Em Revisão", cor: "#f59e0b" },
  { id: "done", titulo: "Concluída", cor: "#22c55e" },
]

const prioridades: { id: Prioridade; cor: string; label: string }[] = [
  { id: "urgente", cor: "#ef4444", label: "Urgente" },
  { id: "alta", cor: "#f97316", label: "Alta" },
  { id: "media", cor: "#eab308", label: "Media" },
  { id: "baixa", cor: "#22c55e", label: "Baixa" },
]

// Dados de exemplo
const tarefasExemplo: Tarefa[] = [
  {
    id: 1,
    empresa_id: 1,
    titulo: "Setup inicial do projeto",
    descricao: "Configurar estrutura base",
    coluna: "done",
    prioridade: "alta",
    responsaveis: [1],
    tags: ["infra"],
    created_at: "2026-02-15T10:00:00Z",
    updated_at: "2026-02-18T15:00:00Z",
    tempo_gasto_minutos: 120,
    ordem: 0,
    eh_subtarefa: false,
    status: "concluida",
    observadores: [],
  },
  {
    id: 2,
    empresa_id: 1,
    titulo: "Criar schema do banco",
    descricao: "Schema completo com todas as entidades",
    coluna: "done",
    prioridade: "alta",
    responsaveis: [1],
    tags: ["backend"],
    created_at: "2026-02-16T10:00:00Z",
    updated_at: "2026-02-17T15:00:00Z",
    tempo_gasto_minutos: 180,
    ordem: 1,
    eh_subtarefa: false,
    status: "concluida",
    observadores: [],
  },
  {
    id: 3,
    empresa_id: 1,
    titulo: "Implementar API FastAPI",
    descricao: "Endpoints REST para CRUD",
    coluna: "in_progress",
    prioridade: "alta",
    responsaveis: [2],
    prazo: "2026-02-25",
    tags: ["backend"],
    created_at: "2026-02-17T10:00:00Z",
    updated_at: "2026-02-19T10:00:00Z",
    tempo_gasto_minutos: 60,
    ordem: 0,
    eh_subtarefa: false,
    status: "ativa",
    observadores: [],
  },
  {
    id: 4,
    empresa_id: 1,
    titulo: "Configurar agentes IA",
    descricao: "OpenClaw com múltiplos agentes",
    coluna: "todo",
    prioridade: "media",
    responsaveis: [3],
    tags: ["ia"],
    created_at: "2026-02-18T10:00:00Z",
    updated_at: "2026-02-18T10:00:00Z",
    tempo_gasto_minutos: 0,
    ordem: 0,
    eh_subtarefa: false,
    status: "ativa",
    observadores: [],
  },
  {
    id: 5,
    empresa_id: 1,
    titulo: "Criar interface Kanban",
    descricao: "Frontend Next.js",
    coluna: "todo",
    prioridade: "media",
    responsaveis: [4],
    tags: ["frontend"],
    created_at: "2026-02-18T10:00:00Z",
    updated_at: "2026-02-18T10:00:00Z",
    tempo_gasto_minutos: 0,
    ordem: 1,
    eh_subtarefa: false,
    status: "ativa",
    observadores: [],
  },
  {
    id: 6,
    empresa_id: 1,
    titulo: "Implementar busca semântica",
    descricao: "pgVector",
    coluna: "todo",
    prioridade: "baixa",
    responsaveis: [1],
    tags: ["backend", "ia"],
    created_at: "2026-02-18T10:00:00Z",
    updated_at: "2026-02-18T10:00:00Z",
    tempo_gasto_minutos: 0,
    ordem: 2,
    eh_subtarefa: false,
    status: "ativa",
    observadores: [],
  },
  {
    id: 7,
    empresa_id: 1,
    titulo: "Revisar código",
    coluna: "review",
    prioridade: "alta",
    responsaveis: [1],
    tags: ["qa"],
    created_at: "2026-02-19T10:00:00Z",
    updated_at: "2026-02-19T10:00:00Z",
    tempo_gasto_minutos: 0,
    ordem: 0,
    eh_subtarefa: false,
    status: "ativa",
    observadores: [],
  },
]

function getPrioridadeConfig(prioridade: Prioridade) {
  return prioridades.find((p) => p.id === prioridade) || prioridades[2]
}

export default function KanbanPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>(tarefasExemplo)
  const [draggedTask, setDraggedTask] = useState<number | null>(null)
  const [showAddTask, setShowAddTask] = useState<ColunaKanban | null>(null)

  const handleDragStart = (taskId: number) => {
    setDraggedTask(taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (coluna: ColunaKanban) => {
    if (draggedTask) {
      setTarefas((prev) =>
        prev.map((t) =>
          t.id === draggedTask ? { ...t, coluna } : t
        )
      )
      setDraggedTask(null)
    }
  }

  const getTarefasPorColuna = (coluna: ColunaKanban) => {
    return tarefas.filter((t) => t.coluna === coluna)
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-7rem)] flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Kanban</h1>
            <p className="text-[var(--foreground)]/60">Quadro de tarefas</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {/* Board */}
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {colunas.map((coluna) => {
            const tarefasColuna = getTarefasPorColuna(coluna.id)
            return (
              <div
                key={coluna.id}
                className="flex w-72 shrink-0 flex-col"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(coluna.id)}
              >
                {/* Column Header */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: coluna.cor }}
                    />
                    <h3 className="font-medium">{coluna.titulo}</h3>
                    <span className="rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-xs">
                      {tarefasColuna.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowAddTask(coluna.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Cards */}
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                  {tarefasColuna.map((tarefa) => {
                    const prioridade = getPrioridadeConfig(tarefa.prioridade)
                    const overdue = tarefa.prazo && isOverdue(tarefa.prazo) && coluna.id !== "done"
                    
                    return (
                      <Card
                        key={tarefa.id}
                        draggable
                        onDragStart={() => handleDragStart(tarefa.id)}
                        className={cn(
                          "cursor-grab p-3 transition-shadow hover:shadow-md",
                          draggedTask === tarefa.id && "opacity-50"
                        )}
                      >
                        {/* Tags */}
                        {tarefa.tags.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1">
                            {tarefa.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Título */}
                        <h4 className="mb-2 font-medium">{tarefa.titulo}</h4>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* Prioridade */}
                            <div
                              className="flex items-center gap-1 text-xs"
                              style={{ color: prioridade.cor }}
                            >
                              <Flag className="h-3 w-3" />
                              {prioridade.label}
                            </div>

                            {/* Prazo */}
                            {tarefa.prazo && (
                              <div
                                className={cn(
                                  "flex items-center gap-1 text-xs",
                                  overdue ? "text-[var(--error)]" : "text-[var(--foreground)]/60"
                                )}
                              >
                                <Calendar className="h-3 w-3" />
                                {formatDate(tarefa.prazo)}
                              </div>
                            )}
                          </div>

                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    )
                  })}

                  {/* Add task button */}
                  {showAddTask === coluna.id && (
                    <Card className="p-3">
                      <Input
                        placeholder="Título da tarefa..."
                        className="mb-2"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            // Adicionar tarefa
                            setShowAddTask(null)
                          }
                          if (e.key === "Escape") {
                            setShowAddTask(null)
                          }
                        }}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddTask(null)}
                        >
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={() => setShowAddTask(null)}>
                          Adicionar
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}

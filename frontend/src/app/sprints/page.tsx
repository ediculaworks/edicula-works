"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSprints } from "@/hooks/useSprints"
import { useProjetos } from "@/hooks/useProjetos"
import type { Sprint } from "@/types"
import { 
  Plus, 
  Play, 
  CheckCircle, 
  Trash2, 
  Calendar,
  Target,
  Flag,
  X,
  AlertCircle,
  History,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

const EMPRESA_ID = 1

type StatusSprint = "planejada" | "ativa" | "concluida" | "cancelada"

const statusConfig: Record<StatusSprint, { cor: string; label: string }> = {
  planejada: { cor: "#6b7280", label: "Planejada" },
  ativa: { cor: "#22c55e", label: "Ativa" },
  concluida: { cor: "#3b82f6", label: "Concluída" },
  cancelada: { cor: "#ef4444", label: "Cancelada" },
}

export default function SprintsPage() {
  const { sprints, loading, createSprint, updateSprint, deleteSprint, iniciarSprint, concluirSprint, refetch } = useSprints({ empresaId: EMPRESA_ID })
  const { projetos } = useProjetos({ empresaId: EMPRESA_ID })
  
  const [showModal, setShowModal] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    nome: "",
    objetivo: "",
    projeto_id: undefined as number | undefined,
    data_inicio: "",
    data_fim: "",
    meta_pontos: undefined as number | undefined,
  })

  const handleOpenModal = (sprint?: Sprint) => {
    if (sprint) {
      setEditingSprint(sprint)
      setFormData({
        nome: sprint.nome,
        objetivo: sprint.objetivo || "",
        projeto_id: sprint.projeto_id,
        data_inicio: sprint.data_inicio,
        data_fim: sprint.data_fim,
        meta_pontos: sprint.meta_pontos,
      })
    } else {
      setEditingSprint(null)
      const today = new Date().toISOString().split("T")[0]
      const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      setFormData({
        nome: "",
        objetivo: "",
        projeto_id: undefined,
        data_inicio: today,
        data_fim: twoWeeksLater,
        meta_pontos: undefined,
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingSprint) {
        await updateSprint(editingSprint.id, formData)
      } else {
        await createSprint(formData)
      }
      setShowModal(false)
      setEditingSprint(null)
    } catch (err) {
      console.error("Erro ao salvar sprint:", err)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteSprint(id)
      setDeleteConfirm(null)
    } catch (err) {
      console.error("Erro ao deletar sprint:", err)
    }
  }

  const handleIniciar = async (id: number) => {
    try {
      await iniciarSprint(id)
    } catch (err) {
      console.error("Erro ao iniciar sprint:", err)
    }
  }

  const handleConcluir = async (id: number) => {
    try {
      await concluirSprint(id)
    } catch (err) {
      console.error("Erro ao concluir sprint:", err)
    }
  }

  const sprintAtiva = sprints.find(s => s.status === "ativa")
  const sprintsPlanejadas = sprints.filter(s => s.status === "planejada")
  const sprintsConcluidas = sprints.filter(s => s.status === "concluida")

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sprints</h1>
            <p className="text-[var(--foreground)]/60">Gerencie seus sprints e acompanhe o progresso</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sprints/historico">
              <Button variant="outline" className="gap-2">
                <History className="h-4 w-4" />
                Histórico
              </Button>
            </Link>
            <Button onClick={() => handleOpenModal()} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Sprint
            </Button>
          </div>
        </div>

        {/* Sprint Ativa */}
        {sprintAtiva && (
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Flag className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{sprintAtiva.nome}</h2>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${statusConfig[sprintAtiva.status].cor}20`, color: statusConfig[sprintAtiva.status].cor }}
                    >
                      {statusConfig[sprintAtiva.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground)]/60">
                    {new Date(sprintAtiva.data_inicio).toLocaleDateString("pt-BR")} - {new Date(sprintAtiva.data_fim).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{sprintAtiva.pontos_concluidos}</p>
                  <p className="text-xs text-[var(--foreground)]/60">Pontos Concluídos</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => handleConcluir(sprintAtiva.id)}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Concluir Sprint
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Sprints Planejadas */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Sprints Planejadas</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sprintsPlanejadas.map((sprint) => (
              <motion.div
                key={sprint.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-gray-500" />
                    <h4 className="font-semibold">{sprint.nome}</h4>
                  </div>
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${statusConfig[sprint.status].cor}20`, color: statusConfig[sprint.status].cor }}
                  >
                    {statusConfig[sprint.status].label}
                  </span>
                </div>

                {sprint.projeto_id && (
                  <p className="text-sm text-[var(--foreground)]/60 mb-2">
                    Projeto: {projetos.find(p => p.id === sprint.projeto_id)?.nome || "Não informado"}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-[var(--foreground)]/60 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(sprint.data_inicio).toLocaleDateString("pt-BR")} - {new Date(sprint.data_fim).toLocaleDateString("pt-BR")}
                  </div>
                  {sprint.meta_pontos && (
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {sprint.meta_pontos} pts
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleIniciar(sprint.id)}
                    disabled={!!sprintAtiva}
                    className="gap-1"
                  >
                    <Play className="h-3 w-3" />
                    Iniciar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleOpenModal(sprint)}
                    className="gap-1"
                  >
                    Editar
                  </Button>
                  {deleteConfirm === sprint.id ? (
                    <div className="flex items-center gap-1 ml-auto">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(sprint.id)}
                        className="h-7 px-2"
                      >
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirm(null)}
                        className="h-7 px-2"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setDeleteConfirm(sprint.id)}
                      className="ml-auto text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}

            {sprintsPlanejadas.length === 0 && (
              <div className="col-span-full text-center py-8 text-[var(--foreground)]/60">
                Nenhuma sprint planejada
              </div>
            )}
          </div>
        </div>

        {/* Sprints Concluídas */}
        {sprintsConcluidas.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Sprints Concluídas</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sprintsConcluidas.map((sprint) => (
                <div
                  key={sprint.id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 opacity-75"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Flag className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">{sprint.nome}</h4>
                    </div>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${statusConfig[sprint.status].cor}20`, color: statusConfig[sprint.status].cor }}
                    >
                      {statusConfig[sprint.status].label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-[var(--foreground)]/60 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(sprint.data_inicio).toLocaleDateString("pt-BR")} - {new Date(sprint.data_fim).toLocaleDateString("pt-BR")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-lg font-bold">{sprint.pontos_concluidos}</p>
                        <p className="text-xs text-[var(--foreground)]/60">pts concluídos</p>
                      </div>
                      {sprint.meta_pontos && (
                        <div>
                          <p className="text-lg font-bold">{Math.round((sprint.pontos_concluidos / sprint.meta_pontos) * 100)}%</p>
                          <p className="text-xs text-[var(--foreground)]/60">da meta</p>
                        </div>
                      )}
                    </div>
                    {deleteConfirm === sprint.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(sprint.id)}
                          className="h-7 px-2"
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(null)}
                          className="h-7 px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setDeleteConfirm(sprint.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Sprint */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-6">
                {editingSprint ? "Editar Sprint" : "Nova Sprint"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nome da Sprint</label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Sprint 1 - Janeiro"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Objetivo</label>
                  <textarea
                    value={formData.objetivo}
                    onChange={(e) => setFormData(prev => ({ ...prev, objetivo: e.target.value }))}
                    placeholder="Qual o objetivo desta sprint?"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] p-3 text-sm min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Projeto (opcional)</label>
                  <select
                    value={formData.projeto_id || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, projeto_id: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] p-2 text-sm"
                  >
                    <option value="">Nenhum projeto</option>
                    {projetos.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Data Início</label>
                    <Input
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Data Fim</label>
                    <Input
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Meta de Pontos (opcional)</label>
                  <Input
                    type="number"
                    value={formData.meta_pontos || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_pontos: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Pontos planejados"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!formData.nome || !formData.data_inicio || !formData.data_fim}>
                  {editingSprint ? "Salvar" : "Criar Sprint"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEventos, useTimeline, useEventosDoDia } from "@/hooks/useEventos"
import { useUsuarios } from "@/hooks/useUsuarios"
import type { Evento, TipoEvento } from "@/types"
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Video,
  Trash2,
  Edit,
  X,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const EMPRESA_ID = 1

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

const TIPOS_EVENTO: Record<TipoEvento, { cor: string; label: string; icon: string }> = {
  reuniao: { cor: "#8b5cf6", label: "Reunião", icon: "🔵" },
  visita: { cor: "#f97316", label: "Visita", icon: "🟠" },
  daily: { cor: "#3b82f6", label: "Daily", icon: "📅" },
  evento: { cor: "#22c55e", label: "Evento", icon: "🟢" },
  outro: { cor: "#6b7280", label: "Outro", icon: "⚪" },
}

function formatTime(timeStr: string | undefined): string {
  if (!timeStr) return ""
  return timeStr.slice(0, 5)
}

export default function CalendarioPage() {
  const [activeTab, setActiveTab] = useState<"calendario" | "timeline">("calendario")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null)
  
  // Filtros
  const [filterTipo, setFilterTipo] = useState<string>("")
  const [filterMembro, setFilterMembro] = useState<string>("")
  
  // Dados
  const { usuarios } = useUsuarios({ empresaId: EMPRESA_ID })
  
  // Calendário do mês
  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const dataInicio = `${year}-${String(month + 1).padStart(2, "0")}-01`
  const dataFim = `${year}-${String(month + 1).padStart(2, "0")}-${daysInMonth}`
  
  const { eventos, loading, createEvento, updateEvento, deleteEvento, refetch } = useEventos({
    empresaId: EMPRESA_ID,
    tipo: filterTipo || undefined,
    dataInicio: activeTab === "timeline" ? undefined : dataInicio,
    dataFim: activeTab === "timeline" ? undefined : dataFim,
  })
  
  // Timeline - últimos 30 dias
  const hoje = new Date()
  const dataTimelineInicio = new Date(hoje)
  dataTimelineInicio.setDate(dataTimelineInicio.getDate() - 30)
  const dataTimelineFim = new Date(hoje)
  dataTimelineFim.setDate(dataTimelineFim.getDate() + 60)
  
  const { eventos: timelineEventos } = useTimeline(
    dataTimelineInicio.toISOString().split("T")[0],
    dataTimelineFim.toISOString().split("T")[0],
    EMPRESA_ID,
    filterMembro || undefined
  )
  
  // Eventos do dia selecionado
  const eventosDoDia = useMemo(() => {
    if (!selectedDate) return []
    const dataSelecionada = selectedDate.toISOString().split("T")[0]
    return eventos.filter(e => e.data_inicio === dataSelecionada)
  }, [eventos, selectedDate])
  
  // Agrupar timeline por dia
  const timelinePorDia = useMemo(() => {
    const agrupado: Record<string, Evento[]> = {}
    timelineEventos.forEach(evento => {
      const dia = evento.data_inicio
      if (!agrupado[dia]) agrupado[dia] = []
      agrupado[dia].push(evento)
    })
    // Ordenar chaves
    return Object.entries(agrupado)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dia, evs]) => ({
        data: dia,
        eventos: evs.sort((a, b) => {
          if (!a.hora_inicio) return 1
          if (!b.hora_inicio) return -1
          return a.hora_inicio.localeCompare(b.hora_inicio)
        })
      }))
  }, [timelineEventos])

  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }, [firstDayOfMonth, daysInMonth])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const isToday = (day: number | null): boolean => {
    if (!day) return false
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const hasEvent = (day: number | null): boolean => {
    if (!day) return false
    const data = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return eventos.some(e => e.data_inicio === data)
  }

  const getEventsForDay = (day: number | null): Evento[] => {
    if (!day) return []
    const data = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return eventos.filter(e => e.data_inicio === data)
  }

  const openCreateModal = (dia?: number) => {
    setEditingEvento(null)
    if (dia) {
      const dataSelecionada = `${year}-${String(month + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
      setSelectedDate(new Date(year, month, dia))
    }
    setShowModal(true)
  }

  const openEditModal = (evento: Evento) => {
    setEditingEvento(evento)
    setShowModal(true)
  }

  const handleSaveEvento = async (data: any) => {
    try {
      if (editingEvento) {
        await updateEvento(editingEvento.id, data)
      } else {
        await createEvento({
          ...data,
          empresa_id: EMPRESA_ID,
        })
      }
      setShowModal(false)
      setEditingEvento(null)
    } catch (err) {
      console.error("Erro ao salvar evento:", err)
    }
  }

  const handleDeleteEvento = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return
    try {
      await deleteEvento(id)
      setShowModal(false)
      setEditingEvento(null)
    } catch (err) {
      console.error("Erro ao deletar evento:", err)
    }
  }

  const getUsuarioNome = (id: string) => {
    return usuarios.find(u => u.id === id)?.nome || "Desconhecido"
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Cronograma</h1>
            <p className="text-sm text-[var(--foreground)]/50">
              Reuniões, visitas, daily e eventos
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === "calendario" ? "default" : "outline"}
              onClick={() => setActiveTab("calendario")}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendário
            </Button>
            <Button 
              variant={activeTab === "timeline" ? "default" : "outline"}
              onClick={() => setActiveTab("timeline")}
            >
              <Clock className="h-4 w-4 mr-2" />
              Timeline
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4">
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
          >
            <option value="">Todos os tipos</option>
            {Object.entries(TIPOS_EVENTO).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            value={filterMembro}
            onChange={(e) => setFilterMembro(e.target.value)}
            className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
          >
            <option value="">Todos os membros</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </select>
        </div>

        {activeTab === "calendario" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendário */}
            <div className="lg:col-span-2 bento-item p-6">
              {/* Navegação */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {MESES[month]} {year}
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DIAS_SEMANA.map(dia => (
                  <div key={dia} className="text-center text-sm font-medium text-[var(--foreground)]/60 py-2">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Grid do calendário */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => day && setSelectedDate(new Date(year, month, day))}
                    className={cn(
                      "min-h-[80px] p-2 rounded-lg border border-[var(--border)] cursor-pointer transition-colors",
                      day && "hover:bg-[var(--surface-hover)]",
                      isToday(day) && "bg-[var(--primary)]/10 border-[var(--primary)]",
                      selectedDate?.getDate() === day && selectedDate?.getMonth() === month && "bg-[var(--primary)]/20 border-[var(--primary)]",
                      !day && "bg-transparent"
                    )}
                  >
                    {day && (
                      <>
                        <div className={cn(
                          "text-sm font-medium mb-1",
                          isToday(day) && "text-[var(--primary)]"
                        )}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {getEventsForDay(day).slice(0, 3).map(evento => (
                            <div
                              key={evento.id}
                              onClick={(e) => { e.stopPropagation(); openEditModal(evento) }}
                              className="text-xs px-1 py-0.5 rounded truncate cursor-pointer"
                              style={{ backgroundColor: `${evento.cor}20`, color: evento.cor }}
                            >
                              {evento.titulo}
                            </div>
                          ))}
                          {getEventsForDay(day).length > 3 && (
                            <div className="text-xs text-[var(--foreground)]/50">
                              +{getEventsForDay(day).length - 3}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Eventos do dia */}
            <div className="bento-item p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {selectedDate 
                    ? selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
                    : "Selecione um dia"
                  }
                </h3>
                {selectedDate && (
                  <Button size="sm" onClick={() => openCreateModal()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-8 text-[var(--foreground)]/50">Carregando...</div>
              ) : selectedDate ? (
                eventosDoDia.length > 0 ? (
                  <div className="space-y-3">
                    {eventosDoDia.map(evento => (
                      <div
                        key={evento.id}
                        onClick={() => openEditModal(evento)}
                        className="p-3 rounded-lg border border-[var(--border)] cursor-pointer hover:bg-[var(--surface-hover)]"
                        style={{ borderLeftColor: evento.cor, borderLeftWidth: 4 }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{evento.titulo}</h4>
                            {evento.hora_inicio && (
                              <p className="text-sm text-[var(--foreground)]/60">
                                {formatTime(evento.hora_inicio)}
                                {evento.hora_fim && ` - ${formatTime(evento.hora_fim)}`}
                              </p>
                            )}
                          </div>
                          <span 
                            className="text-xs px-2 py-0.5 rounded"
                            style={{ backgroundColor: `${evento.cor}20`, color: evento.cor }}
                          >
                            {TIPOS_EVENTO[evento.tipo as TipoEvento]?.label || evento.tipo}
                          </span>
                        </div>
                        {evento.local && (
                          <p className="text-xs text-[var(--foreground)]/50 mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {evento.local}
                          </p>
                        )}
                        {evento.participantes && evento.participantes.length > 0 && (
                          <p className="text-xs text-[var(--foreground)]/50 mt-1 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {evento.participantes.length} participante(s)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--foreground)]/50">
                    Nenhum evento neste dia
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-[var(--foreground)]/50">
                  Clique em um dia para ver os eventos
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Timeline View */
          <div className="bento-item p-6">
            <h2 className="text-xl font-semibold mb-6">Timeline</h2>
            {loading ? (
              <div className="text-center py-8 text-[var(--foreground)]/50">Carregando...</div>
            ) : timelinePorDia.length > 0 ? (
              <div className="space-y-6">
                {timelinePorDia.map(({ data, eventos }) => {
                  const dataObj = new Date(data)
                  const isToday = data === new Date().toISOString().split("T")[0]
                  
                  return (
                    <div key={data}>
                      <div className={cn(
                        "flex items-center gap-3 mb-3",
                        isToday && "text-[var(--primary)] font-semibold"
                      )}>
                        <div className={cn(
                          "w-16 text-center p-2 rounded-lg",
                          isToday ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-hover)]"
                        )}>
                          <div className="text-xs uppercase">
                            {dataObj.toLocaleDateString("pt-BR", { weekday: "short" })}
                          </div>
                          <div className="text-lg font-bold">
                            {dataObj.getDate()}
                          </div>
                        </div>
                        <div className="flex-1 border-t border-[var(--border)]" />
                      </div>
                      
                      <div className="space-y-3 ml-16">
                        {eventos.map(evento => (
                          <div
                            key={evento.id}
                            onClick={() => openEditModal(evento)}
                            className="flex gap-4 p-4 rounded-lg border border-[var(--border)] cursor-pointer hover:bg-[var(--surface-hover)]"
                          >
                            {evento.hora_inicio && (
                              <div className="text-sm font-medium text-[var(--foreground)]/60 w-16 shrink-0">
                                {formatTime(evento.hora_inicio)}
                              </div>
                            )}
                            <div 
                              className="w-1 rounded-full shrink-0"
                              style={{ backgroundColor: evento.cor }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{evento.titulo}</h4>
                                <span 
                                  className="text-xs px-2 py-0.5 rounded"
                                  style={{ backgroundColor: `${evento.cor}20`, color: evento.cor }}
                                >
                                  {TIPOS_EVENTO[evento.tipo as TipoEvento]?.label || evento.tipo}
                                </span>
                              </div>
                              {evento.descricao && (
                                <p className="text-sm text-[var(--foreground)]/60 mt-1">
                                  {evento.descricao}
                                </p>
                              )}
                              <div className="flex gap-4 mt-2 text-xs text-[var(--foreground)]/50">
                                {evento.hora_inicio && evento.hora_fim && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(evento.hora_inicio)} - {formatTime(evento.hora_fim)}
                                  </span>
                                )}
                                {evento.local && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {evento.local}
                                  </span>
                                )}
                                {evento.link_reuniao && (
                                  <span className="flex items-center gap-1 text-blue-500">
                                    <Video className="h-3 w-3" />
                                    Link
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--foreground)]/50">
                Nenhum evento encontrado
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Evento */}
      {showModal && (
        <EventoModal
          evento={editingEvento}
          defaultDate={selectedDate}
          onSave={handleSaveEvento}
          onDelete={editingEvento ? () => handleDeleteEvento(editingEvento.id) : undefined}
          onClose={() => { setShowModal(false); setEditingEvento(null) }}
          usuarios={usuarios}
        />
      )}
    </DashboardLayout>
  )
}

// Componente Modal de Evento
interface EventoModalProps {
  evento: Evento | null
  defaultDate: Date | null
  onSave: (data: any) => void
  onDelete?: () => void
  onClose: () => void
  usuarios: any[]
}

function EventoModal({ evento, defaultDate, onSave, onDelete, onClose, usuarios }: EventoModalProps) {
  const [formData, setFormData] = useState({
    titulo: evento?.titulo || "",
    descricao: evento?.descricao || "",
    tipo: evento?.tipo || "evento",
    data_inicio: evento?.data_inicio || defaultDate?.toISOString().split("T")[0] || "",
    hora_inicio: evento?.hora_inicio?.slice(0, 5) || "",
    hora_fim: evento?.hora_fim?.slice(0, 5) || "",
    local: evento?.local || "",
    link_reuniao: evento?.link_reuniao || "",
    cor: evento?.cor || "#3b82f6",
    recurrencia: evento?.recurrencia || "",
    participantes: evento?.participantes?.map(p => p.membro_id) || [] as string[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      hora_inicio: formData.hora_inicio || null,
      hora_fim: formData.hora_fim || null,
      recurrencia: formData.recurrencia || null,
      dia_semana_recurrencia: formData.recurrencia === "semanal" ? new Date(formData.data_inicio).getDay() : null,
    })
  }

  const toggleParticipante = (membroId: string) => {
    setFormData(prev => ({
      ...prev,
      participantes: prev.participantes.includes(membroId)
        ? prev.participantes.filter(id => id !== membroId)
        : [...prev.participantes, membroId]
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {evento ? "Editar Evento" : "Novo Evento"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-[var(--surface-hover)] rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Título</label>
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ex: Daily Standup"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo</label>
              <select
                value={formData.tipo}
                onChange={(e) => {
                  const tipo = e.target.value as TipoEvento
                  setFormData(prev => ({ 
                    ...prev, 
                    tipo,
                    cor: TIPOS_EVENTO[tipo]?.cor || prev.cor
                  }))
                }}
                className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
              >
                {Object.entries(TIPOS_EVENTO).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Data</label>
              <Input
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Hora Início</label>
              <Input
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Hora Fim</label>
              <Input
                type="time"
                value={formData.hora_fim}
                onChange={(e) => setFormData(prev => ({ ...prev, hora_fim: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Local</label>
              <Input
                value={formData.local}
                onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
                placeholder="Sala, endereço..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Link Reunião</label>
              <Input
                value={formData.link_reuniao}
                onChange={(e) => setFormData(prev => ({ ...prev, link_reuniao: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Recorrência</label>
            <select
              value={formData.recurrencia}
              onChange={(e) => setFormData(prev => ({ ...prev, recurrencia: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <option value="">Não se repete</option>
              <option value="diaria">Diariamente</option>
              <option value="semanal">Semanalmente</option>
              <option value="mensal">Mensalmente</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] min-h-[80px]"
              placeholder="Descrição do evento..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Participantes</label>
            <div className="flex flex-wrap gap-2">
              {usuarios.map(usuario => (
                <button
                  key={usuario.id}
                  type="button"
                  onClick={() => toggleParticipante(usuario.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm border transition-colors",
                    formData.participantes.includes(usuario.id)
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "border-[var(--border)] hover:border-[var(--primary)]"
                  )}
                >
                  {usuario.nome}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {evento && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete} className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 glow-button">
              {evento ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

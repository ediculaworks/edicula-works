"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Loader2
} from "lucide-react"

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

interface Tarefa {
  id: number
  titulo: string
  coluna: string
  prioridade: string
  status: string
  prazo?: string
  data_inicio?: string
}

const EMPRESA_ID = 1

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(true)
  const [tarefasDoDia, setTarefasDoDia] = useState<Tarefa[]>([])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  useEffect(() => {
    fetchTarefas()
  }, [year, month])

  useEffect(() => {
    if (selectedDate) {
      const diaSelecionado = selectedDate.toISOString().split('T')[0]
      const tarefasFiltradas = tarefas.filter(t => {
        if (!t.prazo) return false
        return t.prazo.startsWith(diaSelecionado)
      })
      setTarefasDoDia(tarefasFiltradas)
    }
  }, [selectedDate, tarefas])

  const fetchTarefas = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tarefas?empresa_id=${EMPRESA_ID}`)
      if (response.ok) {
        const data = await response.json()
        setTarefas(data)
      }
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error)
    } finally {
      setLoading(false)
    }
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDate(null)
    setTarefasDoDia([])
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDate(null)
    setTarefasDoDia([])
  }

  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const today = new Date()
  const isToday = (day: number | null): boolean => 
    day !== null &&
    day === today.getDate() && 
    month === today.getMonth() && 
    year === today.getFullYear()

  const hasTarefa = (day: number): boolean => {
    const data = new Date(year, month, day).toISOString().split('T')[0]
    return tarefas.some(t => t.prazo && t.prazo.startsWith(data))
  }

  const getTarefaPriorityColor = (prioridade: string): string => {
    switch (prioridade) {
      case 'urgente': return 'bg-red-500'
      case 'alta': return 'bg-orange-500'
      case 'media': return 'bg-yellow-500'
      case 'baixa': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const selectedDateStr = selectedDate 
    ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Calendário</h1>
            <p className="text-sm text-[var(--foreground)]/50">
              Visualize eventos e prazos das tarefas
            </p>
          </div>
          <Button className="glow-button">
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bento-item p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {MONTHS[month]} {year}
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

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-[var(--foreground)]/50 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      "aspect-square p-2 rounded-lg text-sm transition-colors cursor-pointer relative",
                      day === null && "invisible",
                      isToday(day) && "bg-[var(--primary)] text-white hover:bg-[var(--primary)]",
                      !isToday(day) && selectedDate?.getDate() === day && "bg-[var(--primary)]/20 border border-[var(--primary)]",
                      !isToday(day) && selectedDate?.getDate() !== day && "hover:bg-[var(--surface-hover)]"
                    )}
                    onClick={() => day && setSelectedDate(new Date(year, month, day))}
                  >
                    {day}
                    {day && hasTarefa(day) && (
                      <span className={cn(
                        "absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                        getTarefaPriorityColor(tarefas.find(t => t.prazo?.startsWith(new Date(year, month, day).toISOString().split('T')[0]))?.prioridade || 'baixa')
                      )} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Events for selected date */}
          <div className="bento-item p-6">
            <h3 className="font-semibold mb-4">
              {selectedDate ? selectedDateStr : 'Selecione uma data'}
            </h3>
            
            {!selectedDate ? (
              <div className="text-center py-8 text-[var(--foreground)]/50">
                Clique em uma data para ver as tarefas
              </div>
            ) : tarefasDoDia.length === 0 ? (
              <div className="text-center py-8 text-[var(--foreground)]/50">
                Nenhuma tarefa nesta data
              </div>
            ) : (
              <div className="space-y-3">
                {tarefasDoDia.map((tarefa) => (
                  <div 
                    key={tarefa.id}
                    className="p-3 bg-[var(--surface-hover)] rounded-lg border-l-4"
                    style={{ borderLeftColor: tarefa.prioridade === 'urgente' ? '#ef4444' : tarefa.prioridade === 'alta' ? '#f97316' : tarefa.prioridade === 'media' ? '#eab308' : '#22c55e' }}
                  >
                    <p className="font-medium text-sm">{tarefa.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        tarefa.prioridade === 'urgente' && "bg-red-500/10 text-red-500",
                        tarefa.prioridade === 'alta' && "bg-orange-500/10 text-orange-500",
                        tarefa.prioridade === 'media' && "bg-yellow-500/10 text-yellow-500",
                        tarefa.prioridade === 'baixa' && "bg-green-500/10 text-green-500"
                      )}>
                        {tarefa.prioridade}
                      </span>
                      <span className="text-xs text-[var(--foreground)]/50">{tarefa.coluna}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react"

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const today = new Date()
  const isToday = (day: number | null) => 
    day !== null &&
    day === today.getDate() && 
    month === today.getMonth() && 
    year === today.getFullYear()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Calendário</h1>
            <p className="text-sm text-[var(--foreground)]/50">
              Visualize eventos e prazos
            </p>
          </div>
          <Button className="glow-button">
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        </div>

        {/* Calendar */}
        <div className="bento-item p-6">
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
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div
                key={index}
                className={cn(
                  "aspect-square p-2 rounded-lg text-sm transition-colors cursor-pointer hover:bg-[var(--surface-hover)]",
                  day === null && "invisible",
                  isToday(day) && "bg-[var(--primary)] text-white hover:bg-[var(--primary)]",
                  selectedDate?.getDate() === day && "bg-[var(--primary)]/20 border border-[var(--primary)]"
                )}
                onClick={() => day && setSelectedDate(new Date(year, month, day))}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Events for selected date */}
        {selectedDate && (
          <div className="bento-item p-4">
            <h3 className="font-semibold mb-3">
              Eventos - {selectedDate.toLocaleDateString("pt-BR")}
            </h3>
            <div className="text-center py-8 text-[var(--foreground)]/50">
              Nenhum evento nesta data
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

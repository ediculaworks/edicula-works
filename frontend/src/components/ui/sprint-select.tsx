"use client"

import { useState } from "react"
import { ChevronDown, Check, Zap } from "lucide-react"
import { mockSprints, getSprintById } from "@/lib/mock-data"
import type { Sprint } from "@/types"
import { cn } from "@/lib/utils"

interface SprintSelectProps {
  value: number | null
  onChange: (sprintId: number | null) => void
  placeholder?: string
  className?: string
}

export function SprintSelect({ value, onChange, placeholder = "Selecionar...", className }: SprintSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedSprint = value ? getSprintById(value) : null

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-2 text-sm transition-all hover:border-[var(--border-hover)]"
      >
        <span className={value ? "" : "text-[var(--foreground)]/50"}>
          {selectedSprint ? (
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[var(--accent)]" />
              {selectedSprint.nome}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] py-1 shadow-xl">
            {mockSprints.map((sprint) => (
              <button
                key={sprint.id}
                type="button"
                onClick={() => {
                  onChange(sprint.id)
                  setIsOpen(false)
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-hover)]",
                  value === sprint.id && "bg-[var(--primary-glow)]"
                )}
              >
                <Zap className="h-4 w-4" style={{ 
                  color: sprint.status === "ativa" ? "var(--primary)" : "var(--foreground)/50" 
                }} />
                <span className="flex-1 text-left">{sprint.nome}</span>
                <span className="text-xs text-[var(--foreground)]/50">
                  {sprint.status === "ativa" ? "Ativa" : sprint.status === "concluida" ? "Concluída" : "Planejada"}
                </span>
                {value === sprint.id && <Check className="h-4 w-4 text-[var(--primary)]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { ChevronDown, Check, Folder } from "lucide-react"
import type { Grupo } from "@/types"
import { cn } from "@/lib/utils"

interface GroupSelectProps {
  value: number | null
  onChange: (groupId: number | null) => void
  grupos?: Grupo[]
  placeholder?: string
  className?: string
}

export function GroupSelect({ value, onChange, grupos = [], placeholder = "Selecionar...", className }: GroupSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedGroup = value ? grupos.find(g => g.id === value) : null

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-2 text-sm transition-all hover:border-[var(--border-hover)]"
      >
        <span className={value ? "" : "text-[var(--foreground)]/50"}>
          {selectedGroup ? (
            <span className="flex items-center gap-2">
              <span 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: selectedGroup.cor }}
              />
              {selectedGroup.nome}
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
            {grupos.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  onChange(group.id)
                  setIsOpen(false)
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-hover)]",
                  value === group.id && "bg-[var(--primary-glow)]"
                )}
              >
                <span 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: group.cor }}
                />
                <span className="flex-1 text-left">{group.nome}</span>
                {value === group.id && <Check className="h-4 w-4 text-[var(--primary)]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

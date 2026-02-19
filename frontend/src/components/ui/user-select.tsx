"use client"

import { useState } from "react"
import { ChevronDown, Check, User } from "lucide-react"
import { mockUsuarios, getUsuarioById } from "@/lib/mock-data"
import type { Usuario } from "@/types"
import { cn } from "@/lib/utils"

interface UserSelectProps {
  value: number | null
  onChange: (userId: number | null) => void
  placeholder?: string
  className?: string
}

export function UserSelect({ value, onChange, placeholder = "Selecionar...", className }: UserSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedUser = value ? getUsuarioById(value) : null

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-2 text-sm transition-all hover:border-[var(--border-hover)]"
      >
        <span className={value ? "" : "text-[var(--foreground)]/50"}>
          {selectedUser ? (
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-xs font-bold text-white">
                {selectedUser.nome.charAt(0)}
              </span>
              {selectedUser.nome}
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
            {mockUsuarios.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  onChange(user.id)
                  setIsOpen(false)
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-hover)]",
                  value === user.id && "bg-[var(--primary-glow)]"
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-xs font-bold text-white">
                  {user.nome.charAt(0)}
                </span>
                <span className="flex-1 text-left">{user.nome}</span>
                <span className="text-xs text-[var(--foreground)]/50">{user.cargo}</span>
                {value === user.id && <Check className="h-4 w-4 text-[var(--primary)]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

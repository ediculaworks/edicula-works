"use client"

import { useUIStore } from "@/stores/ui-store"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Menu, Bell, Search, Plus } from "lucide-react"

export function Header() {
  const { setSidebarOpen } = useUIStore()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/60 px-4 backdrop-blur-xl">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search - desktop */}
      <div className="hidden flex-1 md:block md:max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/40" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2 pl-10 pr-4 text-sm"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <Button className="glow-button hidden sm:flex">
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--error)]" />
        </Button>

        <ThemeToggle />

        <div className="ml-2 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]" />
        </div>
      </div>
    </header>
  )
}

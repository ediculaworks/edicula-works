"use client"

import { useUIStore } from "@/stores/ui-store"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Menu, Bell } from "lucide-react"

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

      {/* Spacer for desktop */}
      <div className="hidden md:block md:flex-1 md:max-w-md" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--error)]" />
        </Button>

        <ThemeToggle />
      </div>
    </header>
  )
}

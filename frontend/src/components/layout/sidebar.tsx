"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/stores/ui-store"
import {
  LayoutDashboard,
  Kanban,
  ListTodo,
  FileText,
  Wallet,
  FolderKanban,
  Calendar,
  Activity,
  Settings,
  MessageSquare,
  X,
  ChevronLeft,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/kanban", label: "Kanban", icon: Kanban },
  { href: "/tarefas", label: "Tarefas", icon: ListTodo },
  { href: "/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/contratos", label: "Contratos", icon: FileText },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/calendario", label: "Calendário", icon: Calendar },
  { href: "/monitor", label: "Monitor", icon: Activity },
  { href: "/settings", label: "Configurações", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-200",
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[var(--primary)]" />
            <span className="font-semibold">EdiculaWorks</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 hover:bg-[var(--surface-hover)] md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-[var(--foreground)]/60 hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Collapse button (desktop) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute bottom-4 right-4 hidden rounded-md border border-[var(--border)] bg-[var(--surface)] p-1 md:block"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </aside>
    </>
  )
}

"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useUIStore } from "@/stores/ui-store"
import { cn } from "@/lib/utils"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-200",
          "md:ml-16",
          !sidebarCollapsed && "md:ml-64"
        )}
      >
        <Header />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

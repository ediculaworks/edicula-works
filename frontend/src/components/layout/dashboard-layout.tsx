"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useUIStore } from "@/stores/ui-store"
import { cn } from "@/lib/utils"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--background)]">
      <Sidebar />
      <div
        className={cn(
          "flex h-full flex-col transition-all duration-200",
          "md:ml-16",
          !sidebarCollapsed && "md:ml-64"
        )}
      >
        <Header />
        <main className="flex-1 overflow-hidden p-4 md:p-6">
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

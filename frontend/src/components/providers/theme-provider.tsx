"use client"

import { useEffect } from "react"
import { useUIStore } from "@/stores/ui-store"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  return <>{children}</>
}

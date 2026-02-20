"use client"

import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { motion, AnimatePresence } from "framer-motion"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PageTransitionWrapper>
        {children}
      </PageTransitionWrapper>
    </ThemeProvider>
  )
}

function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Desabilitar transições na página de login
  const isLoginPage = pathname === "/login"

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

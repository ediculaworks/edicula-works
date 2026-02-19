import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'
type Agente = 'chief' | 'tech' | 'gestao' | 'financeiro' | 'security' | 'ops'

interface UIState {
  theme: Theme
  sidebarOpen: boolean
  agenteSelecionado: Agente
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setAgenteSelecionado: (agente: Agente) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      agenteSelecionado: 'chief',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setAgenteSelecionado: (agente) => set({ agenteSelecionado: agente }),
    }),
    {
      name: 'edicula-ui-storage',
    }
  )
)

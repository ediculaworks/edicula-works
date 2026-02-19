// Mock data for development
// These will be replaced with API calls later

import type { Usuario, Grupo, Sprint } from "@/types"

// Mock Users
export const mockUsuarios: Usuario[] = [
  { id: 1, nome: "Lucas", email: "lucas@edicula.com", cargo: "Tech Lead", role: "admin", ativo: true },
  { id: 2, nome: "Ana", email: "ana@edicula.com", cargo: "Desenvolvedora", role: "member", ativo: true },
  { id: 3, nome: "Carlos", email: "carlos@edicula.com", cargo: "Designer", role: "member", ativo: true },
  { id: 4, nome: "Maria", email: "maria@edicula.com", cargo: "PM", role: "manager", ativo: true },
  { id: 5, nome: "João", email: "joao@edicula.com", cargo: "QA", role: "member", ativo: true },
]

// Mock Groups
export const mockGrupos: Grupo[] = [
  { id: 1, empresa_id: 1, nome: "Frontend", descricao: "Equipe de Frontend", cor: "#3b82f6", icone: "layout", ativo: true, ordem: 1, created_at: "", updated_at: "" },
  { id: 2, empresa_id: 1, nome: "Backend", descricao: "Equipe de Backend", cor: "#8b5cf6", icone: "server", ativo: true, ordem: 2, created_at: "", updated_at: "" },
  { id: 3, empresa_id: 1, nome: "Infra", descricao: "Equipe de Infraestrutura", cor: "#10b981", icone: "cloud", ativo: true, ordem: 3, created_at: "", updated_at: "" },
  { id: 4, empresa_id: 1, nome: "Design", descricao: "Equipe de Design", cor: "#f59e0b", icone: "palette", ativo: true, ordem: 4, created_at: "", updated_at: "" },
]

// Mock Tags
export const mockTags = [
  { id: "frontend", label: "frontend", cor: "#3b82f6" },
  { id: "backend", label: "backend", cor: "#8b5cf6" },
  { id: "infra", label: "infra", cor: "#10b981" },
  { id: "bug", label: "bug", cor: "#ef4444" },
  { id: "feature", label: "feature", cor: "#f59e0b" },
  { id: "docs", label: "docs", cor: "#06b6d4" },
  { id: "ux", label: "ux", cor: "#ec4899" },
  { id: "api", label: "api", cor: "#6366f1" },
]

// Mock Sprints
export const mockSprints: Sprint[] = [
  { id: 1, empresa_id: 1, nome: "Sprint 12", objetivo: "Finalizar dashboard", data_inicio: "2026-02-17", data_fim: "2026-03-02", status: "ativa", meta_pontos: 34, pontos_concluidos: 21, ordem: 12, created_at: "", updated_at: "" },
  { id: 2, empresa_id: 1, nome: "Sprint 13", objetivo: "Implementar tarefas", data_inicio: "2026-03-03", data_fim: "2026-03-17", status: "planejada", meta_pontos: 40, pontos_concluidos: 0, ordem: 13, created_at: "", updated_at: "" },
]

// Helper functions
export function getUsuarioById(id: number): Usuario | undefined {
  return mockUsuarios.find(u => u.id === id)
}

export function getGrupoById(id: number): Grupo | undefined {
  return mockGrupos.find(g => g.id === id)
}

export function getTagById(id: string) {
  return mockTags.find(t => t.id === id)
}

export function getSprintById(id: number): Sprint | undefined {
  return mockSprints.find(s => s.id === id)
}

export function getUsuariosByIds(ids: number[]): Usuario[] {
  return ids.map(id => getUsuarioById(id)).filter((u): u is Usuario => u !== undefined)
}

"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatRelative } from "@/lib/date-utils"
import type { Agente } from "@/types"
import {
  Send,
  Bot,
  User,
  Loader2,
  ChevronDown,
} from "lucide-react"

interface Mensagem {
  id: number
  role: "user" | "assistant"
  conteudo: string
  created_at: string
}

const agentes: { id: Agente; nome: string; descricao: string; cor: string }[] = [
  { id: "chief", nome: "Chief", descricao: "Coordenador geral", cor: "#22c55e" },
  { id: "tech", nome: "Tech Lead", descricao: "Desenvolvimento e código", cor: "#3b82f6" },
  { id: "gestao", nome: "Gestão", descricao: "Tarefas e projetos", cor: "#f59e0b" },
  { id: "financeiro", nome: "Financeiro", descricao: "Finanças e contratos", cor: "#8b5cf6" },
  { id: "security", nome: "Security", descricao: "Segurança", cor: "#ef4444" },
  { id: "ops", nome: "Ops", descricao: "Infraestrutura", cor: "#06b6d4" },
]

export default function ChatPage() {
  const [agenteSelecionado, setAgenteSelecionado] = useState<Agente>("chief")
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showAgents, setShowAgents] = useState(false)

  const agente = agentes.find((a) => a.id === agenteSelecionado)!

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const mensagemUser: Mensagem = {
      id: Date.now(),
      role: "user",
      conteudo: input,
      created_at: new Date().toISOString(),
    }

    setMensagens((prev) => [...prev, mensagemUser])
    setInput("")
    setLoading(true)

    // Simular resposta (aqui você integraria com a API real)
    setTimeout(() => {
      const mensagemIA: Mensagem = {
        id: Date.now() + 1,
        role: "assistant",
        conteudo: `Entendi sua mensagem sobre "${input}". Como posso ajudar você com isso?`,
        created_at: new Date().toISOString(),
      }
      setMensagens((prev) => [...prev, mensagemIA])
      setLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-7rem)] gap-4">
        {/* Lista de Agentes - Desktop */}
        <div className="hidden w-64 flex-col gap-2 md:flex">
          <h2 className="mb-2 text-sm font-semibold">Agentes</h2>
          {agentes.map((ag) => (
            <button
              key={ag.id}
              onClick={() => setAgenteSelecionado(ag.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg p-3 text-left transition-colors",
                agenteSelecionado === ag.id
                  ? "bg-[var(--surface-hover)]"
                  : "hover:bg-[var(--surface-hover)]"
              )}
            >
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: ag.cor + "20" }}
              >
                <Bot className="h-5 w-5" style={{ color: ag.cor }} />
              </div>
              <div>
                <p className="font-medium">{ag.nome}</p>
                <p className="text-xs text-[var(--foreground)]/60">{ag.descricao}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Área de Chat */}
        <div className="flex flex-1 flex-col">
          {/* Header do agente */}
          <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center md:hidden"
                style={{ backgroundColor: agente.cor + "20" }}
              >
                <Bot className="h-5 w-5" style={{ color: agente.cor }} />
              </div>
              <div>
                <h2 className="font-semibold">{agente.nome}</h2>
                <p className="text-xs text-[var(--foreground)]/60">{agente.descricao}</p>
              </div>
            </div>

            {/* Selector mobile */}
            <div className="relative md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAgents(!showAgents)}
                className="gap-2"
              >
                <Bot className="h-4 w-4" />
                <ChevronDown className="h-4 w-4" />
              </Button>
              {showAgents && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg">
                  {agentes.map((ag) => (
                    <button
                      key={ag.id}
                      onClick={() => {
                        setAgenteSelecionado(ag.id)
                        setShowAgents(false)
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md p-2 text-left text-sm",
                        agenteSelecionado === ag.id && "bg-[var(--surface-hover)]"
                      )}
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: ag.cor }}
                      />
                      {ag.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mensagens */}
          <Card className="flex-1 overflow-hidden border-0 bg-transparent shadow-none">
            <CardContent className="flex h-full flex-col justify-end gap-4 p-4">
              {mensagens.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center text-[var(--foreground)]/60">
                    <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Como posso ajudar você hoje?</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 overflow-y-auto">
                  {mensagens.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        msg.role === "user" && "flex-row-reverse"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          msg.role === "user"
                            ? "bg-[var(--primary)]"
                            : "bg-[var(--accent)]"
                        )}
                      >
                        {msg.role === "user" ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg p-3",
                          msg.role === "user"
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "bg-[var(--surface)]"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.conteudo}</p>
                        <p className="mt-1 text-xs opacity-60">
                          {formatRelative(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-[var(--surface)] p-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Pensando...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Input */}
          <div className="border-t border-[var(--border)] p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1"
                disabled={loading}
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

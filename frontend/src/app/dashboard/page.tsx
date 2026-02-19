"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-[var(--foreground)]/60">Visão geral da sua empresa</p>
        </div>

        {/* Métricas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tarefas Abertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-[var(--foreground)]/60">+2 desde ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 45.000</div>
              <p className="text-xs text-[var(--foreground)]/60">+12% desde mês passado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-[var(--foreground)]/60">3 expiram em 30 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-[var(--foreground)]/60">2 em andamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Atividades Recentes */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Setup API", status: "done", time: "2h atrás" },
                  { title: "Criar schema DB", status: "done", time: "3h atrás" },
                  { title: "Implementar rotas", status: "in_progress", time: "5h atrás" },
                  { title: "Testar conexão", status: "todo", time: "1 dia atrás" },
                ].map((task, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          task.status === "done"
                            ? "bg-[var(--success)]"
                            : task.status === "in_progress"
                            ? "bg-[var(--warning)]"
                            : "bg-[var(--border)]"
                        }`}
                      />
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <span className="text-xs text-[var(--foreground)]/40">{task.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividade dos Agentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { agent: "TechLead", action: "Analisou código...", time: "10 min" },
                  { agent: "Chief", action: "Entendeu pedido...", time: "15 min" },
                  { agent: "Financeiro", action: "Calculou métricas...", time: "1 h" },
                  { agent: "Gestao", action: "Atualizou tarefas...", time: "2 h" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-[var(--accent)]" />
                      <div>
                        <span className="text-sm font-medium">{activity.agent}</span>
                        <p className="text-xs text-[var(--foreground)]/60">{activity.action}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--foreground)]/40">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

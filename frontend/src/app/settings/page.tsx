"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Save
} from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("perfil")

  const tabs = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "seguranca", label: "Segurança", icon: Shield },
    { id: "aparencia", label: "Aparência", icon: Palette },
    { id: "sistema", label: "Sistema", icon: Globe },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-sm text-[var(--foreground)]/50">
            Gerencie suas preferências
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                  activeTab === tab.id 
                    ? "bg-[var(--primary)] text-white" 
                    : "hover:bg-[var(--surface-hover)]"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 bento-item p-6">
            {activeTab === "perfil" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Perfil</h2>
                
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-2xl font-bold text-white">
                    L
                  </div>
                  <Button variant="outline">Alterar foto</Button>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label>Nome</Label>
                    <Input defaultValue="Lucas Drummond" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input defaultValue="lucas.drummondpv@gmail.com" type="email" />
                  </div>
                  <div>
                    <Label>Cargo</Label>
                    <Input defaultValue="Administrador" />
                  </div>
                </div>

                <Button className="glow-button">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </div>
            )}

            {activeTab === "notificacoes" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Notificações</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-[var(--foreground)]/50">Receba notificações por email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Tarefas</p>
                      <p className="text-sm text-[var(--foreground)]/50">Notificações de tarefas</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Projetos</p>
                      <p className="text-sm text-[var(--foreground)]/50">Atualizações de projetos</p>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "seguranca" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Segurança</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label>Senha atual</Label>
                    <Input type="password" />
                  </div>
                  <div>
                    <Label>Nova senha</Label>
                    <Input type="password" />
                  </div>
                  <div>
                    <Label>Confirmar senha</Label>
                    <Input type="password" />
                  </div>
                </div>

                <Button className="glow-button">
                  <Save className="mr-2 h-4 w-4" />
                  Alterar senha
                </Button>
              </div>
            )}

            {activeTab === "aparencia" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Aparência</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label>Tema</Label>
                    <select className="w-full mt-1 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                      <option>Escuro</option>
                      <option>Claro</option>
                      <option>Automático</option>
                    </select>
                  </div>
                  <div>
                    <Label>Idioma</Label>
                    <select className="w-full mt-1 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                      <option>Português (Brasil)</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sistema" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Sistema</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--surface-hover)] rounded-lg">
                    <p className="font-medium">EdiculaWorks</p>
                    <p className="text-sm text-[var(--foreground)]/50">Versão 1.0.0</p>
                  </div>
                  
                  <div className="p-4 bg-[var(--surface-hover)] rounded-lg">
                    <p className="font-medium">Frontend</p>
                    <p className="text-sm text-[var(--foreground)]/50">Next.js 16</p>
                  </div>
                  
                  <div className="p-4 bg-[var(--surface-hover)] rounded-lg">
                    <p className="font-medium">Backend</p>
                    <p className="text-sm text-[var(--foreground)]/50">FastAPI + Python</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

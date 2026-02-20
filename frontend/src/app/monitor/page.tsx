"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { 
  Activity, 
  Server, 
  Database, 
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Clock
} from "lucide-react"

export default function MonitorPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Monitor</h1>
          <p className="text-sm text-[var(--foreground)]/50">
            Monitoramento do sistema
          </p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bento-item p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">Online</p>
                <p className="text-xs text-[var(--foreground)]/50">Status</p>
              </div>
            </div>
          </div>

          <div className="bento-item p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Server className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-[var(--foreground)]/50">Containers</p>
              </div>
            </div>
          </div>

          <div className="bento-item p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">Supabase</p>
                <p className="text-xs text-[var(--foreground)]/50">Banco</p>
              </div>
            </div>
          </div>

          <div className="bento-item p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">99.9%</p>
                <p className="text-xs text-[var(--foreground)]/50">Uptime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Usage */}
        <div className="bento-item p-6">
          <h2 className="text-lg font-semibold mb-4">Recursos</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  CPU
                </span>
                <span>45%</span>
              </div>
              <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                <div className="h-full w-[45%] bg-blue-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4" />
                  Memória
                </span>
                <span>62%</span>
              </div>
              <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                <div className="h-full w-[62%] bg-purple-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Disco
                </span>
                <span>28%</span>
              </div>
              <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                <div className="h-full w-[28%] bg-green-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Rede
                </span>
                <span>12%</span>
              </div>
              <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                <div className="h-full w-[12%] bg-yellow-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* API Health */}
        <div className="bento-item p-6">
          <h2 className="text-lg font-semibold mb-4">Serviços</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg">
              <span>API</span>
              <span className="flex items-center gap-2 text-green-500">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg">
              <span>Frontend</span>
              <span className="flex items-center gap-2 text-green-500">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg">
              <span>Supabase</span>
              <span className="flex items-center gap-2 text-green-500">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

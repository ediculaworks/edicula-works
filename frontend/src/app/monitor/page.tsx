"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { api, SystemStats, SystemHealth } from "@/lib/api"
import { Skeleton, StatsSkeleton } from "@/components/ui/skeleton"
import { 
  Activity, 
  Server, 
  Database, 
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Clock,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

export default function MonitorPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, healthData] = await Promise.all([
          api.getSystemStats(),
          api.getSystemHealth()
        ])
        setStats(statsData)
        setHealth(healthData)
      } catch (err) {
        setError("Erro ao carregar dados do sistema")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <StatsSkeleton />
          <div className="bento-item p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Monitor</h1>
            <p className="text-sm text-[var(--foreground)]/50">
              Monitoramento do sistema
            </p>
          </div>
          <div className="bento-item p-8 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-sm text-[var(--foreground)]/50 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="glow-button">
              Tentar novamente
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const cpuPercent = stats?.cpu.percent ?? 0
  const memPercent = stats?.memory.percent ?? 0
  const diskPercent = stats?.disk.percent ?? 0

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
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${health?.status === 'healthy' ? 'bg-green-500/10' : health?.status === 'warning' ? 'bg-yellow-500/10' : 'bg-red-500/10'}`}>
                <Activity className={`h-5 w-5 ${health?.status === 'healthy' ? 'text-green-500' : health?.status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold capitalize">{health?.status || 'Unknown'}</p>
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
                <p className="text-2xl font-bold">{stats?.cpu.count || 0}</p>
                <p className="text-xs text-[var(--foreground)]/50">CPUs</p>
              </div>
            </div>
          </div>

          <div className="bento-item p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{health?.services?.database || 'N/A'}</p>
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
                <p className="text-2xl font-bold">{stats?.uptime?.boot_time ? 'Online' : 'N/A'}</p>
                <p className="text-xs text-[var(--foreground)]/50">Sistema</p>
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
                <span>{cpuPercent.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${cpuPercent > 80 ? 'bg-red-500' : cpuPercent > 60 ? 'bg-yellow-500' : 'bg-blue-500'}`} 
                  style={{ width: `${cpuPercent}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4" />
                  Memória
                </span>
                <span>{memPercent.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${memPercent > 80 ? 'bg-red-500' : memPercent > 60 ? 'bg-yellow-500' : 'bg-purple-500'}`} 
                  style={{ width: `${memPercent}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Disco
                </span>
                <span>{diskPercent.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${diskPercent > 90 ? 'bg-red-500' : diskPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                  style={{ width: `${diskPercent}%` }} 
                />
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
              <span className={`flex items-center gap-2 ${health?.services?.api === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                <span className={`h-2 w-2 rounded-full ${health?.services?.api === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                {health?.services?.api || 'unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg">
              <span>Frontend</span>
              <span className={`flex items-center gap-2 ${health?.services?.frontend === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                <span className={`h-2 w-2 rounded-full ${health?.services?.frontend === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                {health?.services?.frontend || 'unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg">
              <span>Supabase</span>
              <span className={`flex items-center gap-2 ${health?.services?.database === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                <span className={`h-2 w-2 rounded-full ${health?.services?.database === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                {health?.services?.database || 'unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

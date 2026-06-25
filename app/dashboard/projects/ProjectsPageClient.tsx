'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { V2Project, ProjectStatusV2 } from '@/types/database'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

import { ProjectDTO } from './actions'
import { DollarSign, Briefcase, CheckCircle, AlertTriangle, TrendingUp, Timer } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DashboardAlerts } from '@/components/dashboard/DashboardAlerts'
import { OperationalStats } from '@/components/dashboard/OperationalStats'

interface ProjectsPageClientProps {
  initialProjects: ProjectDTO[]
  clients: { id: string; name: string }[]
  team: { id: string; full_name: string }[]
  currentUserRole?: string
}

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'paused', label: 'Pausados' },
  { value: 'completed', label: 'Finalizados' },
  { value: 'archived', label: 'Inativos' },
]

export function ProjectsPageClient({ initialProjects, clients, team, currentUserRole }: ProjectsPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const newParam = searchParams.get('new')
  const templateIdParam = searchParams.get('templateId')

  useEffect(() => {
    if (newParam === 'true') {
      router.push('/dashboard/projects/new')
    } else if (templateIdParam) {
      router.push(`/dashboard/projects/new?templateId=${templateIdParam}`)
    }
  }, [newParam, templateIdParam, router])

  // Operational Metrics calculation
  const totalActive = initialProjects.filter(p => p.status === 'active' || p.status === 'paused').length
  const inProgress = initialProjects.filter(p => p.status === 'active').length
  
  const completedThisMonth = initialProjects.filter(p => {
    if (p.status !== 'completed' || !p.completed_at) return false
    const completedDate = new Date(p.completed_at)
    const now = new Date()
    return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear()
  }).length

  const completedLastMonth = initialProjects.filter(p => {
    if (p.status !== 'completed' || !p.completed_at) return false
    const completedDate = new Date(p.completed_at)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    return completedDate.getMonth() === lastMonth.getMonth() && completedDate.getFullYear() === lastMonth.getFullYear()
  }).length

  const completedTrend = completedLastMonth > 0 
    ? (completedThisMonth >= completedLastMonth ? 'up' : 'down') 
    : 'neutral'
  const completedTrendValue = completedLastMonth > 0
    ? `${Math.abs(Math.round(((completedThisMonth - completedLastMonth) / completedLastMonth) * 100))}% vs mês ant.`
    : null

  const delayedProjectsCount = initialProjects.filter(p => {
    if (p.status === 'completed' || !p.deadline) return false
    return new Date() > new Date(p.deadline)
  }).length

  const filtered = initialProjects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.clients?.name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesType = typeFilter === 'all' || p.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusCount = (status: string) => {
    if (status === 'all') return initialProjects.length
    return initialProjects.filter(p => p.status === status).length
  }

  return (
    <>
      <DashboardAlerts projects={initialProjects} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <MetricCard 
          label="Projetos Ativos" 
          value={totalActive} 
          icon={Briefcase} 
          description={`${inProgress} em andamento`}
          accent="info"
        />
        <MetricCard 
          label="Concluídos (Mês)" 
          value={completedThisMonth} 
          icon={CheckCircle} 
          description="Total finalizado este mês"
          accent="success"
          trend={completedTrend}
          trendValue={completedTrendValue || undefined}
        />
        <MetricCard 
          label="Projetos Atrasados" 
          value={delayedProjectsCount} 
          icon={AlertTriangle} 
          description="Ação imediata necessária"
          accent={delayedProjectsCount > 0 ? "danger" : "default"}
          featured={delayedProjectsCount > 0}
        />
      </div>

      <OperationalStats projects={initialProjects} team={team} />

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou cliente..."
            className="pl-10 h-10 w-full rounded-full transition-all duration-200 glass-pill hover:bg-white/40 dark:hover:bg-black/40 focus-visible:ring-2 focus-visible:ring-brand-primary/30 outline-none"
            id="projects-search"
          />
        </div>
        <div className="flex items-center gap-4">
          {/* Segmented Control de Status */}
          <div className="flex p-[3px] bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-full shadow-inner items-center overflow-x-auto hide-scrollbar">
            {STATUS_FILTER_OPTIONS.map((opt) => {
              const count = getStatusCount(opt.value)
              const isActive = statusFilter === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    'flex items-center justify-center px-4 h-8 rounded-full text-[13px] transition-all duration-300 ease-apple whitespace-nowrap',
                    isActive 
                      ? 'bg-white dark:bg-white/10 text-text-primary shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none ring-1 ring-black/5 dark:ring-white/10 font-bold'
                      : 'text-text-secondary hover:text-text-primary font-medium hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  {opt.label} ({count})
                </button>
              )
            })}
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-4 glass-pill rounded-full text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300 ease-apple"
            id="projects-type-filter"
            aria-label="Filtrar por tipo"
          >
            <option value="all">Tipos (Todos)</option>
            <option value="one_time">Único</option>
            <option value="recurring">Recorrente</option>
          </select>
          
          {['admin', 'gestor', 'social_seller', 'ceo'].includes(currentUserRole || '') && (
            <Button 
              onClick={() => router.push('/dashboard/projects/new')}
              className="h-10 px-6 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black shadow-xl shadow-brand-primary/20 flex items-center gap-2 active:scale-[0.97] transition-all duration-300 ease-apple shrink-0"
            >
              <Plus size={16} />
              Novo Projeto
            </Button>
          )}
        </div>
      </div>

      {filtered.length !== initialProjects.length && (
        <p className="text-xs text-text-muted mb-5">
          Mostrando {filtered.length} de {initialProjects.length} projetos
        </p>
      )}

      <div className="glass-card-super pb-4">
        <ProjectsTable
          projects={filtered}
          onEdit={(project) => router.push(`/dashboard/projects/${project.id}/edit`)}
        />
      </div>
    </>
  )
}

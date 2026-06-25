'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { V2Project, ProjectStatusV2 } from '@/types/database'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'

import { ProjectDTO } from './actions'
import { DollarSign, Briefcase, CheckCircle, AlertTriangle, TrendingUp, Timer } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DashboardAlerts } from '@/components/dashboard/DashboardAlerts'
import { OperationalStats } from '@/components/dashboard/OperationalStats'

interface ProjectsPageClientProps {
  initialProjects: ProjectDTO[]
  clients: { id: string; name: string }[]
  team: { id: string; full_name: string }[]
}

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'paused', label: 'Pausados' },
  { value: 'completed', label: 'Finalizados' },
  { value: 'archived', label: 'Arquivados' },
]

export function ProjectsPageClient({ initialProjects, clients, team }: ProjectsPageClientProps) {
  const searchParams = useSearchParams()
  const templateIdParam = searchParams.get('templateId')

  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const newParam = searchParams.get('new')

  useEffect(() => {
    if (templateIdParam || newParam === 'true') {
      setShowModal(true)
    }
  }, [templateIdParam, newParam])

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
            className="pl-10 h-10 w-full rounded-full transition-all duration-200 bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/[0.07] dark:hover:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-brand-primary/30"
            id="projects-search"
          />
        </div>
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 bg-black/5 dark:bg-white/5 border-transparent rounded-full text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300 ease-apple"
            id="projects-status-filter"
            aria-label="Filtrar por status"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-4 bg-black/5 dark:bg-white/5 border-transparent rounded-full text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300 ease-apple"
            id="projects-type-filter"
            aria-label="Filtrar por tipo"
          >
            <option value="all">Tipos (Todos)</option>
            <option value="one_time">Único</option>
            <option value="recurring">Recorrente</option>
          </select>
          <Button onClick={() => setShowModal(true)} className="h-10 px-6 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black shadow-xl shadow-brand-primary/20 flex items-center gap-2 active:scale-[0.97] transition-all duration-300 ease-apple">
            <Plus size={18} />
            Novo Projeto
          </Button>
        </div>
      </div>

      {filtered.length !== initialProjects.length && (
        <p className="text-xs text-text-muted mb-5">
          Mostrando {filtered.length} de {initialProjects.length} projetos
        </p>
      )}

      <div className="rounded-[2rem] bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-none overflow-hidden pb-4 mt-5">
        <ProjectsTable projects={filtered} clients={clients} team={team} />
      </div>

      {showModal && (
        <ProjectModal
          clients={clients}
          team={team}
          onClose={() => setShowModal(false)}
          templateId={templateIdParam || undefined}
        />
      )}
    </>
  )
}

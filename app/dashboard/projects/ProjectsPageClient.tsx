'use client'

import { useState } from 'react'
import { V2Project, ProjectStatusV2 } from '@/types/database'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'

import { DollarSign, Briefcase, RefreshCw, AlertTriangle } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'

type ProjectWithRelations = V2Project & {
  clients: { name: string } | null
  profiles: { full_name: string } | null
  project_type?: 'one_time' | 'recurring'
  amount?: number
}

interface ProjectsPageClientProps {
  initialProjects: ProjectWithRelations[]
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
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Metrics calculation
  const totalProjects = initialProjects.length
  const activeProjects = initialProjects.filter(p => p.status === 'active').length
  const recurringRevenue = initialProjects
    .filter(p => p.project_type === 'recurring' && p.status === 'active')
    .reduce((acc, p) => acc + (p.amount || 0), 0)
  const totalMonthlyValue = initialProjects
    .filter(p => p.status === 'active')
    .reduce((acc, p) => acc + (p.amount || 0), 0)

  const filtered = initialProjects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.clients?.name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesType = typeFilter === 'all' || p.project_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard 
          label="Total de Projetos" 
          value={totalProjects} 
          icon={Briefcase} 
          description={`${activeProjects} ativos agora`}
          accent="info"
        />
        <MetricCard 
          label="Receita Mensal (Estimada)" 
          value={`R$ ${totalMonthlyValue.toLocaleString('pt-BR')}`} 
          icon={DollarSign} 
          description="Total de projetos ativos"
          accent="success"
        />
        <MetricCard 
          label="MRR (Recorrente)" 
          value={`R$ ${recurringRevenue.toLocaleString('pt-BR')}`} 
          icon={RefreshCw} 
          description="Apenas contratos recorrentes"
          featured
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou cliente..."
            className="pl-9 h-11"
            id="projects-search"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 text-sm rounded-xl border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
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
            className="h-11 px-4 text-sm rounded-xl border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm"
            id="projects-type-filter"
            aria-label="Filtrar por tipo"
          >
            <option value="all">Tipos (Todos)</option>
            <option value="one_time">Único</option>
            <option value="recurring">Recorrente</option>
          </select>
          <Button onClick={() => setShowModal(true)} className="h-11 px-6 flex items-center gap-2 rounded-xl shadow-brand/20 hover:shadow-brand/30 transition-all">
            <Plus size={18} />
            Novo Projeto
          </Button>
        </div>
      </div>

      {filtered.length !== initialProjects.length && (
        <p className="text-xs text-text-muted mb-4">
          Mostrando {filtered.length} de {initialProjects.length} projetos
        </p>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden mt-4">
        <ProjectsTable projects={filtered} clients={clients} team={team} />
      </div>

      {showModal && (
        <ProjectModal
          clients={clients}
          team={team}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

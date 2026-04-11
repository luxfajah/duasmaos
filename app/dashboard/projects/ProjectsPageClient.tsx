'use client'

import { useState } from 'react'
import { V2Project, ProjectStatusV2 } from '@/types/database'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'

type ProjectWithRelations = V2Project & {
  clients: { name: string } | null
  profiles: { full_name: string } | null
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

  const filtered = initialProjects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.clients?.name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou cliente..."
            className="pl-9"
            id="projects-search"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          id="projects-status-filter"
          aria-label="Filtrar por status"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 flex-shrink-0">
          <Plus size={16} />
          Novo Projeto
        </Button>
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

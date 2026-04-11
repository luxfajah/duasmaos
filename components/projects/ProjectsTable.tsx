'use client'

import { useState } from 'react'
import { V2Project, ProjectStatusV2 } from '@/types/database'
import { updateProjectStatus, deleteProject } from '@/app/dashboard/projects/actions'
import { ProjectModal } from './ProjectModal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, ExternalLink, Clock } from 'lucide-react'
import Link from 'next/link'

type ProjectWithRelations = V2Project & {
  clients: { name: string } | null
  profiles: { full_name: string } | null
  deadline?: string | null
  priority?: string | null
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Ativo', variant: 'default' },
  paused: { label: 'Pausado', variant: 'destructive' },
  completed: { label: 'Concluído', variant: 'default' },
  archived: { label: 'Arquivado', variant: 'outline' },
}

const priorityMap: Record<string, string> = {
  low: '↓ Baixa',
  medium: '→ Média',
  high: '↑ Alta',
  urgent: '⚡ Urgente',
}

interface ProjectsTableProps {
  projects: ProjectWithRelations[]
  clients: { id: string; name: string }[]
  team: { id: string; full_name: string }[]
}

export function ProjectsTable({ projects, clients, team }: ProjectsTableProps) {
  const [editingProject, setEditingProject] = useState<ProjectWithRelations | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return
    setDeletingId(id)
    try {
      await deleteProject(id)
    } catch {
      alert('Erro ao excluir projeto.')
    } finally {
      setDeletingId(null)
    }
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <p className="text-text-secondary font-medium">Nenhum projeto cadastrado</p>
        <p className="text-text-muted text-sm mt-1">Crie seu primeiro projeto para começar.</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Projeto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const cfg = statusConfig[project.status] ?? { label: project.status, variant: 'outline' as const }
            const isOverdue =
              project.deadline && new Date(project.deadline) < new Date() && project.status !== ('completed' as any)
            return (
              <TableRow key={project.id} className="group">
                <TableCell className="font-medium text-text-primary max-w-[200px] truncate">
                  {project.name}
                </TableCell>
                <TableCell className="text-text-secondary">{project.clients?.name ?? '—'}</TableCell>
                <TableCell className="text-text-secondary">{project.profiles?.full_name ?? '—'}</TableCell>
                <TableCell className="text-text-secondary text-sm">{priorityMap[project.priority ?? ''] ?? project.priority ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </TableCell>
                <TableCell>
                  {project.deadline ? (
                    <span className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-status-danger font-medium' : 'text-text-secondary'}`}>
                      {isOverdue && <Clock size={12} />}
                      {new Date(project.deadline).toLocaleDateString('pt-BR')}
                    </span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ExternalLink size={14} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setEditingProject(project)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-status-danger hover:text-status-danger hover:bg-status-danger/10"
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {editingProject && (
        <ProjectModal
          project={editingProject}
          clients={clients}
          team={team}
          onClose={() => setEditingProject(null)}
        />
      )}
    </>
  )
}

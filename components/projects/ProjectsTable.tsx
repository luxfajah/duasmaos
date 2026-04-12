'use client'

import { useState } from 'react'
import { V2Project, ProjectStatusV2 } from '@/types/database'
import { updateProjectStatus, deleteProject, ProjectDTO } from '@/app/dashboard/projects/actions'
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
import { Progress } from '@/components/ui/progress'
import { RefreshCw, User, DollarSign, CheckCircle2, AlertCircle, Clock, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'



const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
  active: { label: 'Em Andamento', variant: 'default' },
  paused: { label: 'Pausado', variant: 'warning' as const },
  completed: { label: 'Concluído', variant: 'success' as const },
  archived: { label: 'Arquivado', variant: 'outline' },
}

const priorityMap: Record<string, string> = {
  low: '↓ Baixa',
  medium: '→ Média',
  high: '↑ Alta',
  urgent: '⚡ Urgente',
}

interface ProjectsTableProps {
  projects: ProjectDTO[]
  clients: { id: string; name: string }[]
  team: { id: string; full_name: string }[]
}

export function ProjectsTable({ projects, clients, team }: ProjectsTableProps) {
  const [editingProject, setEditingProject] = useState<ProjectDTO | null>(null)
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
          <TableRow className="hover:bg-transparent border-b border-border">
            <TableHead className="w-[200px]">Projeto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Status / Progresso</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor / Financeiro</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const cfg = statusConfig[project.status] ?? { label: project.status, variant: 'outline' as const }
            const isOverdue =
              project.deadline && new Date(project.deadline) < new Date() && project.status !== ('completed' as any)
            
            const progress = project.progress ?? 0
            const amount = project.amount || 0
            const isRecurring = project.type === 'recurring'
            const paymentStatus = project.revenues?.some(r => r.status === 'paid') ? 'paid' : 'pending'

            // Dynamic status adjustment for display
            let finalLabel = cfg.label
            let finalVariant = cfg.variant

            if (project.status === 'active' && progress === 0) {
              finalLabel = 'Não Iniciado'
              finalVariant = 'secondary'
            } else if (project.status === 'completed' && progress < 100) {
              // Highlight inconsistency if project is marked completed but progress is low
              finalVariant = 'warning'
            }

            return (
              <TableRow key={project.id} className="group hover:bg-surface-muted/50 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-text-primary text-sm truncate">{project.name}</span>
                    <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">{priorityMap[project.priority ?? ''] ?? project.priority ?? '—'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-text-secondary text-sm">{project.clients?.name ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5 min-w-[120px]">
                    <div className="flex items-center justify-between">
                      <Badge variant={finalVariant as any} className="text-[10px] h-5">{finalLabel}</Badge>
                      <span className="text-[10px] font-bold text-text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>
                </TableCell>
                <TableCell className="text-text-secondary text-sm">{project.profiles?.full_name ?? '—'}</TableCell>
                <TableCell>
                  {isRecurring ? (
                    <Badge variant="outline" className="gap-1 text-deep-blue border-deep-blue/20 bg-deep-blue/5">
                      <RefreshCw size={10} /> Recorrente
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-text-muted">
                      <User size={10} /> Único
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-primary tabular-nums">R$ {amount.toLocaleString('pt-BR')}</span>
                    {paymentStatus === 'paid' ? (
                      <span className="text-[10px] text-olive font-bold flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> Pago
                      </span>
                    ) : (
                      <span className="text-[10px] text-terracotta font-bold flex items-center gap-0.5">
                        <AlertCircle size={10} /> Pendente
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {project.deadline ? (
                    <span className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-status-danger font-medium' : 'text-text-secondary'}`}>
                      <Clock size={12} className={isOverdue ? 'text-status-danger' : 'text-text-muted'} />
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

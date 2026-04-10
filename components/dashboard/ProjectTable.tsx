import React from 'react'
import { ExtendedProject } from '@/app/dashboard/projects/actions'
import { StatusBadge, BadgeVariant } from '@/components/ui/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/ui/avatar'
import { PROJECT_STATUS_LABELS } from '@/types/database'

function getHealthVariant(score: number): BadgeVariant {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

function getHealthLabel(score: number): string {
  if (score >= 80) return 'Saudável';
  if (score >= 50) return 'Atenção';
  return 'Crítico';
}

export function ProjectTable({ projects }: { projects: ExtendedProject[] }) {
  if (projects.length === 0) {
    return (
      <div className="bg-surface rounded-sm shadow-md p-8 text-center text-text-muted">
        Nenhum projeto ativo no momento.
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-sm shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary whitespace-nowrap">
          <thead className="bg-surface-muted text-[10px] font-bold uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-6 py-3.5">Nome do Projeto</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Saúde</th>
              <th className="px-6 py-3.5">Integrantes</th>
              <th className="px-6 py-3.5 w-48">Progresso</th>
              <th className="px-6 py-3.5">Prazo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-surface-muted/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-text-primary text-sm">{project.name}</span>
                    <span className="text-[11px] text-text-muted mt-0.5">{project.clients?.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge 
                    label={PROJECT_STATUS_LABELS[project.status] || project.status} 
                    variant={project.status === 'completed' || project.status === 'approved' ? 'success' : project.status === 'delayed' ? 'danger' : 'info'} 
                  />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge 
                    label={getHealthLabel(project.health_score)} 
                    variant={getHealthVariant(project.health_score)} 
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex -space-x-2">
                    {project.profiles && (
                      <Avatar 
                        name={project.profiles.full_name} 
                        src={project.profiles.avatar_url ?? undefined} 
                        size="sm" 
                        className="ring-2 ring-surface group-hover:ring-surface-muted/30 transition-all" 
                      />
                    )}
                    {/* Placeholder for others if not array in DB structure currently */}
                    {!project.profiles && <span className="text-xs text-text-muted">Unassigned</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold w-9 text-right text-text-primary">{project.progress}%</span>
                    <Progress value={project.progress} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-text-primary">
                    {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

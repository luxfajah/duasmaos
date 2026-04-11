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

// Dot color per health score
function getHealthDotColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export function ProjectTable({ projects }: { projects: ExtendedProject[] }) {
  if (projects.length === 0) {
    return (
      <div className="bg-surface rounded-xl shadow-sm p-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
            <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-text-muted">Nenhum projeto ativo no momento.</p>
        <p className="text-xs text-text-muted/60 mt-1">Crie um novo projeto para começar.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary whitespace-nowrap">
          <thead>
            <tr className="border-b border-border/60">
              <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                <span className="block">Nome do Projeto</span>
              </th>
              <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Status</th>
              <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Saúde</th>
              <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Equipe</th>
              <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-muted w-48">Progresso</th>
              <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Prazo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="hover:bg-surface-muted/40 transition-all duration-150 group hover:-translate-y-px"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {/* Color health dot */}
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getHealthDotColor(project.health_score)}`} />
                    <div className="flex flex-col">
                      <span className="font-bold text-text-primary text-sm group-hover:text-brand-highlight transition-colors duration-150">
                        {project.name}
                      </span>
                      <span className="text-[11px] text-text-muted mt-0.5">{project.clients?.name}</span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge
                    label={PROJECT_STATUS_LABELS[project.status] || project.status}
                    variant={project.status === 'completed' || project.status === 'approved' ? 'success' : project.status === 'delayed' ? 'danger' : 'info'}
                  />
                </td>
                <td className="px-5 py-4">
                  <StatusBadge
                    label={getHealthLabel(project.health_score)}
                    variant={getHealthVariant(project.health_score)}
                  />
                </td>
                <td className="px-5 py-4">
                  <div className="flex -space-x-2">
                    {project.profiles && (
                      <Avatar
                        name={project.profiles.full_name}
                        src={project.profiles.avatar_url ?? undefined}
                        size="sm"
                        className="ring-2 ring-surface group-hover:ring-surface-muted/40 transition-all"
                      />
                    )}
                    {!project.profiles && (
                      <span className="text-xs text-text-muted italic">Não atribuído</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold w-9 text-right text-text-primary tabular-nums">
                      {project.progress}%
                    </span>
                    <Progress value={project.progress} />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs font-semibold text-text-primary">
                    {project.deadline ? new Date(project.deadline).toLocaleDateString('pt-BR') : 'A definir'}
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

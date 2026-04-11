import React from 'react'
import { ExtendedProject } from '@/app/dashboard/projects/actions'
import { StatusBadge, BadgeVariant } from '@/components/ui/StatusBadge'
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

/* Duas Mãos palette health dots */
function getHealthDot(score: number): string {
  if (score >= 80) return 'bg-olive';          /* Olive — healthy */
  if (score >= 50) return 'bg-yellow';         /* Warm Yellow — attention */
  return 'bg-terracotta';                      /* Terracotta — critical */
}

function getProgressColor(score: number): string {
  if (score >= 80) return 'bg-olive';
  if (score >= 50) return 'bg-yellow';
  return 'bg-terracotta';
}

export function ProjectTable({ projects }: { projects: ExtendedProject[] }) {
  if (projects.length === 0) {
    return (
      <div className="bg-surface-elevated rounded-2xl shadow-sm border border-sand-dark/40 p-12 text-center">
        {/* Empty state organic illustration */}
        <div className="w-16 h-16 rounded-2xl bg-sand flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 9h20M4 14h20M4 19h12" stroke="hsl(222 10% 58%)" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
          {/* Doodle accent */}
          <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-brand-primary/10" />
        </div>
        <p className="text-sm font-bold font-heading text-text-muted">Nenhum projeto ativo no momento.</p>
        <p className="text-xs text-text-muted/60 mt-1.5 font-body">Crie um novo projeto para começar.</p>
        <button className="mt-5 px-4 py-2 text-xs font-bold font-heading text-brand-primary border border-brand-primary/25 rounded-lg hover:bg-terracotta-soft transition-colors">
          + Novo Projeto
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated rounded-2xl shadow-sm border border-sand-dark/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary whitespace-nowrap">
          <thead>
            <tr className="border-b border-sand-dark/50">
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted font-body">
                Nome do Projeto
              </th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted font-body">Status</th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted font-body">Saúde</th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted font-body">Equipe</th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted font-body w-52">Progresso</th>
              <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted font-body">Prazo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/70">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="hover:bg-sand/50 transition-all duration-150 group cursor-pointer"
              >
                {/* Project name */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getHealthDot(project.health_score)}`} />
                    <div className="flex flex-col">
                      <span className="font-bold font-heading text-text-primary text-sm group-hover:text-brand-primary transition-colors duration-150">
                        {project.name}
                      </span>
                      <span className="text-[11px] text-text-muted mt-0.5 font-body">{project.clients?.name}</span>
                    </div>
                  </div>
                </td>

                {/* Status badge */}
                <td className="px-5 py-4">
                  <StatusBadge
                    label={PROJECT_STATUS_LABELS[project.status] || project.status}
                    variant={
                      project.status === 'completed' || project.status === 'approved'
                        ? 'success'
                        : project.status === 'delayed'
                          ? 'danger'
                          : 'info'
                    }
                  />
                </td>

                {/* Health badge */}
                <td className="px-5 py-4">
                  <StatusBadge
                    label={getHealthLabel(project.health_score)}
                    variant={getHealthVariant(project.health_score)}
                  />
                </td>

                {/* Team */}
                <td className="px-5 py-4">
                  <div className="flex -space-x-2">
                    {project.profiles && (
                      <Avatar
                        name={project.profiles.full_name}
                        src={project.profiles.avatar_url ?? undefined}
                        size="sm"
                        className="ring-2 ring-surface-elevated group-hover:ring-sand/80 transition-all"
                      />
                    )}
                    {!project.profiles && (
                      <span className="text-xs text-text-muted italic font-body">Não atribuído</span>
                    )}
                  </div>
                </td>

                {/* Progress */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-heading w-9 text-right text-text-primary tabular-nums">
                      {project.progress}%
                    </span>
                    {/* Custom progress bar — brand palette */}
                    <div className="flex-1 h-1.5 bg-sand rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressColor(project.health_score)} transition-all duration-700`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Deadline */}
                <td className="px-5 py-4">
                  <span className="text-xs font-semibold font-body text-text-primary">
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString('pt-BR')
                      : 'A definir'}
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

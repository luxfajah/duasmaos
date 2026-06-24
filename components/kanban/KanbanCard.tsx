import { KanbanProject, ProjectStatusV2 } from '@/types/database'
import { Clock, User, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const priorityColors: Record<string, string> = {
  low: 'border-l-status-info',
  medium: 'border-l-status-warning',
  high: 'border-l-status-danger',
  urgent: 'border-l-brand-accent',
}

interface KanbanCardProps {
  project: KanbanProject
}

export function KanbanCard({ project }: KanbanCardProps) {
  const isOverdue =
    project.deadline &&
    new Date(project.deadline) < new Date() &&
    project.status !== 'completed'

  const priorityBorder = priorityColors[project.priority ?? ''] ?? 'border-l-border'

  return (
    <div
      className={`
        group relative bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border border-black/[0.04] dark:border-white/[0.06] rounded-2xl p-4 shadow-sm cursor-grab active:cursor-grabbing
        hover:-translate-y-0.5 hover:shadow-md hover:border-black/[0.08] dark:hover:border-white/[0.12] transition-all duration-300 ease-apple
        border-l-4 ${priorityBorder}
      `}
    >
      {/* Project name */}
      <p className="font-medium text-text-primary text-sm leading-snug mb-3 line-clamp-2">
        {project.name}
      </p>

      {/* Client */}
      <p className="text-xs text-text-muted mb-3 truncate">
        {project.clients?.name ?? '—'}
      </p>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Owner */}
        {project.profiles?.full_name ? (
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <User size={11} />
            {project.profiles.full_name.split(' ')[0]}
          </span>
        ) : (
          <span />
        )}

        {/* Deadline */}
        {project.deadline ? (
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              isOverdue ? 'text-status-danger' : 'text-text-muted'
            }`}
          >
            {isOverdue && <AlertCircle size={11} />}
            {!isOverdue && <Clock size={11} />}
            {new Date(project.deadline).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
            })}
          </span>
        ) : null}
      </div>
    </div>
  )
}

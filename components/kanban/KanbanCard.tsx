'use client'

import { Project, ProjectStatus } from '@/types/database'
import { Clock, User, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type KanbanProject = Project & {
  clients: { name: string }
  profiles: { full_name: string } | null
}

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

  const priorityBorder = priorityColors[project.priority] ?? 'border-l-border'

  return (
    <div
      className={`
        group relative bg-surface border border-border rounded-lg p-4 shadow-sm cursor-grab active:cursor-grabbing
        hover:border-border-strong hover:shadow-md transition-all duration-150
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

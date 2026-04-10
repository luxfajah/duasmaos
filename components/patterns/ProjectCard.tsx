import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Clock, AlertCircle, User, ArrowRight } from 'lucide-react'

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */

export type ProjectStatus =
  | 'briefing'
  | 'production'
  | 'review'
  | 'approved'
  | 'completed'
  | 'paused'
  | 'cancelled'

export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface ProjectCardProps {
  id: string
  name: string
  clientName: string
  status: ProjectStatus
  priority?: ProjectPriority
  deadline?: string | Date | null
  assigneeName?: string
  assigneeSrc?: string
  href?: string
  className?: string
  /** Número de tarefas concluídas */
  completedTasks?: number
  /** Número total de tarefas */
  totalTasks?: number
}

/* ─────────────────────────────────────────
   CONFIG
───────────────────────────────────────── */

const statusConfig: Record<
  ProjectStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }
> = {
  briefing: { label: 'Briefing', variant: 'info' },
  production: { label: 'Produção', variant: 'pending' },
  review: { label: 'Em Revisão', variant: 'warning' },
  approved: { label: 'Aprovado', variant: 'success' },
  completed: { label: 'Concluído', variant: 'success-solid' },
  paused: { label: 'Pausado', variant: 'draft' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
}

const priorityBorder: Record<ProjectPriority, string> = {
  low: 'border-l-status-info',
  medium: 'border-l-status-warning',
  high: 'border-l-status-danger',
  urgent: 'border-l-brand-accent',
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */

export function ProjectCard({
  id,
  name,
  clientName,
  status,
  priority = 'medium',
  deadline,
  assigneeName,
  assigneeSrc,
  href,
  completedTasks,
  totalTasks,
  className,
}: ProjectCardProps) {
  const config = statusConfig[status]
  const borderClass = priorityBorder[priority]

  const isOverdue =
    deadline &&
    new Date(deadline) < new Date() &&
    status !== 'completed' &&
    status !== 'cancelled'

  const deadlineDate = deadline ? new Date(deadline) : null
  const progress =
    totalTasks && totalTasks > 0
      ? Math.round((completedTasks ?? 0) / totalTasks * 100)
      : null

  const Wrapper = href ? Link : 'div'
  const wrapperProps = href ? { href } : {}

  return (
    <Wrapper
      {...(wrapperProps as any)}
      data-slot="project-card"
      className={cn(
        'group flex flex-col gap-4 rounded-xl bg-surface border border-border p-5',
        'border-l-4 transition-all duration-200',
        'hover:border-border-strong hover:shadow-md hover:-translate-y-0.5',
        href && 'cursor-pointer',
        borderClass,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 truncate">
            {clientName}
          </p>
          <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
            {name}
          </h3>
        </div>
        <Badge variant={config.variant} className="shrink-0">
          {config.label}
        </Badge>
      </div>

      {/* Progress bar (se tiver tarefas) */}
      {progress !== null && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>Progresso</span>
            <span className="font-medium">{completedTasks}/{totalTasks}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Assignee */}
        {assigneeName ? (
          <Avatar
            name={assigneeName}
            src={assigneeSrc}
            size="xs"
            variant="muted"
            title={assigneeName}
          />
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
            <User size={10} />
            Sem responsável
          </span>
        )}

        {/* Deadline */}
        {deadlineDate ? (
          <span
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              isOverdue ? 'text-status-danger' : 'text-text-muted'
            )}
          >
            {isOverdue ? <AlertCircle size={11} /> : <Clock size={11} />}
            {deadlineDate.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
            })}
          </span>
        ) : null}

        {href && (
          <ArrowRight
            size={14}
            className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
          />
        )}
      </div>
    </Wrapper>
  )
}

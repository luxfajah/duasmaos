'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Clock, AlertCircle } from 'lucide-react'

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */

export type KanbanStatus =
  | 'briefing'
  | 'production'
  | 'review'
  | 'approved'
  | 'completed'
  | 'paused'

export type KanbanPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface KanbanCardProps {
  id: string
  name: string
  clientName: string
  status: KanbanStatus
  priority?: KanbanPriority
  deadline?: string | Date | null
  assigneeName?: string
  assigneeSrc?: string
  className?: string
  onClick?: () => void
}

/* ─────────────────────────────────────────
   CONFIG
───────────────────────────────────────── */

const priorityBorder: Record<KanbanPriority, string> = {
  low: 'border-l-status-info',
  medium: 'border-l-status-warning',
  high: 'border-l-status-danger',
  urgent: 'border-l-brand-accent',
}

const priorityLabel: Record<KanbanPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
}

const priorityVariant: Record<KanbanPriority, React.ComponentProps<typeof Badge>['variant']> = {
  low: 'info',
  medium: 'warning',
  high: 'danger',
  urgent: 'accent',
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */

export function KanbanCard({
  id,
  name,
  clientName,
  status,
  priority = 'medium',
  deadline,
  assigneeName,
  assigneeSrc,
  className,
  onClick,
}: KanbanCardProps) {
  const borderClass = priorityBorder[priority]

  const isOverdue =
    deadline &&
    new Date(deadline) < new Date() &&
    status !== 'completed'

  const deadlineDate = deadline ? new Date(deadline) : null

  return (
    <div
      role="button"
      tabIndex={0}
      data-slot="kanban-card"
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={cn(
        'group relative flex flex-col gap-3 rounded-lg glass-panel p-4',
        'border-l-4 transition-all duration-150',
        'hover:border-border-strong hover:shadow-md',
        'cursor-grab active:cursor-grabbing active:shadow-lg active:scale-[1.02]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50',
        borderClass,
        className
      )}
    >
      {/* Client label */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted truncate">
        {clientName}
      </p>

      {/* Project name */}
      <p className="font-medium text-text-primary text-sm leading-snug line-clamp-2">
        {name}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Priority badge */}
          <Badge variant={priorityVariant[priority]}>
            {priorityLabel[priority]}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Deadline */}
          {deadlineDate && (
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
          )}

          {/* Assignee */}
          {assigneeName && (
            <Avatar
              name={assigneeName}
              src={assigneeSrc}
              size="xs"
              variant="muted"
              title={assigneeName}
            />
          )}
        </div>
      </div>

      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-brand-primary/10" />
    </div>
  )
}

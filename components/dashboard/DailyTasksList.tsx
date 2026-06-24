'use client'

import React from 'react'
import { CheckCircle2, Circle, CalendarDays, ExternalLink, Play } from 'lucide-react'
import { Task } from '@/types/database'
import { cn } from '@/lib/utils'

interface DailyTasksListProps {
  tasks: Task[]
}

/* ─────────────────────────────────────────
   PRIORITY CONFIG
───────────────────────────────────────── */
const priorityConfig = {
  urgent: {
    label: 'Urgente',
    badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30',
    cardClass: 'task-card-urgent',
    dot: 'bg-red-500',
  },
  high: {
    label: 'Alta',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30',
    cardClass: 'task-card-high',
    dot: 'bg-amber-500',
  },
  medium: {
    label: 'Média',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30',
    cardClass: 'task-card-medium',
    dot: 'bg-blue-500',
  },
  low: {
    label: 'Baixa',
    badgeClass: 'bg-surface-muted text-text-muted border-border',
    cardClass: 'task-card-low',
    dot: 'bg-text-muted/40',
  },
}

/* ─────────────────────────────────────────
   MINI AVATAR — generates from initials
───────────────────────────────────────── */
const avatarColors = [
  'bg-terracotta-soft text-terracotta-dark',
  'bg-deep-blue-soft text-deep-blue',
  'bg-olive-soft text-olive-dark',
  'bg-yellow-soft text-yellow-dark',
]
function MiniAvatar({ name, index = 0 }: { name: string; index?: number }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
  const color = avatarColors[index % avatarColors.length]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold font-heading',
        'ring-2 ring-surface-elevated',
        color
      )}
      title={name}
    >
      {initials}
    </span>
  )
}

/* ─────────────────────────────────────────
   FORMAT DATE
───────────────────────────────────────── */
function formatDeadline(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/* ─────────────────────────────────────────
   TASK CARD
───────────────────────────────────────── */
function TaskCard({ task, index }: { task: Task; index: number }) {
  const isDone = task.status === 'done'
  const priority = (task.priority as keyof typeof priorityConfig) ?? 'medium'
  const pc = priorityConfig[priority] ?? priorityConfig.medium
  const deadline = formatDeadline(task.deadline ?? null)

  // Generate representative avatars from project id (deterministic)
  const mockNames = ['Ana S.', 'Bruno M.', 'Carla R.']
  const numAvatars = (parseInt(task.project_id.slice(0, 4), 16) % 2) + 1
  const avatarNames = mockNames.slice(0, numAvatars)

  return (
    <div
      className={cn(
        'task-card p-5',
        pc.cardClass,
        isDone && 'opacity-55',
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top row — title + priority badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          {/* Done toggle */}
          <button
            className="shrink-0 mt-0.5 text-text-muted hover:text-brand-primary transition-colors duration-150 hover:scale-110"
            aria-label={isDone ? 'Marcar como pendente' : 'Marcar como concluída'}
          >
            {isDone
              ? <CheckCircle2 size={18} className="text-emerald-500" />
              : <Circle size={18} className="hover:text-brand-primary/60 transition-colors" />
            }
          </button>

          {/* Title */}
          <h3 className={cn(
            'text-sm font-bold font-heading leading-snug flex-1',
            isDone ? 'text-text-muted line-through' : 'text-text-primary'
          )}>
            {task.title}
          </h3>
        </div>

        {/* Priority badge */}
        <span className={cn(
          'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border',
          pc.badgeClass
        )}>
          {pc.label}
        </span>
      </div>

      {/* Middle — project context */}
      <div className="ml-[26px] mb-4">
        <p className="text-xs text-text-muted font-body leading-relaxed">
          Projeto{' '}
          <span className="text-text-secondary font-semibold">
            #{task.project_id.slice(0, 8)}
          </span>
        </p>
      </div>

      {/* Bottom row — avatars + deadline + CTA */}
      <div className="flex items-center justify-between gap-3 ml-[26px]">
        {/* Avatar stack */}
        <div className="flex items-center gap-2">
          <div className="avatar-stack flex flex-row gap-[-6px]">
            {avatarNames.map((name, i) => (
              <MiniAvatar key={name} name={name} index={i} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Deadline */}
          {deadline && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted font-body">
              <CalendarDays size={11} strokeWidth={2} />
              {deadline}
            </span>
          )}

          {/* CTA */}
          {!isDone && (
            <button className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold font-heading',
              'bg-brand-primary/8 text-brand-primary border border-brand-primary/20',
              'hover:bg-brand-primary hover:text-white hover:border-brand-primary',
              'transition-all duration-200 hover:shadow-md hover:shadow-brand-primary/20',
              'hover:-translate-y-0.5'
            )}>
              <Play size={10} strokeWidth={2.5} />
              Iniciar
            </button>
          )}
          {isDone && (
            <button className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold font-heading',
              'bg-brand-primary/10 text-brand-primary',
              'hover:bg-brand-primary/20',
              'transition-all duration-200'
            )}>
              <ExternalLink size={10} strokeWidth={2.5} />
              Abrir
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   DAILY TASKS LIST
───────────────────────────────────────── */
export function DailyTasksList({ tasks }: DailyTasksListProps) {
  return (
    <div className="flex flex-col divide-y divide-border/40">
      {tasks.length === 0 ? (
        /* Empty state */
        <div className="task-card p-10 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
            <CheckCircle2 size={26} className="text-emerald-500" />
          </div>
          <p className="text-sm font-bold font-heading text-text-primary">Tudo limpo por hoje!</p>
          <p className="text-xs text-text-muted mt-1.5 font-body">Sua agenda está em dia. Aproveite o foco.</p>
        </div>
      ) : (
        tasks.map((task, i) => (
          <TaskCard key={task.id} task={task} index={i} />
        ))
      )}
    </div>
  )
}

import React from 'react'
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { Task } from '@/types/database'
import { PRIORITY_LABELS } from '@/types/database'

interface DailyTasksListProps {
  tasks: Task[];
}

const priorityConfig = {
  urgent: { label: 'Urgente', class: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
  high:   { label: 'Alta',    class: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
  medium: { label: 'Média',   class: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  low:    { label: 'Baixa',   class: 'bg-surface-muted text-text-muted' },
}

export function DailyTasksList({ tasks }: DailyTasksListProps) {
  return (
    <div className="floating-card p-6">

      <div className="flex flex-col gap-2.5">
        {tasks.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
              <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-text-primary">Tudo limpo por hoje!</p>
            <p className="text-xs text-text-muted mt-1">Sua mesa está em ordem. Aproveite.</p>
          </div>
        ) : (
          tasks.map((task, i) => {
            const isDone = task.status === 'done';
            const priority = task.priority as keyof typeof priorityConfig;
            const pc = priorityConfig[priority] ?? priorityConfig.medium;

            return (
              <div
                key={task.id}
                className={`
                  group/task flex items-center gap-3 p-3.5 rounded-lg border
                  transition-all duration-150 cursor-pointer
                  ${isDone
                    ? 'border-border/40 opacity-60 bg-transparent'
                    : 'border-border/60 bg-background hover:border-brand-highlight/40 hover:bg-surface hover:shadow-sm hover:-translate-y-px'
                  }
                `}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Checkbox */}
                <button
                  className="shrink-0 text-text-muted hover:text-brand-highlight transition-colors duration-150 hover:scale-110"
                  aria-label={isDone ? 'Marcar como pendente' : 'Marcar como concluída'}
                >
                  {isDone ? (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  ) : (
                    <Circle size={20} className="group-hover/task:text-brand-highlight/60 transition-colors" />
                  )}
                </button>

                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${
                    isDone ? 'text-text-muted line-through' : 'text-text-primary'
                  }`}>
                    {task.title}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5 font-medium">
                    Projeto #{task.project_id.slice(0, 6)}
                  </p>
                </div>

                {/* Priority badge */}
                {!isDone && (
                  <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${pc.class}`}>
                    {pc.label}
                  </span>
                )}
                {isDone && (
                  <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                    Feito
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

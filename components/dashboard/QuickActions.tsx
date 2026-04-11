import React from 'react'
import Link from 'next/link'
import { FolderPlus, FileBarChart2, ListChecks, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ElementType
  href?: string
  accent?: 'terracotta' | 'deep-blue' | 'olive'
}

const actions: QuickAction[] = [
  {
    id: 'create-project',
    label: 'Criar Projeto',
    description: 'Iniciar nova campanha',
    icon: FolderPlus,
    href: '/dashboard/projects',
    accent: 'terracotta',
  },
  {
    id: 'generate-report',
    label: 'Gerar Relatório',
    description: 'Exportar visão do ciclo',
    icon: FileBarChart2,
    href: '#',
    accent: 'deep-blue',
  },
  {
    id: 'review-tasks',
    label: 'Revisar Tarefas',
    description: 'Pendências da equipe',
    icon: ListChecks,
    href: '/dashboard/tasks',
    accent: 'olive',
  },
]

const accentStyles = {
  terracotta: {
    icon: 'bg-terracotta-soft text-terracotta-dark',
    arrow: 'bg-brand-primary text-white',
  },
  'deep-blue': {
    icon: 'bg-deep-blue-soft text-deep-blue',
    arrow: 'bg-brand-deep-blue text-white',
  },
  olive: {
    icon: 'bg-olive-soft text-olive-dark',
    arrow: 'bg-olive text-white',
  },
}

export function QuickActions() {
  return (
    <div className="quick-actions-bar px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="label-eyebrow text-text-muted">Ações Rápidas</span>
        <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          const styles = accentStyles[action.accent ?? 'terracotta']

          return (
            <div key={action.id}>
              {action.href ? (
                <Link
                  href={action.href}
                  className={cn(
                    'group flex items-center gap-3 px-4 py-3 rounded-xl',
                    'bg-surface-elevated/60 border border-border/60',
                    'hover:bg-surface-elevated hover:border-border',
                    'hover:-translate-y-0.5 hover:shadow-sm',
                    'transition-all duration-200 text-left',
                    'cursor-pointer'
                  )}
                >
                  {/* Icon */}
                  <div className={cn('flex-shrink-0 p-2 rounded-lg', styles.icon)}>
                    <Icon size={16} strokeWidth={1.75} />
                  </div>
                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold font-heading text-text-primary leading-tight">
                      {action.label}
                    </p>
                    <p className="text-[11px] text-text-muted font-body mt-0.5">
                      {action.description}
                    </p>
                  </div>
                  {/* Arrow */}
                  <div className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
                    'bg-yellow/15 text-yellow-dark',
                    'group-hover:bg-yellow group-hover:text-white',
                    'transition-all duration-200'
                  )}>
                    <ArrowRight size={11} strokeWidth={2.5} />
                  </div>
                </Link>
              ) : (
                <button
                  className={cn(
                    'group flex items-center gap-3 px-4 py-3 rounded-xl w-full',
                    'bg-surface-elevated/60 border border-border/60',
                    'hover:bg-surface-elevated hover:border-border',
                    'hover:-translate-y-0.5 hover:shadow-sm',
                    'transition-all duration-200 text-left',
                    'cursor-pointer'
                  )}
                >
                  <div className={cn('flex-shrink-0 p-2 rounded-lg', styles.icon)}>
                    <Icon size={16} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold font-heading text-text-primary leading-tight">
                      {action.label}
                    </p>
                    <p className="text-[11px] text-text-muted font-body mt-0.5">
                      {action.description}
                    </p>
                  </div>
                  <div className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
                    'bg-yellow/15 text-yellow-dark',
                    'group-hover:bg-yellow group-hover:text-white',
                    'transition-all duration-200'
                  )}>
                    <ArrowRight size={11} strokeWidth={2.5} />
                  </div>
                </button>
              )}
            </div>

          )
        })}
      </div>
    </div>
  )
}

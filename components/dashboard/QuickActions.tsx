import React from 'react'
import Link from 'next/link'
import { FolderPlus, ListPlus, CalendarPlus, FileBarChart2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ElementType
  href?: string
  iconBg: string
  iconColor: string
  arrowBg: string
}

const actions: QuickAction[] = [
  {
    id: 'create-project',
    label: 'Novo Projeto',
    description: 'Iniciar nova campanha',
    icon: FolderPlus,
    href: '/dashboard/projects',
    iconBg: 'bg-terracotta-soft',
    iconColor: 'text-terracotta-dark',
    arrowBg: 'bg-brand-primary text-white',
  },
  {
    id: 'create-task',
    label: 'Nova Tarefa',
    description: 'Adicionar à lista de hoje',
    icon: ListPlus,
    href: '/dashboard/tasks',
    iconBg: 'bg-deep-blue-soft',
    iconColor: 'text-deep-blue',
    arrowBg: 'bg-brand-deep-blue text-white',
  },
  {
    id: 'create-meeting',
    label: 'Nova Reunião',
    description: 'Agendar com cliente ou equipe',
    icon: CalendarPlus,
    href: '/dashboard/calendar',
    iconBg: 'bg-olive-soft',
    iconColor: 'text-olive-dark',
    arrowBg: 'bg-olive text-white',
  },
  {
    id: 'generate-report',
    label: 'Gerar Relatório',
    description: 'Exportar visão do ciclo',
    icon: FileBarChart2,
    href: '#',
    iconBg: 'bg-yellow-soft',
    iconColor: 'text-yellow-dark',
    arrowBg: 'bg-yellow-dark text-white',
  },
]

function ActionButton({ action }: { action: QuickAction }) {
  const Icon = action.icon

  const inner = (
    <>
      {/* Icon */}
      <div className={cn('flex-shrink-0 p-2.5 rounded-xl', action.iconBg, action.iconColor)}>
        <Icon size={17} strokeWidth={1.75} />
      </div>

      {/* Labels */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold font-heading text-text-primary leading-tight">
          {action.label}
        </p>
        <p className="text-[11px] text-text-muted font-body mt-0.5">{action.description}</p>
      </div>

      {/* Arrow */}
      <div className={cn(
        'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
        'bg-sand-warm text-text-muted',
        'group-hover:bg-brand-primary group-hover:text-white',
        'transition-all duration-200'
      )}>
        <ArrowRight size={12} strokeWidth={2.5} />
      </div>
    </>
  )

  const cls = 'quick-action-btn group'

  if (action.href && action.href !== '#') {
    return (
      <Link href={action.href} className={cls}>
        {inner}
      </Link>
    )
  }

  return (
    <button className={cls}>
      {inner}
    </button>
  )
}

/* ─────────────────────────────────────────
   QUICK ACTIONS — Vertical right panel
───────────────────────────────────────── */
export function QuickActions() {
  return (
    <div className="floating-card p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="label-eyebrow text-text-muted">Ações Rápidas</span>
        <div className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
      </div>

      {/* Action buttons — vertical stack */}
      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <ActionButton key={action.id} action={action} />
        ))}
      </div>
    </div>
  )
}

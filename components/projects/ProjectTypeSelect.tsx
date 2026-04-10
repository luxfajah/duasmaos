'use client'

import { ProjectType, PROJECT_TYPE_LABELS } from '@/types/database'
import { cn } from '@/lib/utils'
import { Rss, Palette, Globe } from 'lucide-react'

const TYPE_ICONS: Record<ProjectType, React.ElementType> = {
  redes_sociais: Rss,
  branding: Palette,
  site: Globe,
}

const TYPE_COLORS: Record<ProjectType, string> = {
  redes_sociais: 'text-status-info bg-status-info/10 border-status-info/20',
  branding: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20',
  site: 'text-status-success bg-status-success/10 border-status-success/20',
}

interface ProjectTypeSelectProps {
  value?: ProjectType | null
  onChange: (type: ProjectType | null) => void
  className?: string
}

export function ProjectTypeSelect({ value, onChange, className }: ProjectTypeSelectProps) {
  const types: ProjectType[] = ['redes_sociais', 'branding', 'site']

  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {types.map((type) => {
        const Icon = TYPE_ICONS[type]
        const isSelected = value === type
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(isSelected ? null : type)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-semibold transition-all duration-150',
              isSelected
                ? TYPE_COLORS[type]
                : 'text-text-secondary border-border hover:border-border-strong hover:bg-surface-muted',
            )}
          >
            <Icon size={18} strokeWidth={1.75} />
            {PROJECT_TYPE_LABELS[type]}
          </button>
        )
      })}
    </div>
  )
}

interface ProjectTypeBadgeProps {
  type: ProjectType
  className?: string
}

export function ProjectTypeBadge({ type, className }: ProjectTypeBadgeProps) {
  const Icon = TYPE_ICONS[type]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border',
        TYPE_COLORS[type],
        className,
      )}
    >
      <Icon size={11} />
      {PROJECT_TYPE_LABELS[type]}
    </span>
  )
}

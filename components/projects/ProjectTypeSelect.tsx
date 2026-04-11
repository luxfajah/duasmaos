'use client'

import { WorkflowTypeV2 } from '@/types/database'
import { cn } from '@/lib/utils'
import { Rss, Palette, Globe, MessageSquare } from 'lucide-react'

const TYPE_ICONS: Record<WorkflowTypeV2, React.ElementType> = {
  social_media: Rss,
  branding: Palette,
  website: Globe,
  consultoria: MessageSquare,
}

const TYPE_LABELS: Record<WorkflowTypeV2, string> = {
  social_media: 'Social Media',
  branding: 'Branding',
  website: 'Website',
  consultoria: 'Consultoria',
}

const TYPE_COLORS: Record<WorkflowTypeV2, string> = {
  social_media: 'text-status-info bg-status-info/10 border-status-info/20',
  branding: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20',
  website: 'text-status-success bg-status-success/10 border-status-success/20',
  consultoria: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20',
}

interface ProjectTypeSelectProps {
  value?: WorkflowTypeV2 | null
  onChange: (type: WorkflowTypeV2 | null) => void
  className?: string
}

export function ProjectTypeSelect({ value, onChange, className }: ProjectTypeSelectProps) {
  const types: WorkflowTypeV2[] = ['branding', 'social_media', 'website', 'consultoria']

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
            {TYPE_LABELS[type]}
          </button>
        )
      })}
    </div>
  )
}

interface ProjectTypeBadgeProps {
  type: WorkflowTypeV2
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
      {TYPE_LABELS[type]}
    </span>
  )
}

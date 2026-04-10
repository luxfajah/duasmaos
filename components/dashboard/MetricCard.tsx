import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
  accent?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const accentMap = {
  default: 'bg-brand-highlight/10 text-brand-highlight',
  success: 'bg-status-success/10 text-status-success',
  warning: 'bg-status-warning/10 text-status-warning',
  danger: 'bg-status-danger/10 text-status-danger',
  info: 'bg-status-info/10 text-status-info',
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  className,
  accent = 'default',
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-sm bg-surface shadow-md transition-all duration-200 hover:shadow-lg',
        className
      )}
      style={{ padding: '1.5rem' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
            {label}
          </p>
          <p className="text-3xl font-bold text-text-primary tabular-nums">{value}</p>
          {description && (
            <p className="mt-1.5 text-sm text-text-secondary">{description}</p>
          )}
          {trendValue && (
            <p
              className={cn(
                'mt-2 text-xs font-medium',
                trend === 'up' && 'text-status-success',
                trend === 'down' && 'text-status-danger',
                trend === 'neutral' && 'text-text-muted'
              )}
            >
              {trendValue}
            </p>
          )}
        </div>
        <div className={cn('flex-shrink-0 rounded-lg p-3', accentMap[accent])}>
          <Icon size={20} strokeWidth={1.75} />
        </div>
      </div>
      {/* Subtle gradient decoration */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full blur-2xl bg-brand-highlight/5 translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  )
}

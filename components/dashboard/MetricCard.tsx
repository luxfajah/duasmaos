import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
  accent?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  /** Featured card gets a dominant orange brand treatment */
  featured?: boolean
}

const accentMap = {
  default: 'bg-brand-highlight/12 text-brand-highlight',
  success: 'bg-status-success/12 text-status-success',
  warning: 'bg-status-warning/12 text-status-warning',
  danger: 'bg-status-danger/12 text-status-danger',
  info: 'bg-status-info/12 text-status-info',
}

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
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
  featured = false,
}: MetricCardProps) {
  if (featured) {
    return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-xl p-6',
          'card-brand',
          'cursor-default',
          className
        )}
      >
        {/* Organic blob decoration */}
        <div className="doodle-overlay">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 animate-blob-drift" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/6 animate-blob-drift" style={{ animationDelay: '-3s' }} />
          {/* Doodle cross */}
          <svg className="absolute top-3 left-3 opacity-10" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v20M2 12h20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <svg className="absolute bottom-4 right-4 opacity-10 rotate-45" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1v14M1 8h14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="label-eyebrow text-white/60 mb-3">{label}</p>
            <p className="text-4xl font-black text-white tabular-nums tracking-tight">{value}</p>
            {description && (
              <p className="mt-1.5 text-sm text-white/70 font-medium">{description}</p>
            )}
            {trendValue && (
              <p className={cn(
                'mt-2 text-xs font-bold flex items-center gap-1',
                trend === 'up' && 'text-emerald-300',
                trend === 'down' && 'text-red-300',
                trend === 'neutral' && 'text-white/50'
              )}>
                {trend && (() => {
                  const TIcon = trendIcon[trend]
                  return <TIcon size={12} />
                })()}
                {trendValue}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 rounded-lg p-3 bg-white/15 text-white">
            <Icon size={22} strokeWidth={1.75} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl bg-surface p-6',
        'shadow-sm',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-1.5 hover:shadow-lg',
        'cursor-default',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="label-eyebrow text-text-muted mb-3">
            {label}
          </p>
          <p className="text-3xl font-black text-text-primary tabular-nums tracking-tight">{value}</p>
          {description && (
            <p className="mt-1.5 text-sm text-text-secondary">{description}</p>
          )}
          {trendValue && (
            <p
              className={cn(
                'mt-2 text-xs font-bold flex items-center gap-1',
                trend === 'up' && 'text-status-success',
                trend === 'down' && 'text-status-danger',
                trend === 'neutral' && 'text-text-muted'
              )}
            >
              {trend && (() => {
                const TIcon = trendIcon[trend]
                return <TIcon size={12} />
              })()}
              {trendValue}
            </p>
          )}
        </div>
        <div className={cn('flex-shrink-0 rounded-xl p-3', accentMap[accent])}>
          <Icon size={22} strokeWidth={1.75} />
        </div>
      </div>
      {/* Subtle gradient decoration on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full blur-2xl bg-brand-highlight/6 translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  )
}

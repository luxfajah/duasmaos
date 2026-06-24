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
  /** Featured card gets Terracotta dominant treatment + expressive tilt */
  featured?: boolean
}

const accentMap = {
  default:  'bg-terracotta-soft text-terracotta-dark',
  success:  'bg-olive-soft text-olive-dark',
  warning:  'bg-yellow-soft text-yellow-dark',
  danger:   'bg-terracotta-soft text-terracotta-dark',
  info:     'bg-deep-blue-soft text-deep-blue',
}

const trendIcon = {
  up:      TrendingUp,
  down:    TrendingDown,
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

  /* ── Featured — Accent Highlight (Glass) ── */
  if (featured) {
    return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-[2rem] p-6',
          'bg-gradient-to-br from-brand-primary to-brand-primary/80',
          'shadow-lg shadow-brand-primary/20',
          'border border-white/10',
          className
        )}
      >
        {/* Subtle HIG noise or glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="label-eyebrow text-white/60 mb-3">{label}</p>
            <p className="text-4xl font-black font-heading text-white tabular-nums tracking-tight">{value}</p>
            {description && (
              <p className="mt-1.5 text-sm text-white/70 font-medium font-body">{description}</p>
            )}
            {trendValue && (
              <p className={cn(
                'mt-2 text-xs font-bold flex items-center gap-1 font-body',
                trend === 'up'      && 'text-yellow-light',
                trend === 'down'    && 'text-white/60',
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
          <div className="flex-shrink-0 rounded-xl p-3 bg-white/18 text-white">
            <Icon size={22} strokeWidth={1.75} />
          </div>
        </div>
      </div>
    )
  }

  /* ── Standard Widget (Glass) ── */
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl p-6',
        'bg-surface-primary/70 dark:bg-black/40',
        'border border-black/[0.04] dark:border-white/[0.08]',
        'shadow-[0_4px_16px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]',
        'backdrop-blur-3xl saturate-150',
        'transition-all duration-300 ease-apple hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5',
        className
      )}
    >
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className={cn(
            'flex-shrink-0 rounded-2xl p-3 w-12 h-12 flex items-center justify-center',
            accentMap[accent]
          )}>
            <Icon size={22} strokeWidth={1.5} />
          </div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-text-muted/70 font-body">
            {label}
          </p>
        </div>
        
        <div>
          <p className="text-[2.25rem] font-semibold text-text-primary tracking-tight tabular-nums font-sans leading-none">{value}</p>
          {description && (
            <p className="mt-2 text-sm text-text-secondary font-medium">{description}</p>
          )}
          {trendValue && (
            <p className={cn(
              'mt-2 text-sm font-semibold flex items-center gap-1',
              trend === 'up'      && 'text-[#34c759]',
              trend === 'down'    && 'text-[#ff3b30]',
              trend === 'neutral' && 'text-[#8e8e93]'
            )}>
              {trend && (() => {
                const TIcon = trendIcon[trend]
                return <TIcon size={14} />
              })()}
              {trendValue}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

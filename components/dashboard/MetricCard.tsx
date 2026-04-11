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

  /* ── Featured — Terracotta highlight + expressive tilt (only this block rotates) ── */
  if (featured) {
    return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-2xl p-6',
          'card-terracotta glow-ring-terracotta',
          'expressive-tilt-right',
          'cursor-default',
          className
        )}
      >
        {/* Organic blob decorations */}
        <div className="doodle-overlay">
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 animate-blob-drift" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-black/8 animate-blob-drift" style={{ animationDelay: '-3s' }} />
          {/* Organic wave line */}
          <svg className="absolute top-4 right-4 opacity-[0.12]" width="72" height="48" viewBox="0 0 72 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 24 Q20 8 36 24 Q52 40 68 24" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <path d="M4 34 Q20 18 36 34 Q52 50 68 34" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
          </svg>
          {/* Small cross doodle */}
          <svg className="absolute bottom-5 left-5 opacity-[0.10] rotate-12" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2v16M2 10h16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {/* Hover shimmer */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="shimmer absolute inset-0" />
          </div>
        </div>

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

  /* ── Standard — Floating elevated card (perfectly aligned, NO rotation) ── */
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl p-6',
        'floating-card',
        'cursor-default',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="label-eyebrow text-text-muted mb-3">
            {label}
          </p>
          <p className="text-3xl font-black font-heading text-text-primary tabular-nums tracking-tight">{value}</p>
          {description && (
            <p className="mt-1.5 text-sm text-text-secondary font-body">{description}</p>
          )}
          {trendValue && (
            <p
              className={cn(
                'mt-2 text-xs font-bold flex items-center gap-1 font-body',
                trend === 'up'      && 'text-olive',
                trend === 'down'    && 'text-terracotta',
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

      {/* Subtle accent glow on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full blur-2xl bg-brand-primary/5 translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  )
}

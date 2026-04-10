import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */

export type DashboardWidgetAccent =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'brand'

export interface DashboardWidgetProps {
  label: string
  value: number | string
  icon: LucideIcon
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  trendLabel?: string
  accent?: DashboardWidgetAccent
  className?: string
}

/* ─────────────────────────────────────────
   CONFIG
───────────────────────────────────────── */

const accentConfig: Record<
  DashboardWidgetAccent,
  { icon: string; ring: string; glow: string }
> = {
  default: {
    icon: 'bg-brand-primary/10 text-brand-primary',
    ring: 'ring-brand-primary/10',
    glow: 'bg-brand-primary/5',
  },
  brand: {
    icon: 'bg-brand-primary text-text-inverse',
    ring: 'ring-brand-primary/20',
    glow: 'bg-brand-primary/8',
  },
  success: {
    icon: 'bg-status-success/10 text-status-success',
    ring: 'ring-status-success/10',
    glow: 'bg-status-success/5',
  },
  warning: {
    icon: 'bg-status-warning/10 text-status-warning',
    ring: 'ring-status-warning/10',
    glow: 'bg-status-warning/5',
  },
  danger: {
    icon: 'bg-status-danger/10 text-status-danger',
    ring: 'ring-status-danger/10',
    glow: 'bg-status-danger/5',
  },
  info: {
    icon: 'bg-status-info/10 text-status-info',
    ring: 'ring-status-info/10',
    glow: 'bg-status-info/5',
  },
}

const trendConfig = {
  up: { color: 'text-status-success', Icon: TrendingUp },
  down: { color: 'text-status-danger', Icon: TrendingDown },
  neutral: { color: 'text-text-muted', Icon: Minus },
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */

export function DashboardWidget({
  label,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  trendLabel,
  accent = 'default',
  className,
}: DashboardWidgetProps) {
  const cfg = accentConfig[accent]
  const TrendIcon = trend ? trendConfig[trend].Icon : null

  return (
    <div
      data-slot="dashboard-widget"
      className={cn(
        'group relative overflow-hidden rounded-xl bg-surface border border-border p-6',
        'transition-all duration-200',
        'hover:border-border-strong hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      {/* Content */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Label */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">
            {label}
          </p>

          {/* Value */}
          <p className="text-3xl font-bold text-text-primary tabular-nums leading-none">
            {value}
          </p>

          {/* Description */}
          {description && (
            <p className="mt-2 text-sm text-text-secondary leading-snug">{description}</p>
          )}

          {/* Trend */}
          {trend && trendValue && (
            <div className={cn('mt-3 flex items-center gap-1.5 text-xs font-medium', trendConfig[trend].color)}>
              {TrendIcon && <TrendIcon size={12} />}
              <span>{trendValue}</span>
              {trendLabel && (
                <span className="text-text-muted font-normal">{trendLabel}</span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          className={cn(
            'shrink-0 rounded-lg p-3 ring-1',
            cfg.icon,
            cfg.ring
          )}
        >
          <Icon size={20} strokeWidth={1.75} />
        </div>
      </div>

      {/* Background glow decoration */}
      <div
        className={cn(
          'pointer-events-none absolute bottom-0 right-0 h-24 w-24 rounded-full blur-2xl',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-1/2 translate-y-1/2',
          cfg.glow
        )}
      />
    </div>
  )
}

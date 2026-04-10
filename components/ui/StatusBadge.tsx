import React from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

export function StatusBadge({ label, variant = 'default', className }: StatusBadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    success: 'bg-status-success/15 text-status-success',
    warning: 'bg-status-warning/15 text-status-warning',
    danger: 'bg-status-danger/15 text-status-danger',
    info: 'bg-status-info/15 text-status-info',
    default: 'bg-surface-muted text-text-secondary',
  };

  return (
    <span className={cn(
      'inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
      variants[variant],
      className
    )}>
      {label}
    </span>
  )
}

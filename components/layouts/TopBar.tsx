import React from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Bell, Search } from 'lucide-react'

interface TopBarProps {
  className?: string
  userName?: string | null
  userEmail?: string | null
}

export function TopBar({ className, userName, userEmail }: TopBarProps) {
  const displayName = userName ?? userEmail?.split('@')[0] ?? 'Usuário'

  return (
    <header
      className={cn(
        'h-14 sticky top-0 z-40 topbar-float',
        'flex items-center px-6 lg:px-8 gap-4',
        className
      )}
    >
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors duration-200 group-focus-within:text-brand-primary"
            size={14}
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Buscar tarefas, projetos..."
            className={cn(
              'w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none',
              'bg-sand-warm/60 hover:bg-sand-warm',
              'border border-sand-dark/40 hover:border-sand-dark',
              'focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10',
              'text-text-primary placeholder:text-text-muted',
              'transition-all duration-200',
            )}
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: bell + avatar */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          className={cn(
            'relative rounded-xl p-2',
            'text-text-muted hover:bg-sand-warm hover:text-text-primary',
            'transition-all duration-150 hover:scale-105'
          )}
          aria-label="Notificações"
        >
          <Bell size={17} strokeWidth={1.75} />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand-primary ring-2 ring-background animate-pulse" />
        </button>

        <div className="h-5 w-px bg-sand-dark/40" />

        {/* Avatar only — name lives in the greeting block */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <Avatar
            name={displayName}
            size="sm"
            variant="brand"
            className="transition-transform duration-200 group-hover:scale-105 ring-2 ring-brand-primary/20"
          />
        </div>
      </div>
    </header>
  )
}

/* ─────────────────────────────────────────
   CONTENT WRAPPER — unchanged, kept for compat
───────────────────────────────────────── */

export function ContentWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main className={cn('p-6 lg:p-8 xl:p-10 max-w-[1440px] mx-auto w-full', className)}>
      {children}
    </main>
  )
}

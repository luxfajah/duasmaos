import React from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Bell, Search } from 'lucide-react'

/* ─────────────────────────────────────────
   HEADER
───────────────────────────────────────── */

interface HeaderProps {
  className?: string
  children?: React.ReactNode
  userName?: string | null
  userEmail?: string | null
  pageTitle?: string
  parentSection?: string
}

export function Header({
  className,
  children,
  userName,
  userEmail,
  pageTitle,
  parentSection,
}: HeaderProps) {
  const displayName = userName ?? userEmail?.split('@')[0] ?? 'Usuário'

  return (
    <header
      className={cn(
        'h-16 sticky top-0 z-30',
        /* Sand-warm header background */
        'bg-background/92 backdrop-blur-md',
        'border-b border-sand-dark/50',
        'shadow-[0_1px_0_0_hsl(35_18%_84%/0.6),0_4px_24px_0_rgb(0_0_0/0.04)]',
        'flex items-center px-6 lg:px-8 gap-4',
        className
      )}
    >
      {/* Breadcrumb */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        {parentSection && (
          <>
            <span className="text-sm text-text-muted font-body truncate">{parentSection}</span>
            <span className="text-text-muted/40 text-xs">/</span>
          </>
        )}
        {pageTitle && (
          <span className="text-sm font-bold font-heading text-text-primary truncate">{pageTitle}</span>
        )}
        {children}
      </div>

      {/* Search — Sand input with Terracotta focus */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative group">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors duration-200 group-focus-within:text-brand-primary"
            size={15}
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Buscar projetos, tarefas ou clientes..."
            className={cn(
              'w-full rounded-md pl-10 pr-4 py-2 text-sm outline-none',
              'bg-sand-warm/80 hover:bg-sand-warm',
              'border border-sand-dark/50 hover:border-sand-dark',
              'focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15',
              'text-text-primary placeholder:text-text-muted',
              'transition-all duration-200',
              'focus:bg-surface-elevated focus:shadow-sm'
            )}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0 flex-1 justify-end">
        {/* Notificações */}
        <button
          className={cn(
            'relative rounded-md p-2',
            'text-text-muted hover:bg-sand-warm hover:text-text-primary',
            'transition-all duration-150 hover:scale-105'
          )}
          aria-label="Notificações"
        >
          <Bell size={18} strokeWidth={1.75} />
          {/* Terracotta notification dot */}
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand-primary ring-2 ring-background animate-pulse" />
        </button>

        {/* Separator */}
        <div className="h-5 w-px bg-sand-dark/50 mx-1" />

        {/* User info */}
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold font-heading text-text-primary leading-tight">{displayName}</p>
          </div>
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
   CONTENT WRAPPER
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

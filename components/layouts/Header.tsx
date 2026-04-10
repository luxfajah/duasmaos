import React from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Bell } from 'lucide-react'

/* ─────────────────────────────────────────
   HEADER
───────────────────────────────────────── */

interface HeaderProps {
  className?: string
  children?: React.ReactNode
  /** Nome do usuário para exibir no avatar */
  userName?: string | null
  /** Email do usuário */
  userEmail?: string | null
  /** Título da página atual (para o breadcrumb) */
  pageTitle?: string
  /** Seção pai (para o breadcrumb) */
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
        'h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40',
        'flex items-center px-6 lg:px-8 gap-4',
        className
      )}
    >
      {/* Breadcrumb */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        {parentSection && (
          <>
            <span className="text-sm text-text-muted truncate">{parentSection}</span>
            <span className="text-text-muted/50">/</span>
          </>
        )}
        {pageTitle && (
          <span className="text-sm font-medium text-text-primary truncate">{pageTitle}</span>
        )}
        {children}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notificações */}
        <button
          className="relative rounded-lg p-2 text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors"
          aria-label="Notificações"
        >
          <Bell size={16} strokeWidth={1.75} />
          {/* Badge de notificação não lida */}
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-status-danger ring-2 ring-surface" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-border" />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-text-primary leading-tight">{displayName}</p>
            {userEmail && (
              <p className="text-[10px] text-text-muted leading-tight">{userEmail}</p>
            )}
          </div>
          <Avatar
            name={displayName}
            size="sm"
            variant="brand"
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
    <main className={cn('p-6 lg:p-8 xl:p-10 max-w-[1400px] mx-auto w-full', className)}>
      {children}
    </main>
  )
}

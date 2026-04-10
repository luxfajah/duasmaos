'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Kanban,
  CalendarDays,
  CheckSquare,
  Files,
  Settings,
  LogOut,
} from 'lucide-react'

/* ─────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────── */

const navGroups = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/clients', label: 'Clientes', icon: Users },
      { href: '/dashboard/projects', label: 'Projetos', icon: FolderOpen },
      { href: '/dashboard/kanban', label: 'Kanban', icon: Kanban },
    ],
  },
  {
    label: 'Produção',
    items: [
      { href: '/dashboard/tasks', label: 'Tarefas', icon: CheckSquare },
      { href: '/dashboard/calendar', label: 'Calendário', icon: CalendarDays },
      { href: '/dashboard/files', label: 'Arquivos', icon: Files },
    ],
  },
]

/* ─────────────────────────────────────────
   PROPS
───────────────────────────────────────── */

interface SidebarProps {
  className?: string
  /** Email do usuário autenticado */
  userEmail?: string | null
  /** Nome do usuário autenticado */
  userName?: string | null
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */

export function Sidebar({ className, userEmail, userName }: SidebarProps) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const displayName = userName ?? userEmail?.split('@')[0] ?? 'Usuário'
  const displayEmail = userEmail ?? ''

  return (
    <aside
      className={cn(
        'flex flex-col w-64 border-r border-border bg-surface h-screen sticky top-0',
        'px-4 py-6',
        className
      )}
    >
      {/* ── Logo ── */}
      <div className="mb-8 px-2">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          {/* Símbolo da marca */}
          <div className="relative w-7 h-7 shrink-0">
            <Image
              src="/brand/symbols/simbolo-dark.png"
              alt="Duas Mãos símbolo"
              fill
              className="object-contain transition-opacity duration-200 group-hover:opacity-80"
              priority
            />
          </div>
          {/* Logotipo */}
          <div className="relative h-5 flex-1 min-w-0 max-w-[120px]">
            <Image
              src="/brand/logos/logotipo-dark.png"
              alt="Duas Mãos"
              fill
              className="object-contain object-left transition-opacity duration-200 group-hover:opacity-80"
              priority
            />
          </div>
        </Link>
        {/* Tagline editorial */}
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-text-muted mt-2 px-0.5 ml-10">
          Gestão de Projetos
        </p>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 space-y-5 overflow-y-auto pr-1">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-text-muted mb-2 px-3">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                        active
                          ? 'bg-brand-primary/10 text-brand-primary'
                          : 'text-text-secondary hover:bg-surface-muted/70 hover:text-text-primary'
                      )}
                    >
                      <item.icon
                        size={16}
                        strokeWidth={active ? 2.25 : 1.75}
                        className="flex-shrink-0"
                      />
                      {item.label}
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Bottom actions ── */}
      <div className="border-t border-border pt-4 mt-4 space-y-0.5">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
            pathname.startsWith('/dashboard/settings')
              ? 'bg-brand-primary/10 text-brand-primary'
              : 'text-text-secondary hover:bg-surface-muted/70 hover:text-text-primary'
          )}
        >
          <Settings size={16} strokeWidth={1.75} />
          Configurações
        </Link>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-status-danger/10 hover:text-status-danger transition-all duration-150"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Sair do sistema
          </button>
        </form>
      </div>

      {/* ── User identity ── */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-3 px-2">
          <Avatar
            name={displayName}
            size="sm"
            variant="brand"
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate leading-tight">
              {displayName}
            </p>
            {displayEmail && (
              <p className="text-[10px] text-text-muted truncate leading-tight mt-0.5">
                {displayEmail}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

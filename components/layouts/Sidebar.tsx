'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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
  BarChart3,
  UserCircle2,
  HelpCircle,
  Archive,
  Plus
} from 'lucide-react'

/* ─────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────── */

const navGroups = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
      { href: '/dashboard/clients', label: 'Clients', icon: Users, exact: true },
      { href: '/dashboard/financials', label: 'Financials', icon: BarChart3 },
      { href: '/dashboard/team', label: 'Team', icon: UserCircle2 },
    ],
  },
  {
    label: 'Produção',
    items: [
      { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
      { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
      { href: '/dashboard/files', label: 'Files', icon: Files },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/dashboard/support', label: 'Support', icon: HelpCircle },
      { href: '/dashboard/archive', label: 'Archive', icon: Archive },
    ],
  }
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
    <aside className={cn("hidden lg:block relative z-50 h-screen shrink-0 w-[72px] transition-all duration-300", className)}>
      <div className={cn(
        'group absolute top-0 left-0 h-screen border-r border-border bg-surface shadow-sm overflow-hidden',
        'w-[72px] hover:w-[260px] transition-all duration-300 ease-in-out',
        'flex flex-col py-6'
      )}>
        {/* ── Logo ── */}
        <div className="mb-6 px-4 flex items-center justify-start h-8 shrink-0 relative">
          <Link href="/dashboard" className="flex items-center group/logo w-full overflow-hidden whitespace-nowrap">
            {/* Símbolo da marca - Fixado em largura */}
            <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
              <Image
                src="/brand/symbols/simbolo-dark.png"
                alt="Duas Mãos símbolo"
                fill
                className="object-contain transition-opacity duration-200 group-hover/logo:opacity-80"
                priority
              />
            </div>
            {/* Logotipo - Fica oculto até o hover */}
            <div className="relative h-5 ml-3 w-[120px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              <Image
                src="/brand/logos/logotipo-dark.png"
                alt="Duas Mãos"
                fill
                className="object-contain object-left transition-opacity duration-200 group-hover/logo:opacity-80"
                priority
              />
            </div>
          </Link>
        </div>

        {/* ── Action Button ── */}
        <div className="px-4 mb-6">
           <button className="w-full bg-brand-primary text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm shadow-brand-primary/20 group-hover:px-4 duration-300">
             <Plus size={18} strokeWidth={3} />
             <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">New Project</span>
           </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 scrollbar-none">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 px-3 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center rounded-xl transition-all duration-200 p-2 relative overflow-hidden',
                          active
                            ? 'bg-brand-primary/10 text-brand-primary'
                            : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                        )}
                        title={item.label}
                      >
                        <div className="flex items-center justify-center w-8 h-8 shrink-0">
                          <item.icon
                            size={18}
                            strokeWidth={active ? 2.5 : 2}
                          />
                        </div>
                        <span className="ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {item.label}
                        </span>
                        
                        {active && (
                          <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
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
        <div className="border-t border-border pt-4 mt-4 px-3 space-y-1 overflow-hidden shrink-0">
          <Link
            href="/dashboard/settings"
            className={cn(
              'flex items-center rounded-xl transition-all duration-200 p-2 overflow-hidden',
              pathname.startsWith('/dashboard/settings')
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
            )}
            title="Configurações"
          >
            <div className="flex items-center justify-center w-8 h-8 shrink-0">
              <Settings size={18} strokeWidth={2} />
            </div>
            <span className="ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Configurações
            </span>
          </Link>
          
          <div className="flex items-center p-2 rounded-xl text-text-secondary hover:bg-surface-muted transition-colors relative overflow-hidden h-12" title="Tema">
            <div className="flex items-center justify-center w-8 h-8 shrink-0 text-text-muted">
              <ThemeToggle />
            </div>
            <span className="ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-1">
              Aparência
            </span>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center rounded-xl transition-all duration-200 p-2 overflow-hidden text-text-secondary hover:bg-status-danger/10 hover:text-status-danger"
              title="Sair"
            >
              <div className="flex items-center justify-center w-8 h-8 shrink-0">
                <LogOut size={18} strokeWidth={2} />
              </div>
              <span className="ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Sair do sistema
              </span>
            </button>
          </form>
        </div>

        {/* ── User identity ── */}
        <div className="mt-4 pt-4 border-t border-border px-3 pb-2 shrink-0">
          <div className="flex items-center p-1 rounded-xl hover:bg-surface-muted transition-colors overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 shrink-0">
              <Avatar
                name={displayName}
                size="sm"
                variant="brand"
              />
            </div>
            <div className="ml-3 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              <p className="text-sm font-bold text-text-primary truncate">
                {displayName}
              </p>
              {displayEmail && (
                <p className="text-[11px] text-text-muted truncate mt-0.5">
                  {displayEmail}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

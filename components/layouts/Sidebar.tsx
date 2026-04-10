'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        'flex flex-col w-64 border-r border-border bg-surface h-screen sticky top-0 px-4 py-8',
        className
      )}
    >
      {/* Logo */}
      <div className="mb-10 flex items-center gap-2.5 px-2">
        <div className="w-6 h-6 bg-brand-primary rounded-sm flex-shrink-0" />
        <span className="font-serif font-bold text-xl tracking-tight text-text-primary">
          Duas Mãos
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2 px-2">
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
                          : 'text-text-secondary hover:bg-surface-muted/60 hover:text-text-primary'
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

      {/* Bottom actions */}
      <div className="border-t border-border pt-4 mt-4 space-y-0.5">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
            pathname.startsWith('/dashboard/settings')
              ? 'bg-brand-primary/10 text-brand-primary'
              : 'text-text-secondary hover:bg-surface-muted/60 hover:text-text-primary'
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
    </aside>
  )
}

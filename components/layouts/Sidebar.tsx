'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  DoodleDashboard,
  DoodleProjects,
  DoodleClients,
  DoodleFinancials,
  DoodleTeam,
  DoodleTasks,
  DoodleCalendarRound,
  DoodleClip,
  DoodleSupport,
  DoodleArchive,
  DoodleSettings,
  DoodlePlus,
  DoodleLogout,
} from '@/components/ui/EthosIcons'

/* ─────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────── */

const navGroups = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: DoodleDashboard, exact: true },
      { href: '/dashboard/projects', label: 'Projetos', icon: DoodleProjects },
      { href: '/dashboard/clients', label: 'Clientes', icon: DoodleClients, exact: true },
      { href: '/dashboard/financials', label: 'Financeiro', icon: DoodleFinancials },
      { href: '/dashboard/team', label: 'Equipe', icon: DoodleTeam },
    ],
  },
  {
    label: 'Produção',
    items: [
      { href: '/dashboard/tasks', label: 'Tarefas', icon: DoodleTasks },
      { href: '/dashboard/calendar', label: 'Calendário', icon: DoodleCalendarRound },
      { href: '/dashboard/files', label: 'Arquivos', icon: DoodleClip },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/dashboard/support', label: 'Suporte', icon: DoodleSupport },
      { href: '/dashboard/archive', label: 'Arquivados', icon: DoodleArchive },
    ],
  }
]

/* ─────────────────────────────────────────
   PROPS
───────────────────────────────────────── */

interface SidebarProps {
  className?: string
  userEmail?: string | null
  userName?: string | null
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */

export function Sidebar({ className, userEmail, userName }: SidebarProps) {
  const pathname = usePathname()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const currentTheme = resolvedTheme || theme
  const isDark = mounted && currentTheme === 'dark'

  const symbolSrc = isDark ? '/brand/symbols/simbolo-dark.png' : '/brand/symbols/simbolo-light.png'
  const logoSrc = isDark ? '/brand/logos/logotipo-dark.png' : '/brand/logos/logotipo-light.png'

  const displayName = userName ?? userEmail?.split('@')[0] ?? 'Usuário'
  const displayEmail = userEmail ?? ''

  return (
    // Fixed wrapper — não rola com o conteúdo
    <aside className={cn('fixed inset-y-0 left-0 z-50 h-screen hidden lg:block', className)}>
      <div className={cn(
        'group relative h-full flex flex-col py-5',
        'w-[72px] hover:w-[260px]',
        'transition-all duration-300 ease-in-out',
        'glass-fluted',
      )}>

        {/* ── Logo ── */}
        <div className="mb-5 px-4 flex items-center justify-start h-8 shrink-0 relative">
          <Link href="/dashboard" className="flex items-center w-full overflow-hidden whitespace-nowrap">
            {/* Símbolo — visível quando fechado */}
            <div className="relative w-8 h-8 shrink-0 flex items-center justify-center transition-opacity duration-200 group-hover:opacity-0">
              <Image
                src={symbolSrc}
                alt="Duas Mãos símbolo"
                fill
                className="object-contain"
                priority
              />
            </div>
            {/* Logotipo — visível quando aberto */}
            <div className="absolute left-4 h-7 w-[180px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 pointer-events-none">
              <Image
                src={logoSrc}
                alt="Duas Mãos"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
        </div>

        {/* ── Botão Novo Projeto ── */}
        <div className="px-4 mb-5 flex justify-center group-hover:justify-start">
          <button className={cn(
            'bg-brand-highlight text-text-inverse font-bold',
            'flex items-center justify-center gap-0 group-hover:gap-2',
            // Fechado: círculo 40px | Aberto: full width pill
            'w-10 h-10 group-hover:w-full',
            'rounded-sm',
            'overflow-hidden whitespace-nowrap',
            'transition-all duration-300 ease-in-out',
            'shadow-md hover:opacity-90'
          )}>
            <DoodlePlus size={18} strokeWidth={2.5} className="shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 text-sm">
              Novo Projeto
            </span>
          </button>
        </div>

        {/* ── Navegação ── */}
        <nav className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-3 scrollbar-none">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-1 px-2 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={item.label}
                        className={cn(
                          'flex items-center rounded-sm p-2 transition-all duration-150 relative overflow-hidden',
                          active
                            ? 'bg-brand-highlight/12 text-brand-highlight'
                            : 'text-text-secondary hover:bg-surface/50 hover:text-text-primary'
                        )}
                      >
                        {/* Active indicator bar */}
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-brand-highlight rounded-full" />
                        )}
                        <div className="flex items-center justify-center w-8 h-8 shrink-0">
                          <item.icon size={20} strokeWidth={active ? 2 : 1.6} />
                        </div>
                        <span className="ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Ações de Fundo ── */}
        <div className="pt-3 mt-2 px-3 space-y-0.5 border-t border-border/30 overflow-hidden shrink-0">
          <Link
            href="/dashboard/settings"
            title="Configurações"
            className={cn(
              'flex items-center rounded-sm p-2 transition-all duration-150 overflow-hidden',
              pathname.startsWith('/dashboard/settings')
                ? 'bg-brand-highlight/12 text-brand-highlight'
                : 'text-text-secondary hover:bg-surface/50 hover:text-text-primary'
            )}
          >
            <div className="flex items-center justify-center w-8 h-8 shrink-0">
              <DoodleSettings size={20} strokeWidth={1.6} />
            </div>
            <span className="ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Configurações
            </span>
          </Link>

          <div className="flex items-center p-2 rounded-sm text-text-secondary hover:bg-surface/50 transition-colors overflow-hidden h-11" title="Aparência">
            <div className="flex items-center justify-center w-8 h-8 shrink-0">
              <ThemeToggle />
            </div>
            <span className="ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Aparência
            </span>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              title="Sair"
              className="w-full flex items-center rounded-sm p-2 transition-all duration-150 overflow-hidden text-text-secondary hover:bg-status-danger/10 hover:text-status-danger"
            >
              <div className="flex items-center justify-center w-8 h-8 shrink-0">
                <DoodleLogout size={20} strokeWidth={1.6} />
              </div>
              <span className="ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Sair do sistema
              </span>
            </button>
          </form>
        </div>

        {/* ── Identidade do Usuário ── */}
        <div className="mt-2 pt-3 border-t border-border/30 px-3 pb-1 shrink-0">
          <div className="flex items-center p-1 rounded-sm hover:bg-surface/50 transition-colors overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 shrink-0">
              <Avatar name={displayName} size="sm" variant="brand" />
            </div>
            <div className="ml-3 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              <p className="text-sm font-bold text-text-primary truncate">{displayName}</p>
              {displayEmail && (
                <p className="text-[11px] text-text-muted truncate mt-0.5">{displayEmail}</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </aside>
  )
}

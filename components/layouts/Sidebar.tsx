'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { SlIcon } from '@/components/ui/StreamlineIcon'

/* ─────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────── */

const navGroups = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'dashboard', exact: true },
      { href: '/dashboard/projects', label: 'Projetos', icon: 'projects' },
      { href: '/dashboard/clients', label: 'Clientes', icon: 'clients', exact: true },
      { href: '/dashboard/financials', label: 'Financeiro', icon: 'financials' },
      { href: '/dashboard/team', label: 'Equipe', icon: 'team' },
    ],
  },
  {
    label: 'Produção',
    items: [
      { href: '/dashboard/tasks', label: 'Tarefas', icon: 'tasks' },
      { href: '/dashboard/calendar', label: 'Calendário', icon: 'calendar' },
      { href: '/dashboard/files', label: 'Arquivos', icon: 'files' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/dashboard/support', label: 'Suporte', icon: 'support' },
      { href: '/dashboard/archive', label: 'Arquivados', icon: 'archive' },
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
    <aside className={cn('fixed inset-y-0 left-0 z-50 h-screen hidden lg:block', className)}>
      <div className={cn(
        'group relative h-full flex flex-col py-5',
        'w-[72px] hover:w-[264px]',
        'transition-all duration-300 ease-in-out',
        'sidebar-surface',
      )}>

        {/* Doodle accent — subtle organic dots pattern top-right */}
        <div className="pointer-events-none absolute top-0 right-0 w-20 h-32 opacity-[0.04] overflow-hidden">
          <svg width="80" height="128" viewBox="0 0 80 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="2" fill="white"/>
            <circle cx="30" cy="10" r="1.5" fill="white"/>
            <circle cx="50" cy="10" r="2" fill="white"/>
            <circle cx="70" cy="10" r="1.5" fill="white"/>
            <circle cx="10" cy="30" r="1.5" fill="white"/>
            <circle cx="30" cy="30" r="2" fill="white"/>
            <circle cx="50" cy="30" r="1.5" fill="white"/>
            <circle cx="70" cy="30" r="2" fill="white"/>
            <circle cx="10" cy="50" r="2" fill="white"/>
            <circle cx="30" cy="50" r="1.5" fill="white"/>
            <circle cx="50" cy="50" r="2" fill="white"/>
            <circle cx="70" cy="50" r="1.5" fill="white"/>
            <circle cx="10" cy="70" r="1.5" fill="white"/>
            <circle cx="30" cy="70" r="2" fill="white"/>
            <circle cx="50" cy="70" r="1.5" fill="white"/>
            <circle cx="70" cy="70" r="2" fill="white"/>
            <circle cx="10" cy="90" r="2" fill="white"/>
            <circle cx="30" cy="90" r="1.5" fill="white"/>
            <circle cx="50" cy="90" r="2" fill="white"/>
            <circle cx="70" cy="90" r="1.5" fill="white"/>
            <circle cx="10" cy="110" r="1.5" fill="white"/>
            <circle cx="30" cy="110" r="2" fill="white"/>
            <circle cx="50" cy="110" r="1.5" fill="white"/>
            <circle cx="70" cy="110" r="2" fill="white"/>
          </svg>
        </div>

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
        <div className="px-3 mb-5">
          <button className={cn(
            'bg-brand-highlight text-[hsl(40_85%_94%)] font-bold',
            'flex items-center rounded-md',
            'w-12 h-10 group-hover:w-full group-hover:h-10',
            'transition-all duration-300 ease-in-out',
            'shadow-brand hover:opacity-90 overflow-hidden'
          )}>
            {/* Ícone — fixo, sempre visível */}
            <span className="flex items-center justify-center w-12 h-10 shrink-0">
              <SlIcon name="plus" size={20} />
            </span>
            {/* Texto — só aparece quando aberto */}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-150 text-sm whitespace-nowrap pr-4 -ml-1">
              Novo Projeto
            </span>
          </button>
        </div>

        {/* ── Navegação ── */}
        <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 scrollbar-none">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1.5 px-2 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
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
                          'flex items-center rounded-md p-2 transition-all duration-200 relative overflow-hidden group/item',
                          active
                            ? 'bg-brand-highlight/20 text-white'
                            : 'text-white/40 hover:bg-white/6 hover:text-white/80'
                        )}
                      >
                        {/* Active indicator bar */}
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-highlight rounded-full shadow-[0_0_8px_hsl(var(--brand-primary)/0.6)]" />
                        )}
                        {/* Active glow bg */}
                        {active && (
                          <span className="absolute inset-0 bg-brand-highlight/10 rounded-md" />
                        )}
                        <div className="flex items-center justify-center w-8 h-8 shrink-0 relative z-10 transition-transform duration-200 group-hover/item:scale-110">
                          <SlIcon name={item.icon} size={22} />
                        </div>
                        <span className="ml-2.5 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative z-10">
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

        {/* ── Divisor de marca ── */}
        <div className="mx-3 mb-2 h-px bg-gradient-to-r from-brand-highlight/40 via-brand-highlight/10 to-transparent" />

        {/* ── Ações de Fundo ── */}
        <div className="pt-2 px-3 space-y-0.5 overflow-hidden shrink-0">
          <Link
            href="/dashboard/settings"
            title="Configurações"
            className={cn(
              'flex items-center rounded-md p-2 transition-all duration-200 overflow-hidden',
              pathname.startsWith('/dashboard/settings')
                ? 'bg-brand-highlight/20 text-white'
                : 'text-white/40 hover:bg-white/6 hover:text-white/80'
            )}
          >
            <div className="flex items-center justify-center w-8 h-8 shrink-0">
              <SlIcon name="settings" size={22} />
            </div>
            <span className="ml-2.5 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Configurações
            </span>
          </Link>

          <div className="flex items-center p-2 rounded-md text-white/40 hover:bg-white/6 hover:text-white/80 transition-colors overflow-hidden h-11 cursor-pointer" title="Aparência">
            <div className="flex items-center justify-center w-8 h-8 shrink-0">
              <ThemeToggle />
            </div>
            <span className="ml-2.5 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Aparência
            </span>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              title="Sair"
              className="w-full flex items-center rounded-md p-2 transition-all duration-200 overflow-hidden text-white/30 hover:bg-red-500/15 hover:text-red-400"
            >
              <div className="flex items-center justify-center w-8 h-8 shrink-0">
                <SlIcon name="logout" size={22} />
              </div>
              <span className="ml-2.5 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Sair do sistema
              </span>
            </button>
          </form>
        </div>

        {/* ── Identidade do Usuário ── */}
        <div className="mt-2 pt-3 border-t border-white/8 px-3 pb-1 shrink-0">
          <div className="flex items-center p-1.5 rounded-md hover:bg-white/6 transition-colors overflow-hidden cursor-pointer">
            <div className="flex items-center justify-center w-10 h-10 shrink-0">
              <Avatar name={displayName} size="sm" variant="brand" />
            </div>
            <div className="ml-3 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              <p className="text-sm font-bold text-white truncate">{displayName}</p>
              {displayEmail && (
                <p className="text-[11px] text-white/40 truncate mt-0.5">{displayEmail}</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </aside>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
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
    ],
  },
  {
    label: 'Produtos',
    items: [
      { href: '/dashboard/products', label: 'Produtos', icon: 'projects' },
      { href: '/dashboard/propostas', label: 'Propostas', icon: 'files' },
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

export function Sidebar({ className }: SidebarProps) {
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

  return (
    <aside className={cn('fixed inset-y-0 left-0 z-50 hidden lg:block', className)}>
      <div className={cn(
        'group relative flex flex-col py-5',
        'w-[72px] hover:w-[264px]',
        'transition-all duration-300 ease-in-out',
        'sidebar-surface sidebar-float',
        'overflow-hidden'
      )}>

        {/* ── Organic Brand Decorations ── */}
        {/* Flowing wave at top */}
        <div className="pointer-events-none absolute top-0 right-0 w-full h-40 overflow-hidden opacity-[0.06] dark:opacity-[0.06] flex text-text-primary">
          <svg width="264" height="160" viewBox="0 0 264 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M-20 80 C40 40 80 120 140 80 C200 40 220 100 284 60"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"
              strokeDasharray="200" strokeDashoffset="0"
            />
            <path
              d="M-20 100 C40 60 80 140 140 100 C200 60 220 120 284 80"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"
            />
          </svg>
        </div>
        {/* Organic circle blob — bottom */}
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-56 h-56 rounded-full opacity-[0.04]"
          style={{ background: 'hsl(13 55% 50%)' }}
        />

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

        {/* ── Botão Novo Projeto — Terracotta ── */}
        <div className="px-3 mb-6">
          <button className={cn(
            'bg-brand-primary text-[hsl(35_35%_95%)] font-bold font-heading',
            'flex items-center rounded-md',
            'w-12 h-10 group-hover:w-full group-hover:h-10',
            'transition-all duration-300 ease-in-out',
            'shadow-terracotta/30 shadow-md hover:opacity-90 hover:-translate-y-0.5 overflow-hidden',
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
        <nav className="flex-1 space-y-5 px-3">
          {navGroups.map((group) => (
            <div key={group.label}>
              {/* Group label — only visible on hover */}
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted/60 mb-2 px-2 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap font-body">
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
                            ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/18 dark:text-white'
                            : 'text-text-muted hover:bg-surface-muted hover:text-text-primary'
                        )}
                      >
                        {/* Active indicator — Terracotta bar */}
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-primary rounded-r-full shadow-[0_0_10px_hsl(13_55%_50%/0.7)]" />
                        )}
                        {/* Active glow fill */}
                        {active && (
                          <span className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 dark:from-brand-primary/15 to-transparent rounded-md" />
                        )}
                        {/* Icon */}
                        <div className="flex items-center justify-center w-8 h-8 shrink-0 relative z-10 transition-transform duration-200 group-hover/item:scale-110">
                          <SlIcon name={item.icon} size={22} />
                        </div>
                        {/* Label */}
                        <span className="ml-2.5 text-sm font-medium font-body whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative z-10">
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

      </div>
    </aside>
  )
}

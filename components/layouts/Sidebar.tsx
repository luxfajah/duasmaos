'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  FileStack,
  FileText,
  Package,
  TrendingUp,
  Settings2,
  Plus,
  type LucideIcon,
} from 'lucide-react'

/* ─────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────── */

const navGroups: { label: string; items: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] }[] = [
  {
    label: 'Operação',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/clients', label: 'Clientes', icon: Users, exact: true },
      { href: '/dashboard/projects', label: 'Projetos', icon: FolderKanban },
      { href: '/dashboard/tasks', label: 'Tarefas', icon: CheckSquare },
    ],
  },
  {
    label: 'Produção',
    items: [
      { href: '/dashboard/calendar', label: 'Calendário', icon: CalendarDays },
      { href: '/dashboard/files', label: 'Arquivos', icon: FileStack },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { href: '/dashboard/propostas', label: 'Propostas', icon: FileText },
      { href: '/dashboard/products', label: 'Produtos', icon: Package },
    ],
  },
  {
    label: 'Administrativo',
    items: [
      { href: '/dashboard/financeiro', label: 'Financeiro', icon: TrendingUp },
      { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings2 },
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
          <Link href="/dashboard/projects?new=true" className="block">
            <button className={cn(
              'bg-brand-primary text-[hsl(35_35%_95%)] font-semibold font-sans w-full',
              'flex items-center rounded-full',
              'w-12 h-10 group-hover:w-full group-hover:h-10',
              'transition-all duration-300 ease-in-out',
              'shadow-sm hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] overflow-hidden',
            )}>
              {/* Ícone — fixo, sempre visível */}
              <span className="flex items-center justify-center w-12 h-10 shrink-0">
                <Plus size={18} strokeWidth={1.5} />
              </span>
              {/* Texto — só aparece quando aberto */}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-150 text-sm whitespace-nowrap pr-4 -ml-1 font-heading">
                Novo Projeto
              </span>
            </button>
          </Link>
        </div>

        {/* ── Navegação ── */}
        <nav className="flex-1 space-y-5 px-3">
          {navGroups.map((group) => (
            <div key={group.label}>
              {/* Group label — only visible on hover */}
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted/65 mb-2 px-3 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap font-body">
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
                          'flex items-center rounded-lg p-2 mx-1 transition-all duration-150 relative group/item',
                          active
                            ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary font-semibold'
                            : 'text-text-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-text-primary'
                        )}
                      >
                        {/* Icon */}
                        <div className="flex items-center justify-center w-8 h-8 shrink-0 relative z-10 transition-transform duration-200 group-hover/item:scale-105">
                          <item.icon
                            size={18}
                            strokeWidth={1.5}
                            className={cn('transition-colors duration-150', active ? 'text-brand-primary' : 'text-text-secondary')}
                          />
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

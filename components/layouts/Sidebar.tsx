'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { navGroups } from '@/lib/nav.config'

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
    <aside className={cn('fixed inset-y-0 left-0 z-50 hidden md:block border-r border-border/40', className)}>
      <div className={cn(
        'group relative flex flex-col py-5',
        'md:w-16 md:hover:w-64 lg:w-64 h-screen',
        'transition-all duration-300 ease-apple',
        'bg-background/60 backdrop-blur-2xl saturate-[1.5]',
        'overflow-hidden'
      )}>

        {/* ── Logo ── */}
        <div className="mb-5 px-4 flex items-center justify-center h-8 shrink-0 relative">
          <Link href="/dashboard" className="flex items-center justify-center w-full overflow-hidden whitespace-nowrap">
            {/* Símbolo — visível quando fechado */}
            <div className="relative w-8 h-8 shrink-0 flex items-center justify-center transition-opacity duration-200 md:group-hover:opacity-0 lg:hidden">
              <Image
                src={symbolSrc}
                alt="Duas Mãos símbolo"
                fill
                className="object-contain"
                priority
              />
            </div>
            {/* Logotipo — visível quando aberto */}
            <div className="absolute inset-0 mx-auto flex justify-center h-7 w-[160px] opacity-0 md:group-hover:opacity-100 lg:opacity-100 transition-opacity duration-200 delay-75 pointer-events-none">
              <Image
                src={logoSrc}
                alt="Duas Mãos"
                fill
                className="object-contain object-center"
                priority
              />
            </div>
          </Link>
        </div>

        {/* ── Botão Novo Projeto — Terracotta ── */}
        <div className="px-2 mb-6">
          <Link href="/dashboard/projects?new=true" className="block">
            <button className={cn(
              'bg-brand-primary text-[hsl(35_35%_95%)] font-semibold font-sans w-full',
              'flex items-center rounded-full',
              'w-12 h-10 md:group-hover:w-full md:group-hover:h-10 mx-auto md:group-hover:mx-0 lg:w-full lg:mx-0',
              'transition-all duration-300 ease-apple',
              'shadow-sm hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] overflow-hidden',
            )}>
              {/* Ícone — fixo, sempre visível */}
              <span className="flex items-center justify-center w-12 h-10 shrink-0">
                <Plus size={18} strokeWidth={1.5} />
              </span>
              {/* Texto — só aparece quando aberto */}
              <span className="opacity-0 md:group-hover:opacity-100 lg:opacity-100 transition-opacity duration-200 delay-100 text-sm whitespace-nowrap font-heading pr-4">
                Novo Projeto
              </span>
            </button>
          </Link>
        </div>

        {/* ── Navegação ── */}
        <nav className="flex-1 flex flex-col justify-end pb-4 space-y-5 px-3">
          {navGroups.map((group) => (
            <div key={group.label}>
              {/* Group label — only visible on hover */}
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted/65 mb-2 px-3 h-4 opacity-0 md:group-hover:opacity-100 lg:opacity-100 transition-opacity duration-200 whitespace-nowrap font-body">
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
                          'flex items-center rounded-lg p-2 transition-all duration-150 relative group/item active:scale-[0.98]',
                          active
                            ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary font-semibold'
                            : 'text-text-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-text-primary'
                        )}
                      >
                        {/* Icon */}
                        <div className="flex items-center justify-center w-6 h-6 shrink-0 relative z-10 transition-transform duration-200 group-hover/item:scale-105 md:mx-auto md:group-hover:mx-0 lg:mx-0">
                          <item.icon
                            size={18}
                            strokeWidth={1.5}
                            className={cn('transition-colors duration-150', active ? 'text-brand-primary' : 'text-text-secondary')}
                          />
                        </div>
                        {/* Label */}
                        <span className="ml-2.5 text-sm font-medium font-body whitespace-nowrap opacity-0 md:group-hover:opacity-100 lg:opacity-100 transition-opacity duration-200 relative z-10">
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

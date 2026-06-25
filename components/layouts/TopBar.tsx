'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Settings2, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { navGroups } from '@/lib/nav.config'
import { usePathname } from 'next/navigation'

interface TopBarProps {
  className?: string
  userName?: string | null
  userEmail?: string | null
  userAvatar?: string | null
  tasks?: Array<{
    id: string
    title: string
    status: string
    due_date?: string | null
    deadline?: string | null
    v2_projects?: { name: string } | null
    projects?: { name: string } | null
  }>
}

export function TopBar({ className, userName, userEmail, userAvatar, tasks = [] }: TopBarProps) {
  const displayName = userName ?? userEmail?.split('@')[0] ?? 'Usuário'
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <header
      className={cn(
        'h-16 sticky top-0 z-30',
        'flex items-center px-6 lg:px-8',
        'bg-background/60 backdrop-blur-2xl saturate-[1.5] border-b border-border/40',
        className
      )}
    >
      <div className="flex-1 flex items-center">
        {/* Mobile Hamburger Menu */}
        <Sheet>
          <SheetTrigger className="lg:hidden p-2 -ml-2 mr-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors">
            <Menu size={20} strokeWidth={1.5} />
            <span className="sr-only">Abrir menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col py-5 h-full overflow-y-auto">
              <div className="mb-6 px-6">
                <Link href="/dashboard" className="flex items-center">
                  <div className="relative h-7 w-[160px] pointer-events-none">
                    <img src="/brand/logos/logotipo-light.png" alt="Duas Mãos" className="object-contain object-left h-full dark:hidden" />
                    <img src="/brand/logos/logotipo-dark.png" alt="Duas Mãos" className="object-contain object-left h-full hidden dark:block" />
                  </div>
                </Link>
              </div>
              <nav className="flex-1 space-y-5 px-4">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted/65 mb-2 px-2 h-4 whitespace-nowrap font-body">
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
                                'flex items-center rounded-lg p-2 transition-all duration-150 relative active:scale-[0.98]',
                                active
                                  ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary font-semibold'
                                  : 'text-text-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-text-primary'
                              )}
                            >
                              <div className="flex items-center justify-center w-6 h-6 shrink-0 relative z-10">
                                <item.icon size={18} strokeWidth={1.5} className={cn('transition-colors duration-150', active ? 'text-brand-primary' : 'text-text-secondary')} />
                              </div>
                              <span className="ml-2.5 text-sm font-medium font-body whitespace-nowrap relative z-10">
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
          </SheetContent>
        </Sheet>
      </div>

      {/* Portal target for dynamic center titles */}
      <div id="top-bar-center" className="fixed left-1/2 -translate-x-1/2 top-0 h-16 flex items-center justify-center z-[40]" />

      <div className="flex-1 flex justify-end items-center gap-2 shrink-0">
        <ThemeToggle className="text-text-muted hover:text-text-primary active:scale-[0.95] transition-all duration-150" />

        <Link href="/dashboard/settings" title="Meu Perfil" className="p-2 text-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary rounded-full transition-all duration-150 active:scale-[0.95]">
          <Settings2 size={17} strokeWidth={1.5} />
        </Link>

        <NotificationCenter tasks={tasks} />

        <div className="h-5 w-px bg-black/10 dark:bg-white/10 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer group outline-none">
              <Avatar
                name={displayName}
                src={userAvatar || undefined}
                size="sm"
                variant="brand"
                className="transition-transform duration-200 group-hover:scale-105 ring-1 ring-black/10 dark:ring-white/10 cursor-pointer"
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2.5 py-1.5 text-sm">
              <p className="font-bold font-heading text-text-primary truncate">{displayName}</p>
              <p className="text-xs text-text-muted font-body truncate">{userEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <Link href="/dashboard/settings">
              <DropdownMenuItem>
                <Settings2 size={14} strokeWidth={1.5} className="mr-2" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <form action="/auth/signout" method="post" className="w-full">
              <button type="submit" className="w-full">
                <DropdownMenuItem variant="danger">
                  <LogOut size={14} strokeWidth={1.5} className="mr-2" />
                  <span>Sair do sistema</span>
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
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

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

  return (
    <header
      className={cn(
        'h-16 sticky top-0 z-30',
        'flex items-center px-6 lg:px-8',
        'glass depth-modal border-x-0 border-t-0 border-b border-border/50 rounded-none',
        className
      )}
    >
      <div className="flex-1" />

      <div className="flex-1 flex justify-end items-center gap-2 shrink-0">
        <ThemeToggle className="text-text-muted hover:text-text-primary" />

        <Link href="/dashboard/settings" title="Meu Perfil" className="p-2 text-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary rounded-full transition-all duration-150">
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

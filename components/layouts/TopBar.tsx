'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Bell, Search, Settings, LogOut, Moon, Sun } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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
}

export function TopBar({ className, userName, userEmail, userAvatar }: TopBarProps) {
  const displayName = userName ?? userEmail?.split('@')[0] ?? 'Usuário'

  return (
    <header
      className={cn(
        'h-14 relative z-30',
        'flex items-center px-6 lg:px-8',
        'bg-transparent',
        className
      )}
    >
      {/* Spacer para equilibrar o flex */}
      <div className="flex-1" />

      {/* Controladores Direitos */}
      <div className="flex-1 flex justify-end items-center gap-2 shrink-0">
        
        {/* Aparência (Theme) */}
        <ThemeToggle className="text-text-muted hover:text-text-primary" />

        {/* Configurações */}
        <Link href="/dashboard/settings" title="Configurações" className="p-2 text-text-muted hover:bg-sand-warm hover:text-text-primary rounded-xl transition-all duration-150 hover:scale-105">
          <Settings size={17} strokeWidth={1.75} />
        </Link>
        
        {/* Notificações */}
        <button
          className={cn(
            'relative rounded-xl p-2',
            'text-text-muted hover:bg-sand-warm hover:text-text-primary',
            'transition-all duration-150 hover:scale-105'
          )}
          aria-label="Notificações"
        >
          <Bell size={17} strokeWidth={1.75} />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand-primary ring-2 ring-background animate-pulse" />
        </button>

        <div className="h-5 w-px bg-sand-dark/40 mx-1" />

        {/* Avatar com Dropdown (CRUD) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer group outline-none">
              <Avatar
                name={displayName}
                src={userAvatar || undefined}
                size="sm"
                variant="brand"
                className="transition-transform duration-200 group-hover:scale-105 ring-2 ring-brand-primary/20 cursor-pointer"
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
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <form action="/auth/signout" method="post" className="w-full">
              <button type="submit" className="w-full">
                <DropdownMenuItem variant="danger">
                  <LogOut className="mr-2 h-4 w-4" />
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
   CONTENT WRAPPER — unchanged, kept for compat
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

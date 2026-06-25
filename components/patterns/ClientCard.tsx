import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { FolderOpen, ArrowRight, Phone, Mail } from 'lucide-react'

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */

export interface ClientCardProps {
  id: string
  name: string
  /** Segmento/categoria do cliente */
  segment?: string
  /** Número de projetos ativos */
  activeProjects?: number
  /** Número de projetos totais */
  totalProjects?: number
  /** Status do cliente */
  status?: 'active' | 'paused' | 'churned'
  /** Email de contato */
  email?: string
  /** Telefone de contato */
  phone?: string
  /** URL de logo do cliente */
  logoSrc?: string
  /** Link para detalhes */
  href?: string
  className?: string
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */

const clientStatusConfig = {
  active: { label: 'Ativo', variant: 'success' as const },
  paused: { label: 'Pausado', variant: 'draft' as const },
  churned: { label: 'Inativo', variant: 'danger' as const },
}

export function ClientCard({
  id,
  name,
  segment,
  activeProjects = 0,
  totalProjects = 0,
  status = 'active',
  email,
  phone,
  logoSrc,
  href,
  className,
}: ClientCardProps) {
  const statusCfg = clientStatusConfig[status]
  const Wrapper = href ? Link : 'div'
  const wrapperProps = href ? { href } : {}

  return (
    <Wrapper
      {...(wrapperProps as any)}
      data-slot="client-card"
      className={cn(
        'group flex flex-col gap-4 rounded-xl glass-panel p-5',
        'transition-all duration-200',
        'hover:border-border-strong hover:shadow-md hover:-translate-y-0.5',
        href && 'cursor-pointer',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar
          name={name}
          src={logoSrc}
          size="md"
          variant="brand"
          className="shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-text-primary text-sm leading-tight truncate group-hover:text-brand-primary transition-colors">
              {name}
            </h3>
            <Badge variant={statusCfg.variant} className="shrink-0">
              {statusCfg.label}
            </Badge>
          </div>
          {segment && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-0.5">
              {segment}
            </p>
          )}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-1 border-y border-border py-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">
            Projetos ativos
          </p>
          <p className="text-2xl font-bold text-text-primary tabular-nums">
            {activeProjects}
          </p>
        </div>
        <div className="border-l border-border pl-3">
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">
            Total de projetos
          </p>
          <p className="text-2xl font-bold text-text-secondary tabular-nums">
            {totalProjects}
          </p>
        </div>
      </div>

      {/* Contato + Link */}
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          {email && (
            <a
              href={`mailto:${email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-primary transition-colors truncate"
            >
              <Mail size={11} />
              {email}
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-primary transition-colors"
            >
              <Phone size={11} />
              {phone}
            </a>
          )}
        </div>

        {href && (
          <span className="inline-flex items-center gap-1 text-xs text-text-muted group-hover:text-brand-primary transition-colors shrink-0">
            <FolderOpen size={12} />
            Ver projetos
            <ArrowRight
              size={12}
              className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
            />
          </span>
        )}
      </div>
    </Wrapper>
  )
}

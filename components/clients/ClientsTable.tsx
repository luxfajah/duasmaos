'use client'

import { useState } from 'react'
import { Client } from '@/types/database'
import { deleteClient } from '@/app/dashboard/clients/actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, ExternalLink, Briefcase, User, Building2 } from 'lucide-react'
import Link from 'next/link'

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active: { label: 'Ativo', variant: 'default' }, // We'll override the color via Tailwind
  inactive: { label: 'Inativo', variant: 'secondary' },
  paused: { label: 'Pausado', variant: 'destructive' },
}

function formatCPF(v: string) {
  return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

function formatCNPJ(v: string) {
  return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
}

function formatPhone(v: string) {
  if (v.length === 11) {
    return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
  return v.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
}

interface ClientsTableProps {
  clients: Client[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Date constants for birthday comparisons
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    setDeletingId(id)
    try {
      await deleteClient(id)
    } catch (e) {
      alert('Erro ao excluir cliente.')
    } finally {
      setDeletingId(null)
    }
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-4">
          <span className="text-2xl">👥</span>
        </div>
        <p className="text-text-secondary font-medium">Nenhum cliente cadastrado</p>
        <p className="text-text-muted text-sm mt-1">Crie seu primeiro cliente para começar.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-b border-black/[0.04] dark:border-white/[0.08]">
          <TableHead className="w-[300px] h-10 px-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Nome / Empresa</TableHead>
          <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Documento</TableHead>
          <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Contato</TableHead>
          <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Projetos</TableHead>
          <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Status</TableHead>
          <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => {
          const status = statusMap[client.status] ?? { label: client.status, variant: 'secondary' as const }
          const isPJ = client.type === 'pj'
          const identifier = isPJ ? client.cnpj : client.cpf
          const formattedIdentifier = identifier 
            ? (isPJ ? formatCNPJ(identifier) : formatCPF(identifier))
            : '—'
          
          // Birthday calculations
          let isBirthdayToday = false
          let isBirthdayThisMonth = false

          if (client.birth_date) {
            const [_, m, d] = client.birth_date.split('-')
            isBirthdayToday = parseInt(m, 10) === currentMonth && parseInt(d, 10) === currentDay
            isBirthdayThisMonth = parseInt(m, 10) === currentMonth
          }
          
          return (
            <TableRow key={client.id} className="group transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02] border-b border-black/[0.04] dark:border-white/[0.04]">
              <TableCell className="py-3 px-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 shadow-sm shadow-brand-primary/5">
                    {isPJ ? <Building2 size={18} strokeWidth={1.5} /> : <User size={18} strokeWidth={1.5} />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold font-sans text-text-primary truncate flex items-center gap-1.5 text-[15px] tracking-tight">
                      {isPJ ? (client.company || client.name) : client.name}
                      {isBirthdayToday && (
                        <Badge 
                          variant="outline" 
                          className="bg-amber-500/10 text-amber-600 border-amber-500/20 py-0.5 px-1.5 text-[9px] font-bold uppercase tracking-tight animate-bounce flex items-center gap-0.5"
                        >
                          Hoje! 🎂
                        </Badge>
                      )}
                      {!isBirthdayToday && isBirthdayThisMonth && (
                        <span className="text-sm cursor-help" title="Aniversário este mês!">🎈</span>
                      )}
                    </span>
                    {isPJ && client.name && client.company !== client.name && (
                      <span className="text-[13px] text-text-secondary truncate mt-0.5 font-medium">
                        Resp: {client.name}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-3 px-4 text-text-secondary font-mono text-[13px]">
                {formattedIdentifier}
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="flex flex-col">
                  <span className="text-[14px] text-text-primary font-medium">{client.email || '—'}</span>
                  {client.phone && (
                    <span className="text-[13px] text-text-secondary">{formatPhone(client.phone)}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1 font-normal bg-white/5 border-black/5 dark:border-white/10">
                    <Briefcase size={12} className="text-text-muted" />
                    {client.projects_count || 0}
                  </Badge>
                  {client.active_projects_count ? (
                    <span className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse shadow-[0_0_8px_rgba(52,199,89,0.4)]" title="Projetos ativos" />
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="py-3 px-4">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "font-medium border-0 px-2 py-0.5 text-xs",
                    client.status === 'active' && 'bg-[#34c759]/15 text-[#34c759] dark:bg-[#34c759]/20',
                    client.status === 'paused' && 'bg-[#ff9500]/15 text-[#ff9500] dark:bg-[#ff9500]/20',
                    client.status === 'inactive' && 'bg-[#8e8e93]/15 text-[#8e8e93] dark:bg-[#8e8e93]/20'
                  )}
                >
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <Link href={`/dashboard/clients/${client.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10">
                      <ExternalLink size={15} strokeWidth={1.5} />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/clients/${client.id}/edit`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5">
                      <Pencil size={15} strokeWidth={1.5} />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0 text-text-secondary hover:text-[#ff3b30] hover:bg-[#ff3b30]/10"
                    onClick={() => handleDelete(client.id)}
                    disabled={deletingId === client.id}
                  >
                    <Trash2 size={15} strokeWidth={1.5} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

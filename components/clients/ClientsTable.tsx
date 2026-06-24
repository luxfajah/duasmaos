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
  active: { label: 'Ativo', variant: 'default' },
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
        <TableRow>
          <TableHead className="w-[300px]">Nome / Empresa</TableHead>
          <TableHead>Documento</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>Projetos</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
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
            <TableRow key={client.id} className="group">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    {isPJ ? <Building2 size={18} /> : <User size={18} />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-text-primary truncate flex items-center gap-1.5">
                      {isPJ ? (client.company || client.name) : client.name}
                      {isBirthdayToday && (
                        <Badge 
                          variant="outline" 
                          className="bg-amber-500/10 text-amber-600 border-amber-500/20 py-0.5 px-1.5 text-[9px] font-black uppercase tracking-tight animate-bounce flex items-center gap-0.5"
                        >
                          Hoje! 🎂
                        </Badge>
                      )}
                      {!isBirthdayToday && isBirthdayThisMonth && (
                        <span 
                          className="text-sm cursor-help animate-pulse" 
                          title="Aniversário este mês!"
                        >
                          🎈
                        </span>
                      )}
                    </span>
                    {isPJ && client.name && client.company !== client.name && (
                      <span className="text-xs text-text-muted truncate">
                        Resp: {client.name}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-text-secondary font-mono text-xs">
                {formattedIdentifier}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm text-text-primary">{client.email || '—'}</span>
                  {client.phone && (
                    <span className="text-xs text-text-muted">{formatPhone(client.phone)}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1 font-normal">
                    <Briefcase size={12} className="text-text-muted" />
                    {client.projects_count || 0}
                  </Badge>
                  {client.active_projects_count ? (
                    <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" title="Projetos ativos" />
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/dashboard/clients/${client.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink size={14} />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/clients/${client.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Pencil size={14} />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-status-danger hover:text-status-danger hover:bg-status-danger/10"
                    onClick={() => handleDelete(client.id)}
                    disabled={deletingId === client.id}
                  >
                    <Trash2 size={14} />
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

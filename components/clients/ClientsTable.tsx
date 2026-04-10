'use client'

import { useState } from 'react'
import { Client } from '@/types/database'
import { updateClient, deleteClient } from '@/app/dashboard/clients/actions'
import { ClientModal } from './ClientModal'
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
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active: { label: 'Ativo', variant: 'default' },
  inactive: { label: 'Inativo', variant: 'secondary' },
  paused: { label: 'Pausado', variant: 'destructive' },
}

interface ClientsTableProps {
  clients: Client[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const status = statusMap[client.status] ?? { label: client.status, variant: 'secondary' as const }
            return (
              <TableRow key={client.id} className="group">
                <TableCell className="font-medium text-text-primary">{client.name}</TableCell>
                <TableCell className="text-text-secondary">{client.company ?? '—'}</TableCell>
                <TableCell className="text-text-secondary">{client.email ?? '—'}</TableCell>
                <TableCell className="text-text-secondary">{client.phone ?? '—'}</TableCell>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setEditingClient(client)}
                    >
                      <Pencil size={14} />
                    </Button>
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

      {editingClient && (
        <ClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
        />
      )}
    </>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProposal } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { SlIcon } from '@/components/ui/StreamlineIcon'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { toast } from 'sonner'
import Link from 'next/link'

interface Proposal {
  id: string
  client_name: string
  created_at: string
  status: string
}

export function ProposalsClient({ initialProposals }: { initialProposals: Proposal[] }) {
  const router = useRouter()
  const [proposals, setProposals] = useState(initialProposals)
  const [isCreating, setIsCreating] = useState(false)
  const [newClientName, setNewClientName] = useState('')

  const handleCreate = async () => {
    if (!newClientName.trim()) {
      toast.error('Informe o nome do cliente')
      return
    }
    
    setIsCreating(true)
    try {
      const newProposal = await createProposal(newClientName)
      setProposals([newProposal, ...proposals])
      setNewClientName('')
      toast.success('Proposta criada com sucesso!')
      router.push(`/dashboard/propostas/${newProposal.id}`)
    } catch (error: any) {
      toast.error('Erro ao criar: ' + error.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-surface-muted/50 p-4 rounded-xl border border-border">
        <Input
          placeholder="Nome do cliente (ex: Apple Inc.)"
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
          className="max-w-sm bg-background"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <Button onClick={handleCreate} disabled={isCreating} className="bg-brand-primary text-white">
          <SlIcon name="plus" size={16} className="mr-2" />
          {isCreating ? 'Criando...' : 'Nova Proposta'}
        </Button>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-muted/30">
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-text-muted">
                  Nenhuma proposta encontrada.
                </TableCell>
              </TableRow>
            ) : (
              proposals.map((proposal) => (
                <TableRow key={proposal.id} className="group hover:bg-surface-muted/20">
                  <TableCell className="font-medium">{proposal.client_name}</TableCell>
                  <TableCell>
                    <StatusBadge label={proposal.status} variant={proposal.status === 'draft' ? 'warning' : 'success'} />
                  </TableCell>
                  <TableCell className="text-text-muted text-sm">
                    {format(new Date(proposal.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/propostas/${proposal.id}`}>
                          <SlIcon name="edit" size={14} className="mr-2" />
                          Editar
                        </Link>
                      </Button>
                      <Button variant="default" size="sm" asChild className="bg-brand-deep-blue text-white">
                        <a href={`/proposta/index.html?id=${proposal.id}`} target="_blank" rel="noreferrer">
                          <SlIcon name="eye" size={14} className="mr-2" />
                          Ver Link
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

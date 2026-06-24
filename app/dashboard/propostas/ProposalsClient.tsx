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
  client_id?: string
  client_name: string
  created_at: string
  status: string
}

export function ProposalsClient({ initialProposals, clients }: { initialProposals: Proposal[], clients: { id: string, name: string }[] }) {
  const router = useRouter()
  const [proposals, setProposals] = useState(initialProposals)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState('')

  const handleCreate = async () => {
    if (!selectedClientId) {
      toast.error('Selecione um cliente para a proposta')
      return
    }
    
    setIsCreating(true)
    try {
      const newProposal = await createProposal(selectedClientId)
      setProposals([newProposal, ...proposals])
      setSelectedClientId('')
      toast.success('Proposta criada com sucesso!')
      router.push(`/dashboard/propostas/${newProposal.id}`)
    } catch (error: any) {
      toast.error('Erro ao criar: ' + error.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 bg-surface-muted/50 p-4 rounded-xl border border-border">
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="flex h-10 w-full max-w-sm rounded-xl border border-border/50 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 ease-apple"
        >
          <option value="" disabled>Selecione o Cliente</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
        <Button onClick={handleCreate} disabled={isCreating || !selectedClientId} className="bg-brand-primary text-white active:scale-[0.97] transition-all duration-300 ease-apple">
          <SlIcon name="plus" size={16} className="mr-2" />
          {isCreating ? 'Criando...' : 'Nova Proposta'}
        </Button>
      </div>

      <div className="apple-bezel"><div className="apple-bezel-inner overflow-hidden">
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
                <TableRow key={proposal.id} className="group hover:bg-surface-muted/20 transition-all duration-300 ease-apple">
                  <TableCell className="font-medium">{proposal.client_name}</TableCell>
                  <TableCell>
                    <StatusBadge label={proposal.status} variant={proposal.status === 'draft' ? 'warning' : 'success'} />
                  </TableCell>
                  <TableCell className="text-text-muted text-sm">
                    {format(new Date(proposal.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-apple">
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
      </div></div>
    </div>
  )
}

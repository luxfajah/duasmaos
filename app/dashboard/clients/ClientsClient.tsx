'use client'

import { useState } from 'react'
import { Client } from '@/types/database'
import { ClientsTable } from '@/components/clients/ClientsTable'
import { ClientModal } from '@/components/clients/ClientModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'

interface ClientsClientProps {
  initialClients: Client[]
}

export function ClientsClient({ initialClients }: ClientsClientProps) {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = initialClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, empresa ou e-mail..."
            className="pl-9"
            id="clients-search"
          />
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 flex-shrink-0">
          <Plus size={16} />
          Novo Cliente
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <ClientsTable clients={filtered} />
      </div>

      {showModal && (
        <ClientModal onClose={() => setShowModal(false)} />
      )}
    </>
  )
}

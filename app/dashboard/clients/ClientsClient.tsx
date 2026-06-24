'use client'

import { useState } from 'react'
import { Client } from '@/types/database'
import { ClientsTable } from '@/components/clients/ClientsTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Users, UserCheck, Briefcase, Gift } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import Link from 'next/link'

interface ClientsClientProps {
  initialClients: Client[]
}

type StatusFilter = 'all' | 'active' | 'paused' | 'inactive'

export function ClientsClient({ initialClients }: ClientsClientProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  // Date constants for birthday comparisons
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()

  // ── Metrics Calculation ──
  const totalClients = initialClients.length
  
  const activeClients = initialClients.filter(c => c.status === 'active').length
  const activeClientsPercent = totalClients > 0 
    ? Math.round((activeClients / totalClients) * 100) 
    : 0

  const activeProjects = initialClients.reduce((acc, c) => acc + (c.active_projects_count || 0), 0)

  const birthdaysThisMonth = initialClients.filter(c => {
    if (!c.birth_date) return false
    const [_, m] = c.birth_date.split('-')
    return parseInt(m, 10) === currentMonth
  }).length

  const birthdaysToday = initialClients.filter(c => {
    if (!c.birth_date) return false
    const [_, m, d] = c.birth_date.split('-')
    return parseInt(m, 10) === currentMonth && parseInt(d, 10) === currentDay
  }).length

  // Filter calculations for tabs
  const countAll = totalClients
  const countActive = initialClients.filter(c => c.status === 'active').length
  const countPaused = initialClients.filter(c => c.status === 'paused').length
  const countInactive = initialClients.filter(c => c.status === 'inactive').length

  // Filter clients to display in table
  const filtered = initialClients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.trade_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.cnpj ?? '').includes(search.replace(/\D/g, '')) ||
      (c.cpf ?? '').includes(search.replace(/\D/g, ''))

    const matchesStatus = statusFilter === 'all' ? true : c.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      {/* ── Mini Dashboard / KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total de Clientes"
          value={totalClients}
          icon={Users}
          description="Clientes registrados na base"
          accent="info"
        />
        <MetricCard
          label="Clientes Ativos"
          value={activeClients}
          icon={UserCheck}
          description={`${activeClientsPercent}% do total de clientes`}
          accent="success"
        />
        <MetricCard
          label="Projetos Ativos"
          value={activeProjects}
          icon={Briefcase}
          description="Projetos em andamento"
          accent="default"
        />
        <MetricCard
          label="Aniversariantes"
          value={`${birthdaysThisMonth} no mês`}
          icon={Gift}
          description={birthdaysToday > 0 ? `${birthdaysToday} hoje! 🎂🎉` : "Nenhum aniversariante hoje"}
          accent="warning"
          featured={birthdaysToday > 0}
        />
      </div>

      {/* ── Filter Bar & Actions ── */}
      <div className="flex flex-col gap-6">
        {/* Status Tabs & New Client Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border gap-4">
          <div className="flex overflow-x-auto scrollbar-none gap-6">
            <button
              onClick={() => setStatusFilter('all')}
              className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all duration-300 ease-apple shrink-0 ${
                statusFilter === 'all'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              Todos ({countAll})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all duration-300 ease-apple shrink-0 ${
                statusFilter === 'active'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              Ativos ({countActive})
            </button>
            <button
              onClick={() => setStatusFilter('paused')}
              className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all duration-300 ease-apple shrink-0 ${
                statusFilter === 'paused'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              Pausados ({countPaused})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`pb-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all duration-300 ease-apple shrink-0 ${
                statusFilter === 'inactive'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              Inativos ({countInactive})
            </button>
          </div>

          <div className="pb-2">
            <Link href="/dashboard/clients/new">
              <Button className="flex items-center gap-2 w-full sm:w-auto shadow-brand active:scale-[0.97] transition-all duration-300 ease-apple">
                <Plus size={16} />
                Novo Cliente
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Control */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, empresa, e-mail, CPF ou CNPJ..."
            className="pl-10 h-11 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]"
            id="clients-search"
          />
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="apple-bezel"><div className="apple-bezel-inner overflow-hidden">
        <ClientsTable clients={filtered} />
      </div></div>
    </div>
  )
}

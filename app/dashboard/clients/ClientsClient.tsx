'use client'

import { cn } from '@/lib/utils'

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Search Control (Apple HIG Search Field) */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, empresa, documento..."
            className={cn(
              'pl-9 h-10 w-full rounded-full transition-all duration-200',
              'bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/[0.07] dark:hover:bg-white/[0.07]',
              'focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:bg-transparent dark:focus-visible:bg-transparent'
            )}
            id="clients-search"
          />
        </div>

        {/* Status Segmented Control & Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center p-1 bg-black/5 dark:bg-white/5 rounded-xl">
            {[
              { id: 'all', label: `Todos (${countAll})` },
              { id: 'active', label: `Ativos (${countActive})` },
              { id: 'paused', label: `Pausados (${countPaused})` },
              { id: 'inactive', label: `Inativos (${countInactive})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as StatusFilter)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ease-apple select-none',
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-white/10 text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link href="/dashboard/clients/new">
            <Button className="flex items-center gap-2 h-10 rounded-full px-5 shadow-brand active:scale-[0.96] transition-all duration-300 ease-apple">
              <Plus size={16} strokeWidth={2} />
              <span className="font-semibold font-sans">Novo Cliente</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Table Container (Glass) ── */}
      <div className="bg-surface-primary/70 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-3xl saturate-150 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] overflow-hidden">
        <ClientsTable clients={filtered} />
      </div>
    </div>
  )
}

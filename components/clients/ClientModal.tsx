'use client'

import { useState, useTransition } from 'react'
import { Client, ClientStatus } from '@/types/database'
import { createClient_ } from '@/app/dashboard/clients/actions'
import { updateClient } from '@/app/dashboard/clients/actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ClientModalProps {
  client?: Client | null
  onClose: () => void
}

export function ClientModal({ client, onClose }: ClientModalProps) {
  const isEdit = !!client
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: client?.name ?? '',
    company: client?.company ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    status: (client?.status ?? 'active') as ClientStatus,
  })

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.name.trim()) {
      setError('O nome é obrigatório.')
      return
    }
    startTransition(async () => {
      try {
        if (isEdit && client) {
          await updateClient(client.id, form)
        } else {
          await createClient_(form)
        }
        onClose()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar cliente.')
      }
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="client-name">
              Nome *
            </label>
            <Input
              id="client-name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: João Silva"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="client-company">
              Empresa
            </label>
            <Input
              id="client-company"
              value={form.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="Ex: Acme Ltda."
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary" htmlFor="client-email">
                E-mail
              </label>
              <Input
                id="client-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@empresa.com"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary" htmlFor="client-phone">
                Telefone
              </label>
              <Input
                id="client-phone"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                disabled={isPending}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="client-status">
              Status
            </label>
            <select
              id="client-status"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              disabled={isPending}
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="paused">Pausado</option>
            </select>
          </div>
          {error && (
            <p className="text-sm text-status-danger bg-status-danger/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

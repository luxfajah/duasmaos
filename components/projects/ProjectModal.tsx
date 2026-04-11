'use client'

import { useState, useTransition } from 'react'
import { V2Project, ProjectStatusV2, WorkflowTypeV2, Priority } from '@/types/database'
import { createV2Project, getV2ProjectById } from '@/app/dashboard/v2/actions'
import { updateProject } from '@/app/dashboard/projects/actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProjectTypeSelect } from '@/components/projects/ProjectTypeSelect'

interface ProjectModalProps {
  project?: V2Project | null
  clients: { id: string; name: string }[]
  team: { id: string; full_name: string }[]
  onClose: () => void
}

export function ProjectModal({ project, clients, team, onClose }: ProjectModalProps) {
  const isEdit = !!project
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: project?.name ?? '',
    description: '', // V2 projects don't have description in the insert yet, can add if needed
    client_id: project?.client_id ?? '',
    workflow_type: (project?.workflow_type ?? 'branding') as WorkflowTypeV2,
    status: (project?.status ?? 'active') as ProjectStatusV2,
    priority: 'medium' as Priority,
    deadline: '',
    owner_id: '',
  })

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.name.trim()) {
      setError('O nome do projeto é obrigatório.')
      return
    }
    if (!form.client_id) {
      setError('Selecione um cliente.')
      return
    }
    startTransition(async () => {
      try {
        if (isEdit && project) {
          // For now, only update status/name if needed, but routing to legacy update for fields
          await updateProject(project.id, {
            name: form.name,
            status: form.status as any,
          } as any)
        } else {
          await createV2Project({
            name: form.name,
            client_id: form.client_id,
            workflow_type: form.workflow_type,
            workspace_id: 'default' // This should come from a context ideally
          })
        }
        onClose()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar projeto.')
      }
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Nome do projeto *</label>
            <Input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Campanha de Lançamento"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Pipeline de Processo (Workflow)</label>
            <select
              value={form.workflow_type}
              onChange={(e) => handleChange('workflow_type', e.target.value)}
              disabled={isPending || isEdit}
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
            >
              <option value="branding">Branding (8 etapas)</option>
              <option value="social_media">Social Media (4 etapas)</option>
              <option value="website">Website (6 etapas)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva o objetivo do projeto..."
              disabled={isPending}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Cliente *</label>
              <select
                value={form.client_id}
                onChange={(e) => handleChange('client_id', e.target.value)}
                disabled={isPending}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
              >
                <option value="">Selecionar...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Responsável</label>
              <select
                value={form.owner_id}
                onChange={(e) => handleChange('owner_id', e.target.value)}
                disabled={isPending}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
              >
                <option value="">Sem responsável</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={isPending}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
              >
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
                <option value="completed">Concluído</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Prioridade</label>
              <select
                value={form.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                disabled={isPending}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Prazo</label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
                disabled={isPending}
              />
            </div>
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
              {isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar projeto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

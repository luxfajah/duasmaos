'use client'

import { useState, useTransition } from 'react'
import { Project, ProjectStatus, ProjectType, Priority } from '@/types/database'
import { createProject, updateProject } from '@/app/dashboard/projects/actions'
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
  project?: Project | null
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
    description: project?.description ?? '',
    client_id: project?.client_id ?? '',
    type: (project?.type ?? null) as ProjectType | null,
    status: (project?.status ?? 'draft') as ProjectStatus,
    priority: (project?.priority ?? 'medium') as Priority,
    deadline: project?.deadline ? project.deadline.split('T')[0] : '',
    owner_id: project?.owner_id ?? '',
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
        const payload = {
          ...form,
          type: form.type ?? undefined,
          deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
          owner_id: form.owner_id || undefined,
          description: form.description || undefined,
        }
        if (isEdit && project) {
          await updateProject(project.id, payload)
        } else {
          await createProject(payload)
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
            <label className="text-sm font-medium text-text-primary">Tipo de projeto</label>
            <ProjectTypeSelect
              value={form.type}
              onChange={(type) => setForm((prev) => ({ ...prev, type }))}
            />
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
                <option value="draft">Rascunho</option>
                <option value="copy">Copy</option>
                <option value="review">Revisão</option>
                <option value="approved">Aprovado</option>
                <option value="delayed">Atrasado</option>
                <option value="completed">Concluído</option>
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

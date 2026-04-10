'use client'

import { useState, useTransition } from 'react'
import { Task, TaskStatus, Priority } from '@/types/database'
import { createTask, updateTask } from '@/app/dashboard/tasks/actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TaskModalProps {
  task?: Task | null
  projects: { id: string; name: string }[]
  team: { id: string; full_name: string }[]
  defaultProjectId?: string
  onClose: () => void
}

export function TaskModal({ task, projects, team, defaultProjectId, onClose }: TaskModalProps) {
  const isEdit = !!task
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    project_id: task?.project_id ?? defaultProjectId ?? '',
    title: task?.title ?? '',
    description: task?.description ?? '',
    assigned_to: task?.assigned_to ?? '',
    status: (task?.status ?? 'todo') as TaskStatus,
    priority: (task?.priority ?? 'medium') as Priority,
    deadline: task?.deadline ? task.deadline.split('T')[0] : '',
  })

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.title.trim()) {
      setError('O título da tarefa é obrigatório.')
      return
    }
    if (!form.project_id) {
      setError('Selecione um projeto.')
      return
    }
    startTransition(async () => {
      try {
        const payload = {
          ...form,
          deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
          assigned_to: form.assigned_to || undefined,
          description: form.description || undefined,
        }
        if (isEdit && task) {
          await updateTask(task.id, payload)
        } else {
          await createTask(payload)
        }
        onClose()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar tarefa.')
      }
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Título *</label>
            <Input
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Criar copy para Instagram"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Projeto *</label>
            <select
              value={form.project_id}
              onChange={(e) => handleChange('project_id', e.target.value)}
              disabled={isPending}
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
            >
              <option value="">Selecionar projeto...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Responsável</label>
              <select
                value={form.assigned_to}
                onChange={(e) => handleChange('assigned_to', e.target.value)}
                disabled={isPending}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
              >
                <option value="">Sem responsável</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={isPending}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
              >
                <option value="todo">A fazer</option>
                <option value="in_progress">Em progresso</option>
                <option value="review">Revisão</option>
                <option value="done">Concluído</option>
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
              {isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar tarefa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

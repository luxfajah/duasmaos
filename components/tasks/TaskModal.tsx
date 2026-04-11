'use client'

import { useState, useEffect, useTransition } from 'react'
import { V2Task, TaskStatusV2, TaskPriorityV2, DeliverableTypeV2, V2SocialPost } from '@/types/database'
import { createTask, updateTask } from '@/app/dashboard/tasks/actions'
import { getSocialPosts } from '@/app/dashboard/tasks/social-actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SocialPostGrid } from '@/components/social/SocialPostGrid'
import { SocialPostModal } from '@/components/social/SocialPostModal'
import { Hash, Sparkles, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskModalProps {
  task?: V2Task | null
  projects: { id: string; name: string }[]
  team: { id: string; full_name: string }[]
  defaultProjectId?: string
  onClose: () => void
}

export function TaskModal({ task, projects, team, defaultProjectId, onClose }: TaskModalProps) {
  const isEdit = !!task
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  // Social Posts state
  const [socialPosts, setSocialPosts] = useState<V2SocialPost[]>([])
  const [selectedPost, setSelectedPost] = useState<V2SocialPost | null>(null)

  const [form, setForm] = useState({
    project_id: task?.project_id ?? defaultProjectId ?? '',
    title: task?.title ?? '',
    description: task?.description ?? '',
    assigned_to: task?.assigned_to ?? '',
    status: (task?.status ?? 'pending') as TaskStatusV2,
    priority: (task?.priority ?? 'medium') as TaskPriorityV2,
    deadline: task?.due_date ? task.due_date.split('T')[0] : '',
    deliverable_type: (task?.deliverable_type ?? '') as DeliverableTypeV2 | '',
    social_post_count: task?.social_post_count ?? 0,
  })

  // Load social posts if needed
  useEffect(() => {
    if (isEdit && task && (task.deliverable_type === 'social_copy' || task.deliverable_type === 'social_design')) {
      getSocialPosts(task.id).then(setSocialPosts)
    }
  }, [isEdit, task])

  function handleChange(field: keyof typeof form, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const isSocialTask = form.deliverable_type === 'social_copy' || form.deliverable_type === 'social_design'

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
          due_date: form.deadline ? new Date(form.deadline).toISOString() : undefined,
          description: form.description || undefined,
          deliverable_type: form.deliverable_type || undefined,
        }
        if (isEdit && task) {
          await updateTask(task.id, payload as any)
        } else {
          await createTask(payload as any)
        }
        onClose()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar tarefa.')
      }
    })
  }

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className={cn(
          "sm:max-w-md transition-all duration-300",
          isSocialTask && "sm:max-w-2xl"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
              {isSocialTask && <Sparkles className="w-4 h-4 text-brand-primary" />}
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[80vh] overflow-y-auto px-1 custom-scrollbar">
            <form id="task-form" onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Título *</label>
                  <Input
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Ex: Criar copy para Instagram"
                    disabled={isPending}
                    className="h-11 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Tipo de Entrega</label>
                  <select
                    value={form.deliverable_type}
                    onChange={(e) => handleChange('deliverable_type', e.target.value)}
                    disabled={isPending}
                    className="w-full h-11 px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
                  >
                    <option value="">Geral</option>
                    <option value="copy">Somente Copy</option>
                    <option value="design">Somente Design</option>
                    <option value="social_copy">Social Media (Copywriting)</option>
                    <option value="social_design">Social Media (Design)</option>
                    <option value="strategy">Estratégia</option>
                    <option value="website">Website</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Projeto *</label>
                  <select
                    value={form.project_id}
                    onChange={(e) => handleChange('project_id', e.target.value)}
                    disabled={isPending}
                    className="w-full h-11 px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
                  >
                    <option value="">Selecionar projeto...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Social Config */}
              {isSocialTask && (
                <div className="animate-fade-in-up">
                  <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-brand-primary" />
                        <label className="text-sm font-bold text-brand-primary/80">Configuração Social</label>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] font-medium text-text-muted uppercase">Número de Posts (0-100)</label>
                        <Input
                          type="number"
                          min={0} max={100}
                          value={form.social_post_count}
                          onChange={(e) => handleChange('social_post_count', parseInt(e.target.value) || 0)}
                          disabled={isPending}
                          className="h-10 border-brand-primary/20 bg-white/5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Post Grid Section */}
                  {isEdit && socialPosts.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <div className="flex items-center gap-2 border-b border-border pb-2">
                        <LayoutGrid className="w-4 h-4 text-text-muted" />
                        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Grade de Posts</h3>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <SocialPostGrid 
                          posts={socialPosts} 
                          onPostClick={setSelectedPost} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Responsável</label>
                  <select
                    value={form.assigned_to}
                    onChange={(e) => handleChange('assigned_to', e.target.value)}
                    disabled={isPending}
                    className="w-full h-11 px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
                  >
                    <option value="">Sem responsável</option>
                    {team.map((m) => (
                      <option key={m.id} value={m.id}>{m.full_name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Prazo</label>
                  <Input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    disabled={isPending}
                    className="h-11 border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    disabled={isPending}
                    className="w-full h-11 px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
                  >
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em progresso</option>
                    <option value="in_review">Revisão</option>
                    <option value="approved">Aprovado</option>
                    <option value="done">Concluído</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Prioridade</label>
                  <select
                    value={form.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    disabled={isPending}
                    className="w-full h-11 px-3 py-2 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
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
            </form>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button form="task-form" type="submit" disabled={isPending} className="px-8">
              {isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar tarefa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Social Post Detail Modal */}
      {selectedPost && (
        <SocialPostModal 
          post={selectedPost}
          allPosts={socialPosts}
          onClose={() => setSelectedPost(null)}
          onNavigate={setSelectedPost}
          onUpdate={() => getSocialPosts(task!.id).then(setSocialPosts)}
        />
      )}
    </>
  )
}


'use client'

import { useState } from 'react'
import { V2Task, TaskStatusV2, TaskWithRelations } from '@/types/database'
import { updateTaskStatus, deleteTask } from '@/app/dashboard/tasks/actions'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Clock, AlertCircle, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'


const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'outline' },
  in_progress: { label: 'Em progresso', variant: 'secondary' },
  in_review: { label: 'Revisão', variant: 'secondary' },
  approved: { label: 'Aprovado', variant: 'default' },
  done: { label: 'Concluído', variant: 'default' },
  blocked: { label: 'Bloqueado', variant: 'destructive' },
}

const priorityMap: Record<string, string> = {
  low: '↓ Baixa',
  medium: '→ Média',
  high: '↑ Alta',
  urgent: '⚡ Urgente',
}

const postStatusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-slate-500/10 text-slate-500' },
  awaiting_review: { label: 'Em Revisão', color: 'bg-amber-500/10 text-amber-500' },
  approved: { label: 'Aprovado', color: 'bg-emerald-500/10 text-emerald-500' },
  rejected: { label: 'Ajuste', color: 'bg-rose-500/10 text-rose-500' },
  in_production: { label: 'Em Produção', color: 'bg-indigo-500/10 text-indigo-500' },
};

interface TasksTableProps {
  tasks: TaskWithRelations[]
  onEdit?: (task: TaskWithRelations) => void
}

export function TasksTable({ tasks, onEdit }: TasksTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta tarefa?')) return
    setDeletingId(id)
    try {
      await deleteTask(id)
    } catch {
      alert('Erro ao excluir tarefa.')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleStatusChange(id: string, status: TaskStatusV2) {
    try {
      await updateTaskStatus(id, status)
    } catch {
      alert('Erro ao atualizar status.')
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <p className="text-text-secondary font-medium">Nenhuma tarefa encontrada</p>
        <p className="text-text-muted text-sm mt-1">Crie tarefas vinculadas a projetos.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tarefa</TableHead>
          <TableHead>Tipo / Conteúdo</TableHead>
          <TableHead>Projeto / Etapa</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Prazo</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const cfg = statusConfig[task.status]
          const isOverdue =
            task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
          return (
            <TableRow 
              key={task.id} 
              className={cn(
                "group cursor-pointer hover:bg-surface-muted/30 transition-colors", 
                task.status === 'locked' && "opacity-50 pointer-events-none"
              )}
              onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
            >
              <TableCell className="font-medium text-text-primary max-w-[200px] truncate">
                <div className="flex items-center gap-2">
                  {task.status === 'locked' && <Lock size={14} className="text-text-muted" />}
                  <div className="flex flex-col">
                    <span className="truncate">{task.title}</span>
                    <span className={cn("text-[9px] font-black uppercase tracking-wider", task.priority === 'urgent' ? 'text-status-danger' : 'text-text-muted')}>
                      {priorityMap[task.priority] || task.priority}
                    </span>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                {task.task_type === 'content_post' && task.v2_social_posts?.[0] ? (
                  <div className="flex items-center gap-3 py-1">
                    <div className="w-10 h-10 rounded-lg bg-surface-muted border border-border overflow-hidden shrink-0 flex items-center justify-center relative">
                      {task.v2_social_posts[0].media?.[0]?.public_url ? (
                        <img 
                          src={task.v2_social_posts[0].media[0].public_url} 
                          alt="preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-text-muted">No Media</span>
                      )}
                      <div className="absolute top-0 right-0 p-0.5 bg-black/50 backdrop-blur-sm">
                        {task.v2_social_posts[0].post_type === 'video' ? '📹' : '🖼️'}
                      </div>
                    </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-text-secondary truncate max-w-[120px]">
                          {task.v2_social_posts[0].caption || 'Sem legenda...'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", 
                            task.v2_social_posts[0].status === 'approved' ? 'bg-emerald-500' : 
                            task.v2_social_posts[0].status === 'awaiting_review' ? 'bg-amber-500' :
                            task.v2_social_posts[0].status === 'rejected' ? 'bg-rose-500' : 
                            task.v2_social_posts[0].status === 'in_production' ? 'bg-indigo-500' : 'bg-slate-400'
                          )} />
                          <span className="text-[9px] font-black uppercase text-text-muted tracking-tight">
                            {postStatusConfig[task.v2_social_posts[0].status || 'draft']?.label || 'Rascunho'}
                          </span>
                        </div>
                      </div>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-text-muted border-border/50">
                    {task.task_type || 'Operacional'}
                  </Badge>
                )}
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-text-primary truncate">{task.projects?.name ?? '—'}</span>
                  <span className="text-[10px] text-text-muted uppercase tracking-tighter">
                    {task.v2_project_stages?.name || 'Etapa não def.'}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                   <div className="w-1 h-6 rounded-full bg-brand-primary" />
                   <span className="text-text-secondary font-medium tracking-tight">
                     {task.profiles?.full_name ?? '—'}
                   </span>
                </div>
              </TableCell>
              
              <TableCell>
                {task.status === 'locked' ? (
                  <Badge variant="outline" className="bg-sand-light text-text-muted border-sand-dark/20 text-[10px] uppercase">Bloqueado</Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", 
                      task.status === 'done' ? 'bg-emerald-500' : 
                      task.status === 'in_progress' ? 'bg-brand-primary' : 'bg-slate-300'
                    )} />
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatusV2)}
                      className="text-[11px] font-bold border-none bg-transparent text-text-primary focus:outline-none p-0 cursor-pointer uppercase tracking-tight"
                    >
                      <option value="pending">Pendente</option>
                      <option value="in_progress">Fazendo</option>
                      <option value="blocked">Pausado</option>
                      <option value="done">Pronto</option>
                    </select>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {task.due_date ? (
                <span className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-status-danger font-medium' : 'text-text-secondary'}`}>
                  {isOverdue ? <AlertCircle size={12} /> : <Clock size={12} />}
                  {new Date(task.due_date).toLocaleDateString('pt-BR')}
                </span>
              ) : (
                <span className="text-text-muted">—</span>
              )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && task.status !== 'locked' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(task)}
                    >
                      <Pencil size={14} />
                    </Button>
                  )}
                  {task.status !== 'locked' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-status-danger hover:text-status-danger hover:bg-status-danger/10"
                      onClick={() => handleDelete(task.id)}
                      disabled={deletingId === task.id}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

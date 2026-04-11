'use client'

import { useState } from 'react'
import { V2Task, TaskStatusV2, TaskWithRelations } from '@/types/database'
import { updateTaskStatus, deleteTask } from '@/app/dashboard/tasks/actions'
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
import { Pencil, Trash2, Clock, AlertCircle } from 'lucide-react'


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

interface TasksTableProps {
  tasks: TaskWithRelations[]
  onEdit?: (task: TaskWithRelations) => void
}

export function TasksTable({ tasks, onEdit }: TasksTableProps) {
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
          <TableHead>Projeto</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead>Prioridade</TableHead>
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
            <TableRow key={task.id} className="group">
              <TableCell className="font-medium text-text-primary max-w-[200px] truncate">
                {task.title}
              </TableCell>
              <TableCell className="text-text-secondary text-sm">
                {task.projects?.name ?? '—'}
              </TableCell>
              <TableCell className="text-text-secondary">
                {task.profiles?.full_name ?? '—'}
              </TableCell>
              <TableCell className="text-text-secondary text-sm">
                {priorityMap[task.priority] ?? task.priority}
              </TableCell>
              <TableCell>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatusV2)}
                  className="text-xs border border-border rounded-md px-2 py-1 bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/50"
                >
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em progresso</option>
                  <option value="in_review">Revisão</option>
                  <option value="approved">Aprovado</option>
                  <option value="done">Concluído</option>
                  <option value="blocked">Bloqueado</option>
                </select>
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
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(task)}
                    >
                      <Pencil size={14} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-status-danger hover:text-status-danger hover:bg-status-danger/10"
                    onClick={() => handleDelete(task.id)}
                    disabled={deletingId === task.id}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

'use client'

import { useState, useEffect, useTransition } from 'react'
import { V2Task, TaskStatusV2, TaskWithRelations } from '@/types/database'
import { updateTaskStatus } from '@/app/dashboard/tasks/actions'
import { cn } from '@/lib/utils'
import { Calendar, User, AlertCircle, GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

const TASK_STATUS_LABELS_V2: Record<TaskStatusV2, string> = {
  locked:      'Aguardando',
  pending:     'Pendente',
  in_progress: 'Em andamento',
  in_review:   'Em revisão',
  approved:    'Aprovado',
  done:        'Concluído',
  blocked:     'Pausado/Impedido',
}

const COLUMNS: { id: TaskStatusV2; label: string; color: string }[] = [
  { id: 'locked',      label: TASK_STATUS_LABELS_V2.locked,      color: 'border-dashed border-sand' },
  { id: 'pending',     label: TASK_STATUS_LABELS_V2.pending,     color: 'border-border' },
  { id: 'in_progress', label: TASK_STATUS_LABELS_V2.in_progress, color: 'border-status-info' },
  { id: 'in_review',   label: TASK_STATUS_LABELS_V2.in_review,   color: 'border-status-warning' },
  { id: 'done',        label: TASK_STATUS_LABELS_V2.done,        color: 'border-status-success' },
]

const PRIORITY_COLOR: Record<string, string> = {
  low:    'bg-status-info/10 text-status-info border-status-info/20',
  medium: 'bg-status-warning/10 text-status-warning border-status-warning/20',
  high:   'bg-status-danger/10 text-status-danger border-status-danger/20',
  urgent: 'bg-status-danger text-white border-status-danger',
}


interface TaskKanbanProps {
  tasks: TaskWithRelations[]
  onTaskClick?: (task: TaskWithRelations) => void
}

export function TaskKanban({ tasks, onTaskClick }: TaskKanbanProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [optimisticTasks, setOptimisticTasks] = useState(tasks)

  // Keep in sync with parent prop changes
  useEffect(() => {
    setOptimisticTasks(tasks)
  }, [tasks])

  function handleDrop(e: React.DragEvent, newStatus: TaskStatusV2) {
    e.preventDefault()
    if (newStatus === 'locked') {
      alert('Não é possível mover tarefas manualmente para bloqueado. Siga o fluxo do pipeline.')
      return
    }

    const taskId = e.dataTransfer.getData('taskId')
    const task = optimisticTasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus || task.status === 'locked') return

    // Optimistic update
    setOptimisticTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )

    startTransition(async () => {
      try {
        await updateTaskStatus(taskId, newStatus)
        router.refresh()
      } catch (err: any) {
        alert(err.message)
        // Refresh component state somehow or rely on revalidation
      }
    })
  }

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 min-h-[400px]">
      {COLUMNS.map((col) => {
        const colTasks = optimisticTasks.filter((t) => t.status === col.id)
        return (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
            className="flex flex-col rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 min-h-[300px] overflow-hidden transition-colors"
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/40 dark:bg-black/20 border-b border-black/5 dark:border-white/5">
              <div className={cn("w-2 h-2 rounded-full", 
                col.id === 'locked' ? 'bg-sand' :
                col.id === 'pending' ? 'bg-text-muted' :
                col.id === 'in_progress' ? 'bg-status-info' :
                col.id === 'in_review' ? 'bg-status-warning' :
                'bg-status-success'
              )} />
              <p className="text-xs font-bold uppercase tracking-widest text-text-primary flex-1">
                {col.label}
              </p>
              <span className="text-[10px] font-bold text-text-muted bg-black/5 dark:bg-white/10 rounded-full px-2 py-0.5 text-center">
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 p-2 flex-1">
              {colTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                />
              ))}
              {colTasks.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-xs text-text-muted py-8">
                  Nenhuma tarefa
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TaskCard({
  task,
  onDragStart,
  onClick,
}: {
  task: TaskWithRelations
  onDragStart: (e: React.DragEvent) => void
  onClick?: () => void
}) {
  const isLocked = task.status === 'locked'
  const isOverdue = task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date()

  return (
    <div
      draggable={!isLocked}
      onDragStart={!isLocked ? onDragStart : undefined}
      onClick={isLocked ? () => alert('Aguardando conclusão da etapa anterior da qual esta tarefa depende.') : onClick}
      title={isLocked ? 'Tarefa bloqueada. Aguardando conclusão da etapa anterior.' : undefined}
      className={cn(
        'bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-3.5 space-y-2.5 transition-all duration-300 relative overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none',
        !isLocked && 'cursor-grab active:cursor-grabbing hover:border-brand-primary/30 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] hover:-translate-y-0.5',
        !isLocked && onClick && 'hover:bg-brand-primary/[0.02]',
        isLocked && 'cursor-not-allowed opacity-60 border-dashed bg-black/5 dark:bg-white/5 grayscale-[30%]',
        isOverdue && !isLocked && 'border-status-danger/30 bg-status-danger/[0.03] text-status-danger shadow-[0_4px_12px_-4px_rgba(255,0,0,0.1)]',
      )}
    >
      {/* Priority + grip */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <Badge
          className={cn('text-[10px] font-bold border', PRIORITY_COLOR[task.priority])}
        >
          {task.priority === 'urgent' ? '🔴 Urgente' :
           task.priority === 'high'   ? '🟠 Alta' :
           task.priority === 'medium' ? '🟡 Média' : '🔵 Baixa'}
        </Badge>
        {!isLocked && <GripVertical size={14} className="text-text-muted shrink-0 mt-0.5" />}
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-text-primary leading-snug relative z-10 flex flex-col gap-1">
        {isLocked && <span className="text-[9px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1"><AlertCircle size={10} /> Dependência Ativa</span>}
        {isOverdue && !isLocked && <span className="text-[9px] font-black uppercase tracking-widest text-status-danger flex items-center gap-1">⚠ Atrasada</span>}
        {task.title}
      </p>

      {/* Project */}
      {task.projects && (
        <p className="text-[10px] text-text-muted truncate relative z-10">
          {task.projects.name}
          {task.projects.clients && ` · ${task.projects.clients.name}`}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 pt-1 relative z-10">
        {task.due_date && (
          <span className={cn('flex items-center gap-1 text-[10px] font-medium', isOverdue ? 'text-status-danger' : 'text-text-muted')}>
            {isOverdue && <AlertCircle size={10} />}
            <Calendar size={10} />
            {new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
        )}
        {task.profiles && (
          <span className="flex items-center gap-1 text-[10px] text-text-muted ml-auto">
            <User size={10} />
            {task.profiles.full_name.split(' ')[0]}
          </span>
        )}
      </div>

      {isLocked && (
        <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
           <AlertCircle size={80} />
        </div>
      )}
    </div>
  )
}

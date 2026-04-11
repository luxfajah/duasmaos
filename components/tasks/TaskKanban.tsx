'use client'

import { useState, useTransition } from 'react'
import { V2Task, TaskStatusV2, TaskWithRelations } from '@/types/database'
import { updateTaskStatus } from '@/app/dashboard/tasks/actions'
import { cn } from '@/lib/utils'
import { Calendar, User, AlertCircle, GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const TASK_STATUS_LABELS_V2: Record<TaskStatusV2, string> = {
  pending:     'Pendente',
  in_progress: 'Em andamento',
  in_review:   'Em revisão',
  approved:    'Aprovado',
  done:        'Concluído',
  blocked:     'Bloqueado',
}

const COLUMNS: { id: TaskStatusV2; label: string; color: string }[] = [
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
  const [, startTransition] = useTransition()
  const [optimisticTasks, setOptimisticTasks] = useState(tasks)

  // Keep in sync with parent prop changes
  if (tasks !== optimisticTasks && tasks.length !== optimisticTasks.length) {
    setOptimisticTasks(tasks)
  }

  function handleDrop(e: React.DragEvent, newStatus: TaskStatusV2) {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    const task = optimisticTasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    // Optimistic update
    setOptimisticTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )

    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus)
    })
  }

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[400px]">
      {COLUMNS.map((col) => {
        const colTasks = optimisticTasks.filter((t) => t.status === col.id)
        return (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
            className="flex flex-col rounded-xl bg-surface border border-border min-h-[300px]"
          >
            {/* Column header */}
            <div className={cn('flex items-center gap-2 px-3 py-2.5 border-b border-border rounded-t-xl border-t-2', col.color)}>
              <p className="text-xs font-bold uppercase tracking-widest text-text-secondary flex-1">
                {col.label}
              </p>
              <span className="text-xs font-bold text-text-muted bg-surface-muted rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
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
                  onClick={onTaskClick ? () => onTaskClick(task) : undefined}
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
  const isOverdue =
    task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date()

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        'bg-background border border-border rounded-lg p-3 space-y-2 cursor-grab active:cursor-grabbing',
        'hover:border-border-strong hover:shadow-sm transition-all duration-150',
        onClick && 'hover:bg-surface-muted/40',
        isOverdue && 'border-status-danger/40 bg-status-danger/5',
      )}
    >
      {/* Priority + grip */}
      <div className="flex items-start justify-between gap-2">
        <Badge
          className={cn('text-[10px] font-bold border', PRIORITY_COLOR[task.priority])}
        >
          {task.priority === 'urgent' ? '🔴 Urgente' :
           task.priority === 'high'   ? '🟠 Alta' :
           task.priority === 'medium' ? '🟡 Média' : '🔵 Baixa'}
        </Badge>
        <GripVertical size={14} className="text-text-muted shrink-0 mt-0.5" />
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-text-primary leading-snug">
        {task.title}
      </p>

      {/* Project */}
      {task.projects && (
        <p className="text-[10px] text-text-muted truncate">
          {task.projects.name}
          {task.projects.clients && ` · ${task.projects.clients.name}`}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 pt-1">
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
    </div>
  )
}

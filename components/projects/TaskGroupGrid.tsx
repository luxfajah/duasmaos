"use client"

import { V2Task, TaskTypeV2, TaskStatusV2, TaskPriorityV2 } from "@/types/database"
import { cn } from "@/lib/utils"
import { Calendar, Users, MessageSquare, Play, CheckCircle2, MoreHorizontal, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface TaskGroupGridProps {
  tasks: V2Task[]
  onTaskClick: (task: V2Task) => void
}

const TYPE_CONFIG: Record<TaskTypeV2, { label: string, color: string }> = {
  operational: { label: "Operacional", color: "text-slate-500" },
  content_post: { label: "Posts", color: "text-brand-primary" },
  document: { label: "Documentos", color: "text-amber-500" },
  approval: { label: "Aprovações", color: "text-emerald-500" },
  task: { label: "Tarefas", color: "text-brand-primary" },
  meeting: { label: "Reuniões", color: "text-brand-secondary" },
  review: { label: "Revisões", color: "text-brand-accent" },
  deliverable: { label: "Entregas", color: "text-brand-primary" }
}

const PRIORITY_BADGE: Record<TaskPriorityV2, string> = {
  low: "bg-surface text-text-muted border-border",
  medium: "bg-info/10 text-info border-info/10",
  high: "bg-warning/10 text-warning border-warning/10",
  urgent: "bg-danger/10 text-danger border-danger/10 font-bold"
}

export function TaskGroupGrid({ tasks, onTaskClick }: TaskGroupGridProps) {
  const groups: Record<TaskTypeV2, V2Task[]> = {
    operational: tasks.filter(t => t.type === 'operational'),
    content_post: tasks.filter(t => t.type === 'content_post'),
    document: tasks.filter(t => t.type === 'document'),
    approval: tasks.filter(t => t.type === 'approval'),
    task: tasks.filter(t => t.type === 'task'),
    meeting: tasks.filter(t => t.type === 'meeting'),
    review: tasks.filter(t => t.type === 'review'),
    deliverable: tasks.filter(t => t.type === 'deliverable'),
  }

  const activeTypes = (Object.keys(groups) as TaskTypeV2[]).filter(
    (type) => groups[type].length > 0
  )

  const typesToRender = activeTypes.length > 0 ? activeTypes : (['task'] as const)

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 pt-2 no-scrollbar snap-x">
      {typesToRender.map((type) => (
        <div key={type} className="w-[320px] shrink-0 snap-start space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", TYPE_CONFIG[type].color.replace('text', 'bg'))} />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                {TYPE_CONFIG[type].label}
              </h3>
            </div>
            <span className="text-[10px] font-bold text-text-muted bg-border/50 rounded-full px-2 py-0.5">
              {groups[type].length}
            </span>
          </div>

          <div className="flex flex-col gap-3 min-h-[150px]">
            {groups[type].length > 0 ? (
              groups[type].map((task) => (
                <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
              ))
            ) : (
              <div className="h-20 flex flex-col items-center justify-center rounded-2xl bg-surface/50 text-[11px] font-medium text-text-muted">
                Sem tarefas
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function TaskCard({ task, onClick }: { task: V2Task; onClick: () => void }) {
  // Use V2 relations (profiles are nested in v2_task_assignees)
  const assignees = (task as any).v2_task_assignees || []
  const isDone = task.status === 'done' || task.status === 'approved'

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group p-4 flex flex-col gap-3 rounded-2xl bg-white dark:bg-surface border border-border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-0.5 relative overflow-hidden",
        isDone && "opacity-60 bg-surface/30"
      )}
    >
      {/* Priority & Top Row */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider rounded-full px-2 border-transparent", PRIORITY_BADGE[task.priority])}>
          {task.priority}
        </Badge>
        <button className="text-text-muted hover:text-brand-primary transition-colors opacity-0 group-hover:opacity-100">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Title & Description */}
      <div className="space-y-1">
        <h4 className={cn("text-sm font-semibold text-text-primary leading-tight line-clamp-2", isDone && "line-through text-text-secondary")}>
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-text-secondary leading-normal line-clamp-2 mt-1">
            {task.description}
          </p>
        )}
      </div>

      {/* Meta Bar */}
      <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/50">
        <div className="flex items-center gap-3">
          {task.due_date && (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-text-muted">
              <Calendar size={12} className={cn("opacity-70", isDone ? "" : "text-brand-primary")} />
              {new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </div>
          )}
          
          {/* Assignees Stack */}
          {assignees.length > 0 && (
            <div className="flex -space-x-1.5 overflow-hidden">
              {assignees.slice(0, 3).map((a: any) => (
                <div key={a.id} className="inline-block h-5 w-5 rounded-full ring-2 ring-white dark:ring-surface overflow-hidden bg-surface-muted">
                   {a.profiles?.avatar_url ? (
                     <img src={a.profiles?.avatar_url} alt={a.profiles?.full_name} className="h-full w-full object-cover" />
                   ) : (
                     <span className="flex h-full w-full items-center justify-center text-[7px] font-bold text-text-primary">
                       {a.profiles?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                     </span>
                   )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        {isDone ? (
          <CheckCircle2 size={16} className="text-success" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
            <Play size={10} className="fill-current" />
          </div>
        )}
      </div>
    </div>
  )
}

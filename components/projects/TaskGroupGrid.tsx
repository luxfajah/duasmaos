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
  low: "bg-surface-muted text-text-muted border-border",
  medium: "bg-info/10 text-info border-info/20",
  high: "bg-warning/10 text-warning border-warning/20",
  urgent: "bg-danger text-white border-danger"
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {(['task', 'meeting', 'review'] as const).map((type) => (
        <div key={type} className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className={cn("text-xs font-bold uppercase tracking-widest", TYPE_CONFIG[type].color)}>
              {TYPE_CONFIG[type].label}
            </h3>
            <span className="text-[10px] font-bold text-text-muted bg-surface-muted rounded-full px-2 py-0.5">
              {groups[type].length}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {groups[type].length > 0 ? (
              groups[type].map((task) => (
                <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
              ))
            ) : (
              <div className="h-24 flex items-center justify-center border border-dashed border-border rounded-xl text-[10px] text-text-muted uppercase tracking-widest bg-surface/30">
                Nenhuma {TYPE_CONFIG[type].label.toLowerCase().slice(0, -1)}
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
        "task-card group p-4 flex flex-col gap-3",
        isDone && "opacity-60 grayscale-[0.5]"
      )}
    >
      {/* Priority & Top Row */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-tight", PRIORITY_BADGE[task.priority])}>
          {task.priority}
        </Badge>
        <button className="text-text-muted hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Title & Description */}
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-text-primary leading-tight line-clamp-2">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-text-secondary leading-normal line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Meta Bar */}
      <div className="flex items-center justify-between pt-1 mt-auto">
        <div className="flex items-center gap-3">
          {task.due_date && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
              <Calendar size={12} className="text-brand-primary/60" />
              {new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </div>
          )}
          
          {/* Assignees Stack */}
          {assignees.length > 0 && (
            <div className="avatar-stack">
              {assignees.slice(0, 3).map((a: any) => (
                <Avatar 
                  key={a.id} 
                  src={a.profiles?.avatar_url} 
                  name={a.profiles?.full_name}
                  size="xs"
                  className="border-[1.5px] border-surface" 
                />
              ))}
              {assignees.length > 3 && (
                <div className="w-5 h-5 rounded-full border-[1.5px] border-surface bg-surface-muted flex items-center justify-center text-[7px] font-bold text-text-muted">
                  +{assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button 
          size="sm" 
          variant={isDone ? "ghost" : "default"} 
          className="h-7 w-7 p-0 rounded-lg shadow-sm"
        >
          {isDone ? (
            <CheckCircle2 size={14} className="text-success" />
          ) : (
            <Play size={12} className="fill-current" />
          )}
        </Button>
      </div>

      {/* Glass Inner Shine Overlay */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
    </div>
  )
}

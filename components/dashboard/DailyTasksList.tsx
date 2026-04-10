import React from 'react'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Circle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Task, Priority } from '@/types/database'
import { PRIORITY_LABELS } from '@/types/database'

interface DailyTasksListProps {
  tasks: Task[];
}

export function DailyTasksList({ tasks }: DailyTasksListProps) {
  return (
    <Card variant="muted" className="p-6 col-span-1 lg:col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold font-serif text-text-primary">Minhas Tarefas do Dia</h3>
        <a href="/dashboard/tasks" className="text-sm font-semibold text-brand-primary hover:text-brand-secondary transition-colors">
          Ver todas
        </a>
      </div>

      <div className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <p className="text-text-muted text-sm py-4">Sua mesa está limpa hoje.</p>
        ) : (
          tasks.map(task => {
            const isDone = task.status === 'done';
            
            // Map priority to badge variant
            let badgeVariant: 'default' | 'danger' | 'warning' | 'success' | 'info' = 'default';
            if (task.priority === 'urgent') badgeVariant = 'danger';
            else if (task.priority === 'high') badgeVariant = 'warning';
            else if (task.priority === 'low') badgeVariant = 'info';

            return (
              <div 
                key={task.id} 
                className={`flex justify-between items-center p-4 rounded-xl border bg-surface transition-all ${
                  isDone ? 'border-border/50 opacity-60' : 'border-border hover:border-brand-primary/50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <button className="text-text-muted hover:text-success transition-colors">
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  <div>
                    <h4 className={`font-semibold ${isDone ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                      {task.title}
                    </h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Projeto: {/* ideally we pass project name too, but keeping it simple */}
                      <span className="font-medium text-text-muted">{task.project_id.slice(0,8)}</span>
                    </p>
                  </div>
                </div>
                
                {isDone ? (
                  <Badge variant="muted">CONCLUÍDO</Badge>
                ) : (
                  <Badge variant={badgeVariant}>{PRIORITY_LABELS[task.priority].toUpperCase()}</Badge>
                )}
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}

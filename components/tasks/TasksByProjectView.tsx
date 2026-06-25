'use client'

import React, { useState } from 'react'
import { TaskWithRelations } from '@/types/database'
import { TasksTable } from '@/components/tasks/TasksTable'
import { TaskKanban } from '@/components/tasks/TaskKanban'
import { TaskCalendar } from '@/components/tasks/TaskCalendar'
import { ChevronDown, ChevronRight, Folder } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TasksByProjectViewProps {
  tasks: TaskWithRelations[]
  viewType: 'kanban' | 'list' | 'calendar'
  onEditTask: (task: TaskWithRelations) => void
}

export function TasksByProjectView({ tasks, viewType, onEditTask }: TasksByProjectViewProps) {
  // Group tasks by project
  const groupedTasks = tasks.reduce((acc, task) => {
    const projectId = task.project_id || 'unassigned'
    const projectName = task.projects?.name || 'Sem Projeto'
    
    if (!acc[projectId]) {
      acc[projectId] = {
        name: projectName,
        tasks: []
      }
    }
    acc[projectId].tasks.push(task)
    return acc
  }, {} as Record<string, { name: string, tasks: TaskWithRelations[] }>)

  // Sort projects alphabetically, keeping "Sem Projeto" at the end
  const sortedProjectIds = Object.keys(groupedTasks).sort((a, b) => {
    if (a === 'unassigned') return 1
    if (b === 'unassigned') return -1
    return groupedTasks[a].name.localeCompare(groupedTasks[b].name)
  })

  // State to manage which projects are expanded
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>(
    sortedProjectIds.reduce((acc, id) => ({ ...acc, [id]: true }), {})
  )

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // If viewType is Calendar, grouping by project is terrible UX (multiple calendars).
  // We'll fallback to a unified calendar or just show it gracefully.
  if (viewType === 'calendar') {
    return (
      <div className="space-y-4">
        <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-4 rounded-xl border border-amber-500/20 text-sm font-medium">
          A visualização de Calendário agrupa automaticamente todas as tarefas pelo prazo. A separação por projetos foi desabilitada nesta visualização para uma melhor experiência.
        </div>
        <TaskCalendar tasks={tasks} onTaskClick={onEditTask} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {sortedProjectIds.map((projectId) => {
        const project = groupedTasks[projectId]
        const isExpanded = expandedProjects[projectId]

        return (
          <div key={projectId} className="glass-card-super overflow-hidden transition-all duration-300">
            {/* Header Accordion */}
            <div 
              className={cn(
                "flex items-center justify-between p-4 cursor-pointer select-none transition-colors",
                isExpanded ? "border-b border-border/40" : ""
              )}
              onClick={() => toggleProject(projectId)}
            >
              <div className="flex items-center gap-3">
                <button className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary transition-colors">
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <Folder size={14} className="text-brand-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-text-primary">
                    {project.name}
                  </h3>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-surface-muted text-xs font-bold text-text-secondary">
                {project.tasks.length} {project.tasks.length === 1 ? 'tarefa' : 'tarefas'}
              </div>
            </div>

            {/* Content Area */}
            {isExpanded && (
              <div className={cn(
                "p-4 bg-black/[0.01] dark:bg-white/[0.01]",
                viewType === 'kanban' ? "overflow-x-auto hide-scrollbar" : ""
              )}>
                {viewType === 'list' && (
                  <TasksTable 
                    tasks={project.tasks} 
                    onEdit={onEditTask} 
                  />
                )}
                {viewType === 'kanban' && (
                  <TaskKanban 
                    tasks={project.tasks as any} 
                  />
                )}
              </div>
            )}
          </div>
        )
      })}

      {sortedProjectIds.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          Nenhuma tarefa encontrada.
        </div>
      )}
    </div>
  )
}

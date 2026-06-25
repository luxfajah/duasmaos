'use client'

import { useState } from 'react'
import { TaskWithRelations, TaskStatusV2 } from '@/types/database'
import { TasksTable } from '@/components/tasks/TasksTable'
import { TaskKanban } from '@/components/tasks/TaskKanban'
import { TaskEditModal } from '@/components/tasks/TaskEditModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Plus, Search, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

import { TasksByProjectView } from '@/components/tasks/TasksByProjectView'
import { TaskCalendar } from '@/components/tasks/TaskCalendar'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Briefcase, CheckCircle, AlertTriangle, ListTodo } from 'lucide-react'

interface TasksPageClientProps {
  initialTasks: TaskWithRelations[]
  projects: { id: string; name: string }[]
  team: { id: string; full_name: string }[]
}

export function TasksPageClient({ initialTasks, projects, team }: TasksPageClientProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'general' | 'project'>('general')
  const [visualization, setVisualization] = useState<'kanban' | 'list' | 'calendar'>('kanban')

  // Status Filter Options
  const STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'in_progress', label: 'Em Andamento' },
    { value: 'in_review', label: 'Em Revisão' },
    { value: 'approved', label: 'Aprovadas' },
    { value: 'done', label: 'Concluídas' },
  ]

  // Auto-mark overdue: tasks past due_date that are not done/locked
  const now = new Date()
  const tasksWithOverdue = initialTasks.map(t => {
    const isOverdue = t.due_date && !['done', 'locked', 'approved'].includes(t.status) && new Date(t.due_date) < now
    return { ...t, _isOverdue: isOverdue }
  })

  const filtered = tasksWithOverdue.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.projects?.name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  const getStatusCount = (status: string) => {
    if (status === 'all') return tasksWithOverdue.length
    return tasksWithOverdue.filter(t => t.status === status).length
  }

  // Metrics calculation
  const totalTasks = initialTasks.length
  const inProgressTasks = initialTasks.filter(t => t.status === 'in_progress' || t.status === 'in_review').length
  const completedThisMonth = initialTasks.filter(t => {
    if (t.status !== 'done' && t.status !== 'approved') return false
    // We don't have a reliable completed_at on TaskWithRelations by default, 
    // so we approximate or just show absolute done count.
    return true
  }).length
  const delayedTasks = tasksWithOverdue.filter(t => t._isOverdue).length

  return (
    <>
      {/* ── Bento Grid Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard 
          label="Total de Tarefas" 
          value={totalTasks} 
          icon={ListTodo} 
          description="Todas registradas"
          accent="default"
        />
        <MetricCard 
          label="Em Andamento" 
          value={inProgressTasks} 
          icon={Briefcase} 
          description="Foco atual da equipe"
          accent="info"
        />
        <MetricCard 
          label="Concluídas" 
          value={completedThisMonth} 
          icon={CheckCircle} 
          description="Tarefas finalizadas"
          accent="success"
        />
        <MetricCard 
          label="Atrasadas" 
          value={delayedTasks} 
          icon={AlertTriangle} 
          description="Ação imediata necessária"
          accent={delayedTasks > 0 ? "danger" : "default"}
          featured={delayedTasks > 0}
        />
      </div>

      {/* ── Controls (Segmented Controls) ── */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Top row: Search + Button */}
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por tarefa ou projeto..."
            className="pl-10 h-10 w-full rounded-full transition-all duration-200 glass-pill hover:bg-white/40 dark:hover:bg-black/40 focus-visible:ring-2 focus-visible:ring-brand-primary/30 outline-none"
            id="tasks-search"
          />
        </div>
        
        <Button 
          onClick={() => setShowModal(true)} 
          className="h-10 px-6 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black shadow-xl shadow-brand-primary/20 flex items-center gap-2 active:scale-[0.97] transition-all duration-300 ease-apple shrink-0"
        >
          <Plus size={16} />
          Nova Tarefa
        </Button>
      </div>

      {/* Bottom row: Filters */}
      <div className="flex flex-wrap items-center gap-4 w-full overflow-x-auto hide-scrollbar pb-2">
          
          {/* Status Filter (Apple Segmented Control) */}
          <div className="flex p-[3px] bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-full shadow-inner items-center shrink-0">
            {STATUS_FILTER_OPTIONS.map((opt) => {
              const count = getStatusCount(opt.value)
              const isActive = statusFilter === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    'flex items-center justify-center px-3 h-8 rounded-full text-[13px] transition-all duration-300 ease-apple whitespace-nowrap',
                    isActive 
                      ? 'bg-white dark:bg-white/10 text-text-primary shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none ring-1 ring-black/5 dark:ring-white/10 font-bold'
                      : 'text-text-secondary hover:text-text-primary font-medium hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  {opt.label} <span className="ml-1 opacity-70">({count})</span>
                </button>
              )
            })}
          </div>

          {/* Grouping View (Geral / Por Projeto) */}
          <div className="flex p-[3px] bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-full shadow-inner items-center shrink-0">
            <button
              onClick={() => setViewMode('general')}
              className={cn(
                'px-4 h-8 rounded-full text-[13px] transition-all duration-300 ease-apple whitespace-nowrap',
                viewMode === 'general'
                  ? 'bg-white dark:bg-white/10 text-text-primary shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none ring-1 ring-black/5 dark:ring-white/10 font-bold'
                  : 'text-text-secondary hover:text-text-primary font-medium hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setViewMode('project')}
              className={cn(
                'px-4 h-8 rounded-full text-[13px] transition-all duration-300 ease-apple whitespace-nowrap',
                viewMode === 'project'
                  ? 'bg-white dark:bg-white/10 text-text-primary shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none ring-1 ring-black/5 dark:ring-white/10 font-bold'
                  : 'text-text-secondary hover:text-text-primary font-medium hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              Por Projeto
            </button>
          </div>

          {/* Visualization Options (Kanban / Lista / Calendário) */}
          <div className="flex p-[3px] bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-full shadow-inner items-center shrink-0">
            {[
              { id: 'kanban', label: 'Kanban' },
              { id: 'list', label: 'Lista' },
              { id: 'calendar', label: 'Calendário' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setVisualization(opt.id as any)}
                className={cn(
                  'px-4 h-8 rounded-full text-[13px] transition-all duration-300 ease-apple whitespace-nowrap',
                  visualization === opt.id
                    ? 'bg-white dark:bg-white/10 text-brand-primary shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-none ring-1 ring-black/5 dark:ring-white/10 font-bold'
                    : 'text-text-secondary hover:text-text-primary font-medium hover:bg-black/5 dark:hover:bg-white/5'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content View ── */}
      <div className="mt-4">
        {viewMode === 'general' ? (
          <>
            {visualization === 'kanban' && (
              <TaskKanban tasks={filtered as any} />
            )}
            {visualization === 'list' && (
              <div className="glass-card-super pb-4">
                <TasksTable
                  tasks={filtered}
                  onEdit={(task) => router.push(`/dashboard/tasks/${task.id}`)}
                />
              </div>
            )}
            {visualization === 'calendar' && (
              <TaskCalendar 
                tasks={filtered} 
                onTaskClick={(task) => router.push(`/dashboard/tasks/${task.id}`)} 
              />
            )}
          </>
        ) : (
          <TasksByProjectView 
            tasks={filtered} 
            viewType={visualization} 
            onEditTask={(task) => router.push(`/dashboard/tasks/${task.id}`)} 
          />
        )}
      </div>

      {(showModal || editingTask) && (
        <TaskEditModal
          task={editingTask}
          open={showModal || !!editingTask}
          projectId={editingTask?.project_id}
          projects={projects}
          onClose={() => {
            setShowModal(false)
            setEditingTask(null)
          }}
        />
      )}
    </>
  )
}

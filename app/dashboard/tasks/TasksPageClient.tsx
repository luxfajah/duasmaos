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

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por tarefa ou projeto..."
              className="pl-10 h-10 w-full rounded-full transition-all duration-200 glass-pill hover:bg-white/40 dark:hover:bg-black/40 focus-visible:ring-2 focus-visible:ring-brand-primary/30 outline-none"
              id="tasks-search"
            />
        </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 glass-pill rounded-full text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300 ease-apple"
            id="tasks-status-filter"
          aria-label="Filtrar por status"
        >
          <option value="all">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="in_progress">Em progresso</option>
          <option value="in_review">Revisão</option>
          <option value="approved">Aprovado</option>
          <option value="done">Concluído</option>
          <option value="blocked">Pausado</option>
        </select>
        <Button 
          onClick={() => setShowModal(true)} 
          className="h-10 px-6 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black shadow-xl shadow-brand-primary/20 flex items-center gap-2 w-full sm:w-auto active:scale-[0.97] transition-all duration-300 ease-apple"
        >
          <Plus size={16} />
          Nova Tarefa
        </Button>
      </div>

      {/* Kanban view — always visible above the table */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid size={16} className="text-brand-primary" />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Visão Kanban</h3>
          <span className="text-xs text-text-muted">· Arraste para mudar status</span>
        </div>
        <TaskKanban tasks={filtered as any} />
      </div>

      {/* Table view */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <List size={16} className="text-brand-primary" />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Lista Completa</h3>
          <span className="text-xs font-medium text-text-muted bg-surface-muted px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>
        <div className="glass-card-super pb-4">
          <TasksTable
            tasks={filtered}
            onEdit={(task) => router.push(`/dashboard/tasks/${task.id}`)}
          />
        </div>
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

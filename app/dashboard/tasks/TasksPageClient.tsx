'use client'

import { useState } from 'react'
import { Task } from '@/types/database'
import { TasksTable } from '@/components/tasks/TasksTable'
import { TaskModal } from '@/components/tasks/TaskModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'

type TaskWithRelations = Task & {
  projects: { name: string; client_id: string; clients: { name: string } | null } | null
  profiles: { full_name: string } | null
}

interface TasksPageClientProps {
  initialTasks: TaskWithRelations[]
  projects: { id: string; name: string }[]
  team: { id: string; full_name: string }[]
}

export function TasksPageClient({ initialTasks, projects, team }: TasksPageClientProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = initialTasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.projects?.name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por tarefa ou projeto..."
            className="pl-9"
            id="tasks-search"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none"
          id="tasks-status-filter"
          aria-label="Filtrar por status"
        >
          <option value="all">Todos os status</option>
          <option value="todo">A fazer</option>
          <option value="in_progress">Em progresso</option>
          <option value="review">Revisão</option>
          <option value="done">Concluído</option>
        </select>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 flex-shrink-0">
          <Plus size={16} />
          Nova Tarefa
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden mt-4">
        <TasksTable
          tasks={filtered}
          onEdit={(task) => setEditingTask(task)}
        />
      </div>

      {(showModal || editingTask) && (
        <TaskModal
          task={editingTask}
          projects={projects}
          team={team}
          onClose={() => {
            setShowModal(false)
            setEditingTask(null)
          }}
        />
      )}
    </>
  )
}

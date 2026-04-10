import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getProjects } from '@/app/dashboard/projects/actions'
import { getTasks } from '@/app/dashboard/tasks/actions'
import { CalendarView } from '@/components/calendar/CalendarView'
import { EditorialHeader } from '@/components/brand/EditorialHeader'

export default async function CalendarPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [projects, tasks] = await Promise.all([
    getProjects(),
    getTasks(),
  ])

  // Build calendar events from projects (deadline) and tasks (deadline)
  const events = [
    ...projects
      .filter((p) => p.deadline)
      .map((p) => ({
        id: `project-${p.id}`,
        title: p.name,
        date: p.deadline!,
        type: 'project' as const,
        status: p.status,
      })),
    ...tasks
      .filter((t) => t.deadline)
      .map((t) => ({
        id: `task-${t.id}`,
        title: t.title,
        date: t.deadline!,
        type: 'task' as const,
        status: t.status,
      })),
  ]

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <EditorialHeader
        title="Calendário"
        subtitle="Prazos de projetos e tarefas organizados por data"
      />
      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-info inline-block" />
          Projeto
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-success inline-block" />
          Tarefa
        </span>
      </div>
      <CalendarView events={events} />
    </div>
  )
}

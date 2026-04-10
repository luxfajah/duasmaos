import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTasks } from './actions'
import { getProjects } from '@/app/dashboard/projects/actions'
import { TasksPageClient } from './TasksPageClient'
import { EditorialHeader } from '@/components/brand/EditorialHeader'

export default async function TasksPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: teamData } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('role', ['admin', 'writer', 'designer'])
    .order('full_name')

  const [tasks, projects] = await Promise.all([
    getTasks(),
    getProjects(),
  ])

  const team = (teamData ?? []) as { id: string; full_name: string }[]

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <EditorialHeader
        title="Tarefas"
        subtitle={`${tasks.length} tarefa${tasks.length !== 1 ? 's' : ''} ao total`}
      />
      <TasksPageClient
        initialTasks={tasks}
        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
        team={team}
      />
    </div>
  )
}

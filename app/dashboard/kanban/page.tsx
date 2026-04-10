import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getProjects } from '@/app/dashboard/projects/actions'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { EditorialHeader } from '@/components/brand/EditorialHeader'

export default async function KanbanPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const projects = await getProjects()

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <EditorialHeader
        title="Kanban"
        subtitle="Arraste os projetos entre as colunas para atualizar o status"
      />
      <KanbanBoard initialProjects={projects} />
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getV2AllProjects } from '@/app/dashboard/v2/actions'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { EditorialHeader } from '@/components/brand/EditorialHeader'

export default async function KanbanPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const projects = await getV2AllProjects()

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <EditorialHeader
        title="Kanban"
        subtitle="O Kanban de projetos ajuda a visualizar o status macro de cada contrato"
      />
      <KanbanBoard initialProjects={projects as any} />
    </div>
  )
}

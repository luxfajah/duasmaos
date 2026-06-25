import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { getClients } from '@/app/dashboard/clients/actions'
import { getProjectById } from '@/app/dashboard/projects/actions'

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: teamData } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('role', ['admin', 'gestor', 'writer', 'designer'])
    .order('full_name')

  const [clients, project] = await Promise.all([
    getClients(),
    getProjectById(params.id)
  ])

  if (!project) redirect('/dashboard/projects')

  const team = (teamData ?? []) as { id: string; full_name: string }[]

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <ProjectForm 
        project={project as any}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))} 
        team={team} 
      />
    </div>
  )
}

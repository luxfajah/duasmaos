import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { getClients } from '@/app/dashboard/clients/actions'
import { EditorialHeader } from '@/components/brand/EditorialHeader'

export default async function NewProjectPage({ searchParams }: { searchParams?: { templateId?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: teamData } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('role', ['admin', 'gestor', 'writer', 'designer'])
    .order('full_name')

  const clients = await getClients()
  const team = (teamData ?? []) as { id: string; full_name: string }[]

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <EditorialHeader
        title="Novo Projeto"
        subtitle="Siga os passos para criar um novo projeto no seu portfólio"
      />
      <ProjectForm 
        clients={clients.map((c) => ({ id: c.id, name: c.name }))} 
        team={team} 
        initialTemplateId={searchParams?.templateId}
      />
    </div>
  )
}

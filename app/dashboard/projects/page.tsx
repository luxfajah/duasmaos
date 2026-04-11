import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getProjects } from '@/app/dashboard/projects/actions'
import { getClients } from '@/app/dashboard/clients/actions'
import { ProjectsPageClient } from './ProjectsPageClient'
import { EditorialHeader } from '@/components/brand/EditorialHeader'
import { Suspense } from 'react'

export default async function ProjectsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get team members (non-client profiles)
  const { data: teamData } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('role', ['admin', 'gestor', 'writer', 'designer'])
    .order('full_name')

  const [projects, clients] = await Promise.all([
    getProjects(),
    getClients(),
  ])

  const team = (teamData ?? []) as { id: string; full_name: string }[]

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <EditorialHeader
        title="Projetos"
        subtitle={`${projects.length} projeto${projects.length !== 1 ? 's' : ''} no total`}
      />
      <Suspense fallback={<div className="h-64 flex items-center justify-center text-text-muted">Carregando projetos...</div>}>
        <ProjectsPageClient
          initialProjects={projects}
          clients={clients.map((c) => ({ id: c.id, name: c.name }))}
          team={team}
        />
      </Suspense>
    </div>
  )
}

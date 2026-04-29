import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getAllFiles } from './actions'
import { FilesPageClient } from './FilesPageClient'
import { EditorialHeader } from '@/components/brand/EditorialHeader'

export default async function FilesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [files, projectsData, clientsData] = await Promise.all([
    getAllFiles(),
    supabase.from('v2_projects').select('id, name').order('name'),
    supabase.from('clients').select('id, name').order('name'),
  ])

  const projects = (projectsData.data ?? []) as { id: string; name: string }[]
  const clients = (clientsData.data ?? []) as { id: string; name: string }[]

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <EditorialHeader
        title="Biblioteca de Arquivos"
        subtitle="Todos os entregáveis, contratos e materiais dos seus projetos"
      />
      <FilesPageClient
        files={files as any}
        userId={user.id}
        projects={projects}
        clients={clients}
      />
    </div>
  )
}

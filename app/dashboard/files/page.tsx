import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getAllFiles, getFileSignedUrl } from './actions'
import { getProjects } from '@/app/dashboard/projects/actions'
import { FilesPageClient } from './FilesPageClient'
import { EditorialHeader } from '@/components/brand/EditorialHeader'

export default async function FilesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [files, projects] = await Promise.all([
    getAllFiles(),
    getProjects(),
  ])

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <EditorialHeader
        title="Arquivos"
        subtitle={`${files.length} arquivo${files.length !== 1 ? 's' : ''} armazenado${files.length !== 1 ? 's' : ''}`}
      />
      <FilesPageClient
        files={files}
        userId={user.id}
        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getProjects } from './projects/actions'
import { DashboardClientView } from '@/components/dashboard/DashboardClientView'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Olá'
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Usuário'

  const [projects, rawTasks] = await Promise.all([
    getProjects(),
    supabase.from('tasks').select('*, profiles(full_name, avatar_url)').order('deadline', { ascending: true })
  ])

  const initialTasks = rawTasks.data ?? []

  return (
    <DashboardClientView 
      user={{ firstName, displayName }}
      initialProjects={projects}
      initialTasks={initialTasks}
    />
  )
}

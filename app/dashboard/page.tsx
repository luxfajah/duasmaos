import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getProjects } from './projects/actions'
import { DashboardClientView } from '@/components/dashboard/DashboardClientView'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [projects, rawTasks, profileResponse, teamResponse] = await Promise.all([
    getProjects(),
    supabase.from('tasks').select('*, profiles(full_name, avatar_url)').order('deadline', { ascending: true }),
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
    supabase.from('profiles').select('id, full_name, avatar_url').neq('id', user.id).limit(10)
  ])

  const initialTasks = rawTasks.data ?? []
  const profile = profileResponse.data
  const avatarUrl = profile?.avatar_url
  const team = teamResponse.data ?? []

  const fullName = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Usuário'
  const firstName = fullName.split(' ')[0]
  const displayName = fullName

  return (
    <DashboardClientView 
      user={{ firstName, displayName, avatarUrl }}
      team={team}
      initialProjects={projects}
      initialTasks={initialTasks}
    />
  )
}

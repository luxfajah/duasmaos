import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getV2AllProjects, getV2AllTasks } from './v2/actions'
import { DashboardClientView } from '@/components/dashboard/DashboardClientView'
import { EditorialHeader } from '@/components/brand/EditorialHeader'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [projects, initialTasks, profileResponse, teamResponse] = await Promise.all([
    getV2AllProjects(),
    getV2AllTasks(),
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
    supabase.from('profiles').select('id, full_name, avatar_url').neq('id', user.id).limit(10)
  ])

  const profile = profileResponse.data
  const avatarUrl = profile?.avatar_url
  const team = teamResponse.data ?? []

  const fullName = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Usuário'
  const firstName = fullName.split(' ')[0]
  const displayName = fullName

  return (
    <>
      <EditorialHeader title="Dashboard" />
      <DashboardClientView 
        user={{ firstName, displayName, avatarUrl }}
        team={team}
        initialProjects={projects}
        initialTasks={initialTasks}
      />
    </>
  )
}

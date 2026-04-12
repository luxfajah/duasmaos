import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getProjectSchedulerData } from './scheduler-actions'
import { ExecutiveProjectScheduler } from '@/components/projects/ExecutiveProjectScheduler'

interface Props {
  params: { id: string }
}

export default async function ProjectDeadlinesPage({ params }: Props) {
  const supabase = createClient()

  // Protect route
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch Scheduler Data (Project, Stages, Tasks, Members, Profiles)
  try {
    const schedulerData = await getProjectSchedulerData(params.id)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const userRole = profile?.role || 'client'

    return (
      <div className="flex-1 w-full h-full overflow-hidden">
        <ExecutiveProjectScheduler initialData={schedulerData} userRole={userRole} />
      </div>
    )
  } catch (err) {
    console.error('Error fetching scheduler data:', err)
    notFound()
  }
}

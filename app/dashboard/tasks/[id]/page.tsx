import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { TaskDetailsClient } from './TaskDetailsClient'

export default async function TaskDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch Task v2 details
  const { data: task, error: taskError } = await supabase
    .from('v2_tasks')
    .select(`
      *,
      project:v2_projects(
        name, 
        workflow_type,
        client:clients(name)
      ),
      stage:v2_project_stages(name),
      posts:v2_social_posts(
        *,
        versions:v2_social_post_versions(*)
      )
    `)
    .eq('id', params.id)
    .single()

  if (taskError || !task) return notFound()

  // Fetch current user's profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isClient = profile?.role === 'client'

  // Check if final payment is confirmed for the project
  let finalPaymentConfirmed = true
  if (task.project_id) {
    const { data: finalPaymentTask } = await supabase
      .from('v2_tasks')
      .select('status')
      .eq('project_id', task.project_id)
      .ilike('title', '%pagamento final%')
      .maybeSingle()

    if (finalPaymentTask) {
      finalPaymentConfirmed = finalPaymentTask.status === 'done' || finalPaymentTask.status === 'approved'
    }
  }

  return (
    <TaskDetailsClient 
      task={task} 
      currentUser={{ id: user.id, email: user.email }} 
      finalPaymentConfirmed={finalPaymentConfirmed}
      isClient={isClient}
    />
  )
}

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

  // comments can stay as initialComments for now or we can move to v2_task_comments
  return (
    <TaskDetailsClient 
      task={task} 
      currentUser={{ id: user.id, email: user.email }} 
    />
  )
}

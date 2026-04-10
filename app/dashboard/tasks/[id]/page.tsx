import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { TaskDetailsClient } from './TaskDetailsClient'
import { getTaskComments } from '../comment-actions'

export default async function TaskDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // We fetch task details
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*, projects(name, client_id, clients(name))')
    .eq('id', params.id)
    .single()

  if (taskError || !task) return notFound()

  // We fetch comments
  const comments = await getTaskComments(params.id)

  return (
    <TaskDetailsClient 
      task={task} 
      initialComments={comments} 
      currentUser={{ id: user.id, email: user.email }} 
    />
  )
}

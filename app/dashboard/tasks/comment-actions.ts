'use server'

import { createClient } from '@/utils/supabase/server'
import { TaskComment } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getTaskComments(taskId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('task_comments')
    .select('*, profiles(full_name, avatar_url)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as (TaskComment & {
    profiles: { full_name: string; avatar_url: string | null } | null
  })[]
}

export async function createTaskComment(taskId: string, body: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // Get the profile id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  const { error } = await supabase.from('task_comments').insert({
    task_id: taskId,
    user_id: profile?.id ?? null,
    body,
  })
  if (error) throw error
  revalidatePath('/dashboard/tasks')
}

export async function deleteTaskComment(commentId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('task_comments').delete().eq('id', commentId)
  if (error) throw error
  revalidatePath('/dashboard/tasks')
}

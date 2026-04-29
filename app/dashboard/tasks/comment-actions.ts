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

export async function createTaskComment(
  taskId: string,
  body: string,
  pos_x?: number | null,
  pos_y?: number | null,
  comment_type?: string,
  social_post_id?: string | null
) {
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
    pos_x: pos_x ?? null,
    pos_y: pos_y ?? null,
    comment_type: comment_type ?? 'general',
    social_post_id: social_post_id ?? null,
  })
  if (error) throw error
  revalidatePath('/dashboard/tasks')
  revalidatePath(`/dashboard/tasks/${taskId}`)
}

export async function deleteTaskComment(commentId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('task_comments').delete().eq('id', commentId)
  if (error) throw error
  revalidatePath('/dashboard/tasks')
}

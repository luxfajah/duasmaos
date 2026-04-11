'use server'

import { createClient } from '@/utils/supabase/server'
import { V2Task, TaskStatusV2, TaskPriorityV2 } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getTasks(projectId?: string) {
  const supabase = createClient()
  let query = supabase
    .from('v2_tasks')
    .select('*, v2_projects(name, client_id, clients(name))')
    .order('due_date', { ascending: true, nullsFirst: false })

  if (projectId) query = query.eq('project_id', projectId)

  const { data, error } = await query
  if (error) throw error
  
  return (data ?? []).map(t => ({
    ...t,
    deadline: t.due_date,
    projects: (t as any).v2_projects
  }))
}

export async function updateTaskStatus(id: string, status: TaskStatusV2) {
  const supabase = createClient()
  const { error } = await supabase.from('v2_tasks').update({ status }).eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/tasks')
}

export async function deleteTask(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('v2_tasks').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/tasks')
}

export async function updateTask(
  id: string,
  formData: Partial<{
    title: string
    description: string
    status: TaskStatusV2
    priority: TaskPriorityV2
    due_date: string
  }>
) {
  const supabase = createClient()
  const { error } = await supabase.from('v2_tasks').update(formData).eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/tasks')
}

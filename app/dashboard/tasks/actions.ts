'use server'

import { createClient } from '@/utils/supabase/server'
import { Task, TaskStatus, Priority } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getTasks(projectId?: string, assignedTo?: string) {
  const supabase = createClient()
  let query = supabase
    .from('tasks')
    .select('*, projects(name, client_id, clients(name)), profiles(full_name)')
    .order('deadline', { ascending: true, nullsFirst: false })

  if (projectId) query = query.eq('project_id', projectId)
  if (assignedTo) query = query.eq('assigned_to', assignedTo)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as (Task & {
    projects: { name: string; client_id: string; clients: { name: string } | null } | null
    profiles: { full_name: string } | null
  })[]
}

export async function createTask(formData: {
  project_id: string
  title: string
  description?: string
  assigned_to?: string
  status?: TaskStatus
  priority?: Priority
  deadline?: string
}) {
  const supabase = createClient()
  const { error } = await supabase.from('tasks').insert({
    project_id: formData.project_id,
    title: formData.title,
    description: formData.description ?? null,
    assigned_to: formData.assigned_to ?? null,
    status: formData.status ?? 'todo',
    priority: formData.priority ?? 'medium',
    deadline: formData.deadline ?? null,
  })
  if (error) throw error
  revalidatePath('/dashboard/tasks')
  revalidatePath(`/dashboard/projects/${formData.project_id}`)
}

export async function updateTask(
  id: string,
  formData: Partial<{
    title: string
    description: string
    assigned_to: string
    status: TaskStatus
    priority: Priority
    deadline: string
  }>
) {
  const supabase = createClient()
  const { error } = await supabase.from('tasks').update(formData).eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/tasks')
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const supabase = createClient()
  const { error } = await supabase.from('tasks').update({ status }).eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/tasks')
}

export async function deleteTask(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/tasks')
}

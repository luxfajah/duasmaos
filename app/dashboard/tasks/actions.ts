'use server'

import { createClient } from '@/utils/supabase/server'
import { V2Task, TaskStatusV2, TaskPriorityV2 } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getTasks(projectId?: string) {
  const supabase = createClient()
  let query = supabase
    .from('v2_tasks')
    .select('*, v2_projects(name, client_id, clients(name)), v2_task_assignees(user_id, profiles(full_name))')
    .order('due_date', { ascending: true, nullsFirst: false })

  if (projectId) query = query.eq('project_id', projectId)

  const { data, error } = await query
  if (error) throw error
  
  return (data ?? []).map((t: any) => ({
    ...t,
    deadline: t.due_date,
    assigned_to: t.v2_task_assignees?.[0]?.user_id ?? null,
    profiles: t.v2_task_assignees?.[0]?.profiles ?? null,
    projects: t.v2_projects
  }))
}

export async function createTask(formData: {
  project_id: string
  title: string
  description?: string
  status?: TaskStatusV2
  priority?: TaskPriorityV2
  due_date?: string
  assigned_to?: string
}) {
  const supabase = createClient()

  // 1. Find the current stage
  const { data: stages } = await supabase
    .from('v2_project_stages')
    .select('id, status, order')
    .eq('project_id', formData.project_id)
    .order('order', { ascending: true })

  if (!stages || stages.length === 0) throw new Error('Projeto não possui etapas.')

  const currentStage = stages.find(s => s.status === 'in_progress') || stages[0]

  // 2. Insert Task
  const { data: task, error } = await supabase.from('v2_tasks').insert({
    project_id: formData.project_id,
    stage_id: currentStage.id,
    title: formData.title,
    description: formData.description ?? null,
    status: formData.status ?? 'pending',
    priority: formData.priority ?? 'medium',
    due_date: formData.due_date ?? null,
  }).select('id').single()

  if (error) throw error

  // 3. Insert assignee if provided
  if (formData.assigned_to && task?.id) {
    await supabase.from('v2_task_assignees').insert({
      task_id: task.id,
      user_id: formData.assigned_to,
    })
  }

  revalidatePath('/dashboard/tasks')
  revalidatePath(`/dashboard/projects/${formData.project_id}`)
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
    assigned_to: string
  }>
) {
  const supabase = createClient()
  const { assigned_to, ...taskData } = formData
  const { error } = await supabase.from('v2_tasks').update(taskData).eq('id', id)
  if (error) throw error

  // Update assignee via join table
  if (assigned_to !== undefined) {
    await supabase.from('v2_task_assignees').delete().eq('task_id', id)
    if (assigned_to) {
      await supabase.from('v2_task_assignees').insert({ task_id: id, user_id: assigned_to })
    }
  }

  revalidatePath('/dashboard/tasks')
}

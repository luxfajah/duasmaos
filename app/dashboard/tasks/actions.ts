'use server'

import { createClient } from '@/utils/supabase/server'
import { V2Task, TaskStatusV2, TaskPriorityV2, DeliverableTypeV2, TaskTypeV2 } from '@/types/database'
import { revalidatePath } from 'next/cache'

/** Logic to reconcile social posts with the desired count */
async function syncSocialPosts(taskId: string, count: number) {
  const supabase = createClient()
  
  // 1. Get current posts
  const { data: currentPosts } = await supabase
    .from('v2_social_posts')
    .select('id, order')
    .eq('task_id', taskId)
    .order('order', { ascending: true })

  const currentCount = currentPosts?.length || 0

  if (currentCount < count) {
    // Add missing posts
    const toAdd = count - currentCount
    const newPosts = Array.from({ length: toAdd }).map((_, i) => ({
      task_id: taskId,
      order: currentCount + i,
      type: 'feed',
      status: 'pending'
    }))
    await supabase.from('v2_social_posts').insert(newPosts)
  } else if (currentCount > count) {
    // Remove extra posts (from the end)
    const toRemove = currentPosts!.slice(count).map(p => p.id)
    await supabase.from('v2_social_posts').delete().in('id', toRemove)
  }
}

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
  deliverable_type?: DeliverableTypeV2
  social_post_count?: number
  task_type?: TaskTypeV2
  // Meeting fields
  meeting_start_at?: string
  meeting_end_at?: string
  meeting_participants?: { email: string; displayName?: string }[]
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
    deliverable_type: formData.deliverable_type ?? null,
    social_post_count: formData.social_post_count ?? 0
  }).select('id').single()

  if (error) throw error

  // 3. Insert assignee if provided
  if (formData.assigned_to && task?.id) {
    await supabase.from('v2_task_assignees').insert({
      task_id: task.id,
      user_id: formData.assigned_to,
    })
  }

  // 4. Sync social posts if count provided
  if (formData.social_post_count && formData.social_post_count > 0 && task?.id) {
    await syncSocialPosts(task.id, formData.social_post_count)
  }

  // 5. Create Google Calendar event for meeting tasks (non-blocking)
  if ((formData as any).deliverable_type === 'meeting' || formData.task_type === 'meeting') {
    if (formData.meeting_start_at && formData.meeting_end_at && task?.id) {
      try {
        const { createMeetingEvent } = await import('@/lib/google/calendar')
        const participants = (formData.meeting_participants || []) as { email: string; displayName?: string }[]
        const calendarEventId = await createMeetingEvent({
          title: formData.title,
          description: formData.description,
          startDateTime: formData.meeting_start_at,
          endDateTime: formData.meeting_end_at,
          participants,
        })
        await supabase.from('v2_tasks').update({ calendar_event_id: calendarEventId }).eq('id', task.id)
      } catch (calError: any) {
        console.error('Aviso: Não foi possível criar evento no Google Calendar:', calError.message)
      }
    }
  }

  revalidatePath('/dashboard/tasks')
  revalidatePath(`/dashboard/projects/${formData.project_id}`)
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
    deliverable_type: DeliverableTypeV2
    social_post_count: number
  }>
) {
  const supabase = createClient()
  const { assigned_to, social_post_count, ...taskData } = formData

  const { data: currentTask } = await supabase.from('v2_tasks').select('status').eq('id', id).single()
  if (currentTask?.status === 'locked') {
    throw new Error('Não é possível modificar as propriedades de uma tarefa bloqueada.')
  }
  
  const { error } = await supabase.from('v2_tasks').update({
    ...taskData,
    social_post_count: social_post_count
  }).eq('id', id)
  
  if (error) throw error

  // Update assignee via join table
  if (assigned_to !== undefined) {
    await supabase.from('v2_task_assignees').delete().eq('task_id', id)
    if (assigned_to) {
      await supabase.from('v2_task_assignees').insert({ task_id: id, user_id: assigned_to })
    }
  }

  // Sync social posts if count changed
  if (social_post_count !== undefined) {
    await syncSocialPosts(id, social_post_count)
  }

  revalidatePath('/dashboard/tasks')
}

export async function updateTaskStatus(id: string, status: TaskStatusV2) {
  const { updateV2TaskStatus } = await import('@/app/dashboard/v2/actions')
  await updateV2TaskStatus(id, status)
  revalidatePath('/dashboard/tasks')
}

export async function deleteTask(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('v2_tasks').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') throw new Error('Não é possível excluir esta tarefa pois existem outras que dependem dela.');
    throw error;
  }
  revalidatePath('/dashboard/tasks')
}


'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { TaskStatusV2, TaskPriorityV2 } from '@/types/database'

export async function updateV2Task(
  taskId: string,
  projectId: string,
  data: {
    title?: string
    description?: string
    status?: TaskStatusV2
    priority?: TaskPriorityV2
    due_date?: string | null
    assignees?: string[] // array of profile IDs
  }
) {
  const supabase = createClient()

  // 1. Update task core fields
  const { error: taskError } = await supabase
    .from('v2_tasks')
    .update({
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      due_date: data.due_date,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)

  if (taskError) throw taskError

  // 2. Sync assignees if provided
  if (data.assignees) {
    // Delete existing
    await supabase.from('v2_task_assignees').delete().eq('task_id', taskId)

    // Insert new
    if (data.assignees.length > 0) {
      const { error: assigneeError } = await supabase
        .from('v2_task_assignees')
        .insert(data.assignees.map(userId => ({
          task_id: taskId,
          user_id: userId
        })))

      if (assigneeError) throw assigneeError
    }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/projects/${projectId}/deadlines`)
  return { success: true }
}

export async function getAllProfiles() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .order('full_name', { ascending: true })

  if (error) throw error
  return data || []
}

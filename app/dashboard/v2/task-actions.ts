'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { TaskStatusV2, TaskPriorityV2, DeliverableTypeV2 } from '@/types/database'

export async function createV2Task(
  projectId: string,
  data: {
    title: string
    description?: string
    status?: TaskStatusV2
    priority?: TaskPriorityV2
    due_date?: string | null
    assignees?: string[]
    deliverable_type?: DeliverableTypeV2
    social_post_count?: number
  }
) {
  const supabase = createClient()

  // 1. Find the current stage for the project
  const { data: stages } = await supabase
    .from('v2_project_stages')
    .select('id, status')
    .eq('project_id', projectId)
    .order('order', { ascending: true })

  if (!stages || stages.length === 0) throw new Error('Projeto não possui etapas.')
  
  // Use first in-progress stage or the first stage
  const targetStage = stages.find(s => s.status === 'in_progress') || stages[0]

  // 2. Insert Task
  const { data: task, error: taskError } = await supabase
    .from('v2_tasks')
    .insert({
      project_id: projectId,
      stage_id: targetStage.id,
      title: data.title,
      description: data.description,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      due_date: data.due_date,
      deliverable_type: data.deliverable_type || 'default',
      social_post_count: data.social_post_count || 0
    })
    .select('id')
    .single()

  if (taskError) throw taskError

  // 3. Insert assignees
  if (data.assignees && data.assignees.length > 0 && task) {
    const { error: assigneeError } = await supabase
      .from('v2_task_assignees')
      .insert(data.assignees.map(userId => ({
        task_id: task.id,
        user_id: userId
      })))

    if (assigneeError) throw assigneeError
  }

  // 4. Initial Sync Social Posts if needed
  if (data.social_post_count && data.social_post_count > 0 && task) {
    await syncSocialPosts(task.id, data.social_post_count)
  }

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/tasks')
  revalidatePath(`/dashboard/projects/${projectId}`)
  return { id: task?.id }
}

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
    deliverable_type?: DeliverableTypeV2
    social_post_count?: number
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
      deliverable_type: data.deliverable_type,
      social_post_count: data.social_post_count,
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

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/tasks')
  revalidatePath(`/dashboard/projects/${projectId}`)
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

export async function getSocialPosts(taskId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('v2_social_posts')
    .select('*')
    .eq('task_id', taskId)
    .order('order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function syncSocialPosts(taskId: string, targetCount: number) {
  const supabase = createClient()

  // 1. Get current posts
  const { data: currentPosts, error: getError } = await supabase
    .from('v2_social_posts')
    .select('*')
    .eq('task_id', taskId)
    .order('order', { ascending: true })

  if (getError) throw getError

  const currentCount = currentPosts?.length || 0

  if (targetCount > currentCount) {
    // Add new posts
    const newPosts = []
    for (let i = currentCount; i < targetCount; i++) {
      newPosts.push({
        task_id: taskId,
        order: i,
        type: 'feed',
        status: 'pending',
        approval_status: 'pending',
        hashtags: []
      })
    }

    if (newPosts.length > 0) {
      const { error: insertError } = await supabase.from('v2_social_posts').insert(newPosts)
      if (insertError) throw insertError
    }
  } else if (targetCount < currentCount) {
    // Identify empty posts to delete that are above the target count
    const postsToDelete = currentPosts.filter(post => {
      if (post.order < targetCount) return false
      
      const isEmpty = !post.caption && 
                      (!post.hashtags || post.hashtags.length === 0) && 
                      (!post.media || (Array.isArray(post.media) && post.media.length === 0))
      
      return isEmpty
    })

    if (postsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('v2_social_posts')
        .delete()
        .in('id', postsToDelete.map(p => p.id))
      
      if (deleteError) throw deleteError
    }
  }

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/tasks')
  return { success: true }
}

export async function updateSocialPost(postId: string, data: any) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('v2_social_posts')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', postId)

  if (error) throw error
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/tasks')
  return { success: true }
}

export async function createDesignTaskFromCopy(copyTaskId: string) {
  const supabase = createClient()

  // 1. Fetch copy task
  const { data: copyTask, error: copyError } = await supabase
    .from('v2_tasks')
    .select('*')
    .eq('id', copyTaskId)
    .single()

  if (copyError || !copyTask) throw new Error('Task de copy não encontrada.')

  if (copyTask.deliverable_type !== 'social_copy') {
    throw new Error('Apenas tarefas de social_copy podem gerar social_design.')
  }

  // 2. Fetch copy posts
  const { data: copyPosts, error: postsError } = await supabase
    .from('v2_social_posts')
    .select('*')
    .eq('task_id', copyTaskId)
    .order('order', { ascending: true })

  if (postsError) throw postsError

  // Check if all approved
  const allApproved = copyPosts?.every(p => p.approval_status === 'approved')
  if (!allApproved) {
    throw new Error('Todos os posts precisam estar aprovados para gerar o design.')
  }

  // 3. Create design task
  const { data: designTask, error: designTaskError } = await supabase
    .from('v2_tasks')
    .insert({
      project_id: copyTask.project_id,
      stage_id: copyTask.stage_id,
      parent_task_id: copyTaskId,
      title: `${copyTask.title} (Design)`,
      description: `Tarefa de design gerada a partir da copy: ${copyTask.title}`,
      type: 'task',
      deliverable_type: 'social_design',
      status: 'pending',
      priority: copyTask.priority,
      social_post_count: copyTask.social_post_count
    })
    .select('id')
    .single()

  if (designTaskError) throw designTaskError

  // 4. Clone posts
  if (copyPosts && copyPosts.length > 0) {
    const designPostsToInsert = copyPosts.map(p => ({
      task_id: designTask.id,
      inherits_from_post_id: p.id,
      type: p.type,
      carousel_slides: p.carousel_slides,
      caption: p.caption,
      hashtags: p.hashtags,
      optional_text: p.optional_text,
      status: 'pending',
      approval_status: 'pending',
      order: p.order
    }))

    const { error: insertPostsError } = await supabase
      .from('v2_social_posts')
      .insert(designPostsToInsert)

    if (insertPostsError) throw insertPostsError
  }

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/tasks')
  revalidatePath(`/dashboard/projects/${copyTask.project_id}`)

  return { id: designTask.id }
}

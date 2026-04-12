'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { TaskStatusV2, TaskPriorityV2, DeliverableTypeV2, TaskTypeV2 } from '@/types/database'

export async function createV2Task(
  projectId: string,
  data: {
    title: string
    description?: string
    status?: TaskStatusV2
    priority?: TaskPriorityV2
    due_date?: string | null
    assignees?: string[]
    task_type?: TaskTypeV2
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

  // Find last task in project to append to queue
  const { data: lastTasks } = await supabase
    .from('v2_tasks')
    .select('id, stage_order, status, created_at')
    .eq('project_id', projectId)
    .order('stage_order', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(1)

  let stageOrder = 1
  let dependsOnTaskId = null
  let initialStatus: TaskStatusV2 = 'pending'

  if (lastTasks && lastTasks.length > 0) {
    const lastTask = lastTasks[0]
    stageOrder = (lastTask.stage_order || 0) + 1
    dependsOnTaskId = lastTask.id
    initialStatus = lastTask.status === 'done' ? 'pending' : 'locked'
  }

  // 2. Insert Task
  const { data: task, error: taskError } = await supabase
    .from('v2_tasks')
    .insert({
      project_id: projectId,
      stage_id: targetStage.id,
      title: data.title,
      description: data.description,
      status: initialStatus,
      priority: data.priority || 'medium',
      due_date: data.due_date,
      task_type: data.task_type || 'operational',
      deliverable_type: data.deliverable_type || 'default',
      social_post_count: data.social_post_count || 0,
      stage_order: stageOrder,
      depends_on_task_id: dependsOnTaskId
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
    task_type?: TaskTypeV2
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
      task_type: data.task_type,
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
    .select('*, media:v2_post_media(*)')
    .eq('task_id', taskId)
    .order('order_index', { ascending: true })

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
    .order('order_index', { ascending: true })

  if (getError) throw getError

  const currentCount = currentPosts?.length || 0

  if (targetCount > currentCount) {
    // Add new posts
    const newPosts = []
    for (let i = currentCount; i < targetCount; i++) {
      newPosts.push({
        task_id: taskId,
        order_index: i,
        post_type: 'image',
        status: 'draft',
        hashtags: []
      })
    }

    if (newPosts.length > 0) {
      const { error: insertError } = await supabase.from('v2_social_posts').insert(newPosts)
      if (insertError) throw insertError
    }
  } else if (targetCount < currentCount) {
    // Identify empty posts to delete
    const postsToDelete = currentPosts.filter(post => {
      if (post.order_index < targetCount) return false
      
      const isEmpty = !post.caption && 
                      (!post.hashtags || post.hashtags.length === 0)
      
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
      post_type: p.post_type,
      caption: p.caption,
      hashtags: p.hashtags,
      art_text: p.art_text,
      script: p.script,
      status: 'draft',
      order_index: p.order_index
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

// ── Content Governance & Versioning ──────────────────────────────────────────

export async function submitPostForReview(postId: string) {
  const supabase = createClient()
  
  // 1. Get current post with media to snapshot
  const { data: post } = await supabase
    .from('v2_social_posts')
    .select('*, media:v2_post_media(*)')
    .eq('id', postId)
    .single()

  if (!post) throw new Error('Post não encontrado')

  // 2. Determine next version number
  const { data: lastVersion } = await supabase
    .from('v2_social_post_versions')
    .select('version_number')
    .eq('post_id', postId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextVersion = (lastVersion?.version_number || 0) + 1

  // 3. Create version snapshot (Copy + Media + Status + Type)
  await supabase.from('v2_social_post_versions').insert({
    post_id: postId,
    version_number: nextVersion,
    copy_snapshot: {
      caption: post.caption,
      art_text: post.art_text,
      script: post.script,
      hashtags: post.hashtags
    },
    media_snapshot: post.media || [],
    status_snapshot: post.status,
    post_type_snapshot: post.post_type,
    created_at: new Date().toISOString()
  })

  // 4. Update status and Lock
  const { error } = await supabase
    .from('v2_social_posts')
    .update({ 
      status: 'awaiting_review',
      updated_at: new Date().toISOString() 
    })
    .eq('id', postId)

  if (error) throw error
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/tasks')
  return { success: true }
}

export async function approvePost(postId: string) {
  const supabase = createClient()
  
  const { data: post } = await supabase
    .from('v2_social_posts')
    .select('task_id')
    .eq('id', postId)
    .single()

  const { error } = await supabase
    .from('v2_social_posts')
    .update({ 
      status: 'approved',
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq('id', postId)

  if (error) throw error
  
  if (post?.task_id) {
    await checkTaskAutoCompletion(post.task_id)
  }

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/tasks')
  return { success: true }
}

export async function rejectPost(postId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('v2_social_posts')
    .update({ 
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq('id', postId)

  if (error) throw error
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/tasks')
  return { success: true }
}

export async function getPostVersions(postId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('v2_social_post_versions')
    .select('*')
    .eq('post_id', postId)
    .order('version_number', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Automagically completes a task if all its posts are approved.
 */
async function checkTaskAutoCompletion(taskId: string) {
  const supabase = createClient()
  
  const { data: posts } = await supabase
    .from('v2_social_posts')
    .select('status')
    .eq('task_id', taskId)

  if (!posts || posts.length === 0) return

  const allApproved = posts.every(p => p.status === 'approved')
  
  if (allApproved) {
    await supabase
      .from('v2_tasks')
      .update({ status: 'done', updated_at: new Date().toISOString() })
      .eq('id', taskId)
  }
}

export async function upsertPostMedia(postId: string, mediaItems: any[]) {
  const supabase = createClient()
  
  // 1. Delete old media for this post (simplest sync)
  await supabase.from('v2_post_media').delete().eq('post_id', postId)
  
  // 2. Insert new media
  if (mediaItems.length > 0) {
    const { error } = await supabase.from('v2_post_media').insert(
      mediaItems.map((item, index) => ({
        post_id: postId,
        storage_provider: item.storage_provider,
        file_path: item.file_path,
        public_url: item.public_url,
        media_type: item.media_type,
        order_index: index
      }))
    )
    if (error) throw error
  }
  
  revalidatePath('/dashboard/tasks')
  return { success: true }
}

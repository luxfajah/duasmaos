'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

// ── Slug Validation ──────────────────────────────────────────────────────────

export async function validatePortalSlug(slug: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('client_portal_settings')
    .select('*, clients(id, name, company)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  return {
    clientId: data.client_id as string,
    clientName: (data.clients as any)?.company || (data.clients as any)?.name || 'Cliente',
    settings: data
  }
}

// ── Client Posts ──────────────────────────────────────────────────────────────

export async function getClientApprovalPosts(clientId: string) {
  const supabase = createAdminClient()

  // Get all social posts from tasks that belong to projects of this client
  const { data, error } = await supabase
    .from('v2_social_posts')
    .select(`
      *,
      task_comments(*, profiles(full_name, role)),
      v2_tasks!inner(
        id, title, project_id, description,
        v2_projects!inner(
          id, name, client_id
        )
      )
    `)
    .eq('v2_tasks.v2_projects.client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching approval posts:', error)
    return []
  }

  return data ?? []
}

export async function getClientPostDetail(postId: string, clientId: string) {
  const supabase = createAdminClient()

  // Fetch the post with task/project info + verify it belongs to this client
  const { data: post, error: postError } = await supabase
    .from('v2_social_posts')
    .select(`
      *,
      v2_tasks!inner(
        id, title, project_id, description,
        v2_projects!inner(
          id, name, client_id, workflow_type
        )
      )
    `)
    .eq('id', postId)
    .single()

  if (postError || !post) return null

  // Verify client ownership
  const taskProject = (post as any).v2_tasks?.v2_projects
  if (taskProject?.client_id !== clientId) return null

  // Fetch comments for this post
  const { data: comments } = await supabase
    .from('task_comments')
    .select('*, profiles(full_name, role)')
    .eq('social_post_id', postId)
    .order('created_at', { ascending: true })

  // Fetch media
  const media = (post as any).media || []

  return {
    ...post,
    comments: comments ?? [],
    mediaItems: media,
  }
}

// ── Client Actions ──────────────────────────────────────────────────────────

async function validateSlugAndGetClient(slug: string) {
  const session = await validatePortalSlug(slug)
  if (!session) {
    throw new Error('Portal inválido ou inativo.')
  }
  return session
}

export async function clientApprovePost(postId: string, slug: string) {
  const session = await validateSlugAndGetClient(slug)
  const supabase = createAdminClient()

  // Verify post belongs to client
  const detail = await getClientPostDetail(postId, session.clientId)
  if (!detail) throw new Error('Post não encontrado.')

  const { error } = await supabase
    .from('v2_social_posts')
    .update({
      client_approval_status: 'approved',
      client_approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)

  if (error) throw error

  revalidatePath(`/aprovacao/${slug}`)
  return { success: true }
}

export async function clientRejectPost(postId: string, slug: string, reason: string) {
  if (!reason || reason.trim().length === 0) {
    throw new Error('É obrigatório informar o motivo da rejeição.')
  }

  const session = await validateSlugAndGetClient(slug)
  const supabase = createAdminClient()

  // Verify post belongs to client
  const detail = await getClientPostDetail(postId, session.clientId)
  if (!detail) throw new Error('Post não encontrado.')

  // Update post status
  const { error: updateError } = await supabase
    .from('v2_social_posts')
    .update({
      client_approval_status: 'rejected',
      client_rejected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)

  if (updateError) throw updateError

  // Create rejection comment
  const taskId = (detail as any).task_id
  const { error: commentError } = await supabase
    .from('task_comments')
    .insert({
      task_id: taskId,
      social_post_id: postId,
      body: reason.trim(),
      comment_type: 'rejection_reason',
    })

  if (commentError) throw commentError

  revalidatePath(`/aprovacao/${slug}`)
  return { success: true }
}

export async function clientRequestRevision(postId: string, slug: string, notes: string) {
  if (!notes || notes.trim().length === 0) {
    throw new Error('É obrigatório informar as observações para revisão.')
  }

  const session = await validateSlugAndGetClient(slug)
  const supabase = createAdminClient()

  // Verify post belongs to client
  const detail = await getClientPostDetail(postId, session.clientId)
  if (!detail) throw new Error('Post não encontrado.')

  // Update post status
  const { error: updateError } = await supabase
    .from('v2_social_posts')
    .update({
      client_approval_status: 'revision_requested',
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)

  if (updateError) throw updateError

  // Create revision comment
  const taskId = (detail as any).task_id
  const { error: commentError } = await supabase
    .from('task_comments')
    .insert({
      task_id: taskId,
      social_post_id: postId,
      body: notes.trim(),
      comment_type: 'revision_request',
    })

  if (commentError) throw commentError

  revalidatePath(`/aprovacao/${slug}`)
  return { success: true }
}

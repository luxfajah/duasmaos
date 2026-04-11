'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { PostTypeV2, PostStatusV2, V2SocialPost } from '@/types/database'

export async function getSocialPosts(taskId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('v2_social_posts')
    .select('*')
    .eq('task_id', taskId)
    .order('order', { ascending: true })

  if (error) throw error
  return (data ?? []) as V2SocialPost[]
}

export async function updateSocialPost(
  postId: string,
  data: Partial<Pick<V2SocialPost, 'type' | 'status' | 'carousel_slides' | 'caption' | 'hashtags' | 'optional_text' | 'approval_status'>>
) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('v2_social_posts')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', postId)

  if (error) throw error
  return { success: true }
}

export async function addPostAsset(postId: string, url: string) {
  const supabase = createClient()
  
  // Get current assets
  const { data: post } = await supabase
    .from('v2_social_posts')
    .select('media')
    .eq('id', postId)
    .single()

  const currentMedia = (post?.media as any[]) || []
  
  const { error } = await supabase
    .from('v2_social_posts')
    .update({
      media: [...currentMedia, { url, type: 'image', created_at: new Date().toISOString() }],
      updated_at: new Date().toISOString()
    })
    .eq('id', postId)

  if (error) throw error
}

export async function removePostAsset(postId: string, url: string) {
  const supabase = createClient()
  
  const { data: post } = await supabase
    .from('v2_social_posts')
    .select('media')
    .eq('id', postId)
    .single()

  const currentMedia = (post?.media as any[]) || []
  const newMedia = currentMedia.filter(m => m.url !== url)
  
  const { error } = await supabase
    .from('v2_social_posts')
    .update({
      media: newMedia,
      updated_at: new Date().toISOString()
    })
    .eq('id', postId)

  if (error) throw error
}

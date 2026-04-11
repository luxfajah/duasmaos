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
  data: Partial<Pick<V2SocialPost, 'type' | 'status' | 'carousel_slides' | 'caption' | 'hashtags' | 'optional_text' | 'is_approved'>>
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
    .select('design_urls')
    .eq('id', postId)
    .single()

  const currentUrls = (post?.design_urls as string[]) || []
  
  const { error } = await supabase
    .from('v2_social_posts')
    .update({
      design_urls: [...currentUrls, url],
      updated_at: new Date().toISOString()
    })
    .eq('id', postId)

  if (error) throw error
}

export async function removePostAsset(postId: string, url: string) {
  const supabase = createClient()
  
  const { data: post } = await supabase
    .from('v2_social_posts')
    .select('design_urls')
    .eq('id', postId)
    .single()

  const currentUrls = (post?.design_urls as string[]) || []
  const newUrls = currentUrls.filter(u => u !== url)
  
  const { error } = await supabase
    .from('v2_social_posts')
    .update({
      design_urls: newUrls,
      updated_at: new Date().toISOString()
    })
    .eq('id', postId)

  if (error) throw error
}

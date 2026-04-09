'use server'

import { createClient } from '@/utils/supabase/server'
import { Post, Client, Comment } from '@/types/database'

export async function getClients() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data as Client[]
}

export async function getPosts(clientId?: string) {
  const supabase = createClient()
  let query = supabase
    .from('posts')
    .select('*, clients(name)')
    .order('created_at', { ascending: false })
  
  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query
  
  if (error) throw error
  return data as (Post & { clients: { name: string } })[]
}

export async function getPostDetail(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*, clients(name)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as (Post & { clients: { name: string } })
}

export async function getPostComments(postId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(full_name, role)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

export async function updatePostStatus(postId: string, status: Post['status']) {
  const supabase = createClient()
  const { error } = await supabase
    .from('posts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', postId)
  
  if (error) throw error
}

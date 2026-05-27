'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProposals() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('proposals')
    .select('id, client_name, created_at, status')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching proposals:', error)
    return []
  }
  return data || []
}

export async function createProposal(clientName: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('proposals')
    .insert([{ client_name: clientName, content: {} }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/propostas')
  return data
}

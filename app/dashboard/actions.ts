'use server'

import { createClient } from '@/utils/supabase/server'
import { Client } from '@/types/database'

export async function getClients() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data as Client[]
}

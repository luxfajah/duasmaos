'use server'

import { createClient } from '@/utils/supabase/server'
import { Client, ClientStatus } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getClients() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')
  if (error) throw error
  return (data ?? []) as Client[]
}

export async function getClientById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Client
}

export async function createClient_(formData: {
  name: string
  company?: string
  email?: string
  phone?: string
  status?: ClientStatus
  notes?: string
  website?: string
  sector?: string
}) {
  const supabase = createClient()
  const { error } = await supabase.from('clients').insert({
    name: formData.name,
    company: formData.company ?? null,
    email: formData.email ?? null,
    phone: formData.phone ?? null,
    status: formData.status ?? 'active',
    notes: formData.notes ?? null,
    website: formData.website ?? null,
    sector: formData.sector ?? null,
    contacts: [],
  })
  if (error) throw error
  revalidatePath('/dashboard/clients')
}

export async function updateClient(
  id: string,
  formData: Partial<{
    name: string
    company: string
    email: string
    phone: string
    status: ClientStatus
    notes: string
    website: string
    sector: string
    contacts: object[]
  }>
) {
  const supabase = createClient()
  const { error } = await supabase.from('clients').update(formData).eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/clients')
  revalidatePath(`/dashboard/clients/${id}`)
}

export async function deleteClient(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/clients')
}

export async function getClientStats(clientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('id, status')
    .eq('client_id', clientId)
  if (error) throw error
  const projects = data ?? []
  return {
    total: projects.length,
    active: projects.filter((p) => ['draft', 'copy', 'review'].includes(p.status)).length,
    completed: projects.filter((p) => p.status === 'completed').length,
    delayed: projects.filter((p) => p.status === 'delayed').length,
  }
}

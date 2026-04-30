'use server'

import { createClient } from '@/utils/supabase/server'
import { Client, ClientStatus, ClientAddress } from '@/types/database'
import { revalidatePath } from 'next/cache'

function stripMask(val: string | null | undefined) {
  if (!val) return null
  return val.replace(/\D/g, '')
}

export async function getClients() {
  const supabase = createClient()
  
  // Fetch clients with project counts and main address
  // We use a join for the address and a subquery for the count to avoid N+1
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      client_addresses(*),
      projects:v2_projects(id, status)
    `)
    .order('name')
    
  if (error) throw error
  
  return (data ?? []).map(client => ({
    ...client,
    projects_count: client.projects?.length ?? 0,
    active_projects_count: client.projects?.filter((p: any) => p.status === 'active').length ?? 0
  })) as Client[]
}

export async function getClientById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*, client_addresses(*), client_documents(*), account_manager:profiles!account_manager_id(full_name)')
    .eq('id', id)
    .single()
    
  if (error) throw error
  return data as any
}

export async function createClient_(formData: Partial<Client & { address?: Partial<ClientAddress> }>) {
  const supabase = createClient()
  
  // 1. Insert Client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      type: formData.type || 'pj',
      name: formData.name,
      company: formData.company || null,
      email: formData.email || null,
      phone: stripMask(formData.phone),
      whatsapp: stripMask(formData.whatsapp),
      status: formData.status || 'active',
      notes: formData.notes || null,
      website: formData.website || null,
      segment: formData.segment || null,
      cpf: stripMask(formData.cpf),
      birth_date: formData.birth_date || null,
      trade_name: formData.trade_name || null,
      cnpj: stripMask(formData.cnpj),
      responsible_name: formData.responsible_name || null,
      lead_source: formData.lead_source || null,
      account_manager_id: formData.account_manager_id || null,
      contacts: [],
    })
    .select()
    .single()
    
  if (clientError) throw clientError

  // 2. Insert Address if provided
  if (formData.address && client) {
    const { error: addressError } = await supabase
      .from('client_addresses')
      .insert({
        client_id: client.id,
        zip_code: stripMask(formData.address.zip_code),
        street: formData.address.street || null,
        number: formData.address.number || null,
        complement: formData.address.complement || null,
        city: formData.address.city || null,
        state: formData.address.state || null,
        is_main: true
      })
    if (addressError) console.error('Error inserting address:', addressError)
  }

  // 3. Create Google Drive folder structure (non-blocking)
  if (client) {
    try {
      const { createClientFolderStructure } = await import('@/lib/google/drive')
      const folderId = await createClientFolderStructure(
        formData.company || formData.name || 'Cliente'
      )
      await supabase.from('clients').update({ drive_folder_id: folderId }).eq('id', client.id)
    } catch (driveError: any) {
      console.error('Aviso: Não foi possível criar pasta no Drive:', driveError.message)
    }
  }

  revalidatePath('/dashboard/clients')
}

export async function updateClient(
  id: string,
  formData: Partial<Client & { address?: Partial<ClientAddress> }>
) {
  const supabase = createClient()
  
  // Normalize normalized fields
  const updateData: any = { ...formData }
  if (updateData.phone) updateData.phone = stripMask(updateData.phone)
  if (updateData.whatsapp) updateData.whatsapp = stripMask(updateData.whatsapp)
  if (updateData.cpf) updateData.cpf = stripMask(updateData.cpf)
  if (updateData.cnpj) updateData.cnpj = stripMask(updateData.cnpj)
  
  // Remove nested/extra objects before updating clients table
  const { address, projects, client_addresses, client_documents, ...directData } = updateData

  const { error: clientError } = await supabase
    .from('clients')
    .update(directData)
    .eq('id', id)
    
  if (clientError) throw clientError

  // Update Address if provided
  if (address) {
    const zip = stripMask(address.zip_code)
    const { error: addressError } = await supabase
      .from('client_addresses')
      .upsert({
        client_id: id,
        ...address,
        zip_code: zip,
        is_main: true
      }, { onConflict: 'client_id, is_main' }) // Assuming a constraint or just manual management
      
    if (addressError) {
      // If no unique constraint on (client_id, is_main), manual check/update
      const { data: existing } = await supabase.from('client_addresses').select('id').eq('client_id', id).eq('is_main', true).single()
      if (existing) {
        await supabase.from('client_addresses').update({ ...address, zip_code: zip }).eq('id', existing.id)
      } else {
        await supabase.from('client_addresses').insert({ client_id: id, ...address, zip_code: zip, is_main: true })
      }
    }
  }

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
    .from('v2_projects')
    .select('id, status, created_at')
    .eq('client_id', clientId)
  if (error) throw error
  const projects = data ?? []
  return {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    delayed: 0,
  }
}

export async function updateClientPipelineStage(id: string, pipeline_stage: string | null) {
  const supabase = createClient()
  const { error } = await supabase.from('clients').update({ pipeline_stage }).eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/clients')
  revalidatePath('/dashboard/clients/pipeline')
}

export async function uploadClientDocument(clientId: string, file: File, type: string) {
  const supabase = createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${clientId}/${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('client-documents')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('client-documents')
    .getPublicUrl(filePath)

  const { error: dbError } = await supabase.from('client_documents').insert({
    client_id: clientId,
    type,
    file_name: file.name,
    file_size: file.size,
    file_url: publicUrl,
  })

  if (dbError) throw dbError
  
  revalidatePath(`/dashboard/clients/${clientId}`)
}

export async function uploadPortalImage(formData: FormData) {
  const supabase = createClient()
  
  const file = formData.get('file') as File
  const clientId = formData.get('clientId') as string
  if (!file || !clientId) throw new Error('Dados inválidos para upload.')

  // Use the file name as-is (client sets the correct name/extension)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${clientId}/${Date.now()}_${safeName}`
  const contentType = file.type || 'application/octet-stream'

  const { error: uploadError } = await supabase.storage
    .from('portal-assets')
    .upload(path, file, {
      contentType,
      cacheControl: '3600',
      upsert: true
    })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('portal-assets')
    .getPublicUrl(path)

  return publicUrl
}

// ── Approval Portal ──────────────────────────────────────────────────────────

export async function getClientPortalSettings(clientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('client_portal_settings')
    .select('*')
    .eq('client_id', clientId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // Ignore not found
  return data
}

export async function upsertClientPortalSettings(settings: any) {
  const supabase = createClient()
  
  // Verify current user is admin or gestor
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'gestor'].includes(profile.role)) {
    throw new Error('Apenas administradores e gestores podem configurar o portal.')
  }

  // Ensure slug uniqueness (except for self)
  const { data: existingSlug } = await supabase
    .from('client_portal_settings')
    .select('client_id')
    .eq('slug', settings.slug)
    .single()

  if (existingSlug && existingSlug.client_id !== settings.client_id) {
    throw new Error('Esta URL já está sendo usada por outro portal. Escolha outro nome.')
  }

  const { error } = await supabase
    .from('client_portal_settings')
    .upsert({
      ...settings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'client_id' })

  if (error) throw error
  revalidatePath(`/dashboard/clients/${settings.client_id}`)
}

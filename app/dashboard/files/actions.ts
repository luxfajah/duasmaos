'use server'

import { createClient } from '@/utils/supabase/server'
import { ProjectFile } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getProjectFiles(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_files')
    .select('*, profiles(full_name)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as (ProjectFile & { profiles: { full_name: string } | null })[]
}

export async function getAllFiles() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_files')
    .select('*, profiles(full_name), projects:v2_projects(name, clients(name))')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as (ProjectFile & {
    profiles: { full_name: string } | null
    projects: { name: string; clients: { name: string } | null } | null
    category?: string | null
    description?: string | null
    client_id?: string | null
    external_url?: string | null
    file_source?: string | null
  })[]
}

export async function registerProjectFile(data: {
  project_id: string
  name: string
  file_path: string
  file_type?: string
  file_size?: number
  uploaded_by: string
  category?: string
  description?: string
  client_id?: string
  task_id?: string
}) {
  const supabase = createClient()
  const { error } = await supabase.from('project_files').insert({
    project_id: data.project_id,
    name: data.name,
    file_path: data.file_path,
    file_type: data.file_type ?? null,
    file_size: data.file_size ?? null,
    uploaded_by: data.uploaded_by,
    category: data.category ?? 'other',
    description: data.description ?? null,
    client_id: data.client_id ?? null,
    task_id: data.task_id ?? null,
    file_source: 'upload',
  })
  if (error) throw error
  revalidatePath('/dashboard/files')
  revalidatePath(`/dashboard/projects/${data.project_id}`)
}

export async function registerDriveLink(data: {
  name: string
  external_url: string
  project_id?: string
  client_id?: string
  category?: string
  description?: string
  uploaded_by: string
}) {
  const supabase = createClient()
  const { error } = await supabase.from('project_files').insert({
    name: data.name,
    file_path: '',
    file_source: 'drive',
    external_url: data.external_url,
    project_id: data.project_id ?? null,
    client_id: data.client_id ?? null,
    category: data.category ?? 'drive_link',
    description: data.description ?? null,
    uploaded_by: data.uploaded_by,
    task_id: (data as any).task_id ?? null,
  })
  if (error) throw error
  revalidatePath('/dashboard/files')
}

export async function deleteProjectFile(id: string, filePath: string) {
  const supabase = createClient()
  if (filePath) {
    const { error: storageError } = await supabase.storage
      .from('project_files')
      .remove([filePath])
    if (storageError) console.error('Storage delete error:', storageError)
  }
  const { error } = await supabase.from('project_files').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/files')
}

export async function getFileSignedUrl(filePath: string) {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from('project_files')
    .createSignedUrl(filePath, 3600)
  if (error) throw error
  return data.signedUrl
}

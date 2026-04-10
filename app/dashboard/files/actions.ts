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
    .select('*, profiles(full_name), projects(name, clients(name))')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as (ProjectFile & {
    profiles: { full_name: string } | null
    projects: { name: string; clients: { name: string } | null } | null
  })[]
}

export async function registerProjectFile(data: {
  project_id: string
  name: string
  file_path: string
  file_type?: string
  file_size?: number
  uploaded_by: string
}) {
  const supabase = createClient()
  const { error } = await supabase.from('project_files').insert({
    project_id: data.project_id,
    name: data.name,
    file_path: data.file_path,
    file_type: data.file_type ?? null,
    file_size: data.file_size ?? null,
    uploaded_by: data.uploaded_by,
  })
  if (error) throw error
  revalidatePath('/dashboard/files')
  revalidatePath(`/dashboard/projects/${data.project_id}`)
}

export async function deleteProjectFile(id: string, filePath: string) {
  const supabase = createClient()

  // Remove from Storage
  const { error: storageError } = await supabase.storage
    .from('project_files')
    .remove([filePath])
  if (storageError) console.error('Storage delete error:', storageError)

  // Remove from DB
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

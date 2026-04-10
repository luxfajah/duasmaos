'use server'

import { createClient } from '@/utils/supabase/server'
import { ProjectStage } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getProjectStages(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_stages')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })
  if (error) throw error
  return (data ?? []) as ProjectStage[]
}

export async function markStageComplete(stageId: string, completed: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('project_stages')
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq('id', stageId)
  if (error) throw error
  revalidatePath('/dashboard/projects')
}

export async function addCustomStage(projectId: string, name: string) {
  const supabase = createClient()
  // Get current max position
  const { data: existing } = await supabase
    .from('project_stages')
    .select('position')
    .eq('project_id', projectId)
    .order('position', { ascending: false })
    .limit(1)
  const maxPos = existing?.[0]?.position ?? -1
  const { error } = await supabase.from('project_stages').insert({
    project_id: projectId,
    name,
    position: maxPos + 1,
  })
  if (error) throw error
  revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteStage(stageId: string, projectId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('project_stages').delete().eq('id', stageId)
  if (error) throw error
  revalidatePath(`/dashboard/projects/${projectId}`)
}

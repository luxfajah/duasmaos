'use server'

import { createClient } from '@/utils/supabase/server'
import { V2Project, ProjectStatusV2, WorkflowTypeV2, Priority, V2Task, V2ProjectStage } from '@/types/database'
import { revalidatePath } from 'next/cache'

export type ExtendedProject = V2Project & { 
  clients: { name: string; company?: string | null } | null; 
  progress: number;
  health_score: number;
  profiles?: { full_name: string; avatar_url?: string | null } | null;
  deadline?: string | null;
  stages?: V2ProjectStage[];
  tasks?: V2Task[];
};

export async function getProjects(clientId?: string): Promise<ExtendedProject[]> {
  const supabase = createClient()
  let query = supabase
    .from('v2_projects')
    .select('*, clients(name, company), v2_project_stages(*), v2_tasks(*)')
    .order('created_at', { ascending: false })

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((p: any) => {
    const stages = p.v2_project_stages || []
    const completedStages = stages.filter((s: any) => s.status === 'done' || s.status === 'approved').length
    const progress = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0

    return {
      ...p,
      progress,
      health_score: progress,
    } as ExtendedProject
  })
}

export async function getProjectById(id: string): Promise<ExtendedProject> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('v2_projects')
    .select('*, clients(name, company), v2_project_stages(*), v2_tasks(*)')
    .eq('id', id)
    .single()
  if (error) throw error

  const p = data as any;
  const stages = p.v2_project_stages || []
  const completedStages = stages.filter((s: any) => s.status === 'done' || s.status === 'approved').length
  const progress = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0

  return {
    ...p,
    progress,
    health_score: progress,
  } as ExtendedProject;
}

export async function deleteProject(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('v2_projects').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard/kanban')
}

export async function updateProjectStatus(id: string, status: ProjectStatusV2) {
  const supabase = createClient()
  const { error } = await supabase.from('v2_projects').update({ status }).eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard/kanban')
}

export async function updateProject(
  id: string,
  formData: Partial<{
    name: string
    status: ProjectStatusV2
  }>
) {
  const supabase = createClient()
  const { error } = await supabase.from('v2_projects').update(formData).eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/projects')
  revalidatePath(`/dashboard/projects/${id}`)
  revalidatePath('/dashboard/kanban')
}

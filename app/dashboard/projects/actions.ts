'use server'

import { createClient } from '@/utils/supabase/server'
import { Project, ProjectStatus, ProjectStatusV2, ProjectType, Priority, Task, ProjectStage } from '@/types/database'
import { revalidatePath } from 'next/cache'
import { PROJECT_TEMPLATES } from '@/utils/project-templates'
import { calculateHealthScore, calculateProjectProgress } from '@/utils/project-health'

export type ExtendedProject = Project & { 
  clients: { name: string; company?: string | null }; 
  profiles: { full_name: string; avatar_url?: string | null } | null;
  progress: number;
  health_score: number;
  project_stages?: ProjectStage[];
  tasks?: Task[];
};

export async function getProjects(clientId?: string): Promise<ExtendedProject[]> {
  const supabase = createClient()
  let query = supabase
    .from('projects')
    .select('*, clients(name, company), profiles(full_name, avatar_url), project_stages(*), tasks(*)')
    .order('created_at', { ascending: false })

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((p: any) => {
    const progress = calculateProjectProgress(p.project_stages ?? [], p.tasks ?? [], p.type);
    const health_score = calculateHealthScore(progress, p.deadline, p.tasks ?? []);

    return {
      ...p,
      progress,
      health_score,
    } as ExtendedProject
  })
}

export async function getProjectById(id: string): Promise<ExtendedProject> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(name, company), profiles(full_name, avatar_url), project_stages(*), tasks(*)')
    .eq('id', id)
    .single()
  if (error) throw error

  const p = data as any;
  const progress = calculateProjectProgress(p.project_stages ?? [], p.tasks ?? [], p.type);
  const health_score = calculateHealthScore(progress, p.deadline, p.tasks ?? []);

  return {
    ...p,
    progress,
    health_score
  } as ExtendedProject;
}

export async function createProject(formData: {
  name: string
  description?: string
  client_id: string
  type?: ProjectType
  status?: ProjectStatus
  priority?: Priority
  deadline?: string
  owner_id?: string
}) {
  const supabase = createClient()
  const { data: project, error } = await supabase.from('projects').insert({
    name: formData.name,
    description: formData.description ?? null,
    client_id: formData.client_id,
    type: formData.type ?? null,
    status: formData.status ?? 'draft',
    priority: formData.priority ?? 'medium',
    deadline: formData.deadline ?? null,
    owner_id: formData.owner_id ?? null,
  }).select('*').single()

  if (error) throw error

  if (project.type && project.type in PROJECT_TEMPLATES) {
    const template = PROJECT_TEMPLATES[project.type as keyof typeof PROJECT_TEMPLATES];
    const stagesToInsert = template.map((stage, idx) => ({
      project_id: project.id,
      name: stage.name,
      position: idx,
      completed: false
    }));
    await supabase.from('project_stages').insert(stagesToInsert);
  }

  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard/kanban')
  return project;
}

export async function updateProject(
  id: string,
  formData: Partial<{
    name: string
    description: string
    client_id: string
    type: ProjectType
    status: ProjectStatus
    priority: Priority
    deadline: string
    owner_id: string
  }>
) {
  const supabase = createClient()
  const { error } = await supabase.from('projects').update(formData).eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/projects')
  revalidatePath(`/dashboard/projects/${id}`)
  revalidatePath('/dashboard/kanban')
}

export async function updateProjectStatus(id: string, status: ProjectStatusV2) {
  const supabase = createClient()
  const { error } = await supabase.from('v2_projects').update({ status }).eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard/kanban')
}

export async function deleteProject(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard/kanban')
}

export async function getDashboardStats() {
  const supabase = createClient()

  const [clientsRes, projectsRes, tasksRes] = await Promise.all([
    supabase.from('clients').select('id, status'),
    supabase.from('projects').select('id, status, deadline, type'),
    supabase.from('tasks').select('id, status, deadline')
  ])

  const clients = clientsRes.data ?? []
  const projects = projectsRes.data ?? []
  const tasks = tasksRes.data ?? []

  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + 7)

  return {
    totalClients: clients.filter((c) => c.status === 'active').length,
    activeProjects: projects.filter((p) => ['draft', 'copy', 'review'].includes(p.status)).length,
    delayedProjects: projects.filter((p) => p.status === 'delayed').length,
    approvedProjects: projects.filter((p) => p.status === 'approved').length,
    reviewProjects: projects.filter((p) => p.status === 'review').length,
    weekTasks: tasks.filter((t) => {
      if (!t.deadline) return false
      const dl = new Date(t.deadline)
      return dl >= now && dl <= weekEnd
    }).length,
    overdueTasks: tasks.filter((t) => {
      if (!t.deadline || t.status === 'done') return false
      return new Date(t.deadline) < now
    }).length,
  }
}

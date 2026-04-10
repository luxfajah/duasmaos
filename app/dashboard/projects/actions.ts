'use server'

import { createClient } from '@/utils/supabase/server'
import { Project, ProjectStatus, Priority } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function getProjects(clientId?: string) {
  const supabase = createClient()
  let query = supabase
    .from('projects')
    .select('*, clients(name), profiles(full_name)')
    .order('created_at', { ascending: false })

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as (Project & { clients: { name: string }; profiles: { full_name: string } | null })[]
}

export async function getProjectById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(name, company), profiles(full_name, avatar_url)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Project & {
    clients: { name: string; company: string | null }
    profiles: { full_name: string; avatar_url: string | null } | null
  }
}

export async function createProject(formData: {
  name: string
  description?: string
  client_id: string
  status?: ProjectStatus
  priority?: Priority
  deadline?: string
  owner_id?: string
}) {
  const supabase = createClient()
  const { error } = await supabase.from('projects').insert({
    name: formData.name,
    description: formData.description ?? null,
    client_id: formData.client_id,
    status: formData.status ?? 'draft',
    priority: formData.priority ?? 'medium',
    deadline: formData.deadline ?? null,
    owner_id: formData.owner_id ?? null,
  })
  if (error) throw error
  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard/kanban')
}

export async function updateProject(
  id: string,
  formData: Partial<{
    name: string
    description: string
    client_id: string
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

export async function updateProjectStatus(id: string, status: ProjectStatus) {
  const supabase = createClient()
  const { error } = await supabase.from('projects').update({ status }).eq('id', id)
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
    supabase.from('projects').select('id, status, deadline'),
    supabase.from('tasks').select('id, status, deadline'),
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
    weekTasks: tasks.filter((t) => {
      if (!t.deadline) return false
      const dl = new Date(t.deadline)
      return dl >= now && dl <= weekEnd
    }).length,
  }
}

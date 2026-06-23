'use server'

import { createClient } from '@/utils/supabase/server'
import { V2Project, ProjectStatusV2, WorkflowTypeV2, Priority, V2Task, V2ProjectStage } from '@/types/database'
import { revalidatePath } from 'next/cache'

export type ProjectDTO = V2Project & { 
  clients: { name: string; company: string | null } | null; 
  profiles: { full_name: string; avatar_url: string | null } | null;
  progress: number;
  health_score: number;
  stages: V2ProjectStage[];
  tasks: (V2Task & { v2_task_assignees: { user_id: string }[] })[];
  revenues: any[];
};

export async function getProjects(clientId?: string): Promise<ProjectDTO[]> {
  const supabase = createClient()
  let query = supabase
    .from('v2_projects')
    .select('*, clients(name, company), profiles(full_name, avatar_url), v2_project_stages(*), v2_tasks(*, v2_task_assignees(*)), revenues(*)')
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
      deadline: p.deadline || null,
      completed_at: p.completed_at || null,
      priority: p.priority || 'medium',
      clients: p.clients ? {
        name: p.clients.name,
        company: p.clients.company || null
      } : null,
      profiles: p.profiles ? {
        full_name: p.profiles.full_name,
        avatar_url: p.profiles.avatar_url || null
      } : null,
      stages: p.v2_project_stages || [],
      tasks: p.v2_tasks || [],
      revenues: p.revenues || []
    } as ProjectDTO
  })
}

export async function getProjectById(id: string): Promise<ProjectDTO> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('v2_projects')
    .select('*, clients(name, company), profiles(full_name, avatar_url), v2_project_stages(*), v2_tasks(*, v2_task_assignees(*)), revenues(*)')
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
    deadline: p.deadline || null,
    completed_at: p.completed_at || null,
    priority: p.priority || 'medium',
    clients: p.clients ? {
      name: p.clients.name,
      company: p.clients.company || null
    } : null,
    profiles: p.profiles ? {
      full_name: p.profiles.full_name,
      avatar_url: p.profiles.avatar_url || null
    } : null,
    stages: p.v2_project_stages || [],
    tasks: p.v2_tasks || [],
    revenues: p.revenues || []
  } as ProjectDTO;
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
    deadline: string | null
  }>
) {
  const supabase = createClient()
  const { error } = await supabase.from('v2_projects').update(formData).eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/projects')
  revalidatePath(`/dashboard/projects/${id}`)
  revalidatePath('/dashboard/kanban')
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '');
}

export async function createProjectV3(data: {
  name: string
  client_id: string
  template_id: string
  project_type: 'one_time' | 'recurring'
  amount: number
  payment_type: 'one_time' | 'installment' | 'recurring'
  billing_day?: number
  auto_restart?: boolean
  start_date: string
  deadline?: string
  owner_id?: string
}) {
  const supabase = createClient()
  
  // 0. Fetch template details to get type
  const { data: template } = await supabase
    .from('product_templates')
    .select('type')
    .eq('id', data.template_id)
    .single()

  // 1. Create Project
  const { data: project, error: pError } = await supabase
    .from('v2_projects')
    .insert({
      name: data.name,
      client_id: data.client_id,
      template_id: data.template_id,
      workflow_type: (template?.type || 'branding') as WorkflowTypeV2,
      type: data.project_type,
      amount: data.amount,
      payment_type: data.payment_type,
      billing_day: data.billing_day,
      auto_restart: data.auto_restart || false,
      status: 'active',
      owner_id: data.owner_id || null, // Handle empty string as null for UUID
      deadline: data.deadline || null,
      workspace_id: 'e777e7e7-e7e7-e7e7-e7e7-e7e7e7e7e7e7'
    })
    .select()
    .single()

  if (pError) throw pError

  // 2. Clone Template Stages & Tasks
  const { data: stages } = await supabase
    .from('product_template_stages')
    .select('*, product_template_tasks(*)')
    .eq('template_id', data.template_id)
    .order('order_index', { ascending: true })

  if (stages) {
    const stageIdMap = new Map<string, string>()
    for (const stage of stages) {
      const stageKey = slugify(stage.name)
      const { data: projectStage, error: psError } = await supabase
        .from('v2_project_stages')
        .insert({
          project_id: project.id,
          name: stage.name,
          stage_key: stageKey,
          order: stage.order_index,
          status: stage.order_index === 0 ? 'in_progress' : 'pending',
          requires_approval: stage.requires_approval
        })
        .select()
        .single()

      if (psError) throw psError
      stageIdMap.set(stage.id, projectStage.id)
    }

    let previousTaskId: string | null = null
    let globalOrder = 1
    const tasksToInsert: any[] = []

    for (const stage of stages) {
      const projectStageId = stageIdMap.get(stage.id)
      if (!projectStageId) continue

      if (stage.product_template_tasks) {
        const sortedTasks = [...stage.product_template_tasks].sort(
          (a, b) => (a.order_index || 0) - (b.order_index || 0)
        )

        for (const t of sortedTasks) {
          const taskId = crypto.randomUUID()
          const isFirstTask = (tasksToInsert.length === 0)
          const rawType = t.task_type || 'task'
          const ALLOWED_TASK_TYPES = ['task', 'meeting', 'review', 'approval', 'deliverable', 'operational', 'content_post', 'document']
          const taskType = ALLOWED_TASK_TYPES.includes(rawType) ? rawType : 'task'
          tasksToInsert.push({
            id: taskId,
            project_id: project.id,
            stage_id: projectStageId,
            title: t.title,
            type: taskType,
            task_type: taskType,
            status: isFirstTask ? 'pending' : 'locked',
            priority: 'medium',
            depends_on_task_id: previousTaskId,
            stage_order: globalOrder++
          })
          previousTaskId = taskId
        }
      }
    }

    if (tasksToInsert.length > 0) {
      const { error: tasksInsertError } = await supabase.from('v2_tasks').insert(tasksToInsert)
      if (tasksInsertError) throw tasksInsertError
    }
  }

  // 3. Create Initial Revenue entry if amount > 0
  if (data.amount > 0) {
    await supabase.from('revenues').insert({
      project_id: project.id,
      amount: data.amount,
      due_date: data.start_date || new Date().toISOString(),
      status: 'pending',
      type: data.payment_type || 'one_time'
    })

    if (data.payment_type === 'recurring') {
      const nextDue = new Date(data.start_date || new Date())
      nextDue.setMonth(nextDue.getMonth() + 1)

      await supabase.from('revenue_recurrences').insert({
        project_id: project.id,
        amount: data.amount,
        frequency: 'monthly',
        billing_day: data.billing_day || new Date().getDate(),
        next_due_date: nextDue.toISOString()
      })
    }
  }

  revalidatePath('/dashboard/projects')
  return project
}

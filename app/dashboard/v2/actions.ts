'use server'

import { createClient } from '@/utils/supabase/server'
import { 
  V2Project, 
  V2ProjectStage, 
  V2Task, 
  WorkflowTypeV2, 
  TaskStatusV2, 
  StageStatusV2 
} from '@/types/database'
import { revalidatePath } from 'next/cache'

/**
 * 1. Seed Workflow Templates
 * Populates v2_stage_templates and v2_task_templates with proprietary flows.
 */
export async function seedWorkflowTemplates() {
  const supabase = createClient()

  // Clear existing templates to avoid unique constraint errors during re-seed
  await supabase.from('v2_task_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('v2_stage_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const brandingStages = [
    { name: 'Alinhamento', key: 'alinhamento', order: 0, approval: false },
    { name: 'Pesquisa', key: 'pesquisa', order: 1, approval: false },
    { name: 'Estratégia', key: 'estrategia', order: 2, approval: true },
    { name: 'Conceito', key: 'conceito', order: 3, approval: false },
    { name: 'Identidade Visual', key: 'identidade_visual', order: 4, approval: true },
    { name: 'Validação com Cliente', key: 'validacao_cliente', order: 5, approval: true },
    { name: 'Finalização', key: 'finalizacao', order: 6, approval: false },
    { name: 'Entrega', key: 'entrega', order: 7, approval: false },
  ]

  const socialMediaStages = [
    { name: 'Planejamento', key: 'planejamento', order: 0, approval: false },
    { name: 'Copywriter', key: 'copy', order: 1, approval: true },
    { name: 'Design', key: 'design', order: 2, approval: true },
    { name: 'Publicação', key: 'publicacao', order: 3, approval: false },
  ]

  const websiteStages = [
    { name: 'Alinhamento', key: 'alinhamento', order: 0, approval: false },
    { name: 'Conteúdo', key: 'conteudo', order: 1, approval: false },
    { name: 'Estrutura', key: 'estrutura', order: 2, approval: true },
    { name: 'Desenvolvimento', key: 'desenvolvimento', order: 3, approval: false },
    { name: 'Revisão', key: 'revisao', order: 4, approval: true },
    { name: 'Entrega', key: 'entrega', order: 5, approval: false },
  ]

  const consultoriaStages = [
    { name: 'Diagnóstico', key: 'diagnostico', order: 0, approval: false },
    { name: 'Sessão', key: 'sessao', order: 1, approval: false },
    { name: 'Plano de Ação', key: 'plano_acao', order: 2, approval: true },
    { name: 'Follow-up', key: 'follow_up', order: 3, approval: false },
  ]

  const insertTemplates = async (type: WorkflowTypeV2, stages: any[]) => {
    const { data: insertedStages, error: stageError } = await supabase
      .from('v2_stage_templates')
      .insert(stages.map(s => ({
        workflow_type: type,
        name: s.name,
        stage_key: s.key,
        order: s.order,
        requires_approval: s.approval
      })))
      .select()

    if (stageError) throw stageError

    // Add a default task for each stage template
    await supabase.from('v2_task_templates').insert(stages.map(s => ({
      workflow_type: type,
      stage_key: s.key,
      title: `Tarefa inicial: ${s.name}`,
      type: 'task',
      order: 0
    })))
  }

  await insertTemplates('branding', brandingStages)
  await insertTemplates('social_media', socialMediaStages)
  await insertTemplates('website', websiteStages)
  await insertTemplates('consultoria', consultoriaStages)

  return { success: true }
}

/**
 * 2. Create V2 Project
 * Automates pipeline generation based on templates.
 */
export async function createV2Project(data: {
  name: string,
  workspace_id: string,
  client_id: string,
  workflow_type: WorkflowTypeV2
}) {
  const supabase = createClient()

  // 1. Insert Project
  const { data: project, error: projectError } = await supabase
    .from('v2_projects')
    .insert({
      name: data.name,
      workspace_id: data.workspace_id,
      client_id: data.client_id,
      workflow_type: data.workflow_type,
      status: 'active'
    })
    .select()
    .single()

  if (projectError) throw projectError

  // 2. Fetch Stage Templates
  const { data: stageTemplates } = await supabase
    .from('v2_stage_templates')
    .select('*')
    .eq('workflow_type', data.workflow_type)
    .order('order', { ascending: true })

  if (!stageTemplates || stageTemplates.length === 0) throw new Error('No templates found for this workflow type')

  // 3. Create Project Stages
  const { data: insertedStages, error: stageError } = await supabase
    .from('v2_project_stages')
    .insert(stageTemplates.map(st => ({
      project_id: project.id,
      name: st.name,
      stage_key: st.stage_key,
      order: st.order,
      requires_approval: st.requires_approval,
      status: st.order === 0 ? 'in_progress' : 'pending',
      started_at: st.order === 0 ? new Date().toISOString() : null
    })))
    .select()

  if (stageError) throw stageError

  // 4. Fetch Task Templates & Bulk Insert Tasks
  const { data: taskTemplates } = await supabase
    .from('v2_task_templates')
    .select('*')
    .eq('workflow_type', data.workflow_type)

  if (taskTemplates && taskTemplates.length > 0) {
    let globalOrder = 1;
    let previousTaskId: string | null = null;

    const sortedTemplates = insertedStages.flatMap(is => {
      return taskTemplates
        .filter(tt => tt.stage_key === is.stage_key)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(tt => ({ ...tt, stage_id: is.id }))
    });

    const tasksToInsert = sortedTemplates.map((tt, index) => {
      const taskId = crypto.randomUUID();
      const task = {
        id: taskId,
        project_id: project.id,
        stage_id: tt.stage_id,
        title: tt.title,
        type: tt.type,
        deliverable_type: tt.deliverable_type,
        status: index === 0 ? 'pending' : 'locked',
        priority: 'medium',
        order: tt.order,
        stage_order: globalOrder++,
        depends_on_task_id: previousTaskId
      };
      previousTaskId = taskId;
      return task;
    });

    if (tasksToInsert.length > 0) {
      await supabase.from('v2_tasks').insert(tasksToInsert)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/projects/${project.id}`)
  return project
}

/**
 * 3. Update Task Status & Trigger Progression
 */
export async function updateV2TaskStatus(taskId: string, status: TaskStatusV2) {
  const supabase = createClient()

  // 1. Fetch current task
  const { data: taskToUpdate, error: fetchError } = await supabase
    .from('v2_tasks')
    .select('*, v2_project_stages(*)')
    .eq('id', taskId)
    .single()

  if (fetchError || !taskToUpdate) throw new Error('Tarefa não encontrada.')

  if (taskToUpdate.status === 'locked') {
    throw new Error('Não é possível modificar uma tarefa bloqueada.')
  }

  // 2. Status Update
  // Trigger tr_v2_tasks_progression in Postgres handles unlocking/re-locking next tasks
  if (status === 'done' || status === 'approved') {
    if (taskToUpdate.deliverable_type === 'social_copy' || taskToUpdate.deliverable_type === 'social_design') {
      const { data: posts } = await supabase.from('v2_social_posts').select('*').eq('task_id', taskId)
      if (!posts || posts.length === 0) throw new Error('A tarefa precisa ter pelo menos um post.')
      
      // Check for approved/done posts
      const hasInvalid = posts.some(p => {
        const s = p.status || p.post_status
        const a = p.approval_status || p.post_status
        return s !== 'done' && a !== 'approved'
      })
      if (hasInvalid) throw new Error('Todos os posts devem estar concluídos ou aprovados.')
    }
  }

  const { error: updateError } = await supabase
    .from('v2_tasks')
    .update({ status })
    .eq('id', taskId)

  if (updateError) throw updateError

  const { data: task } = await supabase
    .from('v2_tasks')
    .select('*, v2_project_stages(*)')
    .eq('id', taskId)
    .single()

  if (!task) throw new Error('Tarefa não encontrada após edição.')

  // 2. Query remaining tasks in the same stage
  const { count, error: countError } = await supabase
    .from('v2_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('stage_id', task.stage_id)
    .neq('status', 'done')

  if (countError) throw countError

  // 3. If all tasks are done, progress the stage
  if (count === 0) {
    const currentStage = task.v2_project_stages as V2ProjectStage
    
    if (currentStage.requires_approval) {
      // Pause for approval
      await supabase.from('v2_project_stages')
        .update({ status: 'waiting_approval' })
        .eq('id', currentStage.id)
    } else {
      // Auto-mark as done and move to next
      await supabase.from('v2_project_stages')
        .update({ 
          status: 'done', 
          completed_at: new Date().toISOString() 
        })
        .eq('id', currentStage.id)

      await activateNextStage(currentStage.project_id, currentStage.order)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/projects/${task.project_id}`)
}

/**
 * 4. Approve V2 Stage
 */
export async function approveV2Stage(stageId: string) {
  const supabase = createClient()

  // 1. Fetch current user and permission check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'gestor'].includes(profile.role)) {
    throw new Error('Unauthorized: Only Admin or Manager can approve stages')
  }

  // 2. Fetch stage to verify status
  const { data: stage, error: stageError } = await supabase
    .from('v2_project_stages')
    .select('*')
    .eq('id', stageId)
    .single()

  if (stageError || stage.status !== 'waiting_approval') {
    throw new Error('Stage is not waiting for approval')
  }

  // 3. Record approval
  await supabase.from('v2_stage_approvals').insert({
    stage_id: stageId,
    approved_by: user.id,
    approved_at: new Date().toISOString(),
    status: 'approved'
  })

  // 4. Update stage to approved and activate next
  await supabase.from('v2_project_stages')
    .update({ 
      status: 'approved', 
      completed_at: new Date().toISOString() 
    })
    .eq('id', stageId)

  await activateNextStage(stage.project_id, stage.order)

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/projects/${stage.project_id}`)
}

/**
 * Internal Helper: Activate Next Stage
 */
async function activateNextStage(projectId: string, currentOrder: number) {
  const supabase = createClient()

  // Find the next stage by order
  const { data: nextStage } = await supabase
    .from('v2_project_stages')
    .select('*')
    .eq('project_id', projectId)
    .gt('order', currentOrder)
    .order('order', { ascending: true })
    .limit(1)
    .single()

  if (nextStage) {
    await supabase.from('v2_project_stages')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', nextStage.id)
  } else {
    // If no next stage, mark project as completed
    await supabase.from('v2_projects')
      .update({ status: 'completed' })
      .eq('id', projectId)
  }
}

/**
 * 5. Get V2 Project Detail
 * Fetches project, stages, and tasks with full relations.
 */
export async function getV2ProjectById(projectId: string) {
  const supabase = createClient()

  // 1. Fetch Project with Client
  const { data: project, error: projectError } = await supabase
    .from('v2_projects')
    .select('*, clients(*)')
    .eq('id', projectId)
    .single()

  if (projectError) return null

  // 2. Fetch Stages
  const { data: stages, error: stagesError } = await supabase
    .from('v2_project_stages')
    .select('*, v2_stage_approvals(*)')
    .eq('project_id', projectId)
    .order('order', { ascending: true })

  if (stagesError) throw stagesError

  // 3. Fetch Tasks with Assignees and Profiles
  const { data: tasks, error: tasksError } = await supabase
    .from('v2_tasks')
    .select('*, v2_task_assignees(*, profiles(*))')
    .eq('project_id', projectId)
    .order('order', { ascending: true })

  if (tasksError) throw tasksError

  // Calculate Progress
  const completedStages = stages.filter(s => s.status === 'done' || s.status === 'approved').length
  const progress = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0

  return {
    ...project,
    stages,
    tasks,
    progress
  }
}

/**
 * 6. Get All V2 Projects
 */
export async function getV2AllProjects() {
  const supabase = createClient()
  
  const { data: projects, error } = await supabase
    .from('v2_projects')
    .select('*, clients(name, company), v2_project_stages(*)')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (projects ?? []).map(p => {
    const stages = p.v2_project_stages || []
    const completedStages = stages.filter((s: any) => s.status === 'done' || s.status === 'approved').length
    const progress = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0
    
    return {
      ...p,
      clients: p.clients,
      progress,
      type: p.workflow_type // Map for UI compatibility
    }
  })
}

/**
 * 6b. Get V2 Projects by Client
 */
export async function getV2ProjectsByClient(clientId: string) {
  const supabase = createClient()
  
  const { data: projects, error } = await supabase
    .from('v2_projects')
    .select('*, v2_project_stages(*)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (projects ?? []).map(p => {
    const stages = p.v2_project_stages || []
    const completedStages = stages.filter((s: any) => s.status === 'done' || s.status === 'approved').length
    const progress = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0
    
    return {
      ...p,
      progress,
      type: p.workflow_type
    }
  })
}

/**
 * 7. Get All V2 Tasks
 */
export async function getV2AllTasks() {
  const supabase = createClient()
  
  const { data: tasks, error } = await supabase
    .from('v2_tasks')
    .select('*, v2_projects(name), v2_project_stages(*), v2_task_assignees(*, profiles(*)), v2_social_posts(*)')
    .order('due_date', { ascending: true })

  if (error) throw error

  return (tasks ?? []).map(t => ({
    ...t,
    deadline: t.due_date, // Map for UI compatibility
    profiles: t.v2_task_assignees?.[0]?.profiles, // Take first assignee for simple UI
    v2_social_posts: t.v2_social_posts,
    v2_project_stages: t.v2_project_stages
  }))
}

/**
 * 8. Get V2 Dashboard Stats
 */
export async function getV2DashboardStats() {
  const supabase = createClient()

  const [clientsRes, projectsRes, tasksRes] = await Promise.all([
    supabase.from('clients').select('id, status'),
    supabase.from('v2_projects').select('id, status'),
    supabase.from('v2_tasks').select('id, status, due_date')
  ])

  const clients = clientsRes.data ?? []
  const projects = projectsRes.data ?? []
  const tasks = tasksRes.data ?? []

  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + 7)

  return {
    totalClients: clients.filter((c) => c.status === 'active').length,
    activeProjects: projects.filter((p) => p.status === 'active').length,
    completedProjects: projects.filter((p) => p.status === 'completed').length,
    weekTasks: tasks.filter((t) => {
      if (!t.due_date) return false
      const dl = new Date(t.due_date)
      return dl >= now && dl <= weekEnd
    }).length,
    overdueTasks: tasks.filter((t) => {
      if (!t.due_date || t.status === 'done') return false
      return new Date(t.due_date) < now
    }).length,
  }
}

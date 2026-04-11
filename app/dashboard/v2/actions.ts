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
    const tasksToInsert = insertedStages.flatMap(is => {
      const templatesForStage = taskTemplates.filter(tt => tt.stage_key === is.stage_key)
      return templatesForStage.map(tt => ({
        project_id: project.id,
        stage_id: is.id,
        title: tt.title,
        type: tt.type,
        deliverable_type: tt.deliverable_type,
        status: 'pending',
        priority: 'medium',
        order: tt.order
      }))
    })

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

  // 1. Update the task
  const { data: task, error: updateError } = await supabase
    .from('v2_tasks')
    .update({ status })
    .eq('id', taskId)
    .select('*, v2_project_stages(*)')
    .single()

  if (updateError) throw updateError

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

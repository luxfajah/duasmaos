'use server'

import { createClient } from '@/utils/supabase/server'
import { V2Project, V2ProjectStage, V2Task, V2ProjectMember } from '@/types/database'
import { revalidatePath } from 'next/cache'
import { addDays } from 'date-fns'

export type SchedulerData = {
  project: V2Project
  stages: (V2ProjectStage & { tasks: V2Task[] })[]
  members: (V2ProjectMember & { profiles: { full_name: string; avatar_url: string | null } | null })[]
  allProfiles: { id: string; full_name: string; role: string; avatar_url: string | null }[]
}

export async function getProjectSchedulerData(projectId: string): Promise<SchedulerData> {
  const supabase = createClient()

  // 1. Fetch Project
  const { data: project, error: pError } = await supabase
    .from('v2_projects')
    .select('*')
    .eq('id', projectId)
    .single()
  if (pError) throw pError

  // 2. Fetch Stages and Tasks
  const { data: stages, error: sError } = await supabase
    .from('v2_project_stages')
    .select('*, tasks:v2_tasks(*)')
    .eq('project_id', projectId)
    .order('order', { ascending: true })
  if (sError) throw sError

  // 3. Fetch Project Members
  const { data: members, error: mError } = await supabase
    .from('project_members')
    .select('*, profiles(full_name, avatar_url)')
    .eq('project_id', projectId)
  if (mError) throw mError

  // 4. Fetch All Profiles (except clients) to allow adding new members
  const { data: allProfiles, error: apError } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .neq('role', 'client')
  if (apError) throw apError

  return {
    project: project as V2Project,
    stages: (stages || []).map(s => ({
      ...s,
      tasks: (s.tasks || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    })),
    members: members || [],
    allProfiles: allProfiles || []
  }
}

/**
 * The "Simulation Engine": Recalculates all dates based on offsets and durations.
 * Persists the results as a cache in the database.
 */
export async function recalculateProjectSchedule(projectId: string) {
  const supabase = createClient()

  // Fetch current state
  const { data: project } = await supabase.from('v2_projects').select('start_date').eq('id', projectId).single()
  const { data: stages } = await supabase
    .from('v2_project_stages')
    .select('*, tasks:v2_tasks(*)')
    .eq('project_id', projectId)
    .order('order', { ascending: true })

  if (!project || !stages) return

  const baseDate = project.start_date ? new Date(project.start_date) : new Date()
  let currentDate = baseDate

  const taskUpdates: { id: string; due_date: string }[] = []
  const stageUpdates: { id: string; started_at: string | null; completed_at: string | null }[] = []

  for (const stage of stages) {
    let stageStart = currentDate
    
    // If it's manual, we might want to respect its own started_at if it exists, 
    // but the builder pattern usually implies sequential flow.
    // For now, simplicity: sequential.
    if (stage.start_mode === 'manual' && stage.started_at) {
        stageStart = new Date(stage.started_at)
    }

    const stageEnd = addDays(stageStart, stage.duration_days)

    // Stage update data
    stageUpdates.push({
        id: stage.id,
        started_at: stageStart.toISOString(),
        completed_at: stageEnd.toISOString()
    })

    // Tasks within stage
    for (const task of stage.tasks) {
        const referenceDate = task.offset_type === 'stage_end' ? stageEnd : stageStart
        const taskDueDate = addDays(referenceDate, task.deadline_offset_days || 0)
        
        taskUpdates.push({
            id: task.id,
            due_date: taskDueDate.toISOString()
        })
    }

    // Next stage starts after this one ends
    currentDate = stageEnd
  }

  // Bulk update (using multiple single updates since Supabase doesn't have bulk update in JS SDK without RPC or loop)
  // For better performance, we'd use an RPC, but loop is okay for typical project sizes (10-50 tasks).
  for (const update of taskUpdates) {
    await supabase.from('v2_tasks').update({ due_date: update.due_date }).eq('id', update.id)
  }

  for (const update of stageUpdates) {
      // In the DB these are started_at/completed_at. We use them as calculated slots.
      await supabase.from('v2_project_stages').update({ 
          started_at: update.started_at
          // completed_at: update.completed_at 
      }).eq('id', update.id)
  }

  revalidatePath(`/dashboard/projects/${projectId}/deadlines`)
}

export async function saveProjectSchedule(
  projectId: string,
  data: {
    stages: Partial<V2ProjectStage & { tasks: Partial<V2Task>[] }>[]
    members: { user_id: string; role_key: string }[]
  }
) {
  const supabase = createClient()

  // 1. Sync Members
  // Delete existing and insert new (simple sync)
  await supabase.from('project_members').delete().eq('project_id', projectId)
  if (data.members.length > 0) {
    await supabase.from('project_members').insert(
        data.members.map(m => ({ project_id: projectId, user_id: m.user_id, role_key: m.role_key }))
    )
  }

  // 2. Save Stages and Tasks metadata (offsets/durations)
  for (const stage of data.stages) {
    const { tasks, ...stageData } = stage
    
    if (stage.id) {
        await supabase.from('v2_project_stages')
            .update({
                name: stageData.name,
                duration_days: stageData.duration_days,
                start_mode: stageData.start_mode,
                depends_on_stage_key: stageData.depends_on_stage_key,
                order: stageData.order
            })
            .eq('id', stage.id)

        if (tasks) {
            for (const task of tasks) {
                if (task.id) {
                    await supabase.from('v2_tasks')
                        .update({
                            title: task.title,
                            deadline_offset_days: task.deadline_offset_days,
                            offset_type: task.offset_type,
                            type: task.type,
                            assigned_to: task.assigned_to
                        })
                        .eq('id', task.id)
                    
                    // Specific logic for v2_task_assignees if needed, 
                    // though currently the UI might just use v2_tasks.assigned_to as a convenience check.
                }
            }
        }
    }
  }

  // 3. Trigger recalculation to sync all due_dates
  await recalculateProjectSchedule(projectId)

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

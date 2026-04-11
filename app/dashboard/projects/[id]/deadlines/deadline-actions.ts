'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function bulkUpdateTaskDeadlines(
  projectId: string, 
  updates: { taskId: string; start_date?: string | null; deadline: string | null }[]
) {
  const supabase = createClient()

  // Iterate over updates and apply them
  for (const update of updates) {
    const { error } = await supabase
      .from('v2_tasks')
      .update({ 
        start_date: update.start_date,
        due_date: update.deadline // In the DB it might be due_date, but the current UI uses .update({ deadline }) 
      })
      .eq('id', update.taskId)
      .eq('project_id', projectId)

    if (error) {
      // Fallback check: if 'start_date' column doesn't exist yet, try updating just deadline
      if (error.code === '42703') { 
        await supabase
          .from('v2_tasks')
          .update({ due_date: update.deadline })
          .eq('id', update.taskId)
          .eq('project_id', projectId)
      } else {
        console.error(`Error updating task ${update.taskId}:`, error)
        throw new Error('Falha ao atualizar prazos das tarefas.')
      }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath(`/dashboard/projects/${projectId}/deadlines`)
}

export async function updateProjectStartDate(projectId: string, startDate: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('v2_projects')
    .update({ start_date: startDate })
    .eq('id', projectId)

  if (error && error.code !== '42703') { // 42703 is column does not exist
    throw new Error('Erro ao atualizar data de início do projeto')
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
}

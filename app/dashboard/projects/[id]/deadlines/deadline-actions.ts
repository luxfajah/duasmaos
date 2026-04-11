'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function bulkUpdateTaskDeadlines(projectId: string, updates: { taskId: string; deadline: string | null; startDate: string | null }[]) {
  const supabase = createClient()

  // Iterate over updates and apply them
  for (const update of updates) {
    const { error } = await supabase
      .from('v2_tasks')
      .update({ 
        deadline: update.deadline,
        start_date: update.startDate 
      })
      .eq('id', update.taskId)
      .eq('project_id', projectId) // Extra safety check

    if (error) {
      console.error(`Error updating task ${update.taskId}:`, error)
      throw new Error('Falha ao atualizar prazo de uma das tarefas.')
    }
  }

  // Revalidate both the project dashboard and the root dashboard
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath(`/dashboard/projects/${projectId}/deadlines`)
}

'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ProductTemplateData {
  id?: string
  name: string
  category: string
  type: string
  base_price: number
  stages: {
    id?: string
    name: string
    duration_days: number
    auto_start: boolean
    order_index: number
    tasks: {
      id?: string
      title: string
      role: string
      deadline_offset: number
      task_type: string
      is_required: boolean
    }[]
  }[]
}

export async function createProductTemplate(data: Partial<ProductTemplateData>) {
  const supabase = createClient()
  const { data: template, error } = await supabase
    .from('product_templates')
    .insert({
      name: data.name || 'Novo Produto',
      category: data.category || 'Geral',
      type: data.type || 'service',
      base_price: data.base_price || 0,
      is_active: true
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/products')
  return template
}

export async function syncProductTemplate(id: string, data: ProductTemplateData) {
  const supabase = createClient()

  // 1. Update Template Root
  const { error: tError } = await supabase
    .from('product_templates')
    .update({
      name: data.name,
      category: data.category,
      type: data.type,
      base_price: data.base_price,
    })
    .eq('id', id)

  if (tError) throw tError

  // 2. Get existing stages to diff
  const { data: existingStages } = await supabase
    .from('product_template_stages')
    .select('id')
    .eq('template_id', id)
  
  const existingStageIds = new Set(existingStages?.map(s => s.id) || [])
  const incomingStageIds = new Set(data.stages.map(s => s.id).filter(Boolean) as string[])

  // Stages to delete
  const stagesToDelete = Array.from(existingStageIds).filter(sid => !incomingStageIds.has(sid))
  if (stagesToDelete.length > 0) {
    await supabase.from('product_template_stages').delete().in('id', stagesToDelete)
  }

  // 3. Sync Stages
  for (const stage of data.stages) {
    let stageId = stage.id
    
    if (stageId && existingStageIds.has(stageId)) {
      // Update
      await supabase
        .from('product_template_stages')
        .update({
          name: stage.name,
          duration_days: stage.duration_days,
          auto_start: stage.auto_start,
          order_index: stage.order_index
        })
        .eq('id', stageId)
    } else {
      // Insert
      const { data: newStage } = await supabase
        .from('product_template_stages')
        .insert({
          template_id: id,
          name: stage.name,
          duration_days: stage.duration_days,
          auto_start: stage.auto_start,
          order_index: stage.order_index
        })
        .select()
        .single()
      stageId = newStage?.id
    }

    if (!stageId) continue

    // 4. Sync Tasks for this stage
    const { data: existingTasks } = await supabase
      .from('product_template_tasks')
      .select('id')
      .eq('stage_id', stageId)
    
    const existingTaskIds = new Set(existingTasks?.map(t => t.id) || [])
    const incomingTaskIds = new Set(stage.tasks.map(t => t.id).filter(Boolean) as string[])

    // Tasks to delete
    const tasksToDelete = Array.from(existingTaskIds).filter(tid => !incomingTaskIds.has(tid))
    if (tasksToDelete.length > 0) {
      await supabase.from('product_template_tasks').delete().in('id', tasksToDelete)
    }

    // Sync Tasks
    for (const task of stage.tasks) {
      if (task.id && existingTaskIds.has(task.id)) {
        // Update
        await supabase
          .from('product_template_tasks')
          .update({
            title: task.title,
            role: task.role,
            deadline_offset: task.deadline_offset,
            task_type: task.task_type,
            is_required: task.is_required
          })
          .eq('id', task.id)
      } else {
        // Insert
        await supabase
          .from('product_template_tasks')
          .insert({
            stage_id: stageId,
            title: task.title,
            role: task.role,
            deadline_offset: task.deadline_offset,
            task_type: task.task_type,
            is_required: task.is_required
          })
      }
    }
  }

  revalidatePath('/dashboard/products')
  revalidatePath(`/dashboard/products/${id}/builder`)
}

export async function duplicateProductTemplate(id: string) {
  const supabase = createClient()
  
  // 1. Fetch original
  const { data: original, error: fError } = await supabase
    .from('product_templates')
    .select('*, product_template_stages(*, product_template_tasks(*))')
    .eq('id', id)
    .single()
  
  if (fError || !original) throw fError || new Error('Template not found')

  // 2. Insert new root
  const { data: copy, error: cError } = await supabase
    .from('product_templates')
    .insert({
      name: `${original.name} (Cópia)`,
      category: original.category,
      type: original.type,
      base_price: original.base_price,
      is_active: true
    })
    .select()
    .single()

  if (cError) throw cError

  // 3. Deep copy stages
  for (const stage of original.product_template_stages || []) {
    const { data: newStage, error: sError } = await supabase
      .from('product_template_stages')
      .insert({
        template_id: copy.id,
        name: stage.name,
        duration_days: stage.duration_days,
        auto_start: stage.auto_start,
        order_index: stage.order_index
      })
      .select()
      .single()
    
    if (sError) throw sError

    // 4. Deep copy tasks
    if (stage.product_template_tasks && stage.product_template_tasks.length > 0) {
      const tasksToInsert = stage.product_template_tasks.map((t: any) => ({
        stage_id: newStage.id,
        title: t.title,
        role: t.role,
        deadline_offset: t.deadline_offset,
        task_type: t.task_type,
        is_required: t.is_required
      }))
      await supabase.from('product_template_tasks').insert(tasksToInsert)
    }
  }

  revalidatePath('/dashboard/products')
  return copy
}

export async function getProductTemplates(includeInactive: boolean = false) {
  const supabase = createClient()
  let query = supabase
    .from('product_templates')
    .select('*, product_template_stages(id, name, product_template_tasks(id))')
    .order('created_at', { ascending: false })

  if (!includeInactive) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) throw error
  
  return (data || []).map(t => ({
    ...t,
    stages_count: t.product_template_stages?.length || 0,
    tasks_count: (t.product_template_stages || []).reduce((acc: number, s: any) => acc + (s.product_template_tasks?.length || 0), 0)
  }))
}

export async function getProductTemplateById(id: string): Promise<ProductTemplateData> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('product_templates')
    .select(`
      *,
      stages:product_template_stages(
        *,
        tasks:product_template_tasks(*)
      )
    `)
    .eq('id', id)
    .order('order_index', { foreignTable: 'product_template_stages', ascending: true })
    .single()
  
  if (error) throw error

  // Sort tasks within stages if needed
  const mapped = {
    ...data,
    stages: (data.stages || []).map((s: any) => ({
      ...s,
      tasks: (s.tasks || []).sort((a: any, b: any) => a.created_at.localeCompare(b.created_at))
    }))
  }

  return mapped as ProductTemplateData
}

export async function deleteProductTemplate(id: string) {
  return toggleProductActivation(id, false)
}

export async function toggleProductActivation(id: string, active: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('product_templates')
    .update({ is_active: active })
    .eq('id', id)
  
  if (error) throw error
  revalidatePath('/dashboard/products')
}

export async function updateProductMetadata(id: string, data: Partial<ProductTemplateData>) {
  const supabase = createClient()
  const { error } = await supabase
    .from('product_templates')
    .update({
      name: data.name,
      category: data.category,
      type: data.type,
      base_price: data.base_price
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/products')
  revalidatePath(`/dashboard/products/${id}/builder`)
}

export async function hardDeleteProductTemplate(id: string) {
  const supabase = createClient()
  
  // Safety check: is it used in any projects?
  const { count } = await supabase
    .from('v2_projects')
    .select('*', { count: 'exact', head: true })
    .eq('template_id', id)

  if (count && count > 0) {
    throw new Error('Não é possível excluir um produto que possui projetos vinculados. Desative-o em vez disso.')
  }

  const { error } = await supabase
    .from('product_templates')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  revalidatePath('/dashboard/products')
}

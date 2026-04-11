'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ProductTemplateData {
  name: string
  category: string
  type: string
  base_price: number
  stages: {
    name: string
    duration_days: number
    auto_start: boolean
    order_index: number
    tasks: {
      title: string
      role: string
      deadline_offset: number
      task_type: string
      is_required: boolean
    }[]
  }[]
}

export async function saveProductTemplate(data: ProductTemplateData) {
  const supabase = createClient()
  
  // 1. Insert Template
  const { data: template, error: tError } = await supabase
    .from('product_templates')
    .insert({
      name: data.name,
      category: data.category,
      type: data.type,
      base_price: data.base_price,
      is_active: true
    })
    .select()
    .single()

  if (tError) throw tError

  // 2. Insert Stages and Tasks
  for (const stage of data.stages) {
    const { data: stageData, error: sError } = await supabase
      .from('product_template_stages')
      .insert({
        template_id: template.id,
        name: stage.name,
        duration_days: stage.duration_days,
        auto_start: stage.auto_start,
        order_index: stage.order_index
      })
      .select()
      .single()

    if (sError) throw sError

    if (stage.tasks.length > 0) {
      const { error: tasksError } = await supabase
        .from('product_template_tasks')
        .insert(
          stage.tasks.map(t => ({
            stage_id: stageData.id,
            title: t.title,
            role: t.role,
            deadline_offset: t.deadline_offset,
            task_type: t.task_type,
            is_required: t.is_required
          }))
        )
      
      if (tasksError) throw tasksError
    }
  }

  revalidatePath('/dashboard/templates')
  return template
}

export async function getProductTemplates() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('product_templates')
    .select('*, product_template_stages(id, name, product_template_tasks(id))')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  
  return (data || []).map(t => ({
    ...t,
    stages_count: t.product_template_stages?.length || 0,
    tasks_count: (t.product_template_stages || []).reduce((acc: number, s: any) => acc + (s.product_template_tasks?.length || 0), 0)
  }))
}

export async function deleteProductTemplate(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('product_templates')
    .update({ is_active: false })
    .eq('id', id)
  
  if (error) throw error
  revalidatePath('/dashboard/templates')
}

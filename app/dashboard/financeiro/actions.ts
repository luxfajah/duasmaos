'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getFinancialSummary() {
  const supabase = createClient()

  const { data: revenues, error } = await supabase
    .from('revenues')
    .select('amount, status, due_date')

  if (error) {
    console.error('Error fetching financial summary:', error)
    return { paid: 0, pending: 0, overdue: 0, projection: 0 }
  }

  const now = new Date()
  let paid = 0
  let pending = 0
  let overdue = 0
  let projection = 0

  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  for (const rev of revenues || []) {
    const amount = Number(rev.amount) || 0
    const dueDate = new Date(rev.due_date)
    const isThisMonth = dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear

    if (rev.status === 'paid') {
      paid += amount
      if (isThisMonth) {
        projection += amount
      }
    } else {
      // Check if it is overdue
      const isOverdue = dueDate < now || rev.status === 'overdue'
      if (isOverdue) {
        overdue += amount
      } else {
        pending += amount
      }

      if (isThisMonth) {
        projection += amount
      }
    }
  }

  return { paid, pending, overdue, projection }
}

export async function getRevenuesList() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('revenues')
    .select(`
      *,
      project:v2_projects(
        name,
        client:clients(name)
      )
    `)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching revenues list:', error)
    return []
  }

  return data ?? []
}

export async function markRevenueAsPaid(revenueId: string, amount: number, method: string) {
  const supabase = createClient()

  // 1. Insert into payments
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      revenue_id: revenueId,
      amount: amount,
      method: method,
      paid_at: new Date().toISOString()
    })

  if (paymentError) {
    throw new Error('Erro ao criar registro de pagamento: ' + paymentError.message)
  }

  // 2. Update revenue status
  const { error: revenueError } = await supabase
    .from('revenues')
    .update({
      status: 'paid'
    })
    .eq('id', revenueId)

  if (revenueError) {
    throw new Error('Erro ao atualizar status do faturamento: ' + revenueError.message)
  }

  revalidatePath('/dashboard/financeiro')
  revalidatePath('/dashboard/projects')
  return { success: true }
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getFinancialSummary, getRevenuesList } from './actions'
import { FinanceiroPageClient } from './FinanceiroPageClient'
import { EditorialHeader } from '@/components/brand/EditorialHeader'

export default async function FinanceiroPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if admin or manager
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAuthorized = profile?.role === 'admin' || profile?.role === 'gestor'
  if (!isAuthorized) {
    redirect('/dashboard')
  }

  // Fetch data
  const summary = await getFinancialSummary()
  const revenues = await getRevenuesList()

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <EditorialHeader
        title="Financeiro & Faturamento"
        subtitle="Gerencie receitas, faturamentos recorrentes e pagamentos dos clientes."
      />

      <FinanceiroPageClient initialSummary={summary} initialRevenues={revenues} />
    </div>
  )
}

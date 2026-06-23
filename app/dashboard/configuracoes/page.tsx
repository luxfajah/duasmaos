import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EditorialHeader } from '@/components/brand/EditorialHeader'
import { ConfiguracoesClient } from './ConfiguracoesClient'

export default async function ConfiguracoesPage() {
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

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url, last_login, client_id')
    .order('role')
    .order('full_name')

  // Fetch all clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .order('name')

  // Fetch invitations
  const { data: invitations } = await supabase
    .from('invitations')
    .select('*, clients(name)')
    .order('created_at', { ascending: false })

  // Fetch all client portal settings
  const { data: portalSettings } = await supabase
    .from('client_portal_settings')
    .select('*, clients(name)')

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <EditorialHeader
        title="Configurações do Sistema"
        subtitle="Gerencie sua equipe, links de convite e portais de aprovação dos clientes."
      />

      <ConfiguracoesClient 
        users={profiles ?? []} 
        clients={clients ?? []} 
        invitations={invitations ?? []}
        portalSettings={portalSettings ?? []}
      />
    </div>
  )
}

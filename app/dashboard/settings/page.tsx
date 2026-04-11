import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EditorialHeader } from '@/components/brand/EditorialHeader'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch current profile
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Self-healing: if no profile exists for this auth user, create one.
  if (!profile) {
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        first_name: user.user_metadata?.first_name || 'Usuário',
        last_name: user.user_metadata?.last_name || '',
        full_name: user.user_metadata?.full_name || 'Novo Usuário',
        role: 'admin' // Default to admin for this specific request or as a fallback
      })
      .select('*')
      .single()
    
    if (!insertError) profile = newProfile
  }

  const isAdmin = profile?.role === 'admin'

  // Initialize data
  let allProfiles: any[] = []
  let allInvitations: any[] = []
  let allClients: any[] = []

  if (isAdmin) {
    // Fetch all profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, first_name, last_name, role, avatar_url, last_login')
      .order('role')
      .order('full_name')
    
    allProfiles = profiles ?? []

    // Fetch all invitations
    const { data: invitations } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false })
    
    allInvitations = invitations ?? []

    // Fetch all clients
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name')
      .order('name')
    
    allClients = clients ?? []
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <EditorialHeader
        title="Configurações"
        subtitle="Gerencie seu perfil, equipe e segurança da plataforma."
      />

      <SettingsClient 
        profile={profile} 
        users={allProfiles} 
        invitations={allInvitations} 
        clients={allClients} 
      />
    </div>
  )
}

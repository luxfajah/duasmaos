import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EditorialHeader } from '@/components/brand/EditorialHeader'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Shield, User } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  gestor: 'Gestor',
  designer: 'Designer',
  writer: 'Redator',
  client: 'Cliente',
}

const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  admin: 'default',
  gestor: 'default',
  designer: 'secondary',
  writer: 'secondary',
  client: 'outline',
}

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, clients(name)')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Admin: list all profiles
  let allProfiles: Array<{
    id: string
    full_name: string
    role: string
    avatar_url: string | null
    clients: { name: string } | null
  }> = []

  if (isAdmin) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url, clients(name)')
      .order('role')
      .order('full_name')
    allProfiles = (data ?? []) as unknown as typeof allProfiles
  }

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-500">
      <EditorialHeader
        title="Configurações"
        subtitle="Perfil e gerenciamento do sistema"
      />

      {/* My profile */}
      <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-text-muted" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">Meu Perfil</h2>
        </div>
        <div className="flex items-center gap-4">
          <Avatar name={profile?.full_name ?? user.email ?? 'U'} size="lg" variant="brand" />
          <div>
            <p className="font-semibold text-text-primary text-lg">{profile?.full_name ?? '—'}</p>
            <p className="text-sm text-text-secondary">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={ROLE_VARIANT[profile?.role ?? 'client']}>
                {ROLE_LABELS[profile?.role ?? 'client']}
              </Badge>
              {profile?.clients && (
                <span className="text-xs text-text-muted">· {(profile.clients as { name: string }).name}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Team management (admin only) */}
      {isAdmin && (
        <section className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <Shield size={15} className="text-text-muted" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">Equipe</h2>
            <span className="ml-auto text-xs text-text-muted">{allProfiles.length} usuários</span>
          </div>
          <div className="divide-y divide-border">
            {allProfiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={p.full_name} size="sm" variant="default" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{p.full_name}</p>
                    {p.clients && !Array.isArray(p.clients) && (
                      <p className="text-[10px] text-text-muted">{(p.clients as { name: string }).name}</p>
                    )}
                    {p.clients && Array.isArray(p.clients) && p.clients.length > 0 && (
                      <p className="text-[10px] text-text-muted">{(p.clients[0] as { name: string }).name}</p>
                    )}
                  </div>
                </div>
                <Badge variant={ROLE_VARIANT[p.role]}>
                  {ROLE_LABELS[p.role] ?? p.role}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

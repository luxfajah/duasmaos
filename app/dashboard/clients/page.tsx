import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getClients } from './actions'
import { ClientsClient } from './ClientsClient'
import { EditorialHeader } from '@/components/brand/EditorialHeader'

export default async function ClientsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clients = await getClients()

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <EditorialHeader
        title="Clientes"
        subtitle={`${clients.length} cliente${clients.length !== 1 ? 's' : ''} cadastrado${clients.length !== 1 ? 's' : ''}`}
      />
      <ClientsClient initialClients={clients} />
    </div>
  )
}

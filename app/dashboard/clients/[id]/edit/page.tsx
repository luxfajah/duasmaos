import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getClientById } from '@/app/dashboard/clients/actions'
import { ClientForm } from '@/components/clients/ClientForm'

interface Props {
  params: {
    id: string
  }
}

export default async function EditClientPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let client = null
  try {
    client = await getClientById(params.id)
  } catch (e) {
    notFound()
  }

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <ClientForm client={client} />
    </div>
  )
}

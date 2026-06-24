import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ClientForm } from '@/components/clients/ClientForm'

export default async function NewClientPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <ClientForm />
    </div>
  )
}

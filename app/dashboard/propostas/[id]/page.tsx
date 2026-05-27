import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProposalEditor } from './ProposalEditor'
import { EditorialHeader } from '@/components/brand/EditorialHeader'

export default async function EditProposalPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: proposal, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !proposal) {
    redirect('/dashboard/propostas')
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <EditorialHeader
        title={`Proposta: ${proposal.client_name}`}
        subtitle="Editor de conteúdo da apresentação"
      />
      <ProposalEditor proposal={proposal} />
    </div>
  )
}

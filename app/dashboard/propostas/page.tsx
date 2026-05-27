import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getProposals } from './actions'
import { ProposalsClient } from './ProposalsClient'
import { EditorialHeader } from '@/components/brand/EditorialHeader'

export default async function ProposalsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const proposals = await getProposals()

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <EditorialHeader
        title="Propostas Comerciais"
        subtitle={`${proposals.length} proposta${proposals.length !== 1 ? 's' : ''} criada${proposals.length !== 1 ? 's' : ''}`}
      />
      <ProposalsClient initialProposals={proposals} />
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getClients } from '@/app/dashboard/clients/actions'
import { PipelineBoard } from '@/components/dashboard/PipelineBoard'
import { EditorialHeader } from '@/components/brand/EditorialHeader'
import { Card } from '@/components/ui/Card'
import { TrendingUp, Target, DollarSign } from 'lucide-react'

export default async function PipelinePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clients = await getClients()
  // Ensure that new clients without a pipeline_stage go to 'Lead'
  const normalizedClients = clients.map(c => ({
    ...c,
    pipeline_stage: c.pipeline_stage || 'Lead'
  }));

  const activeLeadsCount = normalizedClients.length;
  const mockTicketMedio = activeLeadsCount > 0 ? 24500 : 0;
  const mockPipelineTotal = activeLeadsCount * mockTicketMedio;

  const formattedTicket = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mockTicketMedio);
  const formattedTotal = mockPipelineTotal > 1000000 
    ? `R$ ${(mockPipelineTotal/1000000).toFixed(1)}M` 
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mockPipelineTotal);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500 pb-12">
      <EditorialHeader
        title="Pipeline Comercial"
        subtitle="Acompanhe a jornada dos seus clientes criativos."
      />
      
      {/* Board Layout */}
      <div className="relative">
        {/* Background Pattern representation optional */}
        <PipelineBoard initialClients={normalizedClients as any} />
      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card variant="muted" className="p-6 flex items-center gap-6 group hover:border-brand-primary/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
            <TrendingUp className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">TICKET MÉDIO</p>
            <p className="text-2xl font-serif font-bold text-text-primary">{formattedTicket}</p>
            <p className="text-xs text-status-success font-semibold mt-1">+12% este mês</p>
          </div>
        </Card>
        
        <Card variant="muted" className="p-6 flex items-center gap-6 group hover:border-status-info/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-status-info/10 flex items-center justify-center group-hover:bg-status-info/20 transition-colors">
            <Target className="w-6 h-6 text-status-info" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">TAXA DE CONVERSÃO</p>
            <p className="text-2xl font-serif font-bold text-text-primary">18.4%</p>
            <p className="text-xs text-status-danger font-semibold mt-1">-2% vs ago</p>
          </div>
        </Card>
        
        <Card variant="muted" className="p-6 flex items-center gap-6 group hover:border-status-warning/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-status-warning/10 flex items-center justify-center group-hover:bg-status-warning/20 transition-colors">
            <DollarSign className="w-6 h-6 text-status-warning" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">PIPELINE TOTAL</p>
            <p className="text-2xl font-serif font-bold text-text-primary">{formattedTotal}</p>
            <p className="text-xs text-text-secondary mt-1">{activeLeadsCount} leads ativos</p>
          </div>
        </Card>
      </div>

    </div>
  )
}

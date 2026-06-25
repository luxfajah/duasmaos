'use client'

import { useState } from 'react'
import { markRevenueAsPaid } from './actions'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  CreditCard,
  Building2,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Revenue {
  id: string
  project_id: string
  amount: number
  due_date: string
  status: 'pending' | 'paid' | 'overdue'
  type: 'one_time' | 'installment' | 'recurring'
  project: {
    name: string
    client: {
      name: string
    } | null
  } | null
}

interface FinanceiroPageClientProps {
  initialSummary: {
    paid: number
    pending: number
    overdue: number
    projection: number
  }
  initialRevenues: Revenue[]
}

const TYPE_LABELS = {
  one_time: 'Único',
  installment: 'Parcela',
  recurring: 'Recorrente'
}

const TYPE_BADGES = {
  one_time: 'secondary',
  installment: 'outline',
  recurring: 'default'
}

export function FinanceiroPageClient({ initialSummary, initialRevenues }: FinanceiroPageClientProps) {
  const [summary, setSummary] = useState(initialSummary)
  const [revenues, setRevenues] = useState<Revenue[]>(initialRevenues)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  // Filters
  const filteredRevenues = revenues.filter(rev => {
    const matchesStatus = filterStatus === 'all' || rev.status === filterStatus
    const clientName = rev.project?.client?.name?.toLowerCase() || ''
    const projectName = rev.project?.name?.toLowerCase() || ''
    const matchesSearch = clientName.includes(searchQuery.toLowerCase()) || 
                          projectName.includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleOpenPaymentModal = (rev: Revenue) => {
    setSelectedRevenue(rev)
  }

  const handleConfirmPayment = async () => {
    if (!selectedRevenue) return

    setIsSubmitting(true)
    try {
      await markRevenueAsPaid(selectedRevenue.id, selectedRevenue.amount, paymentMethod)
      toast.success('Pagamento registrado com sucesso!')
      
      // Update local state
      setRevenues(prev => prev.map(r => r.id === selectedRevenue.id ? { ...r, status: 'paid' } : r))
      
      // Re-calculate summary
      setSummary(prev => {
        const val = Number(selectedRevenue.amount)
        const isOverdue = new Date(selectedRevenue.due_date) < new Date() || selectedRevenue.status === 'overdue'
        return {
          ...prev,
          paid: prev.paid + val,
          pending: isOverdue ? prev.pending : prev.pending - val,
          overdue: isOverdue ? prev.overdue - val : prev.overdue
        }
      })

      setSelectedRevenue(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao registrar pagamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Paid widget */}
        <Card className="p-6 bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20 dark:bg-emerald-500/10 dark:border-emerald-500/20 transition-all duration-300 ease-apple flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-text-muted/80 tracking-wider">Faturamento Recebido</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 tabular-nums">
              R$ {summary.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-emerald-500 font-bold mt-1">✓ Parcerias adimplentes</p>
          </div>
        </Card>

        {/* Pending widget */}
        <Card className="p-6 bg-brand-primary/5 border-brand-primary/10 hover:border-brand-primary/20 dark:bg-brand-primary/10 dark:border-brand-primary/20 transition-all duration-300 ease-apple flex items-start gap-4">
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-text-muted/80 tracking-wider">A Receber (Pendentes)</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 tabular-nums">
              R$ {summary.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-brand-primary font-bold mt-1">⏳ Aguardando vencimento</p>
          </div>
        </Card>

        {/* Overdue widget */}
        <Card className="p-6 bg-status-danger/5 border-status-danger/10 hover:border-status-danger/20 dark:bg-status-danger/10 dark:border-status-danger/20 transition-all duration-300 ease-apple flex items-start gap-4">
          <div className="p-3 bg-status-danger/10 text-status-danger rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-text-muted/80 tracking-wider">Valores Atrasados</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 tabular-nums">
              R$ {summary.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-status-danger font-bold mt-1">⚠️ Vencimento ultrapassado</p>
          </div>
        </Card>

        {/* Projection widget */}
        <Card className="p-6 bg-info/5 border-info/10 hover:border-info/20 dark:bg-info/10 dark:border-info/20 transition-all duration-300 ease-apple flex items-start gap-4">
          <div className="p-3 bg-info/10 text-info rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-text-muted/80 tracking-wider">Projeção do Mês</p>
            <h3 className="text-2xl font-black text-text-primary mt-1 tabular-nums">
              R$ {summary.projection.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-info font-bold mt-1">📈 Estimativa de fechamento</p>
          </div>
        </Card>

      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por cliente ou projeto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-panel/50 rounded-full pl-10 pr-4 py-2 text-sm text-text-primary outline-none focus:border-brand-primary/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ease-apple"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
          <Filter size={14} className="text-text-muted shrink-0 hidden sm:block" />
          {[
            { id: 'all', label: 'Todos' },
            { id: 'paid', label: 'Pagos' },
            { id: 'pending', label: 'Pendentes' },
            { id: 'overdue', label: 'Atrasados' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterStatus(btn.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ease-apple active:scale-[0.97] shrink-0 ${
                filterStatus === btn.id
                  ? 'bg-brand-primary text-white shadow-brand'
                  : 'glass-panel text-text-secondary hover:bg-surface-muted'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

      </div>

      {/* 3. Table of Revenues */}
      <div className="apple-bezel"><div className="apple-bezel-inner overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-muted/30 text-xs font-bold text-text-muted uppercase tracking-wider">
                <th className="px-6 py-4">Projeto / Cliente</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm text-text-secondary">
              {filteredRevenues.map(rev => {
                const dueDate = new Date(rev.due_date)
                const isOverdue = rev.status === 'overdue' || (rev.status === 'pending' && dueDate < new Date())
                
                return (
                  <tr key={rev.id} className="hover:bg-surface-muted/20 transition-all duration-300 ease-apple">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-text-primary text-sm">{rev.project?.name || 'Projeto Excluído'}</span>
                        <span className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                          <Building2 size={12} /> {rev.project?.client?.name || 'Cliente Geral'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={TYPE_BADGES[rev.type] as any} className="text-[10px] uppercase font-bold tracking-wider">
                        {TYPE_LABELS[rev.type]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-xs">
                        <Calendar size={13} className="text-text-muted" />
                        {dueDate.toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-text-primary tabular-nums">
                        R$ {rev.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {rev.status === 'paid' ? (
                        <Badge variant="success" className="text-[10px] font-bold">Pago</Badge>
                      ) : isOverdue ? (
                        <Badge variant="danger" className="text-[10px] font-bold">Atrasado</Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px] font-bold">Pendente</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {rev.status !== 'paid' ? (
                        <Button 
                          onClick={() => handleOpenPaymentModal(rev)} 
                          size="sm" 
                          className="h-8 rounded-xl text-xs bg-emerald-500 hover:bg-emerald-600 font-bold active:scale-[0.97] transition-all duration-300 ease-apple"
                        >
                          Marcar Pago
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-500 font-bold flex items-center justify-end gap-1">
                          ✓ Recebido
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}

              {filteredRevenues.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-text-muted font-medium">
                    Nenhum registro de faturamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div></div>

      {/* 4. Confirm Payment Modal */}
      {selectedRevenue && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-surface rounded-2xl border border-border/50 shadow-2xl max-w-md w-full overflow-hidden animate-in scale-in-95 duration-300">
            <div className="px-6 py-5 border-b border-border bg-surface-muted/20 flex items-center justify-between">
              <h3 className="text-md font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={18} className="text-brand-primary" /> Registrar Pagamento
              </h3>
              <button 
                onClick={() => setSelectedRevenue(null)} 
                className="text-text-muted hover:text-text-primary transition-colors text-sm"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Projeto</p>
                <h4 className="font-bold text-text-primary mt-0.5">{selectedRevenue.project?.name}</h4>
                <p className="text-xs text-text-secondary mt-1">{selectedRevenue.project?.client?.name}</p>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Valor total</span>
                  <span className="text-lg font-black text-brand-primary tabular-nums">
                    R$ {selectedRevenue.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Método de Recebimento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-11 px-3 py-2 text-sm rounded-xl border border-border/50 bg-surface text-text-primary outline-none focus:border-brand-primary/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 ease-apple"
                >
                  <option value="pix">Pix (Transferência rápida)</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="transfer">TED / DOC</option>
                  <option value="cash">Dinheiro em espécie</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-surface-muted/30 border-t border-border flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSelectedRevenue(null)}
                disabled={isSubmitting}
                className="rounded-xl text-xs font-bold active:scale-[0.97] transition-all duration-300 ease-apple"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmPayment}
                disabled={isSubmitting}
                className="rounded-xl text-xs bg-emerald-500 hover:bg-emerald-600 shadow-emerald font-bold active:scale-[0.97] transition-all duration-300 ease-apple"
              >
                {isSubmitting ? 'Registrando...' : 'Confirmar Recebimento'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

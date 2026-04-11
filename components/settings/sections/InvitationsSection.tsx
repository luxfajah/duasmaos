'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/input'
import { 
  Mail, 
  Plus, 
  Link as LinkIcon, 
  Copy, 
  X, 
  RefreshCw, 
  Clock,
  UserPlus,
  ArrowRight
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createInvitation, invalidateInvitation } from '@/app/dashboard/settings/actions'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface InvitationsSectionProps {
  clients: any[]
  invitations: any[]
}

export function InvitationsSection({ clients, invitations }: InvitationsSectionProps) {
  const [loading, setLoading] = useState(false)
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  
  // Form state
  const [type, setType] = useState<'team' | 'client'>('team')
  const [role, setRole] = useState<string>('writer')
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [expiry, setExpiry] = useState<number>(7)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await createInvitation({
        role: (type === 'client' ? 'client' : role) as any,
        client_id: type === 'client' ? selectedClient : undefined,
        expiresInDays: expiry
      })
      if (result.token) {
        setGeneratedToken(result.token)
        toast.success('Convite gerado com sucesso!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar convite')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(token: string) {
    const url = `${window.location.origin}/register?token=${token}`
    navigator.clipboard.writeText(url)
    toast.success('Link copiado para a área de transferência!')
  }

  async function handleInvalidate(id: string) {
    if (!confirm('Deseja invalidar este convite?')) return
    try {
      await invalidateInvitation(id)
      toast.success('Convite invalidado')
    } catch (err) {
      toast.error('Erro ao invalidar convite')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-up duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold font-heading text-text-primary">Convites</h2>
        <p className="text-text-secondary">Gere links de acesso para novos membros da equipe ou clientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleCreate} className="p-6 glass rounded-xl border border-border space-y-5">
            <h3 className="font-bold text-text-primary flex items-center gap-2">
              <Plus size={18} className="text-brand-primary" />
              Novo Convite
            </h3>
            
            <div className="flex bg-surface-muted p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setType('team')}
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
                  type === 'team' ? "bg-white text-brand-primary shadow-sm" : "text-text-muted"
                )}
              >
                EQUIPE
              </button>
              <button
                type="button"
                onClick={() => setType('client')}
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
                  type === 'client' ? "bg-white text-brand-primary shadow-sm" : "text-text-muted"
                )}
              >
                CLIENTE
              </button>
            </div>

            {type === 'team' ? (
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-muted uppercase">Função</label>
                <select 
                  className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="writer">Redator</option>
                  <option value="designer">Designer</option>
                  <option value="gestor">Gestor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-muted uppercase">Selecionar Cliente</label>
                <select 
                  className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  required
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase">Expiração</label>
              <select 
                className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                value={expiry}
                onChange={(e) => setExpiry(Number(e.target.value))}
              >
                <option value={1}>1 dia</option>
                <option value={7}>7 dias</option>
                <option value={30}>30 dias</option>
              </select>
            </div>

            <Button type="submit" disabled={loading} className="w-full shadow-brand">
              {loading ? <RefreshCw className="animate-spin mr-2" size={16} /> : <LinkIcon className="mr-2" size={16} />}
              Gerar Link
            </Button>
          </form>

          {generatedToken && (
            <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-xl animate-in scale-in duration-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-primary uppercase">Link Gerado</span>
                <button onClick={() => setGeneratedToken(null)}><X size={14} className="text-text-muted" /></button>
              </div>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value={`${window.location.origin}/register?token=${generatedToken}`}
                  className="flex-1 bg-white border border-border rounded-md px-3 py-2 text-xs text-text-secondary overflow-hidden text-ellipsis"
                />
                <Button size="icon" variant="outline" onClick={() => copyToClipboard(generatedToken)} className="size-9 shrink-0">
                  <Copy size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-text-primary flex items-center gap-2">
            <Clock size={18} className="text-text-muted" />
            Convites Ativos
          </h3>

          <div className="glass rounded-xl border border-border divide-y divide-border overflow-hidden">
            {invitations.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="size-12 bg-surface-muted rounded-full flex items-center justify-center mx-auto text-text-muted">
                  <Mail size={24} />
                </div>
                <p className="text-text-muted text-sm">Nenhum convite ativo encontrado.</p>
              </div>
            ) : (
              invitations.map((inv) => (
                <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-surface-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "size-10 rounded-full flex items-center justify-center",
                      inv.role === 'client' ? "bg-brand-accent/10 text-brand-secondary" : "bg-brand-primary/10 text-brand-primary"
                    )}>
                      {inv.role === 'client' ? <UserPlus size={18} /> : <Mail size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-text-primary capitalize">{inv.role}</span>
                        {inv.status !== 'pending' && <Badge variant="outline" className="text-[10px] leading-none">{inv.status}</Badge>}
                      </div>
                      <p className="text-xs text-text-muted">
                        Expira em {format(new Date(inv.expires_at), 'dd/MM/yy', { locale: ptBR })}
                        {inv.client_id && ` · Cliente: ${inv.clients?.name || 'Assigned'}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="size-8 rounded-full border-border/50 text-text-muted hover:text-brand-primary"
                      onClick={() => copyToClipboard(inv.token)}
                      title="Copiar link"
                    >
                      <Copy size={13} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="size-8 rounded-full border-border/50 text-text-muted hover:text-status-danger"
                      onClick={() => handleInvalidate(inv.id)}
                      title="Invalidar"
                    >
                      <X size={13} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

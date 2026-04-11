'use client'

import { useState, useTransition, useEffect } from 'react'
import { Client, ClientStatus, Profile, ClientAddress } from '@/types/database'
import { createClient_, updateClient, uploadClientDocument } from '@/app/dashboard/clients/actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  FileText, 
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Upload,
  Globe
} from 'lucide-react'
import { createClient as createBrowserClient } from '@/utils/supabase/client'

interface ClientModalProps {
  client?: Client & { client_addresses?: ClientAddress[] } | null
  onClose: () => void
}

type Step = 1 | 2 | 3 | 4 | 5 | 6

export function ClientModal({ client, onClose }: ClientModalProps) {
  const isEdit = !!client
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>(1)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isSearchingCep, setIsSearchingCep] = useState(false)

  const [form, setForm] = useState({
    type: client?.type ?? 'pj',
    name: client?.name ?? '',
    company: client?.company ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    whatsapp: client?.whatsapp ?? '',
    status: (client?.status ?? 'active') as ClientStatus,
    website: client?.website ?? '',
    segment: client?.segment ?? '',
    cpf: client?.cpf ?? '',
    cnpj: client?.cnpj ?? '',
    birth_date: client?.birth_date ?? '',
    trade_name: client?.trade_name ?? '',
    responsible_name: client?.responsible_name ?? '',
    lead_source: client?.lead_source ?? '',
    account_manager_id: client?.account_manager_id ?? '',
    notes: client?.notes ?? '',
    address: {
      zip_code: client?.client_addresses?.[0]?.zip_code ?? '',
      street: client?.client_addresses?.[0]?.street ?? '',
      number: client?.client_addresses?.[0]?.number ?? '',
      complement: client?.client_addresses?.[0]?.complement ?? '',
      city: client?.client_addresses?.[0]?.city ?? '',
      state: client?.client_addresses?.[0]?.state ?? '',
    }
  })

  useEffect(() => {
    async function fetchProfiles() {
      const supabase = createBrowserClient()
      const { data } = await supabase.from('profiles').select('*').order('full_name')
      if (data) setProfiles(data as Profile[])
    }
    fetchProfiles()
  }, [])

  function handleChange(field: string, value: any) {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }))
    } else {
      setForm((prev) => ({ ...prev, [field]: value }))
    }
  }

  async function handleCepSearch() {
    const cep = form.address.zip_code.replace(/\D/g, '')
    if (cep.length !== 8) return

    setIsSearchingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: data.logradouro,
            city: data.localidade,
            state: data.uf,
          }
        }))
      }
    } catch (e) {
      console.error('CEP search error', e)
    } finally {
      setIsSearchingCep(false)
    }
  }

  function applyMask(val: string, type: 'cpf' | 'cnpj' | 'phone' | 'cep') {
    const v = val.replace(/\D/g, '')
    if (type === 'cpf') {
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").substring(0, 14)
    }
    if (type === 'cnpj') {
      return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5").substring(0, 18)
    }
    if (type === 'phone') {
      if (v.length > 10) {
        return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3").substring(0, 15)
      }
      return v.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3").substring(0, 14)
    }
    if (type === 'cep') {
      return v.replace(/(\d{5})(\d{3})/, "$1-$2").substring(0, 9)
    }
    return val
  }

  function handleSubmit() {
    setError(null)
    if (!form.name.trim()) {
      setError('O nome é obrigatório.')
      setStep(1)
      return
    }
    
    startTransition(async () => {
      try {
        if (isEdit && client) {
          await updateClient(client.id, form)
        } else {
          await createClient_(form)
        }
        onClose()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar cliente.')
      }
    })
  }

  const steps = [
    { title: 'Identificação', icon: <User size={16} /> },
    { title: 'Contatos', icon: <Mail size={16} /> },
    { title: 'Endereço', icon: <MapPin size={16} /> },
    { title: 'Comercial', icon: <Briefcase size={16} /> },
    { title: 'Arquivos', icon: <FileText size={16} /> },
    { title: 'Revisão', icon: <Check size={16} /> },
  ]

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl bg-surface/80 backdrop-blur-xl">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="bg-brand-primary/5 text-brand-primary border-brand-primary/20">
              CRM Pipeline
            </Badge>
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 w-8 rounded-full transition-all duration-300 ${i + 1 <= step ? 'bg-brand-primary' : 'bg-surface-muted'}`} 
                />
              ))}
            </div>
          </div>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
              {steps[step - 1].icon}
            </div>
            {isEdit ? 'Editar Cliente' : 'Novo Cliente Profissional'}
          </DialogTitle>
          <p className="text-text-muted text-sm mt-1">{steps[step - 1].title}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form className="space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4 p-1 bg-surface-muted rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleChange('type', 'pf')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${form.type === 'pf' ? 'bg-surface shadow-sm text-brand-primary' : 'text-text-muted hover:text-text-primary'}`}
                  >
                    <User size={18} /> Pessoa Física
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('type', 'pj')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${form.type === 'pj' ? 'bg-surface shadow-sm text-brand-primary' : 'text-text-muted hover:text-text-primary'}`}
                  >
                    <Building2 size={18} /> Pessoa Jurídica
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">
                      {form.type === 'pf' ? 'Nome Completo *' : 'Razão Social *'}
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder={form.type === 'pf' ? 'Ex: João da Silva' : 'Ex: Tecnologia LTDA'}
                    />
                  </div>

                  {form.type === 'pj' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Nome Fantasia</label>
                      <Input
                        value={form.trade_name}
                        onChange={(e) => handleChange('trade_name', e.target.value)}
                        placeholder="Ex: Tech Solutions"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">
                        {form.type === 'pf' ? 'CPF' : 'CNPJ'}
                      </label>
                      <Input
                        value={form.type === 'pf' ? applyMask(form.cpf, 'cpf') : applyMask(form.cnpj, 'cnpj')}
                        onChange={(e) => handleChange(form.type === 'pf' ? 'cpf' : 'cnpj', e.target.value)}
                        placeholder={form.type === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">
                        {form.type === 'pf' ? 'Data de Nasc.' : 'Responsável'}
                      </label>
                      {form.type === 'pf' ? (
                        <Input
                          type="date"
                          value={form.birth_date}
                          onChange={(e) => handleChange('birth_date', e.target.value)}
                        />
                      ) : (
                        <Input
                          value={form.responsible_name}
                          onChange={(e) => handleChange('responsible_name', e.target.value)}
                          placeholder="Nome do contato principal"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <Mail size={14} /> E-mail Profissional
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="exemplo@empresa.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                      <Phone size={14} /> Telefone
                    </label>
                    <Input
                      value={applyMask(form.phone, 'phone')}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                      <Phone size={14} className="text-status-success" /> WhatsApp
                    </label>
                    <Input
                      value={applyMask(form.whatsapp, 'phone')}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      placeholder="(00) 90000-0000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <Globe size={14} /> Site / LinkedIn
                  </label>
                  <Input
                    value={form.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">CEP</label>
                    <div className="relative">
                      <Input
                        value={applyMask(form.address.zip_code, 'cep')}
                        onChange={(e) => handleChange('address.zip_code', e.target.value)}
                        onBlur={handleCepSearch}
                        placeholder="00000-000"
                      />
                      {isSearchingCep && (
                        <Loader2 size={14} className="absolute right-3 top-3 animate-spin text-brand-primary" />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium text-text-primary">Rua / Logradouro</label>
                    <Input
                      value={form.address.street}
                      onChange={(e) => handleChange('address.street', e.target.value)}
                      placeholder="Nome da rua"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Número</label>
                    <Input
                      value={form.address.number}
                      onChange={(e) => handleChange('address.number', e.target.value)}
                      placeholder="Ex: 123"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Complemento</label>
                    <Input
                      value={form.address.complement}
                      onChange={(e) => handleChange('address.complement', e.target.value)}
                      placeholder="Bloco A, Sala 10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Cidade</label>
                    <Input
                      value={form.address.city}
                      onChange={(e) => handleChange('address.city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Estado</label>
                    <Input
                      value={form.address.state}
                      onChange={(e) => handleChange('address.state', e.target.value)}
                      placeholder="UF"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Segmento de Mercado</label>
                  <Input
                    value={form.segment}
                    onChange={(e) => handleChange('segment', e.target.value)}
                    placeholder="Ex: Varejo, Tecnologia, Saúde"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Origem do Lead</label>
                  <select
                    value={form.lead_source}
                    onChange={(e) => handleChange('lead_source', e.target.value)}
                    className="w-full h-11 px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  >
                    <option value="">Selecione a origem</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Google">Google</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Gestor da Conta (Responsável Interno)</label>
                  <select
                    value={form.account_manager_id}
                    onChange={(e) => handleChange('account_manager_id', e.target.value)}
                    className="w-full h-11 px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  >
                    <option value="">Selecione um gestor</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary text-status-success">Status do CRM</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full h-11 px-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 font-medium"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="paused">Pausado</option>
                  </select>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-surface-muted/30">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-text-primary">Clique para fazer upload</p>
                    <p className="text-xs text-text-muted mt-1">Contratos, Briefings ou Identidade (PDF, PNG, JPG)</p>
                  </div>
                  <Button variant="outline" size="sm" type="button" className="mt-4">
                    Selecionar Arquivos
                  </Button>
                  <p className="text-[10px] text-text-muted">Apenas disponível após criar o perfil do cliente</p>
                </div>
                <div className="space-y-3">
                   <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Checklist de Documentação</p>
                   <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <div className="w-4 h-4 rounded-full border border-border" /> Contrato Social / RG
                   </div>
                   <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <div className="w-4 h-4 rounded-full border border-border" /> Proposta Comercial
                   </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-brand-primary mb-2">Resumo do Perfil</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div className="flex flex-col">
                      <span className="text-text-muted uppercase font-bold tracking-tighter">Tipo</span>
                      <span className="text-text-primary">{form.type === 'pf' ? 'Individual (PF)' : 'Empresa (PJ)'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-text-muted uppercase font-bold tracking-tighter">Documento</span>
                      <span className="text-text-primary">{form.type === 'pf' ? applyMask(form.cpf, 'cpf') : applyMask(form.cnpj, 'cnpj')}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-text-muted uppercase font-bold tracking-tighter">Contato</span>
                      <span className="text-text-primary truncate">{form.email}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-text-muted uppercase font-bold tracking-tighter">Gestor</span>
                      <span className="text-text-primary">{profiles.find(p => p.id === form.account_manager_id)?.full_name || 'Não atribuído'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Observações do CRM (Interno)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Histórico do lead, ticket médio esperado, etc..."
                    rows={4}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-surface text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-status-success/5 border border-status-success/10 rounded-lg text-status-success text-xs">
                  <Check size={14} /> Pronto para ser integrado ao fluxo de projetos.
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-status-danger bg-status-danger/10 rounded-xl px-4 py-3 animate-in fade-in zoom-in duration-300">
                {error}
              </p>
            )}
          </form>
        </div>

        <DialogFooter className="p-6 pt-2 bg-surface/50 border-t border-border mt-auto">
          <div className="flex items-center justify-between w-full">
            <Button 
               type="button" 
               variant="ghost" 
               onClick={() => step > 1 ? setStep((prev) => (prev - 1) as Step) : onClose()} 
               disabled={isPending}
            >
              {step === 1 ? 'Cancelar' : <><ChevronLeft size={16} className="mr-2" /> Voltar</>}
            </Button>
            
            <div className="flex items-center gap-3">
              {step < 6 ? (
                <Button 
                  type="button" 
                  onClick={() => setStep((prev) => (prev + 1) as Step)}
                  className="bg-brand-primary hover:bg-brand-secondary text-white shadow-lg shadow-brand-primary/20"
                >
                  Continuar <ChevronRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={isPending}
                  className="bg-brand-primary hover:bg-brand-secondary text-white shadow-lg shadow-brand-primary/20 min-w-[140px]"
                >
                  {isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : <Check size={16} className="mr-2" />}
                  {isPending ? 'Salvando...' : isEdit ? 'Salvar CRM' : 'Finalizar Cadastro'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

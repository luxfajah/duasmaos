'use client'

import { useState, useTransition, useEffect } from 'react'
import { Client, ClientStatus, Profile, ClientAddress } from '@/types/database'
import { createClient_, updateClient } from '@/app/dashboard/clients/actions'
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
  Globe,
  ArrowLeft
} from 'lucide-react'
import { createClient as createBrowserClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ClientFormProps {
  client?: Client & { client_addresses?: ClientAddress[] } | null
}

type Step = 1 | 2 | 3 | 4 | 5 | 6

export function ClientForm({ client }: ClientFormProps) {
  const isEdit = !!client
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>(1)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isSearchingCep, setIsSearchingCep] = useState(false)
  const router = useRouter()

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
          router.push(`/dashboard/clients/${client.id}`)
        } else {
          await createClient_(form)
          router.push('/dashboard/clients')
        }
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar cliente.')
      }
    })
  }

  const steps = [
    { title: 'Identificação', icon: <User size={14} /> },
    { title: 'Contatos', icon: <Mail size={14} /> },
    { title: 'Endereço', icon: <MapPin size={14} /> },
    { title: 'Comercial', icon: <Briefcase size={14} /> },
    { title: 'Arquivos', icon: <FileText size={14} /> },
    { title: 'Revisão', icon: <Check size={14} /> },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          type="button"
          onClick={() => isEdit && client ? router.push(`/dashboard/clients/${client.id}`) : router.push('/dashboard/clients')}
          className="h-8 px-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2} />
        </Button>
        <h1 className="text-[22px] font-semibold text-text-primary tracking-tight">
          {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
      </div>

      {/* Main Grid: Wizard (HIG Container) */}
      <div className="bg-surface-primary/70 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-3xl saturate-150 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left: Stepper Sidebar (macOS Settings style) */}
        <div className="w-full md:w-64 bg-black/[0.02] dark:bg-white/[0.02] border-b md:border-b-0 md:border-r border-black/[0.04] dark:border-white/[0.04] p-4 flex flex-col gap-1 shrink-0">
          {steps.map((s, i) => {
            const stepNum = i + 1
            const isActive = step === stepNum
            const isCompleted = step > stepNum
            return (
              <button
                key={i}
                type="button"
                onClick={() => setStep(stepNum as Step)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left w-full",
                  isActive ? "bg-brand-primary text-white shadow-sm" : 
                  "text-text-secondary hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center shrink-0",
                  isActive ? "text-white" : 
                  isCompleted ? "text-[#34c759]" : "text-text-muted"
                )}>
                  {isCompleted ? <Check size={16} strokeWidth={2.5} /> : <div className="w-4 h-4 flex items-center justify-center">{s.icon}</div>}
                </div>
                <span className="truncate">{s.title}</span>
              </button>
            )
          })}
        </div>

        {/* Right: Form Content Area */}
        <div className="flex-1 flex flex-col p-6 md:p-8">
          <div className="flex-1">
            <h2 className="text-[17px] font-semibold text-text-primary mb-6 flex items-center gap-2">
              {steps[step - 1].title}
            </h2>

            <form className="space-y-6">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  
                  {/* PF / PJ Segmented Control */}
                  <div className="flex items-center p-1 bg-black/5 dark:bg-white/5 rounded-xl w-fit">
                    <button
                      type="button"
                      onClick={() => handleChange('type', 'pf')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all select-none",
                        form.type === 'pf' ? 'bg-white dark:bg-white/10 text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                      )}
                    >
                      <User size={14} /> Individual (PF)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('type', 'pj')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all select-none",
                        form.type === 'pj' ? 'bg-white dark:bg-white/10 text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                      )}
                    >
                      <Building2 size={14} /> Empresa (PJ)
                    </button>
                  </div>

                  <div className="space-y-4 max-w-xl">
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium text-text-primary">
                        {form.type === 'pf' ? 'Nome Completo *' : 'Razão Social *'}
                      </label>
                      <Input
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder={form.type === 'pf' ? 'Ex: João da Silva' : 'Ex: Tecnologia LTDA'}
                        className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                      />
                    </div>

                    {form.type === 'pj' && (
                      <div className="space-y-2">
                        <label className="text-[13px] font-medium text-text-primary">Nome Fantasia</label>
                        <Input
                          value={form.trade_name}
                          onChange={(e) => handleChange('trade_name', e.target.value)}
                          placeholder="Ex: Tech Solutions"
                          className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[13px] font-medium text-text-primary">
                          {form.type === 'pf' ? 'CPF' : 'CNPJ'}
                        </label>
                        <Input
                          value={form.type === 'pf' ? applyMask(form.cpf, 'cpf') : applyMask(form.cnpj, 'cnpj')}
                          onChange={(e) => handleChange(form.type === 'pf' ? 'cpf' : 'cnpj', e.target.value)}
                          placeholder={form.type === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                          className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-medium text-text-primary">
                          {form.type === 'pf' ? 'Data de Nascimento' : 'Nome do Responsável'}
                        </label>
                        {form.type === 'pf' ? (
                          <Input
                            type="date"
                            value={form.birth_date}
                            onChange={(e) => handleChange('birth_date', e.target.value)}
                            className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all text-text-primary bg-surface"
                          />
                        ) : (
                          <Input
                            value={form.responsible_name}
                            onChange={(e) => handleChange('responsible_name', e.target.value)}
                            placeholder="Nome do contato principal"
                            className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 max-w-xl animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-text-primary flex items-center gap-2">
                      <Mail size={14} /> E-mail de Contato
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="exemplo@empresa.com"
                      className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium text-text-primary flex items-center gap-2">
                        <Phone size={14} /> Telefone
                      </label>
                      <Input
                        value={applyMask(form.phone, 'phone')}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="(00) 0000-0000"
                        className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium text-text-primary flex items-center gap-2">
                        <Phone size={14} className="text-status-success" /> WhatsApp
                      </label>
                      <Input
                        value={applyMask(form.whatsapp, 'phone')}
                        onChange={(e) => handleChange('whatsapp', e.target.value)}
                        placeholder="(00) 90000-0000"
                        className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-text-primary flex items-center gap-2">
                      <Globe size={14} /> Site Corporativo ou LinkedIn
                    </label>
                    <Input
                      value={form.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://"
                      className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 max-w-xl animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium text-text-primary">CEP</label>
                      <div className="relative">
                        <Input
                          value={applyMask(form.address.zip_code, 'cep')}
                          onChange={(e) => handleChange('address.zip_code', e.target.value)}
                          onBlur={handleCepSearch}
                          placeholder="00000-000"
                          className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                        />
                        {isSearchingCep && (
                          <Loader2 size={14} className="absolute right-3 top-3.5 animate-spin text-brand-primary" />
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[13px] font-medium text-text-primary">Endereço / Logradouro</label>
                      <Input
                        value={form.address.street}
                        onChange={(e) => handleChange('address.street', e.target.value)}
                        placeholder="Nome da rua/avenida"
                        className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium text-text-primary">Número</label>
                      <Input
                        value={form.address.number}
                        onChange={(e) => handleChange('address.number', e.target.value)}
                        placeholder="Ex: 123"
                        className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium text-text-primary">Complemento</label>
                      <Input
                        value={form.address.complement}
                        onChange={(e) => handleChange('address.complement', e.target.value)}
                        placeholder="Bloco A, Sala 10"
                        className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium text-text-primary">Cidade</label>
                      <Input
                        value={form.address.city}
                        onChange={(e) => handleChange('address.city', e.target.value)}
                        className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium text-text-primary">Estado / UF</label>
                      <Input
                        value={form.address.state}
                        onChange={(e) => handleChange('address.state', e.target.value)}
                        placeholder="Ex: SP"
                        className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 max-w-xl animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-text-primary">Segmento de Mercado</label>
                    <Input
                      value={form.segment}
                      onChange={(e) => handleChange('segment', e.target.value)}
                      placeholder="Ex: Varejo, Tecnologia, Saúde"
                      className="h-10 rounded-lg bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-text-primary">Origem do Lead</label>
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
                    <label className="text-[13px] font-medium text-text-primary">Gestor da Conta (Responsável Interno)</label>
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
                    <label className="text-[13px] font-medium text-text-primary text-status-success">Status no CRM</label>
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
                <div className="space-y-6 max-w-xl animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-surface-muted/30">
                    <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                      <Upload size={24} />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-text-primary">Fazer upload de documentação</p>
                      <p className="text-xs text-text-muted mt-1">PDFs de Contratos, Briefings ou Propostas comerciais</p>
                    </div>
                    <Button variant="outline" size="sm" type="button" className="mt-4">
                      Selecionar Arquivos
                    </Button>
                    <p className="text-[10px] text-text-muted italic">Os documentos adicionais podem ser anexados na página de detalhes do cliente após a criação.</p>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6 max-w-xl animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-xl p-5">
                    <h4 className="text-sm font-semibold text-brand-primary mb-3">Resumo das Informações</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                      <div className="flex flex-col">
                        <span className="text-text-muted uppercase font-bold tracking-tighter mb-0.5">Nome / Razão</span>
                        <span className="text-text-primary font-medium truncate">{form.name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-text-muted uppercase font-bold tracking-tighter mb-0.5">Tipo</span>
                        <span className="text-text-primary font-medium">{form.type === 'pf' ? 'Individual (PF)' : 'Empresa (PJ)'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-text-muted uppercase font-bold tracking-tighter mb-0.5">Identificador</span>
                        <span className="text-text-primary font-mono">{form.type === 'pf' ? applyMask(form.cpf, 'cpf') : applyMask(form.cnpj, 'cnpj') || '—'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-text-muted uppercase font-bold tracking-tighter mb-0.5">Contato principal</span>
                        <span className="text-text-primary truncate">{form.email || '—'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-text-muted uppercase font-bold tracking-tighter mb-0.5">Gestor de Conta</span>
                        <span className="text-text-primary">{profiles.find(p => p.id === form.account_manager_id)?.full_name || 'Não atribuído'}</span>
                      </div>
                      {form.birth_date && (
                        <div className="flex flex-col">
                          <span className="text-text-muted uppercase font-bold tracking-tighter mb-0.5">Nascimento</span>
                          <span className="text-text-primary">{new Date(form.birth_date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
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
                </div>
              )}

              {error && (
                <p className="text-sm text-status-danger bg-status-danger/10 rounded-xl px-4 py-3 animate-in fade-in zoom-in duration-300">
                  {error}
                </p>
              )}
            </form>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between border-t border-border pt-6 mt-8">
            <Button 
               type="button" 
               variant="ghost" 
               onClick={() => step > 1 ? setStep((prev) => (prev - 1) as Step) : (isEdit && client ? router.push(`/dashboard/clients/${client.id}`) : router.push('/dashboard/clients'))} 
               disabled={isPending}
            >
              {step === 1 ? 'Cancelar' : <><ChevronLeft size={16} className="mr-2" /> Voltar</>}
            </Button>
            
            <div className="flex items-center gap-3">
              {step < 6 ? (
                <Button 
                  type="button" 
                  onClick={() => setStep((prev) => (prev + 1) as Step)}
                  className="bg-brand-primary hover:bg-brand-secondary text-white font-bold text-sm shadow-brand"
                >
                  Continuar <ChevronRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={isPending}
                  className="bg-brand-primary hover:bg-brand-secondary text-white font-bold text-sm shadow-brand min-w-[140px]"
                >
                  {isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : <Check size={16} className="mr-2" />}
                  {isPending ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Finalizar Cadastro'}
                </Button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

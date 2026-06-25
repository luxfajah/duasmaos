'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Client, ClientStatus, Profile, ClientAddress } from '@/types/database'
import { createClient_, updateClient } from '@/app/dashboard/clients/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Loader2,
  ChevronLeft,
  User,
  Building2,
  Search,
  MapPin,
  Phone,
  Briefcase,
  CheckCircle2
} from 'lucide-react'
import { createClient as createBrowserClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ClientFormProps {
  client?: Client & { client_addresses?: ClientAddress[] } | null
}

const STEPS = [
  { id: 'identificacao', title: 'Identificação', icon: User, desc: 'Dados principais do cliente' },
  { id: 'localizacao', title: 'Localização', icon: MapPin, desc: 'Endereço e CEP' },
  { id: 'contatos', title: 'Contatos', icon: Phone, desc: 'Telefones e e-mails' },
  { id: 'comercial', title: 'Comercial', icon: Briefcase, desc: 'Segmento e origens' }
]

export function ClientForm({ client }: ClientFormProps) {
  const isEdit = !!client
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isSearchingCep, setIsSearchingCep] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

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

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setError(null)
    
    // Validate only on final step submit
    if (currentStep !== STEPS.length - 1) {
      nextStep()
      return
    }

    if (!form.name.trim()) {
      setError('O nome é obrigatório.')
      setCurrentStep(0)
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

  function nextStep() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.back()
    }
  }

  // Field Wrapper Component
  const Field = ({ label, children, colSpan = 1 }: { label: string, children: React.ReactNode, colSpan?: number }) => (
    <div className={cn("flex flex-col gap-2", colSpan === 2 && "md:col-span-2")}>
      <label className="text-[13px] font-bold tracking-[0.06em] uppercase text-[#8A94A6] dark:text-[#A0AABF]">
        {label}
      </label>
      <div className="relative">
        {children}
      </div>
    </div>
  )

  const higInputClasses = "glass-pill border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/30 px-4 h-12 text-[15px] text-text-primary placeholder:text-text-muted/60 w-full transition-all duration-300"

  return (
    <form onSubmit={handleSubmit} className="relative pb-32 w-full max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-8">
      
      {/* ── Left Column: Stepper ── */}
      <div className="w-full lg:w-1/3 xl:w-1/4 shrink-0 z-20">
        <div className="glass-card-super p-6 rounded-[2rem] sticky top-24">
          
          <div className="flex flex-col gap-6 relative mt-12">
            {/* Progress line behind icons */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-black/[0.04] dark:bg-white/[0.08] -z-10" />

            {STEPS.map((step, idx) => {
              const Icon = step.icon
              const isActive = currentStep === idx
              const isPast = currentStep > idx

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={cn(
                    "flex items-start gap-4 text-left transition-all duration-300 group",
                    isActive ? "opacity-100" : "opacity-40 hover:opacity-70"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm",
                    isActive 
                      ? "bg-brand-primary text-white scale-110 shadow-brand-primary/20" 
                      : isPast 
                        ? "bg-olive text-white" 
                        : "bg-surface-primary text-text-muted border border-border"
                  )}>
                    {isPast ? <CheckCircle2 size={20} /> : <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />}
                  </div>
                  <div className="pt-1.5">
                    <p className={cn(
                      "text-sm font-bold tracking-wide uppercase",
                      isActive ? "text-brand-primary" : "text-text-primary"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-text-muted mt-1 font-medium">
                      {step.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {error && (
            <div className="mt-8 p-4 rounded-xl bg-status-danger/10 border border-status-danger/20 text-status-danger text-[13px] font-semibold flex flex-col gap-1">
              <span className="uppercase text-[10px] tracking-wider opacity-80">Erro</span>
              {error}
            </div>
          )}

        </div>
      </div>

      {/* ── Right Column: Form Carousel ── */}
      <div className="flex-1 w-full overflow-hidden relative">
        <div 
          className="flex transition-transform duration-700 ease-apple h-full"
          style={{ transform: `translateX(-${currentStep * 100}%)` }}
        >
          
          {/* STEP 0: IDENTIFICAÇÃO */}
          <div className="w-full shrink-0 px-2 lg:px-6">
            <div className="glass-card-super p-8 rounded-[2rem] h-full">
              <div className="mb-8 flex justify-center">
                <div className="flex items-center p-1 glass-pill rounded-[1.25rem] w-full max-w-sm">
                  <button
                    type="button"
                    onClick={() => handleChange('type', 'pf')}
                    className={cn(
                      "flex-1 flex justify-center items-center gap-2 py-2.5 rounded-2xl text-[14px] font-semibold transition-all select-none",
                      form.type === 'pf' ? 'glass-pill-active shadow-sm' : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    <User size={16} /> Individual (PF)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('type', 'pj')}
                    className={cn(
                      "flex-1 flex justify-center items-center gap-2 py-2.5 rounded-2xl text-[14px] font-semibold transition-all select-none",
                      form.type === 'pj' ? 'glass-pill-active shadow-sm' : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    <Building2 size={16} /> Empresa (PJ)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <Field label={form.type === 'pf' ? 'Nome Completo' : 'Razão Social'} colSpan={2}>
                  <Input
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder={form.type === 'pf' ? "Digite o nome completo" : "Razão social oficial"}
                    className={higInputClasses}
                    required={currentStep === STEPS.length - 1} // Only enforce on last step to avoid native tooltip interrupting carousel
                  />
                </Field>

                {form.type === 'pj' && (
                  <Field label="Nome Fantasia" colSpan={2}>
                    <Input
                      value={form.trade_name}
                      onChange={(e) => handleChange('trade_name', e.target.value)}
                      placeholder="Como a empresa é conhecida"
                      className={higInputClasses}
                    />
                  </Field>
                )}

                <Field label={form.type === 'pf' ? 'CPF' : 'CNPJ'}>
                  <Input
                    value={form.type === 'pf' ? applyMask(form.cpf, 'cpf') : applyMask(form.cnpj, 'cnpj')}
                    onChange={(e) => handleChange(form.type === 'pf' ? 'cpf' : 'cnpj', e.target.value)}
                    placeholder={form.type === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                    className={higInputClasses}
                  />
                </Field>

                <Field label={form.type === 'pf' ? 'Data de Nascimento' : 'Responsável Principal'}>
                  {form.type === 'pf' ? (
                    <Input
                      type="date"
                      value={form.birth_date}
                      onChange={(e) => handleChange('birth_date', e.target.value)}
                      className={higInputClasses}
                    />
                  ) : (
                    <Input
                      value={form.responsible_name}
                      onChange={(e) => handleChange('responsible_name', e.target.value)}
                      placeholder="Nome do contato chave"
                      className={higInputClasses}
                    />
                  )}
                </Field>
              </div>
            </div>
          </div>

          {/* STEP 1: LOCALIZAÇÃO */}
          <div className="w-full shrink-0 px-2 lg:px-6">
            <div className="glass-card-super p-8 rounded-[2rem] h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <Field label="CEP" colSpan={2}>
                  <div className="flex items-center gap-3">
                    <Input
                      value={applyMask(form.address.zip_code, 'cep')}
                      onChange={(e) => handleChange('address.zip_code', e.target.value)}
                      onBlur={handleCepSearch}
                      placeholder="00000-000"
                      className={higInputClasses}
                    />
                    <Button 
                      type="button" 
                      onClick={handleCepSearch}
                      disabled={isSearchingCep || form.address.zip_code.length < 8}
                      className="h-12 w-12 rounded-2xl bg-black/5 dark:bg-white/5 text-text-primary hover:bg-black/10 dark:hover:bg-white/10 shrink-0"
                    >
                      {isSearchingCep ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </Button>
                  </div>
                </Field>

                <Field label="Rua / Avenida" colSpan={2}>
                  <Input
                    value={form.address.street}
                    onChange={(e) => handleChange('address.street', e.target.value)}
                    placeholder="Nome do logradouro"
                    className={higInputClasses}
                  />
                </Field>

                <Field label="Número">
                  <Input
                    value={form.address.number}
                    onChange={(e) => handleChange('address.number', e.target.value)}
                    placeholder="Ex: 123, S/N"
                    className={higInputClasses}
                  />
                </Field>

                <Field label="Complemento">
                  <Input
                    value={form.address.complement}
                    onChange={(e) => handleChange('address.complement', e.target.value)}
                    placeholder="Apto, Sala, Bloco"
                    className={higInputClasses}
                  />
                </Field>

                <Field label="Cidade">
                  <Input
                    value={form.address.city}
                    onChange={(e) => handleChange('address.city', e.target.value)}
                    placeholder="Cidade"
                    className={higInputClasses}
                  />
                </Field>

                <Field label="Estado (UF)">
                  <Input
                    value={form.address.state}
                    onChange={(e) => handleChange('address.state', e.target.value)}
                    placeholder="Ex: SP"
                    maxLength={2}
                    className={cn(higInputClasses, "uppercase")}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* STEP 2: CONTATOS */}
          <div className="w-full shrink-0 px-2 lg:px-6">
            <div className="glass-card-super p-8 rounded-[2rem] h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <Field label="E-mail Principal" colSpan={2}>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contato@exemplo.com"
                    className={higInputClasses}
                  />
                </Field>

                <Field label="WhatsApp">
                  <Input
                    value={applyMask(form.whatsapp, 'phone')}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className={higInputClasses}
                  />
                </Field>

                <Field label="Telefone Fixo / Outro">
                  <Input
                    value={applyMask(form.phone, 'phone')}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(00) 0000-0000"
                    className={higInputClasses}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* STEP 3: COMERCIAL */}
          <div className="w-full shrink-0 px-2 lg:px-6">
            <div className="glass-card-super p-8 rounded-[2rem] h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                <Field label="Segmento de Mercado">
                  <Input
                    value={form.segment}
                    onChange={(e) => handleChange('segment', e.target.value)}
                    placeholder="Ex: Tecnologia, Varejo"
                    className={higInputClasses}
                  />
                </Field>

                <Field label="Website">
                  <Input
                    type="url"
                    value={form.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://"
                    className={higInputClasses}
                  />
                </Field>

                <Field label="Origem do Lead">
                  <Input
                    value={form.lead_source}
                    onChange={(e) => handleChange('lead_source', e.target.value)}
                    placeholder="Ex: Indicação, Instagram"
                    className={higInputClasses}
                  />
                </Field>

                <Field label="Account Manager">
                  <div className="relative">
                    <select
                      value={form.account_manager_id}
                      onChange={(e) => handleChange('account_manager_id', e.target.value)}
                      className={cn(higInputClasses, "appearance-none bg-transparent outline-none cursor-pointer")}
                    >
                      <option value="">Não atribuído</option>
                      {profiles.map(p => (
                        <option key={p.id} value={p.id}>{p.full_name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                      <ChevronLeft size={16} className="-rotate-90" />
                    </div>
                  </div>
                </Field>

                <Field label="Anotações Internas" colSpan={2}>
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Informações importantes, negociações..."
                    className={cn(higInputClasses, "py-4 min-h-[120px] resize-y rounded-[1.25rem]")}
                  />
                </Field>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Dynamic Top Navbar Title ── */}
      {mounted && document.getElementById('top-bar-center') && createPortal(
        <div className="flex items-center justify-center animate-in fade-in slide-in-from-top-4 duration-300">
          <h1 className="text-[13px] font-bold tracking-widest uppercase text-text-primary text-center">
            {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
        </div>,
        document.getElementById('top-bar-center')!
      )}

      {/* ── Floating Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-50 pointer-events-none flex justify-center">
        <div className="pointer-events-auto w-full max-w-2xl flex items-center justify-between glass-card-super p-3 rounded-[2rem] shadow-2xl border border-black/[0.04] dark:border-white/[0.08]">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={prevStep}
            disabled={isPending}
            className="rounded-full px-6 h-12 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 font-bold tracking-wide transition-all"
          >
            {currentStep === 0 ? 'Cancelar' : 'Voltar'}
          </Button>
          
          <div className="flex gap-2 items-center">
            {/* Little dots indicator for mobile */}
            <div className="flex lg:hidden gap-1.5 px-4">
              {STEPS.map((_, idx) => (
                <div key={idx} className={cn("w-2 h-2 rounded-full transition-all", currentStep === idx ? "bg-brand-primary w-4" : "bg-text-muted/30")} />
              ))}
            </div>

            <Button 
              type="submit" 
              disabled={isPending}
              className="rounded-full px-8 h-12 bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 active:scale-95 transition-all font-bold tracking-wide"
            >
              {isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                currentStep === STEPS.length - 1 ? (isEdit ? 'Salvar Alterações' : 'Finalizar Cadastro') : 'Próximo Passo'
              )}
            </Button>
          </div>
        </div>
      </div>

    </form>
  )
}

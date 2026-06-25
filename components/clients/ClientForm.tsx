'use client'

import { useState, useTransition, useEffect } from 'react'
import { Client, ClientStatus, Profile, ClientAddress } from '@/types/database'
import { createClient_, updateClient } from '@/app/dashboard/clients/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Loader2,
  ChevronLeft,
  User,
  Building2,
  Search
} from 'lucide-react'
import { createClient as createBrowserClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ClientFormProps {
  client?: Client & { client_addresses?: ClientAddress[] } | null
}

export function ClientForm({ client }: ClientFormProps) {
  const isEdit = !!client
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
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

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setError(null)
    if (!form.name.trim()) {
      setError('O nome é obrigatório.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })
  }

  // Helper component for HIG Form Rows
  const FormRow = ({ label, children, col = false }: { label: string, children: React.ReactNode, col?: boolean }) => (
    <div className={cn(
      "flex py-3 px-4 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0",
      col ? "flex-col gap-1 sm:gap-2" : "flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
    )}>
      <label className="sm:w-1/3 text-[15px] font-medium text-text-primary shrink-0">
        {label}
      </label>
      <div className="flex-1 w-full relative">
        {children}
      </div>
    </div>
  )

  const higInputClasses = "border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto text-[15px] text-text-secondary placeholder:text-text-muted/60 w-full rounded-none"

  return (
    <form onSubmit={handleSubmit} className="relative pb-24 max-w-3xl mx-auto min-h-[calc(100vh-200px)]">
      
      {/* ── Top Bar Navigation ── */}
      <div className="flex items-center gap-4 mb-8 sticky top-0 z-20 py-4 bg-background/80 backdrop-blur-xl -mx-4 px-4 sm:mx-0 sm:px-0">
        <Button 
          variant="ghost" 
          size="sm" 
          type="button"
          onClick={() => isEdit && client ? router.push(`/dashboard/clients/${client.id}`) : router.push('/dashboard/clients')}
          className="h-8 w-8 rounded-full p-0 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </Button>
        <h1 className="text-[22px] font-semibold text-text-primary tracking-tight">
          {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-status-danger/10 border border-status-danger/20 text-status-danger text-[14px] font-medium">
          {error}
        </div>
      )}

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ── Seção: TIPO DE CLIENTE ── */}
        <section>
          <div className="flex justify-center mb-4">
            <div className="flex items-center p-1 bg-black/5 dark:bg-white/5 rounded-[14px] w-full max-w-sm relative">
              <button
                type="button"
                onClick={() => handleChange('type', 'pf')}
                className={cn(
                  "flex-1 flex justify-center items-center gap-2 py-2 rounded-[10px] text-[14px] font-semibold transition-all select-none relative z-10",
                  form.type === 'pf' ? 'text-text-primary shadow-sm bg-white dark:bg-white/10' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <User size={16} /> Individual
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'pj')}
                className={cn(
                  "flex-1 flex justify-center items-center gap-2 py-2 rounded-[10px] text-[14px] font-semibold transition-all select-none relative z-10",
                  form.type === 'pj' ? 'text-text-primary shadow-sm bg-white dark:bg-white/10' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <Building2 size={16} /> Empresa
              </button>
            </div>
          </div>
        </section>

        {/* ── Seção: IDENTIFICAÇÃO ── */}
        <section>
          <h2 className="text-[12px] font-medium text-text-muted uppercase ml-4 mb-2 tracking-wider">Identificação</h2>
          <div className="bg-surface-primary/70 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-3xl saturate-150 rounded-2xl overflow-hidden shadow-sm">
            
            <FormRow label={form.type === 'pf' ? 'Nome Completo' : 'Razão Social'}>
              <Input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Obrigatório"
                className={higInputClasses}
                required
              />
            </FormRow>

            {form.type === 'pj' && (
              <FormRow label="Nome Fantasia">
                <Input
                  value={form.trade_name}
                  onChange={(e) => handleChange('trade_name', e.target.value)}
                  placeholder="Opcional"
                  className={higInputClasses}
                />
              </FormRow>
            )}

            <FormRow label={form.type === 'pf' ? 'CPF' : 'CNPJ'}>
              <Input
                value={form.type === 'pf' ? applyMask(form.cpf, 'cpf') : applyMask(form.cnpj, 'cnpj')}
                onChange={(e) => handleChange(form.type === 'pf' ? 'cpf' : 'cnpj', e.target.value)}
                placeholder={form.type === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                className={higInputClasses}
              />
            </FormRow>

            <FormRow label={form.type === 'pf' ? 'Data de Nascimento' : 'Responsável'}>
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
                  placeholder="Nome do contato principal"
                  className={higInputClasses}
                />
              )}
            </FormRow>

          </div>
        </section>

        {/* ── Seção: CONTATOS ── */}
        <section>
          <h2 className="text-[12px] font-medium text-text-muted uppercase ml-4 mb-2 tracking-wider">Contatos</h2>
          <div className="bg-surface-primary/70 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-3xl saturate-150 rounded-2xl overflow-hidden shadow-sm">
            
            <FormRow label="E-mail">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="exemplo@empresa.com"
                className={higInputClasses}
              />
            </FormRow>

            <FormRow label="Telefone">
              <Input
                value={applyMask(form.phone, 'phone')}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(00) 0000-0000"
                className={higInputClasses}
              />
            </FormRow>

            <FormRow label="WhatsApp">
              <Input
                value={applyMask(form.whatsapp, 'phone')}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="(00) 00000-0000"
                className={higInputClasses}
              />
            </FormRow>

          </div>
        </section>

        {/* ── Seção: ENDEREÇO ── */}
        <section>
          <h2 className="text-[12px] font-medium text-text-muted uppercase ml-4 mb-2 tracking-wider">Endereço</h2>
          <div className="bg-surface-primary/70 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-3xl saturate-150 rounded-2xl overflow-hidden shadow-sm">
            
            <FormRow label="CEP">
              <div className="flex items-center gap-2">
                <Input
                  value={applyMask(form.address.zip_code, 'cep')}
                  onChange={(e) => handleChange('address.zip_code', e.target.value)}
                  onBlur={handleCepSearch}
                  placeholder="00000-000"
                  className={higInputClasses}
                />
                {isSearchingCep && <Loader2 size={16} className="animate-spin text-brand-primary" />}
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCepSearch}
                  className="h-7 w-7 rounded-full p-0 text-brand-primary hover:bg-brand-primary/10"
                >
                  <Search size={14} />
                </Button>
              </div>
            </FormRow>

            <FormRow label="Rua / Avenida">
              <Input
                value={form.address.street}
                onChange={(e) => handleChange('address.street', e.target.value)}
                placeholder="Nome do logradouro"
                className={higInputClasses}
              />
            </FormRow>

            <FormRow label="Número">
              <Input
                value={form.address.number}
                onChange={(e) => handleChange('address.number', e.target.value)}
                placeholder="S/N"
                className={higInputClasses}
              />
            </FormRow>

            <FormRow label="Complemento">
              <Input
                value={form.address.complement}
                onChange={(e) => handleChange('address.complement', e.target.value)}
                placeholder="Apto, Sala, etc."
                className={higInputClasses}
              />
            </FormRow>

            <FormRow label="Cidade">
              <Input
                value={form.address.city}
                onChange={(e) => handleChange('address.city', e.target.value)}
                placeholder="Cidade"
                className={higInputClasses}
              />
            </FormRow>

            <FormRow label="Estado (UF)">
              <Input
                value={form.address.state}
                onChange={(e) => handleChange('address.state', e.target.value)}
                placeholder="Ex: SP"
                maxLength={2}
                className={cn(higInputClasses, "uppercase")}
              />
            </FormRow>

          </div>
        </section>

        {/* ── Seção: COMERCIAL E NOTAS ── */}
        <section>
          <h2 className="text-[12px] font-medium text-text-muted uppercase ml-4 mb-2 tracking-wider">Comercial & Informações Extras</h2>
          <div className="bg-surface-primary/70 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-3xl saturate-150 rounded-2xl overflow-hidden shadow-sm">
            
            <FormRow label="Segmento">
              <Input
                value={form.segment}
                onChange={(e) => handleChange('segment', e.target.value)}
                placeholder="Ex: Tecnologia, Varejo"
                className={higInputClasses}
              />
            </FormRow>

            <FormRow label="Website">
              <Input
                type="url"
                value={form.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://"
                className={higInputClasses}
              />
            </FormRow>

            <FormRow label="Origem do Lead">
              <Input
                value={form.lead_source}
                onChange={(e) => handleChange('lead_source', e.target.value)}
                placeholder="Ex: Instagram, Indicação"
                className={higInputClasses}
              />
            </FormRow>

            <FormRow label="Account Manager">
              <select
                value={form.account_manager_id}
                onChange={(e) => handleChange('account_manager_id', e.target.value)}
                className={cn(higInputClasses, "appearance-none bg-transparent outline-none")}
              >
                <option value="">Não atribuído</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </FormRow>

            <div className="flex flex-col gap-2 py-3 px-4">
              <label className="text-[15px] font-medium text-text-primary">
                Anotações Internas
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Escreva detalhes sobre negociações, etc..."
                className="w-full bg-transparent border-0 text-[15px] text-text-secondary placeholder:text-text-muted/60 focus:ring-0 resize-y min-h-[80px] outline-none"
              />
            </div>

          </div>
        </section>

      </div>

      {/* ── Sticky Bottom Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-black/5 dark:border-white/5 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between sm:justify-end gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.back()}
            disabled={isPending}
            className="rounded-full px-6 text-text-secondary hover:text-text-primary hover:bg-black/5"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isPending}
            className="rounded-full px-8 bg-brand-primary text-white shadow-md active:scale-95 transition-all"
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              isEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'
            )}
          </Button>
        </div>
      </div>

    </form>
  )
}

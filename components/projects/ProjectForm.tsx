'use client'

import { useState, useTransition, useEffect } from 'react'
import { V2Project, ProjectStatusV2, Priority, ProductTemplate } from '@/types/database'
import { updateProject, createProjectV3 } from '@/app/dashboard/projects/actions'
import { getProductTemplates } from '@/app/dashboard/products/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Loader2,
  ChevronLeft,
  Settings,
  Calendar,
  DollarSign,
  Users,
  Info,
  CheckCircle2,
  Briefcase,
  AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ProjectFormProps {
  project?: V2Project | null
  clients: { id: string; name: string }[]
  team: { id: string; full_name: string }[]
  initialTemplateId?: string
  initialClientId?: string
}

const STEPS = [
  { id: 'config', title: 'Configuração Inicial', icon: Settings, desc: 'Cliente e Template base' },
  { id: 'details', title: 'Detalhes do Projeto', icon: Info, desc: 'Prazos e Responsáveis' },
  { id: 'finance', title: 'Financeiro', icon: DollarSign, desc: 'Cobrança e Valores' }
]

export function ProjectForm({ project, clients, team, initialTemplateId, initialClientId }: ProjectFormProps) {
  const isEdit = !!project
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<ProductTemplate[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    getProductTemplates().then(setTemplates)
  }, [])

  const [form, setForm] = useState({
    name: project?.name ?? '',
    client_id: project?.client_id ?? initialClientId ?? '',
    template_id: initialTemplateId ?? '',
    project_type: 'one_time' as 'one_time' | 'recurring',
    amount: 0,
    payment_type: 'one_time' as 'one_time' | 'recurring',
    billing_day: 5,
    auto_restart: false,
    start_date: new Date().toISOString().split('T')[0],
    owner_id: '',
    status: (project?.status ?? 'active') as ProjectStatusV2,
    priority: 'medium' as Priority,
    deadline: project?.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
  })

  // Auto-fill project name when templates are loaded and client/template are preselected
  useEffect(() => {
    if (templates.length > 0) {
      const templateIdVal = form.template_id || initialTemplateId
      const clientIdVal = form.client_id || initialClientId
      const selectedTemplate = templates.find(t => t.id === templateIdVal)
      const selectedClient = clients.find(c => c.id === clientIdVal)

      if (selectedTemplate && selectedClient && !form.name) {
        setForm(prev => ({
          ...prev,
          name: `${selectedTemplate.name} - ${selectedClient.name}`
        }))
      }
    }
  }, [templates, initialTemplateId, initialClientId, clients])

  function handleChange(field: keyof typeof form, value: any) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value }

      // Auto-fill logic when template, client, or start date changes
      if (field === 'template_id' || field === 'client_id' || field === 'start_date') {
        const templateIdVal = field === 'template_id' ? value : prev.template_id
        const clientIdVal = field === 'client_id' ? value : prev.client_id
        
        const selectedTemplate = templates.find(t => t.id === templateIdVal)
        const selectedClient = clients.find(c => c.id === clientIdVal)

        // 1. Auto-fill project name
        if (selectedTemplate && selectedClient) {
          const currentName = prev.name.trim()
          const isDefaultOrEmpty = !currentName || 
            currentName === '' || 
            templates.some(t => currentName.startsWith(`${t.name} -`))
          
          if (isDefaultOrEmpty) {
            updated.name = `${selectedTemplate.name} - ${selectedClient.name}`
          }
        }

        // 2. Auto-fill billing types and amounts
        if (selectedTemplate && field === 'template_id') {
          const templateNameLower = selectedTemplate.name.toLowerCase()
          const isRecurring = templateNameLower.includes('recorrente') || templateNameLower.includes('social media')
          
          updated.project_type = isRecurring ? 'recurring' : 'one_time'
          updated.payment_type = isRecurring ? 'recurring' : 'one_time'
          
          if (selectedTemplate.base_price && Number(selectedTemplate.base_price) > 0) {
            updated.amount = Number(selectedTemplate.base_price)
          }
        }

        // 3. Auto-calculate deadline
        if (selectedTemplate) {
          const templateNameLower = selectedTemplate.name.toLowerCase()
          let durationDays = 30
          
          const match = selectedTemplate.name.match(/(\d+)\s*(Dias|dias|Days|days)/)
          if (match) {
            durationDays = parseInt(match[1], 10)
          } else if (templateNameLower.includes('site') || templateNameLower.includes('website')) {
            durationDays = 60
          } else if (templateNameLower.includes('consultoria')) {
            durationDays = 30
          }

          const baseStartDate = updated.start_date ? new Date(updated.start_date) : new Date()
          if (!isNaN(baseStartDate.getTime())) {
            const deadlineDate = new Date(baseStartDate.getTime())
            deadlineDate.setDate(deadlineDate.getDate() + durationDays)
            updated.deadline = deadlineDate.toISOString().split('T')[0]
          }
        }
      }

      return updated
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        let result: any;
        if (isEdit && project) {
          result = await updateProject(project.id, {
            name: form.name,
            status: form.status,
            deadline: form.deadline || null,
          })
        } else {
          if (!form.name || !form.client_id || !form.template_id) {
            setError('Por favor, preencha todos os campos obrigatórios (*).')
            return
          }

          result = await createProjectV3({
            name: form.name,
            client_id: form.client_id,
            template_id: form.template_id,
            project_type: form.project_type,
            amount: form.amount,
            payment_type: form.payment_type as any,
            billing_day: form.billing_day,
            auto_restart: form.auto_restart,
            start_date: form.start_date,
            deadline: form.deadline || undefined,
            owner_id: form.owner_id || undefined,
          })
        }

        if (result && !result.success) {
          setError(result.error)
          return
        }

        router.push('/dashboard/projects')
        router.refresh()
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao salvar o projeto.')
      }
    })
  }

  // Prevents hydration mismatch for dates and icons
  if (!mounted) return null

  const isLastStep = currentStep === STEPS.length - 1

  function nextStep() {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1)
  }

  function prevStep() {
    if (currentStep > 0) setCurrentStep(c => c - 1)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {error && (
        <div className="flex items-center gap-2 text-status-danger bg-status-danger/10 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Stepper Sidebar */}
        <div className="lg:w-72 shrink-0">
          <div className="glass-card p-4 sticky top-24">
            <div className="space-y-2">
              {STEPS.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === index
                const isPast = currentStep > index

                return (
                  <div
                    key={step.id}
                    onClick={() => {
                      if (isPast || isActive) setCurrentStep(index)
                    }}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-xl transition-all duration-300",
                      isActive ? "bg-white dark:bg-white/10 shadow-sm border border-black/5 dark:border-white/10" : "hover:bg-black/5 dark:hover:bg-white/5 border border-transparent",
                      (isPast || isActive) ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      isActive ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20" : 
                      isPast ? "bg-status-success/20 text-status-success" : 
                      "bg-black/5 dark:bg-white/5 text-text-muted"
                    )}>
                      {isPast ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                    </div>
                    <div>
                      <p className={cn("text-sm font-bold", isActive ? "text-text-primary" : "text-text-secondary")}>
                        {step.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Form Content Area */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 min-h-[500px] flex flex-col">
            
            <div className="flex-1">
              {/* STEP 1: CONFIGURATION */}
              {currentStep === 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-4">
                    <Settings className="text-brand-primary" size={20} />
                    Configuração Inicial
                  </h2>
                  
                  {!isEdit && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-secondary ml-1">
                          Cliente <span className="text-brand-primary">*</span>
                        </label>
                        <select
                          required
                          value={form.client_id}
                          onChange={(e) => handleChange('client_id', e.target.value)}
                          className="w-full h-12 px-4 rounded-xl glass-input bg-black/5 dark:bg-white/5 text-text-primary font-medium border-transparent focus:ring-2 focus:ring-brand-primary/50 outline-none appearance-none cursor-pointer"
                        >
                          <option value="">Selecione um cliente...</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-secondary ml-1">
                          Template do Projeto <span className="text-brand-primary">*</span>
                        </label>
                        <select
                          required
                          value={form.template_id}
                          onChange={(e) => handleChange('template_id', e.target.value)}
                          className="w-full h-12 px-4 rounded-xl glass-input bg-black/5 dark:bg-white/5 text-text-primary font-medium border-transparent focus:ring-2 focus:ring-brand-primary/50 outline-none appearance-none cursor-pointer"
                        >
                          <option value="">Selecione um template base...</option>
                          {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <p className="text-xs text-text-muted mt-2 ml-2 flex items-center gap-1.5">
                          <Info size={14} className="text-brand-primary/70" /> O template preencherá as datas e o financeiro automaticamente.
                        </p>
                      </div>
                    </>
                  )}
                  {isEdit && (
                    <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-sm text-text-secondary flex items-start gap-3">
                      <Info className="text-brand-primary shrink-0 mt-0.5" size={16} />
                      Não é possível alterar o cliente ou template base de um projeto já criado.
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-4">
                    <Info className="text-brand-primary" size={20} />
                    Detalhes do Projeto
                  </h2>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary ml-1">
                      Nome do Projeto <span className="text-brand-primary">*</span>
                    </label>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Ex: Landing Page - Empresa X"
                      className="h-12 rounded-xl bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-brand-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-text-secondary ml-1">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full h-12 px-4 rounded-xl glass-input bg-black/5 dark:bg-white/5 text-text-primary font-medium border-transparent focus:ring-2 focus:ring-brand-primary/50 outline-none appearance-none cursor-pointer"
                      >
                        <option value="active">Ativo (Em andamento)</option>
                        <option value="paused">Pausado</option>
                        <option value="completed">Finalizado</option>
                        <option value="archived">Arquivado</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-text-secondary ml-1">Prioridade</label>
                      <select
                        value={form.priority}
                        onChange={(e) => handleChange('priority', e.target.value)}
                        disabled={isEdit}
                        className="w-full h-12 px-4 rounded-xl glass-input bg-black/5 dark:bg-white/5 text-text-primary font-medium border-transparent focus:ring-2 focus:ring-brand-primary/50 outline-none appearance-none disabled:opacity-50 cursor-pointer"
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-text-secondary ml-1 flex items-center gap-1.5">
                        <Calendar size={14} className="text-text-muted" /> Data de Início
                      </label>
                      <Input
                        type="date"
                        required
                        disabled={isEdit}
                        value={form.start_date}
                        onChange={(e) => handleChange('start_date', e.target.value)}
                        className="h-12 rounded-xl bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-brand-primary/50 disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-text-secondary ml-1 flex items-center gap-1.5">
                        <Calendar size={14} className="text-text-muted" /> Prazo Estimado (Deadline)
                      </label>
                      <Input
                        type="date"
                        value={form.deadline}
                        onChange={(e) => handleChange('deadline', e.target.value)}
                        className="h-12 rounded-xl bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-brand-primary/50"
                      />
                    </div>

                    {!isEdit && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-text-secondary ml-1 flex items-center gap-1.5">
                          <Users size={14} className="text-text-muted" /> Responsável
                        </label>
                        <select
                          value={form.owner_id}
                          onChange={(e) => handleChange('owner_id', e.target.value)}
                          className="w-full h-12 px-4 rounded-xl glass-input bg-black/5 dark:bg-white/5 text-text-primary font-medium border-transparent focus:ring-2 focus:ring-brand-primary/50 outline-none appearance-none cursor-pointer"
                        >
                          <option value="">Não atribuído</option>
                          {team.map(member => (
                            <option key={member.id} value={member.id}>{member.full_name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: FINANCE */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-4">
                    <DollarSign className="text-brand-primary" size={20} />
                    Financeiro
                  </h2>

                  {isEdit ? (
                    <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-sm text-text-secondary flex items-start gap-3">
                      <Info className="text-brand-primary shrink-0 mt-0.5" size={16} />
                      Os dados financeiros são configurados apenas na criação do projeto.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-secondary ml-1">Valor do Projeto (R$)</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.amount}
                          onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                          className="h-12 rounded-xl bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-brand-primary/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-secondary ml-1">Tipo de Pagamento</label>
                        <select
                          value={form.payment_type}
                          onChange={(e) => handleChange('payment_type', e.target.value)}
                          className="w-full h-12 px-4 rounded-xl glass-input bg-black/5 dark:bg-white/5 text-text-primary font-medium border-transparent focus:ring-2 focus:ring-brand-primary/50 outline-none appearance-none cursor-pointer"
                        >
                          <option value="one_time">Único (One-time)</option>
                          <option value="recurring">Recorrente (Mensal)</option>
                        </select>
                      </div>

                      {form.payment_type === 'recurring' && (
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-text-secondary ml-1">Dia de Cobrança</label>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            value={form.billing_day}
                            onChange={(e) => handleChange('billing_day', parseInt(e.target.value) || 1)}
                            className="h-12 rounded-xl bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-brand-primary/50"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="pt-8 mt-8 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0 || isPending}
                className="h-12 px-6 rounded-xl border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 font-medium transition-colors"
              >
                Voltar
              </Button>

              {isLastStep ? (
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="h-12 px-8 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold shadow-lg shadow-brand-primary/20 flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isPending ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {isPending ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Criar Projeto')}
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="h-12 px-8 rounded-xl bg-text-primary text-background hover:bg-text-secondary font-bold shadow-lg flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  Próximo Passo
                </Button>
              )}
            </div>
            
          </form>
        </div>
      </div>
    </div>
  )
}

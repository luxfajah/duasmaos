'use client'

import { useState, useTransition } from 'react'
import { V2Project, ProjectStatusV2, WorkflowTypeV2, Priority, ProductTemplate } from '@/types/database'
import { updateProject, createProjectV3 } from '@/app/dashboard/projects/actions'
import { getProductTemplates } from '@/app/dashboard/products/actions'
import { useEffect } from 'react'
import { Calendar, DollarSign, Layers, Users, Info, Settings, RefreshCw, FileText, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ProjectModalProps {
  project?: V2Project | null
  clients: { id: string; name: string }[]
  team: { id: string; full_name: string }[]
  onClose: () => void
  templateId?: string
}

export function ProjectModal({ project, clients, team, onClose, templateId }: ProjectModalProps) {
  const isEdit = !!project
  const [isPending, startTransition] = useTransition()
  const [templates, setTemplates] = useState<ProductTemplate[]>([])
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: project?.name ?? '',
    client_id: project?.client_id ?? '',
    template_id: templateId ?? '',
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

  useEffect(() => {
    getProductTemplates().then(setTemplates)
  }, [])

  function handleChange(field: keyof typeof form, value: any) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value }

      // When template_id, client_id, or start_date changes, execute smart auto-fills
      if (field === 'template_id' || field === 'client_id' || field === 'start_date') {
        const templateIdVal = field === 'template_id' ? value : prev.template_id
        const clientIdVal = field === 'client_id' ? value : prev.client_id
        
        const selectedTemplate = templates.find(t => t.id === templateIdVal)
        const selectedClient = clients.find(c => c.id === clientIdVal)

        // 1. Auto-fill project name if it follows the default pattern
        if (selectedTemplate && selectedClient) {
          const currentName = prev.name.trim()
          // Check if name is empty or matches an existing template name pattern
          const isDefaultOrEmpty = !currentName || 
            currentName === '' || 
            templates.some(t => currentName.startsWith(`${t.name} -`))
          
          if (isDefaultOrEmpty) {
            updated.name = `${selectedTemplate.name} - ${selectedClient.name}`
          }
        }

        // 2. Auto-fill project_type and payment_type based on template attributes
        if (selectedTemplate && field === 'template_id') {
          const templateNameLower = selectedTemplate.name.toLowerCase()
          const isRecurring = templateNameLower.includes('recorrente') || templateNameLower.includes('social media')
          
          updated.project_type = isRecurring ? 'recurring' : 'one_time'
          updated.payment_type = isRecurring ? 'recurring' : 'one_time'
          
          if (selectedTemplate.base_price && Number(selectedTemplate.base_price) > 0) {
            updated.amount = Number(selectedTemplate.base_price)
          }
        }

        // 3. Auto-calculate deadline based on template duration
        if (selectedTemplate) {
          const templateNameLower = selectedTemplate.name.toLowerCase()
          let durationDays = 30 // default
          
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
        if (isEdit && project) {
          await updateProject(project.id, {
            name: form.name,
            status: form.status,
            deadline: form.deadline || null,
          })
        } else {
          if (!form.name || !form.client_id || !form.template_id) {
            setError('Por favor, preencha todos os campos obrigatórios (*).')
            return
          }

          await createProjectV3({
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
        onClose()
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao salvar o projeto.')
      }
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl p-0 overflow-hidden border-none shadow-2xl bg-surface">
        <DialogHeader className="border-b border-border p-6 pt-8 bg-surface">
          <DialogTitle className="flex items-center gap-2 text-xl font-black font-heading">
            {isEdit ? 'Editar Projeto' : 'Configurar Novo Projeto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh] overflow-hidden bg-surface">
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            
            {/* Split layout: Horizontal side-by-side columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Basic Info & Team/Deadlines */}
              <div className="space-y-6">
                {/* Section 1: Basic Info */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-brand-primary mb-2">
                    <Info size={16} />
                    <h3 className="text-xs font-black uppercase tracking-wider">Informações Básicas</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase">Nome do projeto *</label>
                        <Input
                          value={form.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Ex: Branding Duas Mãos"
                          className="h-11"
                          disabled={isPending}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase">Status do Projeto</label>
                        <select
                          value={form.status}
                          onChange={(e) => handleChange('status', e.target.value)}
                          className="w-full h-11 px-3 py-2 text-sm rounded-xl border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 font-medium"
                          disabled={isPending}
                        >
                          <option value="active">Ativo / Em Andamento</option>
                          <option value="paused">Pausado</option>
                          <option value="completed">Concluído</option>
                          <option value="archived">Arquivado</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase">Cliente *</label>
                        <select
                          value={form.client_id}
                          onChange={(e) => handleChange('client_id', e.target.value)}
                          className="w-full h-11 px-3 py-2 text-sm rounded-xl border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                        >
                          <option value="">Selecionar cliente</option>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase">Template de Produto *</label>
                        <select
                          value={form.template_id}
                          onChange={(e) => handleChange('template_id', e.target.value)}
                          className="w-full h-11 px-3 py-2 text-sm rounded-xl border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                        >
                          <option value="">Selecionar template</option>
                          {templates.map(t => {
                            const templateNameLower = t.name.toLowerCase()
                            const isRecurring = templateNameLower.includes('recorrente') || templateNameLower.includes('social media')
                            return (
                              <option key={t.id} value={t.id}>
                                {t.name} {isRecurring ? '🔁' : '👤'}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 2: Team and Deadlines */}
                <section className="space-y-4 pt-4 border-t border-border/60">
                  <div className="flex items-center gap-2 text-brand-primary mb-2">
                    <FileText size={16} />
                    <h3 className="text-xs font-black uppercase tracking-wider">Time e Prazos</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase">Data de Início</label>
                      <Input
                        type="date"
                        value={form.start_date}
                        onChange={(e) => handleChange('start_date', e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase text-terracotta">Prazo Final (Deadline)</label>
                      <Input
                        type="date"
                        value={form.deadline}
                        onChange={(e) => handleChange('deadline', e.target.value)}
                        className="h-11 border-terracotta/20 focus:ring-terracotta/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase">Gestor do Projeto</label>
                    <select
                      value={form.owner_id}
                      onChange={(e) => handleChange('owner_id', e.target.value)}
                      className="w-full h-11 px-3 py-2 text-sm rounded-xl border border-border bg-surface text-text-primary"
                    >
                      <option value="">Selecionar gestor</option>
                      {team.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                    </select>
                  </div>
                </section>
              </div>

              {/* Right Column: Financial & Template Preview */}
              <div className="space-y-6">
                {/* Section 3: Financial configuration */}
                <section className="space-y-4 p-5 bg-surface-muted/30 rounded-2xl border border-border/60">
                  <div className="flex items-center gap-2 text-brand-primary mb-2">
                    <DollarSign size={16} />
                    <h3 className="text-xs font-black uppercase tracking-wider">Configuração Financeira</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase">Valor do Projeto / Parcela</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">R$</span>
                        <Input
                          type="number"
                          value={form.amount}
                          onChange={(e) => handleChange('amount', e.target.value)}
                          className="h-11 pl-10"
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase">Tipo de Faturamento</label>
                      <select
                        value={form.project_type}
                        onChange={(e) => handleChange('project_type', e.target.value)}
                        className="w-full h-11 px-3 py-2 text-sm rounded-xl border border-border bg-surface text-text-primary focus:outline-none"
                      >
                        <option value="one_time">Projeto Único</option>
                        <option value="recurring">Mensalidade (Recorrente)</option>
                      </select>
                    </div>
                  </div>

                  {form.project_type === 'recurring' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase">Dia de Vencimento</label>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          value={form.billing_day}
                          onChange={(e) => handleChange('billing_day', e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id="auto-restart"
                          checked={form.auto_restart}
                          onChange={(e) => handleChange('auto_restart', e.target.checked)}
                          className="h-4 w-4 rounded border-border text-brand-primary"
                        />
                        <label htmlFor="auto-restart" className="text-xs font-bold text-text-primary cursor-pointer flex items-center gap-1">
                          <RefreshCw size={12} /> Reiniciar ciclo
                        </label>
                      </div>
                    </div>
                  )}
                </section>

                {/* Template Preview Panel */}
                {form.template_id && (() => {
                  const selectedTemplate = templates.find(t => t.id === form.template_id)
                  if (!selectedTemplate) return null
                  
                  const templateNameLower = selectedTemplate.name.toLowerCase()
                  const isRecurring = templateNameLower.includes('recorrente') || templateNameLower.includes('social media')
                  let estimatedDuration = 30
                  
                  const match = selectedTemplate.name.match(/(\d+)\s*(Dias|dias|Days|days)/)
                  if (match) {
                    estimatedDuration = parseInt(match[1], 10)
                  } else if (templateNameLower.includes('site') || templateNameLower.includes('website')) {
                    estimatedDuration = 60
                  }

                  return (
                    <div className="p-5 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 text-xs text-text-secondary space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-primary uppercase tracking-wider text-[10px]">Visualização do Produto</span>
                        <span className="px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary font-black uppercase text-[9px] tracking-tight">
                          {selectedTemplate.category || 'Geral'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <span className="text-[10px] text-text-muted uppercase font-bold block mb-0.5">Duração Estimada</span>
                          <span className="font-black text-text-primary text-sm">{estimatedDuration} dias</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-text-muted uppercase font-bold block mb-0.5">Faturamento</span>
                          <span className="font-black text-text-primary text-sm">
                            {isRecurring ? 'Recorrente (Mensal)' : 'Projeto Único'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-text-muted italic pt-2 border-t border-brand-primary/10">
                        * Ao criar, as etapas e tarefas com seus respectivos prazos sequenciais serão gerados automaticamente.
                      </p>
                    </div>
                  )
                })()}
              </div>

            </div>

            {error && (
              <p className="text-sm text-status-danger bg-status-danger/10 rounded-xl px-4 py-3 font-medium flex items-center gap-2 mt-6">
                <AlertCircle size={14} /> {error}
              </p>
            )}
          </div>

          <DialogFooter className="p-6 border-t border-border bg-surface-muted/20">
            {/* Click closes the modal, ensuring return/cancel works */}
            <Button type="button" variant="ghost" onClick={onClose} className="h-11 px-6 rounded-xl font-bold" disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" className="h-11 px-8 rounded-xl font-bold" disabled={isPending}>
              {isPending ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Projeto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { V2Project, ProjectStatusV2, WorkflowTypeV2, Priority, ProductTemplate } from '@/types/database'
import { createProjectV3, updateProject } from '@/app/dashboard/projects/actions'
import { getProductTemplates } from '@/app/dashboard/templates/actions'
import { useEffect } from 'react'
import { Calendar, DollarSign, Layers, Users, Info, Settings, RefreshCw, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProjectTypeSelect } from '@/components/projects/ProjectTypeSelect'

interface ProjectModalProps {
  project?: V2Project | null
  clients: { id: string; name: string }[]
  team: { id: string; full_name: string }[]
  onClose: () => void
}

export function ProjectModal({ project, clients, team, onClose }: ProjectModalProps) {
  const isEdit = !!project
  const [isPending, startTransition] = useTransition()
  const [templates, setTemplates] = useState<ProductTemplate[]>([])
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: project?.name ?? '',
    client_id: project?.client_id ?? '',
    template_id: '',
    project_type: 'one_time' as 'one_time' | 'recurring',
    amount: 0,
    payment_type: 'one_time' as 'one_time' | 'recurring',
    billing_day: 5,
    auto_restart: false,
    start_date: new Date().toISOString().split('T')[0],
    owner_id: '',
    status: (project?.status ?? 'active') as ProjectStatusV2,
    priority: 'medium' as Priority,
  })

  useEffect(() => {
    getProductTemplates().then(setTemplates)
  }, [])

  function handleChange(field: keyof typeof form, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.name.trim()) {
      setError('O nome do projeto é obrigatório.')
      return
    }
    if (!form.template_id && !isEdit) {
      setError('Selecione um template de produto.')
      return
    }
    
    startTransition(async () => {
      try {
        if (isEdit && project) {
          await updateProject(project.id, {
            name: form.name,
            status: form.status as any,
          } as any)
        } else {
          await createProjectV3({
            ...form,
            amount: Number(form.amount),
            billing_day: Number(form.billing_day)
          })
        }
        onClose()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar projeto.')
      }
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-black font-heading">
            {isEdit ? 'Editar Projeto' : 'Configurar Novo Projeto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
            
            {/* Secção 1: Dados Básicos */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-brand-primary mb-2">
                <Info size={16} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Informações Básicas</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">Nome do projeto *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Ex: Branding Duas Mãos"
                    className="h-11 bg-surface-muted/30"
                    disabled={isPending}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase">Cliente *</label>
                    <select
                      value={form.client_id}
                      onChange={(e) => handleChange('client_id', e.target.value)}
                      className="w-full h-11 px-3 py-2 text-sm rounded-xl border border-border bg-surface-muted/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
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
                      className="w-full h-11 px-3 py-2 text-sm rounded-xl border border-border bg-surface-muted/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    >
                      <option value="">Selecionar template</option>
                      {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.type === 'recurring' ? '🔁' : '👤'})</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Secção 2: Financeiro e Recorrência */}
            <section className="space-y-4 p-4 bg-surface-muted/20 rounded-2xl border border-border/50">
              <div className="flex items-center gap-2 text-brand-primary mb-2">
                <DollarSign size={16} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Configuração Financeira</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
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
                      <RefreshCw size={12} /> Reiniciar ciclo automaticamente
                    </label>
                  </div>
                </div>
              )}
            </section>

            {/* Secção 3: Equipe e Documentos */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-brand-primary mb-2">
                <FileText size={16} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Time e Documentação</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="p-4 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 bg-surface-muted/10 group hover:border-brand-primary/50 transition-colors cursor-pointer">
                <span className="text-2xl opacity-50">📄</span>
                <span className="text-xs font-bold text-text-secondary group-hover:text-brand-primary">Anexar Contrato ou Briefing</span>
                <span className="text-[10px] text-text-muted">PDF, DOCX ou Imagens (Max 10MB)</span>
              </div>
            </section>

            {error && (
              <p className="text-sm text-status-danger bg-status-danger/10 rounded-xl px-4 py-3 font-medium flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </p>
            )}
          </div>

          <DialogFooter className="p-6 border-t border-border bg-surface-muted/20">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending} className="h-11 px-6 rounded-xl font-bold">
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="h-11 px-8 rounded-xl font-bold shadow-brand/20">
              {isPending ? 'Criando...' : isEdit ? 'Salvar Alterações' : 'Finalizar e Criar Projeto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

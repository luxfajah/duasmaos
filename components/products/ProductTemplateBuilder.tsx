'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { syncProductTemplate, createProductTemplate, ProductTemplateData } from '@/app/dashboard/products/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trash2, GripVertical, Check, Save } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskType = 'task' | 'checklist' | 'approval'
type ProductType = 'service' | 'recurring' | 'sprint'

interface TaskTemplate {
  id?: string
  title: string
  role: string
  deadline: string
  type: TaskType
  required: boolean
}

interface Stage {
  id?: string
  name: string
  duration: number
  autoStart: boolean
  tasks: TaskTemplate[]
}

interface Rules {
  autoStartNext: boolean
  bufferDays: number
  repeatOnRevision: boolean
  clientParticipation: boolean
}

// ─── Constants & Helpers ───────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  task: 'Tarefa',
  checklist: 'Checklist',
  approval: 'Aprovação',
}

const TASK_TYPE_STYLES: Record<TaskType, string> = {
  task: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  checklist: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  approval: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
}

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  service: 'Serviço',
  recurring: 'Recorrente',
  sprint: 'Sprint',
}

const ROLES = ['Redator', 'Design', 'Estrategista', 'Gestor', 'Cliente', 'Dev', 'Social Media']

// ─── UI Components ────────────────────────────────────────────────────────────

function SurfaceCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col transition-all duration-200',
      className
    )}>
      {children}
    </div>
  )
}

function CompactToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-all duration-200 outline-none',
        checked ? 'bg-brand-primary' : 'bg-border'
      )}
    >
      <span className={cn(
        'pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5',
        checked ? 'translate-x-3.5' : 'translate-x-0.5'
      )} />
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-1.5 h-4 rounded-full bg-brand-primary shrink-0" />
      <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-text-muted font-body">
        {children}
      </span>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const TaskRow = React.memo(function TaskRow({
  task,
  onChange,
  onRemove,
}: {
  task: TaskTemplate
  onChange: (t: TaskTemplate) => void
  onRemove: () => void
}) {
  return (
    <div className="group flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface-muted/50 transition-all duration-150 border border-transparent hover:border-border/40">
      <GripVertical size={14} className="text-text-muted/30 cursor-grab active:cursor-grabbing shrink-0" />

      <input
        value={task.title}
        onChange={(e) => onChange({ ...task, title: e.target.value })}
        placeholder="Título da tarefa..."
        className="flex-1 min-w-0 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none"
      />

      <select
        value={task.role}
        onChange={(e) => onChange({ ...task, role: e.target.value })}
        className="bg-transparent text-xs text-text-secondary outline-none cursor-pointer hover:text-text-primary transition-colors w-28 border-none p-0"
      >
        {ROLES.map((r) => (
          <option key={r} value={r} className="bg-surface text-text-primary">{r}</option>
        ))}
      </select>

      <input
        value={task.deadline}
        onChange={(e) => onChange({ ...task, deadline: e.target.value })}
        placeholder="D+1"
        className="w-12 bg-transparent text-xs text-brand-primary font-mono text-center outline-none"
      />

      <select
        value={task.type}
        onChange={(e) => onChange({ ...task, type: e.target.value as TaskType })}
        className={cn(
          'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase transition-colors outline-none cursor-pointer border',
          TASK_TYPE_STYLES[task.type]
        )}
      >
        {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((t) => (
          <option key={t} value={t} className="bg-surface text-text-primary">{TASK_TYPE_LABELS[t]}</option>
        ))}
      </select>

      <div className="flex items-center gap-2 mr-1">
        <CompactToggle checked={task.required} onChange={(v) => onChange({ ...task, required: v })} />
        <span className="text-[10px] text-text-muted font-bold min-w-[24px] uppercase">{task.required ? 'Req' : 'Opt'}</span>
      </div>

      <button
        onClick={onRemove}
        className="text-text-muted/30 hover:text-status-danger p-1.5 transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
})

const StageCard = React.memo(function StageCard({
  stage,
  index,
  isActive,
  onSelect,
  onUpdate,
  onRemove,
  onMove,
}: {
  stage: Stage
  index: number
  isActive: boolean
  onSelect: () => void
  onUpdate: (s: Stage) => void
  onRemove: () => void
  onMove: (dir: number) => void
}) {
  const addTask = useCallback(() => {
    const newTask: TaskTemplate = {
      title: '',
      role: ROLES[0],
      deadline: `D+${stage.tasks.length + 1}`,
      type: 'task',
      required: false,
    }
    onUpdate({ ...stage, tasks: [...stage.tasks, newTask] })
  }, [stage, onUpdate])

  const updateTask = useCallback((idx: number, updated: TaskTemplate) => {
    const next = [...stage.tasks]
    next[idx] = updated
    onUpdate({ ...stage, tasks: next })
  }, [stage, onUpdate])

  const removeTask = useCallback((idx: number) => {
    onUpdate({ ...stage, tasks: stage.tasks.filter((_, i) => i !== idx) })
  }, [stage, onUpdate])

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group flex flex-col min-h-[440px] max-h-[600px] rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden',
        isActive
          ? 'bg-surface shadow-xl border-brand-primary ring-1 ring-brand-primary/20 scale-[1.01]'
          : 'bg-surface/40 hover:bg-surface border-border hover:border-border-strong shadow-sm'
      )}
    >
      <div className="p-4 border-b border-border bg-surface-muted/20">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <span className={cn(
              "flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black transition-all",
              isActive ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "bg-border text-text-muted"
            )}>
              {index + 1}
            </span>
            <input
              value={stage.name}
              onChange={(e) => onUpdate({ ...stage, name: e.target.value })}
              className="bg-transparent font-heading font-black text-base text-text-primary placeholder:text-text-muted outline-none w-48 focus:bg-surface-muted/50 rounded-md px-1 -ml-1 transition-all"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove(-1)}><ArrowLeft size={14} className="rotate-90" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove(1)}><ArrowLeft size={14} className="-rotate-90" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-status-danger" onClick={onRemove}><Trash2 size={14} /></Button>
          </div>
        </div>

        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface border border-border shadow-inner">
            <span className="text-[10px] font-black text-text-muted uppercase">Duração</span>
            <input
              type="number"
              min={1}
              value={stage.duration}
              onChange={(e) => onUpdate({ ...stage, duration: Number(e.target.value) })}
              className="w-8 bg-transparent text-xs text-text-primary outline-none font-bold text-center"
            />
            <span className="text-[10px] text-text-muted font-bold">dias</span>
          </div>
          <div className="flex items-center gap-2">
            <CompactToggle checked={stage.autoStart} onChange={(v) => onUpdate({ ...stage, autoStart: v })} />
            <span className="text-[10px] text-text-muted font-black uppercase tracking-wider">{stage.autoStart ? 'Auto' : 'Manual'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
        {stage.tasks.map((task, tidx) => (
          <TaskRow
            key={task.id || tidx}
            task={task}
            onChange={(updated) => updateTask(tidx, updated)}
            onRemove={() => removeTask(tidx)}
          />
        ))}

        <button
          onClick={addTask}
          className="w-full mt-3 py-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-text-muted hover:text-brand-primary hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all text-xs font-bold group"
        >
          <Plus size={16} className="group-hover:scale-110 transition-transform" />
          Adicionar tarefa
        </button>
      </div>

      <div className="px-4 py-2 bg-surface-muted/30 border-t border-border flex items-center justify-between">
         <span className="text-[9px] text-text-muted font-black uppercase tracking-widest opacity-60">
           {stage.tasks.length} {stage.tasks.length === 1 ? 'JOB' : 'JOBS'}
         </span>
         {stage.tasks.some(t => t.required) && (
           <div className="flex items-center gap-1.5">
             <span className="w-1 h-1 rounded-full bg-brand-primary animate-pulse" />
             <span className="text-[9px] text-brand-primary font-black uppercase tracking-widest">Requerido</span>
           </div>
         )}
      </div>
    </div>
  )
})

// ─── Main Builder Component ───────────────────────────────────────────────────

interface ProductTemplateBuilderProps {
  initialData?: ProductTemplateData
  id?: string
}

export function ProductTemplateBuilder({ initialData, id }: ProductTemplateBuilderProps) {
  const router = useRouter()
  const isEdit = !!id

  const [productName, setProductName] = useState(initialData?.name || '')
  const [category, setCategory] = useState(initialData?.category || 'Design')
  const [productType, setProductType] = useState<string>(initialData?.type || 'recurring')
  const [basePrice, setBasePrice] = useState(initialData?.base_price?.toString() || '0')
  const [stages, setStages] = useState<Stage[]>([])
  const [activeStageId, setActiveStageId] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Map initial stages to component format
  useEffect(() => {
    if (initialData?.stages) {
      setStages(initialData.stages.map(s => ({
        id: s.id,
        name: s.name,
        duration: s.duration_days,
        autoStart: s.auto_start,
        tasks: s.tasks.map(t => ({
          id: t.id,
          title: t.title,
          role: t.role,
          deadline: `D+${t.deadline_offset}`,
          type: t.task_type as TaskType,
          required: t.is_required
        }))
      })))
    } else {
      // Default initial stage
      setStages([{
        name: 'Briefing',
        duration: 2,
        autoStart: true,
        tasks: [
          { title: 'Coletar briefing', role: 'Gestor', deadline: 'D+1', type: 'task', required: true }
        ]
      }])
    }
  }, [initialData])

  const handleUpdateStage = useCallback((idx: number, updated: Stage) => {
    setStages(prev => {
      const next = [...prev]
      next[idx] = updated
      return next
    })
  }, [])

  const handleAddStage = useCallback(() => {
    const newStage: Stage = {
      name: `Nova Etapa`,
      duration: 3,
      autoStart: false,
      tasks: [],
    }
    setStages(prev => [...prev, newStage])
    setActiveStageId(stages.length)
  }, [stages.length])

  const handleRemoveStage = useCallback((idx: number) => {
    setStages(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const handleMoveStage = useCallback((idx: number, dir: number) => {
    setStages(prev => {
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      return next
    })
  }, [])

  const handleSave = async () => {
    if (!productName) {
      toast.error('Informe o nome do produto')
      return
    }

    try {
      setIsSaving(true)
      
      const payload: ProductTemplateData = {
        name: productName,
        category,
        type: productType,
        base_price: Number(basePrice),
        stages: stages.map((s, sIdx) => ({
          id: s.id,
          name: s.name,
          duration_days: s.duration,
          auto_start: s.autoStart,
          order_index: sIdx,
          tasks: s.tasks.map(t => ({
            id: t.id,
            title: t.title,
            role: t.role,
            deadline_offset: parseInt(t.deadline.replace('D+', '')) || 1,
            task_type: t.type,
            is_required: t.required
          }))
        }))
      }

      if (isEdit && id) {
        await syncProductTemplate(id, payload)
      } else {
        await createProductTemplate(payload)
      }
      
      setIsSaved(true)
      toast.success(isEdit ? 'Produto atualizado!' : 'Produto criado!')
      
      setTimeout(() => {
        setIsSaved(false)
        router.push('/dashboard/products')
        router.refresh()
      }, 1000)
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Erro ao salvar produto')
    } finally {
      setIsSaving(false)
    }
  }

  const timelineStats = useMemo(() => {
    let dayOffset = 0
    const timeline = stages.map((s, i) => {
      const start = dayOffset
      dayOffset = start + s.duration
      return { stage: s, start, end: dayOffset }
    })
    const totalDays = timeline[timeline.length - 1]?.end ?? 0
    const totalTasks = stages.reduce((acc, s) => acc + s.tasks.length, 0)
    return { timeline, totalDays, totalTasks }
  }, [stages])

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-10">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-xl h-12 w-12 border-border/50 hover:bg-surface-muted"
            onClick={() => router.push('/dashboard/products')}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="heading-editorial text-3xl font-black">
                {productName || (isEdit ? 'Editando Produto' : 'Novo Produto')}
              </h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                isEdit ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
              )}>
                {isEdit ? 'Editando' : 'Novo Fluxo'}
              </span>
            </div>
            <p className="text-text-muted font-body text-sm font-medium">
              Configure a pipeline de trabalho e jobs padrão para este produto.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="font-bold text-text-secondary h-11 px-6 rounded-xl hover:bg-surface-muted/50 transition-all"
            onClick={() => router.push('/dashboard/products')}
          >
            Descartar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "h-11 px-8 rounded-xl font-black shadow-lg transition-all flex items-center gap-2",
              isSaved ? "bg-status-success shadow-status-success/30" : "bg-brand-primary shadow-brand-primary/30 active:scale-95"
            )}
          >
            {isSaving ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSaved ? (
              <Check size={18} />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? 'Salvando...' : isSaved ? 'Salvo!' : isEdit ? 'Atualizar Produto' : 'Salvar Produto'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-10 items-start">
        
        <div className="space-y-12">
          
          {/* Metadata Section */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionLabel>Configuração do Produto</SectionLabel>
            <SurfaceCard className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 bg-surface/60 backdrop-blur-sm border-border/40">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Nome do Produto</label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-surface border border-border/50 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold"
                  placeholder="Ex: Identidade Visual Express"
                />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Categoria</label>
                 <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface border border-border/50 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none"
                  >
                    {['Design', 'Marketing', 'Estratégia', 'Social Media', 'Web', 'Consultoria'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Tipo de Entrega</label>
                 <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full bg-surface border border-border/50 rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold appearance-none"
                  >
                    {Object.entries(PRODUCT_TYPE_LABELS).map(([k,v]) => (<option key={k} value={k}>{v}</option>))}
                  </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Investimento Base</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs font-bold font-mono">R$</span>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full bg-surface border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-mono font-bold"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </SurfaceCard>
          </section>

          {/* Pipeline Section */}
          <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-6">
              <SectionLabel>Pipeline de Entrega</SectionLabel>
              <Button
                onClick={handleAddStage}
                className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all text-xs font-black px-4 h-9 rounded-xl border border-brand-primary/20"
              >
                <Plus size={16} className="mr-2" />
                Nova Etapa
              </Button>
            </div>
            
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
              {stages.map((stage, i) => (
                <StageCard
                  key={stage.id || i}
                  stage={stage}
                  index={i}
                  isActive={activeStageId === i}
                  onSelect={() => setActiveStageId(i)}
                  onUpdate={(updated) => handleUpdateStage(i, updated)}
                  onRemove={() => handleRemoveStage(i)}
                  onMove={(dir) => handleMoveStage(i, dir)}
                />
              ))}
              
              <button
                onClick={handleAddStage}
                className="flex flex-col items-center justify-center min-h-[440px] rounded-2xl border-2 border-dashed border-border/40 text-text-muted hover:border-brand-primary hover:bg-brand-primary/5 transition-all gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-border/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary/10 transition-all group-hover:text-brand-primary">
                  <Plus size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black font-heading group-hover:text-text-primary transition-colors">Nova Etapa</p>
                  <p className="text-[10px] font-medium opacity-60">Adicione um novo fluxo</p>
                </div>
              </button>
            </div>
          </section>

        </div>

        {/* Sidebar Summary */}
        <aside className="sticky top-24 space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
          <SectionLabel>Resumo Operacional</SectionLabel>
          
          <SurfaceCard className="p-6 space-y-8 bg-surface/80 backdrop-blur-md border-border/60">
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-muted/50 p-3 rounded-xl border border-border/30 text-center">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Etapas</p>
                <p className="text-2xl font-black text-text-primary leading-none mt-2">{stages.length}</p>
              </div>
              <div className="bg-surface-muted/50 p-3 rounded-xl border border-border/30 text-center">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Jobs</p>
                <p className="text-2xl font-black text-text-primary leading-none mt-2">{timelineStats.totalTasks}</p>
              </div>
              <div className="bg-surface-muted/50 p-3 rounded-xl border border-border/30 text-center">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Dias</p>
                <p className="text-2xl font-black text-brand-primary leading-none mt-2">{timelineStats.totalDays}</p>
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Simulação de Fluxo</p>
              <div className="space-y-4 relative before:absolute before:left-[4px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-brand-primary before:to-transparent before:opacity-20">
                 {timelineStats.timeline.map((item, idx) => (
                   <div key={idx} className="relative pl-6">
                     <div className={cn(
                       "absolute left-0 top-[6px] w-[10px] h-[10px] rounded-full border-2 border-surface shadow-md ring-1 ring-border",
                       idx === 0 ? "bg-brand-primary" : "bg-border-strong"
                     )} />
                     <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-text-primary truncate">{item.stage.name}</span>
                        <span className="text-[10px] text-text-muted font-black font-mono">D+{item.start} → D+{item.end}</span>
                     </div>
                     <div className="h-2 w-full bg-border/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-primary/40 rounded-full transition-all duration-1000"
                          style={{ width: `${(item.stage.duration / Math.max(1, timelineStats.totalDays)) * 100}%` }}
                        />
                     </div>
                   </div>
                 ))}
                 {stages.length === 0 && <p className="text-xs text-text-muted italic text-center py-4">Nenhuma etapa definida.</p>}
              </div>
            </div>

            <div className="pt-6 border-t border-border/50">
               <Button
                  onClick={handleSave}
                  className="w-full h-12 bg-brand-primary text-white text-sm font-black font-heading rounded-xl shadow-xl shadow-brand-primary/20 hover:shadow-brand-primary/30 active:scale-[0.98] transition-all"
               >
                 Confirmar Configuração
               </Button>
               <p className="text-[10px] text-center text-text-muted italic mt-4 font-medium">Os prazos são calculados a partir da data de início do projeto.</p>
            </div>

          </SurfaceCard>
        </aside>

      </div>
    </div>
  )
}

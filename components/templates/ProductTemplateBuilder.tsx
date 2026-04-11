'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskType = 'task' | 'checklist' | 'approval'
type ProductType = 'service' | 'recurring' | 'sprint'

interface TaskTemplate {
  id: string
  name: string
  role: string
  deadline: string
  type: TaskType
  required: boolean
}

interface Stage {
  id: string
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

// Design tokens mapping for task types (supporting both themes)
const TASK_TYPE_STYLES: Record<TaskType, string> = {
  task: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  checklist: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  approval: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
}

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  service: 'Serviço',
  recurring: 'Recorrente',
  sprint: 'Sprint',
}

const ROLES = ['Redator', 'Design', 'Estrategista', 'Gestor', 'Cliente', 'Dev', 'Social Media']

const DEFAULT_STAGES: Stage[] = [
  {
    id: uid(),
    name: 'Briefing',
    duration: 2,
    autoStart: true,
    tasks: [
      { id: uid(), name: 'Coletar briefing do cliente', role: 'Gestor', deadline: 'D+1', type: 'task', required: true },
      { id: uid(), name: 'Aprovação de escopo', role: 'Cliente', deadline: 'D+2', type: 'approval', required: true },
    ],
  },
  {
    id: uid(),
    name: 'Produção',
    duration: 5,
    autoStart: false,
    tasks: [
      { id: uid(), name: 'Redação dos textos', role: 'Redator', deadline: 'D+3', type: 'task', required: true },
      { id: uid(), name: 'Checklist de qualidade', role: 'Gestor', deadline: 'D+5', type: 'checklist', required: false },
    ],
  },
  {
    id: uid(),
    name: 'Revisão',
    duration: 3,
    autoStart: false,
    tasks: [
      { id: uid(), name: 'Revisão interna', role: 'Gestor', deadline: 'D+1', type: 'task', required: true },
      { id: uid(), name: 'Aprovação final cliente', role: 'Cliente', deadline: 'D+3', type: 'approval', required: true },
    ],
  },
  {
    id: uid(),
    name: 'Entrega',
    duration: 1,
    autoStart: true,
    tasks: [
      { id: uid(), name: 'Publicar / Entregar', role: 'Social Media', deadline: 'D+1', type: 'task', required: true },
    ],
  },
]

// ─── UI Components (Strict Token Usage) ───────────────────────────────────────

/**
 * SurfaceCard component using Level 1 design tokens.
 * Adapts to #FFFFFF (Light) and surface-elevated (Dark).
 */
function SurfaceCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface shadow-sm overflow-hidden flex flex-col',
        'transition-shadow duration-200 hover:shadow-md',
        className
      )}
    >
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
      <span
        className={cn(
          'pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
          checked ? 'translate-x-3.5' : 'translate-x-0.5',
          'mt-0.5'
        )}
      />
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-1 h-3 rounded-full bg-brand-primary shrink-0" />
      <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-muted font-body">
        {children}
      </span>
    </div>
  )
}

// ─── Memoized Sub-components ──────────────────────────────────────────────────

const TaskRow = React.memo(({
  task,
  onChange,
  onRemove,
}: {
  task: TaskTemplate
  onChange: (t: TaskTemplate) => void
  onRemove: () => void
}) => {
  return (
    <div className="group flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-surface-muted transition-colors duration-150 border border-transparent hover:border-border/50">
      {/* drag handle */}
      <span className="text-text-muted/40 cursor-grab active:cursor-grabbing shrink-0">
        <svg width="10" height="14" viewBox="0 0 12 16" fill="currentColor">
          <circle cx="4" cy="4" r="1.5" /><circle cx="8" cy="4" r="1.5" />
          <circle cx="4" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" />
          <circle cx="4" cy="12" r="1.5" /><circle cx="8" cy="12" r="1.5" />
        </svg>
      </span>

      {/* Name */}
      <input
        value={task.name}
        onChange={(e) => onChange({ ...task, name: e.target.value })}
        placeholder="Tarefa…"
        className="flex-1 min-w-0 bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none h-7"
      />

      {/* Role */}
      <select
        value={task.role}
        onChange={(e) => onChange({ ...task, role: e.target.value })}
        className="bg-transparent text-[10px] text-text-secondary outline-none cursor-pointer hover:bg-surface/50 rounded-sm transition-colors w-24 h-7 border-none p-0"
      >
        {ROLES.map((r) => (
          <option key={r} value={r} className="bg-surface text-text-primary">{r}</option>
        ))}
      </select>

      {/* Deadline */}
      <input
        value={task.deadline}
        onChange={(e) => onChange({ ...task, deadline: e.target.value })}
        placeholder="D+1"
        className="w-10 bg-transparent text-[10px] text-brand-primary font-mono text-center outline-none hover:bg-surface/50 rounded-sm h-7"
      />

      {/* Type Badge / Select */}
      <select
        value={task.type}
        onChange={(e) => onChange({ ...task, type: e.target.value as TaskType })}
        className={cn(
          'rounded px-1.5 h-6 text-[9px] font-bold uppercase transition-colors outline-none cursor-pointer border',
          TASK_TYPE_STYLES[task.type]
        )}
      >
        {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((t) => (
          <option key={t} value={t} className="bg-surface text-text-primary">{TASK_TYPE_LABELS[t]}</option>
        ))}
      </select>

      {/* Required toggle */}
      <CompactToggle checked={task.required} onChange={(v) => onChange({ ...task, required: v })} />

      {/* Remove */}
      <button
        onClick={onRemove}
        className="text-text-muted/40 hover:text-danger p-1 transition-colors opacity-0 group-hover:opacity-100"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
})

const StageCard = React.memo(({
  stage,
  index,
  total,
  isActive,
  onSelect,
  onUpdate,
  onRemove,
  onMove,
}: {
  stage: Stage
  index: number
  total: number
  isActive: boolean
  onSelect: () => void
  onUpdate: (s: Stage) => void
  onRemove: () => void
  onMove: (dir: number) => void
}) => {
  const addTask = useCallback(() => {
    const newTask: TaskTemplate = {
      id: uid(),
      name: '',
      role: ROLES[0],
      deadline: `D+${stage.tasks.length + 1}`,
      type: 'task',
      required: false,
    }
    onUpdate({ ...stage, tasks: [...stage.tasks, newTask] })
  }, [stage, onUpdate])

  const updateTask = useCallback((taskId: string, updated: TaskTemplate) => {
    onUpdate({ ...stage, tasks: stage.tasks.map((t) => (t.id === taskId ? updated : t)) })
  }, [stage, onUpdate])

  const removeTask = useCallback((taskId: string) => {
    onUpdate({ ...stage, tasks: stage.tasks.filter((t) => t.id !== taskId) })
  }, [stage, onUpdate])

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group flex flex-col min-h-[420px] max-h-[580px] rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden',
        isActive
          ? 'bg-surface shadow-lg border-brand-primary ring-1 ring-brand-primary/20'
          : 'bg-surface/50 hover:bg-surface border-border hover:border-border-strong shadow-sm'
      )}
    >
      {/* Stage Header */}
      <div className="p-3 border-b border-border bg-surface-muted/30">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className={cn(
              "flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold transition-colors",
              isActive ? "bg-brand-primary text-white" : "bg-border text-text-muted"
            )}>
              {index + 1}
            </span>
            <input
              value={stage.name}
              onChange={(e) => onUpdate({ ...stage, name: e.target.value })}
              className="bg-transparent font-heading font-bold text-sm text-text-primary placeholder:text-text-muted outline-none w-32 focus:bg-surface rounded px-1 -ml-1 transition-colors"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onMove(-1)} className="p-1 text-text-muted hover:text-text-primary transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
            <button onClick={() => onMove(1)} className="p-1 text-text-muted hover:text-text-primary transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></button>
            <button onClick={onRemove} className="p-1 text-text-muted hover:text-danger transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface border border-border">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <input
              type="number"
              min={1}
              value={stage.duration}
              onChange={(e) => onUpdate({ ...stage, duration: Number(e.target.value) })}
              className="w-6 bg-transparent text-[11px] text-text-primary outline-none font-bold"
            />
            <span className="text-[10px] text-text-muted">dias</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CompactToggle checked={stage.autoStart} onChange={(v) => onUpdate({ ...stage, autoStart: v })} />
            <span className="text-[10px] text-text-muted font-medium">{stage.autoStart ? 'Auto' : 'Manual'}</span>
          </div>
        </div>
      </div>

      {/* Task List (Internal Scroll) */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        <div className="space-y-1">
          {stage.tasks.map((task, tidx) => (
            <TaskRow
              key={task.id}
              task={task}
              onChange={(updated) => updateTask(task.id, updated)}
              onRemove={() => removeTask(task.id)}
            />
          ))}
        </div>

        <button
          onClick={addTask}
          className="w-full mt-2 py-2 flex items-center justify-center gap-2 rounded-md border border-dashed border-border text-text-muted hover:text-brand-primary hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all text-[11px] font-medium"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Adicionar tarefa
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-2 border-t border-border bg-surface-muted/20 flex items-center justify-between">
         <span className="text-[9px] text-text-muted opacity-60 font-bold uppercase tracking-wider">
           {stage.tasks.length} {stage.tasks.length === 1 ? 'Job' : 'Jobs'}
         </span>
         {stage.tasks.some(t => t.required) && (
           <span className="text-[9px] text-brand-primary/60 font-bold uppercase">* Requerido</span>
         )}
      </div>
    </div>
  )
})

// ─── Main Builder Component ───────────────────────────────────────────────────

export function ProductTemplateBuilder() {
  const [productName, setProductName] = useState('Social Media Mensal')
  const [category, setCategory] = useState('Marketing Digital')
  const [productType, setProductType] = useState<ProductType>('recurring')
  const [basePrice, setBasePrice] = useState('2500')
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES)
  const [activeStageId, setActiveStageId] = useState<string>(DEFAULT_STAGES[0].id)
  const [rules, setRules] = useState<Rules>({
    autoStartNext: true,
    bufferDays: 1,
    repeatOnRevision: false,
    clientParticipation: true,
  })
  const [isSaved, setIsSaved] = useState(false)

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleUpdateStage = useCallback((updated: Stage) => {
    setStages(prev => prev.map(s => s.id === updated.id ? updated : s))
  }, [])

  const handleAddStage = useCallback(() => {
    const newStage: Stage = {
      id: uid(),
      name: `Nova Etapa`,
      duration: 3,
      autoStart: false,
      tasks: [],
    }
    setStages(prev => [...prev, newStage])
    setActiveStageId(newStage.id)
  }, [])

  const handleRemoveStage = useCallback((id: string) => {
    setStages(prev => {
      const next = prev.filter(s => s.id !== id)
      if (activeStageId === id && next.length > 0) setActiveStageId(next[0].id)
      return next
    })
  }, [activeStageId])

  const handleMoveStage = useCallback((id: string, dir: number) => {
    setStages(prev => {
      const idx = prev.findIndex(s => s.id === id)
      if (idx < 0) return prev
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      return next
    })
  }, [])

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  // ─── Stat Computations ──────────────────────────────────────────────────────

  const timelineStats = useMemo(() => {
    let dayOffset = 0
    const timeline = stages.map((s, i) => {
      const start = dayOffset + (i > 0 ? rules.bufferDays : 0)
      dayOffset = start + s.duration
      return { stage: s, start, end: dayOffset }
    })
    const totalDays = timeline[timeline.length - 1]?.end ?? 0
    const totalTasks = stages.reduce((acc, s) => acc + s.tasks.length, 0)
    return { timeline, totalDays, totalTasks }
  }, [stages, rules.bufferDays])

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="heading-editorial flex items-center gap-3 mb-1">
            <span className="text-text-primary">{productName || 'Novo Template'}</span>
            <span className="text-brand-primary text-sm font-body px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20">
              Builder
            </span>
          </h1>
          <p className="text-text-muted font-body text-sm">Configure o fluxo padrão de trabalho para este serviço.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors">Cancelar</button>
          <button
            onClick={handleSave}
            className={cn(
              "px-6 h-10 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2",
              isSaved
                ? "bg-status-success text-white shadow-status-success/30"
                : "bg-brand-primary text-white shadow-brand/30 hover:shadow-brand/40 hover:-translate-y-0.5"
            )}
          >
            {isSaved ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            ) : "Salvar Template"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
        
        {/* ── LEFT: MAIN BUILDER ── */}
        <div className="space-y-8">
          
          {/* 1. Basic Info */}
          <section>
            <SectionLabel>1. Informações Básicas</SectionLabel>
            <SurfaceCard className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">Nome do Produto</label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-background border border-border rounded p-2 text-sm text-text-primary outline-none focus:ring-1 focus:ring-brand-primary/30 h-9"
                />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-text-muted uppercase">Categoria</label>
                 <input
                   value={category}
                   onChange={(e) => setCategory(e.target.value)}
                   className="w-full bg-background border border-border rounded p-2 text-sm text-text-primary outline-none focus:ring-1 focus:ring-brand-primary/30 h-9"
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-text-muted uppercase">Tipo</label>
                 <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as ProductType)}
                    className="w-full bg-background border border-border rounded p-2 text-sm text-text-primary outline-none focus:ring-1 focus:ring-brand-primary/30 h-9"
                 >
                   {Object.entries(PRODUCT_TYPE_LABELS).map(([k,v]) => (<option key={k} value={k}>{v}</option>))}
                 </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">Preço Base</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">R$</span>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full bg-background border border-border rounded pl-8 pr-3 py-2 text-sm text-text-primary outline-none focus:ring-1 focus:ring-brand-primary/30 h-9 font-mono"
                  />
                </div>
              </div>
            </SurfaceCard>
          </section>

          {/* 2. Pipeline Grid */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>2. Pipeline de Trabalho</SectionLabel>
              <button
                onClick={handleAddStage}
                className="text-[11px] font-bold text-brand-primary px-3 py-1 rounded bg-brand-primary/5 border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all shadow-sm"
              >
                + Nova Etapa
              </button>
            </div>
            
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
              {stages.map((stage, i) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  index={i}
                  total={stages.length}
                  isActive={activeStageId === stage.id}
                  onSelect={() => setActiveStageId(stage.id)}
                  onUpdate={handleUpdateStage}
                  onRemove={() => handleRemoveStage(stage.id)}
                  onMove={(dir) => handleMoveStage(stage.id, dir)}
                />
              ))}
              
              {/* Optional Placeholder for Add */}
              <button
                onClick={handleAddStage}
                className="flex flex-col items-center justify-center min-h-[420px] rounded-xl border-2 border-dashed border-border text-text-muted hover:border-brand-primary hover:bg-brand-primary/5 transition-all gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-border/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <span className="text-sm font-bold font-heading">Nova Etapa</span>
              </button>
            </div>
          </section>

          {/* 3. Automation Rules */}
          <section>
            <SectionLabel>3. Regras de Automação</SectionLabel>
            <SurfaceCard className="p-0 overflow-hidden">
               <div className="divide-y divide-border">
                 {[
                   { id: 'autoStartNext', label: 'Auto-iniciar próxima etapa', hint: 'Ativa etapa seguinte após conclusão dos jobs.', val: rules.autoStartNext },
                   { id: 'repeatOnRevision', label: 'Repetir Jobs em Revisão', hint: 'Jobs voltam para "A fazer" se recusados.', val: rules.repeatOnRevision },
                   { id: 'clientParticipation', label: 'Participação do Cliente', hint: 'Cliente pode visualizar e aprovar jobs.', val: rules.clientParticipation }
                 ].map(rule => (
                   <div key={rule.id} className="flex items-center justify-between p-4 hover:bg-surface-muted/30 transition-colors">
                     <div>
                        <p className="text-sm font-bold text-text-primary">{rule.label}</p>
                        <p className="text-xs text-text-muted">{rule.hint}</p>
                     </div>
                     <CompactToggle
                        checked={rule.val}
                        onChange={(v) => setRules({...rules, [rule.id]: v})}
                     />
                   </div>
                 ))}
                 
                 <div className="flex items-center justify-between p-4">
                    <div>
                        <p className="text-sm font-bold text-text-primary">Buffer entre etapas</p>
                        <p className="text-xs text-text-muted">Tempo de intervalo entre fluxos.</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <input
                         type="number"
                         value={rules.bufferDays}
                         onChange={(e) => setRules({...rules, bufferDays: Number(e.target.value)})}
                         className="w-14 bg-background border border-border rounded text-center text-sm font-bold text-text-primary h-9 outline-none focus:ring-1 focus:ring-brand-primary/30"
                       />
                       <span className="text-xs text-text-muted font-bold">dias</span>
                    </div>
                 </div>
               </div>
            </SurfaceCard>
          </section>

        </div>

        {/* ── RIGHT: STICKY PREVIEW ── */}
        <aside className="sticky top-[84px] max-h-[calc(100vh-120px)] flex flex-col gap-4">
          <SectionLabel>Resumo do Fluxo</SectionLabel>
          
          <SurfaceCard className="flex-1 p-4 overflow-y-auto scrollbar-thin">
            <div className="space-y-6">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-surface-muted/50 p-2 rounded-md text-center">
                  <p className="text-[9px] font-bold text-text-muted uppercase">Etapas</p>
                  <p className="text-lg font-bold text-text-primary leading-none mt-1">{stages.length}</p>
                </div>
                <div className="bg-surface-muted/50 p-2 rounded-md text-center">
                  <p className="text-[9px] font-bold text-text-muted uppercase">Jobs</p>
                  <p className="text-lg font-bold text-text-primary leading-none mt-1">{timelineStats.totalTasks}</p>
                </div>
                <div className="bg-surface-muted/50 p-2 rounded-md text-center">
                  <p className="text-[9px] font-bold text-text-muted uppercase">Duração</p>
                  <p className="text-lg font-bold text-brand-primary leading-none mt-1">{timelineStats.totalDays}d</p>
                </div>
              </div>

              {/* Timeline Visualization */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Cronograma Simulado</p>
                <div className="space-y-3 relative before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
                   {timelineStats.timeline.map((item, idx) => (
                     <div key={item.stage.id} className="relative pl-4">
                       <div className={cn(
                         "absolute left-0 top-1 w-[7px] h-[7px] rounded-full ring-4 ring-surface",
                         idx === 0 ? "bg-brand-primary" : "bg-border-strong"
                       )} />
                       <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-text-primary truncate w-32">{item.stage.name}</span>
                          <span className="text-[10px] text-text-muted font-mono whitespace-nowrap">D{item.start} → D{item.end}</span>
                       </div>
                       <div className="h-1.5 w-full bg-border/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-primary/60 rounded-full transition-all duration-500"
                            style={{ width: `${(item.stage.duration / timelineStats.totalDays) * 100}%` }}
                          />
                       </div>
                     </div>
                   ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-auto">
                 <button
                    onClick={handleSave}
                    className="w-full h-11 bg-brand-primary text-white text-xs font-bold font-heading rounded-lg shadow-sm hover:shadow-brand/20 transition-all active:scale-[0.98]"
                 >
                   Confirmar & Salvar
                 </button>
                 <p className="text-[10px] text-center text-text-muted italic mt-3">Baseado na configuração de {rules.bufferDays} dia(s) de buffer.</p>
              </div>

            </div>
          </SurfaceCard>

        </aside>

      </div>
    </div>
  )
}

'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical, 
  Check, 
  Save, 
  Calendar, 
  Users, 
  Workflow, 
  Clock, 
  ChevronRight,
  UserPlus,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { addDays, format, isValid, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  V2Project, 
  V2ProjectStage, 
  V2Task, 
  V2ProjectMember,
  TaskTypeV2
} from '@/types/database'
import { saveProjectSchedule, SchedulerData } from '@/app/dashboard/projects/[id]/deadlines/scheduler-actions'

// ─── UI Helpers ──────────────────────────────────────────────────────────────

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

const TASK_TYPE_ICONS: Record<TaskTypeV2, any> = {
  task: Target,
  meeting: Users,
  review: Clock,
  approval: Check,
  deliverable: Workflow
}

const TASK_TYPE_LABELS: Record<TaskTypeV2, string> = {
  task: 'Tarefa',
  meeting: 'Reunião',
  review: 'Revisão',
  approval: 'Aprovação',
  deliverable: 'Entrega'
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface ExecutiveProjectSchedulerProps {
  initialData: SchedulerData
}

export function ExecutiveProjectScheduler({ initialData }: ExecutiveProjectSchedulerProps) {
  const router = useRouter()
  const [stages, setStages] = useState(initialData.stages)
  const [members, setMembers] = useState(initialData.members)
  const [isSaving, setIsSaving] = useState(false)

  // Simulation Engine: Derived Timeline
  const timeline = useMemo(() => {
    const baseDate = initialData.project.start_date ? parseISO(initialData.project.start_date) : new Date()
    let currentDate = baseDate
    
    const calculatedStages = stages.map(stage => {
      // Logic for non-linear pipelines could go here based on depends_on_stage_key
      const start = stage.start_mode === 'manual' && stage.started_at ? parseISO(stage.started_at) : currentDate
      const end = addDays(start, stage.duration_days)
      
      const tasksWithDates = stage.tasks.map(task => {
        const refDate = task.offset_type === 'stage_end' ? end : start
        const dueDate = addDays(refDate, task.deadline_offset_days)
        return { ...task, calculatedDate: dueDate }
      })

      currentDate = end // Sequence updates
      return { 
        ...stage, 
        calculatedStart: start, 
        calculatedEnd: end,
        tasks: tasksWithDates
      }
    })

    return calculatedStages
  }, [stages, initialData.project.start_date])

  // Handlers
  const handleUpdateStage = (idx: number, updates: Partial<V2ProjectStage>) => {
    const next = [...stages]
    next[idx] = { ...next[idx], ...updates } as any
    setStages(next)
  }

  const handleUpdateTask = (stageIdx: number, taskIdx: number, updates: Partial<V2Task>) => {
    const next = [...stages]
    const updatedTasks = [...next[stageIdx].tasks]
    updatedTasks[taskIdx] = { ...updatedTasks[taskIdx], ...updates } as any
    next[stageIdx].tasks = updatedTasks
    setStages(next)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveProjectSchedule(initialData.project.id, {
        stages: stages,
        members: members.map(m => ({ user_id: m.user_id, role_key: m.role_key || '' }))
      })
      toast.success('Cronograma operacional atualizado!')
      router.refresh()
    } catch (err) {
      toast.error('Erro ao salvar cronograma.')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background isolate relative z-10 pointer-events-auto">
      {/* ── Fixed Premium Header ── */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-surface/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center gap-6">
          <Button variant="ghost" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-xl hover:bg-surface-muted">
            <ArrowLeft size={20} />
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Workflow size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tighter text-text-muted leading-none mb-1">Orquestração Operacional</span>
              <h1 className="text-xl font-black text-text-primary tracking-tight leading-none">
                {initialData.project.name}
              </h1>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-border mx-2" />

          {/* Context Switch Info */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-surface-muted/50 border border-border/50">
             <Target size={14} className="text-brand-primary" />
             <div className="flex flex-col">
                <span className="text-[9px] font-bold text-text-muted uppercase">Workflow</span>
                <span className="text-xs font-bold text-text-primary capitalize">{initialData.project.workflow_type}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white font-bold h-11 px-6 gap-2 shadow-lg shadow-brand-primary/20"
          >
            {isSaving ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Salvar Cronograma
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Content: Orchestrator ── */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
          
          {/* Section: Project Team */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-brand-primary" />
                <h2 className="text-sm font-black uppercase tracking-widest text-text-muted">Equipe de Execução</h2>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg h-8 text-[10px] font-bold uppercase tracking-wider gap-2">
                <UserPlus size={14} />
                Gerenciar Membros
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-surface border border-border shadow-sm group">
                  <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-[10px] font-black text-brand-primary">
                    {member.profiles?.full_name[0]}
                  </div>
                  <span className="text-xs font-bold text-text-primary">{member.profiles?.full_name}</span>
                  <button className="text-text-muted hover:text-status-danger opacity-0 group-hover:opacity-100 transition-all ml-1">
                    <Plus size={12} className="rotate-45" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Stages Pipeline */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-4 rounded-full bg-brand-primary" />
              <h2 className="text-sm font-black uppercase tracking-widest text-text-muted">Pipeline de Prazos</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              {timeline.map((stage, sIdx) => (
                <div 
                  key={stage.id} 
                  className={cn(
                    "group flex flex-col rounded-3xl border transition-all duration-500 overflow-hidden min-h-[400px]",
                    "bg-surface/50 border-border hover:border-brand-primary/50 hover:bg-surface shadow-sm hover:shadow-xl"
                  )}
                >
                  {/* Stage Header */}
                  <div className="p-5 border-b border-border bg-surface-muted/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-brand-primary text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-brand-primary/10">
                          {sIdx + 1}
                        </div>
                        <input 
                          value={stage.name}
                          onChange={(e) => handleUpdateStage(sIdx, { name: e.target.value })}
                          className="bg-transparent font-black text-base text-text-primary outline-none focus:text-brand-primary transition-colors hover:bg-white/5 rounded px-1"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-status-danger">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      {/* Duration Simulation Input */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border shadow-inner group/input">
                        <Clock size={12} className="text-text-muted group-focus-within/input:text-brand-primary transition-colors" />
                        <input 
                          type="number"
                          value={stage.duration_days}
                          onChange={(e) => handleUpdateStage(sIdx, { duration_days: Number(e.target.value) })}
                          className="w-10 bg-transparent text-sm font-black text-text-primary outline-none text-center"
                        />
                        <span className="text-[10px] font-black uppercase text-text-muted tracking-wide">dias</span>
                      </div>

                      {/* Mode Toggle */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border">
                        <CompactToggle 
                          checked={stage.start_mode === 'auto'} 
                          onChange={(v) => handleUpdateStage(sIdx, { start_mode: v ? 'auto' : 'manual' })} 
                        />
                        <span className="text-[10px] font-black uppercase text-text-muted tracking-wide">
                          {stage.start_mode === 'auto' ? 'Automático' : 'Manual'}
                        </span>
                      </div>
                    </div>

                    {/* Simulation Result Badge */}
                    <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-brand-primary bg-brand-primary/5 border border-brand-primary/10 rounded-lg py-1 px-3 w-fit">
                        <Calendar size={12} />
                        <span>PREVISÃO: {format(stage.calculatedStart, "dd 'de' MMM", { locale: ptBR })} — {format(stage.calculatedEnd, "dd 'de' MMM", { locale: ptBR })}</span>
                    </div>
                  </div>

                  {/* Tasks Content */}
                  <div className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden relative">
                    {stage.tasks.map((task, tIdx) => (
                      <div 
                        key={task.id}
                        className="group/task relative flex flex-col gap-3 p-3 rounded-2xl bg-surface border border-border/50 hover:border-brand-primary/30 hover:bg-surface-muted/30 transition-all animate-in fade-in slide-in-from-left-2 duration-300"
                      >
                         <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface border border-border text-text-muted group-hover/task:text-brand-primary group-hover/task:border-brand-primary/20 transition-all shrink-0">
                               {React.createElement(TASK_TYPE_ICONS[task.type as TaskTypeV2] || Target, { size: 16 })}
                            </div>
                            <input 
                              value={task.title}
                              onChange={(e) => handleUpdateTask(sIdx, tIdx, { title: e.target.value })}
                              placeholder="Título da tarefa..."
                              className="flex-1 bg-transparent text-sm font-bold text-text-primary placeholder:text-text-muted/50 outline-none"
                            />
                            <div className="opacity-0 group-hover/task:opacity-100 transition-all">
                               <Button variant="ghost" size="icon" className="h-6 w-6 text-text-muted hover:text-status-danger">
                                  <Trash2 size={12} />
                               </Button>
                            </div>
                         </div>

                         <div className="flex items-center justify-between gap-4 mt-1 border-t border-border/10 pt-3">
                            {/* Responsible */}
                            <select 
                              value={task.assigned_to || ''}
                              onChange={(e) => handleUpdateTask(sIdx, tIdx, { assigned_to: e.target.value })}
                              className="flex-1 bg-transparent text-[11px] font-bold text-text-muted hover:text-text-primary outline-none truncate"
                            >
                               <option value="" className="bg-surface text-text-primary">Responsável</option>
                               {members.map(m => (
                                 <option key={m.user_id} value={m.user_id} className="bg-surface text-text-primary">
                                   {m.profiles?.full_name}
                                 </option>
                               ))}
                            </select>

                            {/* Offset Engine */}
                            <div className="flex items-center gap-2 shrink-0">
                               <div className="flex items-center gap-1 bg-surface-muted/50 px-2 py-1 rounded-lg border border-border">
                                  <span className="text-[10px] font-black text-text-muted uppercase">D+</span>
                                  <input 
                                    type="number"
                                    value={task.deadline_offset_days}
                                    onChange={(e) => handleUpdateTask(sIdx, tIdx, { deadline_offset_days: Number(e.target.value) })}
                                    className="w-5 bg-transparent text-[11px] font-black text-brand-primary text-center outline-none"
                                  />
                               </div>
                               <select 
                                 value={task.offset_type}
                                 onChange={(e) => handleUpdateTask(sIdx, tIdx, { offset_type: e.target.value as 'stage_start' | 'stage_end' })}
                                 className="bg-transparent text-[9px] font-black uppercase tracking-tighter text-text-muted hover:text-brand-primary outline-none transition-colors border-none p-0"
                               >
                                 <option value="stage_start" className="bg-surface">do início</option>
                                 <option value="stage_end" className="bg-surface">do fim</option>
                               </select>
                            </div>

                            {/* Result Date Badge */}
                            <div className="shrink-0 px-2 py-1 rounded bg-brand-primary/5 text-[9px] font-black text-brand-primary border border-brand-primary/5">
                               {(task as any).calculatedDate ? format((task as any).calculatedDate, 'dd/MM') : '--/--'}
                            </div>
                         </div>
                      </div>
                    ))}

                    <Button 
                      variant="ghost" 
                      className="w-full h-12 border-2 border-dashed border-border rounded-2xl hover:bg-brand-primary/5 hover:border-brand-primary/20 hover:text-brand-primary transition-all gap-2 font-bold text-xs"
                    >
                       <Plus size={16} />
                       Adicionar Job
                    </Button>
                  </div>

                  {/* Stage Footer */}
                  <div className="p-4 border-t border-border bg-surface-muted/10 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Status</span>
                           <div className="flex items-center gap-1">
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                stage.status === 'in_progress' ? "bg-brand-primary" : "bg-text-muted/40"
                              )} />
                              <span className="text-[10px] font-bold text-text-primary uppercase">{stage.status}</span>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right Content: Sidebar Simulation ── */}
        <div className="w-80 border-l border-border bg-surface flex flex-col pt-8 px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-surface-muted border border-border flex items-center justify-center text-text-muted">
              <Clock size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-text-muted">Simulação de Fluxo</h3>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto scrollbar-hide pb-12">
            {timeline.map((stage, sIdx) => (
              <div key={stage.id} className="relative pl-6 group">
                {/* Timeline Line */}
                {sIdx < timeline.length - 1 && (
                  <div className="absolute left-1 top-6 bottom-[-24px] w-[2px] bg-border transition-colors group-hover:bg-brand-primary/20" />
                )}
                
                {/* Timeline Dot */}
                <div className={cn(
                  "absolute left-0 top-1.5 w-2 h-2 rounded-full ring-4 ring-background transition-all duration-300",
                  stage.status === 'in_progress' ? "bg-brand-primary scale-125" : "bg-border"
                )} />

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-text-primary truncate max-w-[120px] uppercase tracking-wide">
                      {stage.name}
                    </span>
                    <span className="text-[10px] font-black text-brand-primary font-mono shrink-0">
                      {stage.duration_days}D
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-text-muted font-bold">
                    <span>{format(stage.calculatedStart, 'dd/MM')}</span>
                    <ChevronRight size={10} className="mx-1" />
                    <span>{format(stage.calculatedEnd, 'dd/MM')}</span>
                  </div>

                  {/* Task Previews Dots */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {stage.tasks.map((t, idx) => (
                      <div 
                        key={idx} 
                        title={t.title}
                        className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-brand-primary/30 transition-colors" 
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Project Summary in Sidebar */}
          <div className="mt-auto border-t border-border py-8 space-y-4">
             <div className="flex flex-col p-4 rounded-2xl bg-surface-muted/50 border border-border">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Resumo Operacional</span>
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-text-secondary">Duração Total</span>
                      <span className="text-[11px] font-black text-text-primary">
                        {timeline.reduce((acc, s) => acc + s.duration_days, 0)} dias
                      </span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-text-secondary">Entrega Final</span>
                      <span className="text-[11px] font-black text-brand-primary">
                        {timeline.length > 0 ? format(timeline[timeline.length - 1].calculatedEnd, 'dd/MM/yyyy') : '--/--'}
                      </span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

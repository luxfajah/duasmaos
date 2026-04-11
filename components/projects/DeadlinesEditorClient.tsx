'use client'

import React, { useState, useTransition, useMemo, useEffect } from 'react'
import { PRIORITY_LABELS, UserRole, V2Project } from '@/types/database'
import { bulkUpdateTaskDeadlines, updateProjectStartDate } from '@/app/dashboard/projects/[id]/deadlines/deadline-actions'
import { 
  Calendar, Save, AlertCircle, Loader2, Lock, Unlock, 
  RefreshCcw, AlertTriangle, Link2, Unlink, CalendarClock, 
  ChevronRight, LayoutList, History, Info, ArrowRight, Edit3
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ProjectSelector } from './ProjectSelector'
import { TaskEditModal } from '../tasks/TaskEditModal'

interface DeadlinesEditorProps {
  projectId: string
  stages: any[]
  tasks: any[]
  userRole: UserRole
  projectData: V2Project & { start_date?: string }
  allProjects: any[]
}

// --- Utils ---
const toDateStr = (d: Date) => {
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0]
  const offset = d.getTimezoneOffset()
  d = new Date(d.getTime() - (offset*60*1000))
  return d.toISOString().split('T')[0]
}

const addD = (dStr: string | null | undefined, days: number) => {
  if (!dStr) return ''
  const dt = new Date(dStr + 'T12:00:00')
  dt.setDate(dt.getDate() + days)
  return toDateStr(dt)
}

const diffD = (d1Str: string, d2Str: string) => {
  const d1 = new Date(d1Str + 'T12:00:00')
  const d2 = new Date(d2Str + 'T12:00:00')
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

const prettyDate = (dStr: string | null | undefined) => {
  if (!dStr) return '--/--'
  const parts = dStr.split('-')
  if (parts.length < 3) return dStr
  return `${parts[2]}/${parts[1]}`
}

export function DeadlinesEditorClient({ projectId, stages, tasks, userRole, projectData }: DeadlinesEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const canEdit = ['admin', 'gestor'].includes(userRole)

  // --- State ---
  const [projStartDate, setProjStartDate] = useState(
    projectData.start_date ? toDateStr(new Date(projectData.start_date)) : toDateStr(new Date())
  )

  // taskState: Mapping taskID -> { start, end }
  const [taskState, setTaskState] = useState<Record<string, { start: string, end: string }>>(() => {
    const initial: Record<string, { start: string, end: string }> = {}
    tasks.forEach(t => {
      initial[t.id] = {
        start: t.start_date ? toDateStr(new Date(t.start_date)) : (t.due_date ? toDateStr(new Date(t.due_date)) : ''),
        end: t.due_date ? toDateStr(new Date(t.due_date)) : ''
      }
    })
    return initial
  })
  
  // Modal State
  const [editingTask, setEditingTask] = useState<any>(null)

  // --- Handlers ---
  const handleTaskDateChange = (taskId: string, field: 'start' | 'end', val: string) => {
    if (!canEdit) return
    setTaskState(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], [field]: val }
    }))
  }

  const handleProjectStartChange = (newVal: string) => {
    if (!canEdit) return
    const oldVal = projStartDate
    setProjStartDate(newVal)
    
    // Auto-suggest shift if the user wants it? 
    // For now, let's keep it manual but allow a button to "Shift everything by delta"
  }

  const shiftAllTasks = () => {
    const delta = diffD(projectData.start_date ? toDateStr(new Date(projectData.start_date)) : toDateStr(new Date()), projStartDate)
    if (delta === 0) return

    setTaskState(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(id => {
        if (next[id].start) next[id].start = addD(next[id].start, delta)
        if (next[id].end) next[id].end = addD(next[id].end, delta)
      })
      return next
    })
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        // 1. Update project start date
        await updateProjectStartDate(projectId, new Date(projStartDate + 'T12:00:00Z').toISOString())

        // 2. Update all tasks
        const updates = Object.entries(taskState).map(([taskId, dates]) => ({
          taskId,
          start_date: dates.start ? new Date(dates.start + 'T12:00:00Z').toISOString() : null,
          deadline: dates.end ? new Date(dates.end + 'T12:00:00Z').toISOString() : null
        }))
        
        await bulkUpdateTaskDeadlines(projectId, updates)
        alert('Cronograma atualizado com sucesso!')
        router.refresh()
      } catch (err: any) {
        alert('Erro ao salvar: ' + err.message)
      }
    })
  }

  // --- Derived ---
  const completionPercent = useMemo(() => {
    const closed = tasks.filter(t => t.status === 'done' || t.status === 'approved').length
    return tasks.length ? Math.round((closed / tasks.length) * 100) : 0
  }, [tasks])

  const sortedStages = [...stages].sort((a,b) => a.order - b.order)

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* 1. Project Selector Context */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <ProjectSelector currentProjectId={projectId} projects={allProjects} />
        
        <div className="flex items-center gap-3 bg-brand-primary/5 px-6 py-4 rounded-2xl border border-brand-primary/10">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Percentual de Entrega</span>
              <span className="text-xl font-black text-text-primary">{completionPercent}%</span>
           </div>
           <div className="w-1.5 h-10 bg-brand-primary/20 rounded-full ml-2" />
        </div>
      </div>      {/* 2. Horizontal Pipeline Timeline */}
      <div className="glass rounded-[32px] p-6 border border-border overflow-hidden">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary mb-6 flex items-center gap-2">
           <LayoutList size={14} /> Pipeline Cronograma
        </h3>
        
        <div className="flex gap-4 overflow-x-auto pb-4">
          {sortedStages.map((stage, idx) => {
            const stageTasks = tasks.filter(t => t.stage_id === stage.id)
            
            // Calculate stage bounds from tasks in taskState
            let minStart = ''
            let maxEnd = ''
            
            stageTasks.forEach(t => {
              const state = taskState[t.id]
              if (state?.start && (!minStart || state.start < minStart)) minStart = state.start
              if (state?.end && (!maxEnd || state.end > maxEnd)) maxEnd = state.end
            })

            return (
              <div key={stage.id} className="flex items-center shrink-0">
                <div className="flex flex-col gap-2 min-w-[180px] p-4 rounded-2xl bg-surface-muted/50 border border-border/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-primary truncate">
                    {stage.name}
                  </span>
                  <div className="flex justify-between items-center gap-2 text-[10px] font-bold text-text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} className="text-brand-primary" /> {prettyDate(minStart)}
                    </span>
                    <ArrowRight size={10} className="opacity-30" />
                    <span className="flex items-center gap-1">
                      <Calendar size={10} className="text-orange-400" /> {prettyDate(maxEnd)}
                    </span>
                  </div>
                </div>
                {idx < sortedStages.length - 1 && (
                  <div className="px-2 opacity-20">
                    <ChevronRight size={20} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Simplified Task List Grouped by Stage */}
      <div className="flex flex-col gap-6">
        {sortedStages.map((stage) => {
          const stageTasks = tasks.filter(t => t.stage_id === stage.id)
          if (stageTasks.length === 0) return null

          return (
            <div key={stage.id} className="flex flex-col gap-4">
              <div className="flex items-center gap-4 px-2">
                 <div className="w-1.5 h-6 bg-brand-primary/40 rounded-full" />
                 <h4 className="text-sm font-black uppercase tracking-widest text-text-primary flex items-center gap-3">
                    {stage.name}
                    <span className="text-[10px] font-bold text-text-muted lowercase tracking-normal">
                      ({stageTasks.length} {stageTasks.length === 1 ? 'item' : 'itens'})
                    </span>
                 </h4>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 {stageTasks.map(task => {
                    const state = taskState[task.id] || { start: '', end: '' }
                    const isOverdue = state.end && new Date(state.end) < new Date() && task.status !== 'done' && task.status !== 'approved'

                    return (
                      <div 
                        key={task.id} 
                        className={`glass rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border transition-all ${isOverdue ? 'border-status-danger/30 bg-status-danger/5' : 'border-border/50'}`}
                      >
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[8px] font-black uppercase p-1 rounded ${task.priority === 'urgent' ? 'bg-status-danger text-white' : 'bg-surface-muted text-text-muted'}`}>
                                {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS] || task.priority}
                              </span>
                              <p className="text-sm font-bold text-text-primary truncate">{task.title}</p>
                           </div>
                           <p className="text-[10px] text-text-muted font-medium flex items-center gap-1">
                             <LayoutList size={10} /> Status: {task.status}
                           </p>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
                           <div className="flex-1 md:w-[160px]">
                              <label className="text-[8px] font-black uppercase tracking-widest text-text-muted mb-1 block">Início</label>
                              <input 
                                type="date"
                                value={state.start}
                                onChange={(e) => handleTaskDateChange(task.id, 'start', e.target.value)}
                                disabled={!canEdit}
                                className="glass-input w-full py-2 px-3 rounded-lg text-xs font-bold disabled:opacity-50"
                              />
                           </div>
                           <ChevronRight size={14} className="text-text-muted/30 mt-4 hidden md:block" />
                           <div className="flex-1 md:w-[160px]">
                              <label className="text-[8px] font-black uppercase tracking-widest text-text-muted mb-1 block">Entrega</label>
                              <input 
                                type="date"
                                value={state.end}
                                onChange={(e) => handleTaskDateChange(task.id, 'end', e.target.value)}
                                disabled={!canEdit}
                                className={`glass-input w-full py-2 px-3 rounded-lg text-xs font-bold disabled:opacity-50 ${isOverdue ? 'border-status-danger text-status-danger' : ''}`}
                              />
                           </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                           <button 
                            onClick={() => setEditingTask(task)}
                            className="p-3 rounded-xl bg-surface-muted hover:bg-brand-primary/10 text-text-muted hover:text-brand-primary transition-all border border-transparent hover:border-brand-primary/20"
                            title="Editar tarefa e equipe"
                           >
                              <Edit3 size={16} />
                           </button>
                        </div>
                      </div>
                    )
                 })}
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Operational Warning / Info for non-admins */}
      {!canEdit && (
        <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-6 flex gap-4 items-center">
           <Info className="text-brand-primary shrink-0" size={24} />
           <div>
             <p className="text-sm font-bold text-text-primary">Modo de Visualização</p>
             <p className="text-xs text-text-muted mt-1">Seu perfil ({userRole}) permite acompanhar o cronograma, mas alterações são restritas a Admins e Gestores.</p>
           </div>
        </div>
      )}

      {/* 4. Persistence Bar (Admins/Gestors Only) */}
      {canEdit && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[1200px] px-4 z-50">
          <div className="bg-surface-elevated/95 backdrop-blur-xl border border-brand-primary/20 shadow-2xl rounded-[32px] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 px-4">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <History size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Status do Cronograma</p>
                <p className="text-sm font-bold text-text-primary">{completionPercent}% das tarefas concluídas</p>
              </div>
            </div>

            <div className="flex gap-4">
               <button 
                onClick={() => router.refresh()}
                className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
               >
                 Descartar
               </button>
               <button 
                onClick={handleSave}
                disabled={isPending}
                className="px-10 py-3 rounded-full bg-brand-primary text-white text-xs font-black uppercase tracking-widest shadow-brand hover:bg-brand-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
               >
                 {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                 Salvar Cronograma
               </button>
            </div>
          </div>
        </div>
      {/* Task Edit Modal */}
      <TaskEditModal 
        open={!!editingTask} 
        onClose={() => setEditingTask(null)} 
        task={editingTask}
        projectId={projectId}
      />

    </div>
  )
}

'use client'

import React, { useState, useTransition, useMemo, useEffect } from 'react'
import { PRIORITY_LABELS } from '@/types/database'
import { bulkUpdateTaskDeadlines } from '@/app/dashboard/projects/[id]/deadlines/deadline-actions'
import { Calendar, Save, AlertCircle, Loader2, Clock, Lock, Unlock, Settings2, RefreshCcw, AlertTriangle, CheckCircle2, Link2, Unlink, CalendarClock, ArrowRight, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeadlinesEditorProps {
  projectId: string
  stages: any[]
  tasks: any[]
}

interface StageScheduler {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  isLocked: boolean;
  buffer: number;
}

// --- Utils ---
const toDateStr = (d: Date) => {
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0]
  const offset = d.getTimezoneOffset()
  d = new Date(d.getTime() - (offset*60*1000))
  return d.toISOString().split('T')[0]
}
const addD = (dStr: string, days: number) => {
  const dt = new Date(dStr + 'T00:00:00');
  dt.setDate(dt.getDate() + days);
  return toDateStr(dt);
}
const diffD = (d1Str: string, d2Str: string) => {
  const d1 = new Date(d1Str + 'T00:00:00');
  const d2 = new Date(d2Str + 'T00:00:00');
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}
const prettyDate = (dStr: string) => {
  const [y, m, d] = dStr.split('-');
  return `${d}/${m}`;
}

export function DeadlinesEditorClient({ projectId, stages, tasks }: DeadlinesEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // --- Rules State ---
  const [autoStartNext, setAutoStartNext] = useState(true);
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [defaultDuration, setDefaultDuration] = useState(3);
  const [defaultBuffer, setDefaultBuffer] = useState(0);

  // --- Scheduler State ---
  const [schedule, setSchedule] = useState<StageScheduler[]>(() => {
    let currentStart = toDateStr(new Date());
    return stages.map((s, idx) => {
      const dur = 3;
      const end = addD(currentStart, dur);
      const stageConfig = {
        id: s.id,
        name: s.name,
        startDate: currentStart,
        endDate: end,
        duration: dur,
        isLocked: false,
        buffer: 0
      };
      currentStart = end; // cascading start for initialization
      return stageConfig;
    });
  });

  // --- Tasks State ---
  // detachedTasks: Task ID -> is detached?
  const [detachedTasks, setDetachedTasks] = useState<Record<string, boolean>>({});
  // customDeadlines: Task ID -> specific date (only relevant if detached)
  const [customDeadlines, setCustomDeadlines] = useState<Record<string, string>>({});

  // When a stage ends, tasks associated with it by default inherit that end date
  const getTaskDeadline = (taskId: string, stageId: string | null) => {
    if (detachedTasks[taskId] && customDeadlines[taskId]) {
      return customDeadlines[taskId];
    }
    const stageConf = schedule.find(s => s.id === stageId);
    return stageConf ? stageConf.endDate : '';
  };

  const handleTaskDetachToggle = (taskId: string, currentStageDate: string) => {
    const isDetached = !!detachedTasks[taskId];
    if (isDetached) {
      // Re-attach
      const newDetached = { ...detachedTasks };
      delete newDetached[taskId];
      setDetachedTasks(newDetached);
    } else {
      // Detach and set to current stage date initially
      setDetachedTasks({ ...detachedTasks, [taskId]: true });
      setCustomDeadlines({ ...customDeadlines, [taskId]: currentStageDate });
    }
  }

  const handleCustomTaskDeadlineChange = (taskId: string, val: string) => {
    setCustomDeadlines({ ...customDeadlines, [taskId]: val });
  }

  // --- Core Scheduling Engine ---
  const updateStageProperty = (index: number, field: keyof StageScheduler, value: any) => {
    let newSchedule = [...schedule];
    const stg = newSchedule[index];
    
    // Update core fields
    if (field === 'startDate') {
      stg.startDate = value;
      stg.duration = Math.max(0, diffD(stg.startDate, stg.endDate));
    } else if (field === 'endDate') {
      stg.endDate = value;
      stg.duration = Math.max(0, diffD(stg.startDate, stg.endDate));
    } else if (field === 'duration') {
      stg.duration = Math.max(0, value);
      stg.endDate = addD(stg.startDate, stg.duration);
    } else if (field === 'isLocked' || field === 'buffer') {
      (stg[field] as any) = value;
    }

    // Cascade adjustment
    if (autoAdjust) {
      for (let i = index + 1; i < newSchedule.length; i++) {
        const prev = newSchedule[i - 1];
        const curr = newSchedule[i];
        if (curr.isLocked) break; // cascading stops at a locked stage
        
        if (autoStartNext) {
          curr.startDate = addD(prev.endDate, prev.buffer);
        }
        curr.endDate = addD(curr.startDate, curr.duration);
      }
    }
    
    setSchedule(newSchedule);
  };

  const recalculateAll = () => {
    let newSchedule = [...schedule];
    for (let i = 0; i < newSchedule.length; i++) {
      if (newSchedule[i].isLocked) continue;
      
      newSchedule[i].duration = defaultDuration;
      newSchedule[i].buffer = defaultBuffer;

      if (i > 0 && autoStartNext) {
        const prev = newSchedule[i - 1];
        newSchedule[i].startDate = addD(prev.endDate, prev.buffer);
      }
      newSchedule[i].endDate = addD(newSchedule[i].startDate, newSchedule[i].duration);
    }
    setSchedule(newSchedule);
  };

  // --- Save ---
  const handleSave = () => {
    startTransition(async () => {
      try {
        const payload = tasks.map(t => {
          const dl = getTaskDeadline(t.id, t.stage_id);
          return {
            taskId: t.id,
            deadline: dl ? new Date(dl + 'T12:00:00Z').toISOString() : null
          }
        });
        
        await bulkUpdateTaskDeadlines(projectId, payload);
        alert('Pipeline atualizado com sucesso!');
      } catch (err: any) {
        alert(err.message || 'Houve um erro ao atualizar os prazos.');
      }
    })
  }

  // --- Derived Metrics ---
  const ganttStart = useMemo(() => {
    if (!schedule.length) return toDateStr(new Date());
    return [...schedule].sort((a,b) => diffD(b.startDate, a.startDate))[0]?.startDate;
  }, [schedule]);

  const ganttEnd = useMemo(() => {
    if (!schedule.length) return toDateStr(new Date());
    return [...schedule].sort((a,b) => diffD(a.endDate, b.endDate))[0]?.endDate;
  }, [schedule]);

  const totalGanttDays = useMemo(() => Math.max(1, diffD(ganttStart, ganttEnd)), [ganttStart, ganttEnd]);
  
  const completionPercent = useMemo(() => {
      const closed = tasks.filter(t => t.status === 'done' || t.status === 'approved').length;
      return tasks.length ? Math.round((closed / tasks.length) * 100) : 0;
  }, [tasks]);

  const isOverdue = (dateStr: string) => diffD(toDateStr(new Date()), dateStr) < 0;
  const overdueTasksCount = tasks.filter(t => t.status !== 'done' && t.status !== 'approved' && isOverdue(getTaskDeadline(t.id, t.stage_id))).length;

  return (
    <div className="flex flex-col gap-8 pb-32">
      
      {/* 1. Header Array */}
      <div className="glass rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shrink-0 border border-border">
        {/* Decorative glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/20 rounded-full blur-[80px]" />
        
        <div className="z-10 flex-col">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-brand-primary mb-2 flex items-center gap-2">
            <Activity size={16} /> Pipeline Master
          </p>
          <div className="flex items-end gap-6 text-text-primary">
            <div>
              <p className="text-sm text-text-muted mb-1 font-body">Progresso Geral</p>
              <div className="flex items-center gap-4">
                 <div className="text-4xl font-black font-heading tracking-tighter">
                   {completionPercent}%
                 </div>
                 <div className="w-32 h-2 rounded-full bg-surface">
                   <div 
                     className="h-full bg-gradient-to-r from-brand-primary to-orange-400 rounded-full transition-all duration-1000" 
                     style={{ width: `${completionPercent}%` }}
                   />
                 </div>
              </div>
            </div>
            {overdueTasksCount > 0 && (
               <div className="ml-4 flex items-center gap-2 bg-status-danger/10 text-status-danger px-4 py-2 rounded-xl font-bold text-sm">
                 <AlertTriangle size={16} />
                 {overdueTasksCount} Atrasada(s)
               </div>
            )}
          </div>
        </div>

        <button
           onClick={recalculateAll}
           className="relative z-10 px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest bg-surface text-text-primary border border-border hover:bg-surface-muted transition-colors flex items-center gap-2 shadow-sm"
        >
           <RefreshCcw size={16} className={isPending ? 'animate-spin' : ''} />
           Recalcular Timeline
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Column: Timeline & Gantt (3 spans) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
           <div className="glass rounded-[32px] border border-border overflow-hidden">
             
             {/* Gantt Header */}
             <div className="bg-surface-muted/50 p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                  <CalendarClock size={20} className="text-brand-primary" /> 
                  Mapeamento de Fases
                </h3>
                <div className="flex text-xs font-bold font-body text-text-muted gap-6 uppercase tracking-wider">
                  <span>Início: <span className="text-text-primary">{prettyDate(ganttStart)}</span></span>
                  <span>Fim: <span className="text-text-primary">{prettyDate(ganttEnd)}</span></span>
                  <span>Total: <span className="text-text-primary">{totalGanttDays} dias</span></span>
                </div>
             </div>

             {/* Gantt Body */}
             <div className="p-6 overflow-x-auto">
               <div className="min-w-[800px] flex flex-col gap-4">
                 {/* Scale Header */}
                 <div className="flex text-[10px] text-text-muted font-black border-b border-border/50 pb-2 mb-2">
                   <div className="w-[300px] shrink-0">Etapa</div>
                   <div className="flex-1 relative h-4">
                      {/* Simple tick marks */}
                      <div className="absolute left-0">Início</div>
                      <div className="absolute right-0">Entrega</div>
                   </div>
                 </div>

                 {/* Tracks */}
                 {schedule.map((stg, idx) => {
                    const startOffsetPerc = Math.max(0, diffD(ganttStart, stg.startDate)) / totalGanttDays * 100;
                    const durationPerc = Math.max(1, stg.duration / totalGanttDays * 100);

                    return (
                      <div key={stg.id} className="group relative flex items-center h-16 rounded-2xl hover:bg-surface/50 transition-colors">
                         {/* Config Side */}
                         <div className="w-[300px] shrink-0 flex items-center gap-3 pr-4 z-10">
                           <button 
                             onClick={() => updateStageProperty(idx, 'isLocked', !stg.isLocked)}
                             className={`p-2 rounded-xl transition-colors ${stg.isLocked ? 'bg-status-danger/20 text-status-danger' : 'bg-surface hover:bg-surface-muted text-text-muted'}`}
                             title={stg.isLocked ? "Fase Travada" : "Fase Automática"}
                           >
                             {stg.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                           </button>
                           <div className="min-w-0 flex-1">
                             <p className="text-sm font-bold truncate">{stg.name}</p>
                             <div className="flex items-center gap-2 mt-1">
                               <input 
                                 type="date" 
                                 value={stg.startDate}
                                 onChange={(e) => updateStageProperty(idx, 'startDate', e.target.value)}
                                 className="bg-transparent text-[10px] uppercase font-bold text-text-muted border border-transparent hover:border-border rounded px-1 focus:outline-none focus:border-brand-primary"
                               />
                               <span className="text-text-muted/50">-</span>
                               <input 
                                 type="date" 
                                 value={stg.endDate}
                                 onChange={(e) => updateStageProperty(idx, 'endDate', e.target.value)}
                                 className="bg-transparent text-[10px] uppercase font-bold text-text-muted border border-transparent hover:border-border rounded px-1 focus:outline-none focus:border-brand-primary"
                               />
                             </div>
                           </div>
                         </div>
                         
                         {/* Gantt Bar Side */}
                         <div className="flex-1 relative h-full flex items-center">
                            {/* Grid lines background (visual only) */}
                            <div className="absolute inset-x-0 inset-y-2 border-y border-dashed border-border/30 opacity-50 pointer-events-none" />
                            
                            {/* Bar */}
                            <div 
                              className={`absolute h-8 rounded-lg shadow-lg flex items-center pt-px px-3 transition-all duration-300 ${stg.isLocked ? 'bg-surface-elevated border border-border' : 'bg-gradient-to-r from-brand-primary to-orange-400'}`}
                              style={{ 
                                left: `${startOffsetPerc}%`, 
                                width: `${Math.min(100 - startOffsetPerc, durationPerc)}%`,
                                minWidth: '40px'
                              }}
                            >
                               <span className={`text-[10px] font-black uppercase tracking-wider truncate ${stg.isLocked ? 'text-text-muted' : 'text-white'}`}>
                                 {stg.duration}d
                               </span>
                            </div>

                            {/* Dependencies link visual (if autoStartNext and not first) */}
                            {autoStartNext && idx > 0 && !stg.isLocked && (
                              <div 
                                className="absolute h-8 border-l-2 border-b-2 border-brand-primary/30 rounded-bl-xl pointer-events-none transition-all duration-300"
                                style={{
                                  left: `${Math.max(0, diffD(ganttStart, schedule[idx-1].endDate)) / totalGanttDays * 100}%`,
                                  width: `${(diffD(schedule[idx-1].endDate, stg.startDate) / totalGanttDays) * 100}%`,
                                  top: '-16px'
                                }}
                              />
                            )}
                         </div>
                      </div>
                    )
                 })}
               </div>
             </div>
           </div>
        </div>

        {/* Right Column: Rules Panel */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <div className="glass rounded-[32px] p-6 border border-border">
             <h3 className="text-sm font-black uppercase tracking-widest text-text-primary flex items-center gap-2 mb-6">
                <Settings2 size={16} className="text-brand-primary" /> Regras do Pipeline
             </h3>

             <div className="space-y-6">
               <div>
                  <label className="text-[11px] font-black uppercase text-text-muted tracking-widest mb-3 flex justify-between">
                    Duração Padrão <span className="text-brand-primary">{defaultDuration} dias</span>
                  </label>
                  <input 
                    type="range" min="1" max="15" 
                    value={defaultDuration} 
                    onChange={e => setDefaultDuration(Number(e.target.value))}
                    className="w-full accent-brand-primary"
                  />
               </div>

               <div>
                  <label className="text-[11px] font-black uppercase text-text-muted tracking-widest mb-3 flex justify-between">
                    Margem de Segurança (Buffer) <span className="text-brand-primary">{defaultBuffer} dias</span>
                  </label>
                  <input 
                    type="range" min="0" max="7" 
                    value={defaultBuffer} 
                    onChange={e => setDefaultBuffer(Number(e.target.value))}
                    className="w-full accent-brand-primary"
                  />
               </div>

               <div className="pt-4 border-t border-border">
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <div className={`relative w-10 h-6 flex items-center rounded-full transition-colors ${autoStartNext ? 'bg-brand-primary' : 'bg-surface'}`}>
                     <div className={`w-4 h-4 bg-white rounded-full transition-transform ml-1 ${autoStartNext ? 'translate-x-4' : 'translate-x-0'}`} />
                   </div>
                   <input type="checkbox" className="sr-only" checked={autoStartNext} onChange={e => setAutoStartNext(e.target.checked)} />
                   <span className="text-sm font-bold text-text-primary group-hover:text-brand-primary transition-colors">Cascata Automática</span>
                 </label>
                 <p className="text-[11px] text-text-muted mt-2 leading-relaxed">As etapas começam automaticamente logo após a conclusão da etapa anterior (mais buffer).</p>
               </div>

               <div className="pt-4 border-t border-border">
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <div className={`relative w-10 h-6 flex items-center rounded-full transition-colors ${autoAdjust ? 'bg-brand-primary' : 'bg-surface'}`}>
                     <div className={`w-4 h-4 bg-white rounded-full transition-transform ml-1 ${autoAdjust ? 'translate-x-4' : 'translate-x-0'}`} />
                   </div>
                   <input type="checkbox" className="sr-only" checked={autoAdjust} onChange={e => setAutoAdjust(e.target.checked)} />
                   <span className="text-sm font-bold text-text-primary group-hover:text-brand-primary transition-colors">Ajuste Dinâmico</span>
                 </label>
                 <p className="text-[11px] text-text-muted mt-2 leading-relaxed">Mudar o fim de uma etapa empurra todas as próximas, exceto travadas.</p>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Task Assignment Area */}
      <div className="mt-4">
         <h3 className="text-xl font-bold font-heading text-text-primary uppercase tracking-widest mb-6">Detalhamento de Tarefas</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedule.map(stg => {
               const stgTasks = tasks.filter(t => t.stage_id === stg.id || t.status === stg.id || t.status === stages.find((s:any)=>s.id===stg.id)?.stage_key);
               
               if(stgTasks.length === 0) return null;

               return (
                  <div key={'tasks-' + stg.id} className="glass rounded-[28px] p-6 border border-border flex flex-col">
                     <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
                       <h4 className="font-bold text-sm text-text-primary">{stg.name}</h4>
                       <span className="text-[10px] font-black bg-surface-muted text-text-muted px-2 py-1 rounded uppercase">
                         Prazo: {prettyDate(stg.endDate)}
                       </span>
                     </div>
                     
                     <div className="flex flex-col gap-3 flex-1">
                        {stgTasks.map(task => {
                           const deadline = getTaskDeadline(task.id, stg.id);
                           const overdue = isOverdue(deadline);
                           const isDetached = detachedTasks[task.id];
                           const isDone = task.status === 'done' || task.status === 'approved';

                           return (
                             <div key={task.id} className={`p-4 rounded-xl transition-all ${isDone ? 'bg-surface opacity-60 grayscale' : 'glass-input '}`}>
                                <div className="flex justify-between items-start gap-4">
                                  <div className="min-w-0">
                                    <p className={`text-sm font-bold truncate ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>{task.title}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                       {isDetached ? (
                                         <input 
                                           type="date"
                                           value={deadline}
                                           onChange={(e) => handleCustomTaskDeadlineChange(task.id, e.target.value)}
                                           className={`text-xs bg-surface border border-border rounded px-2 py-1 focus:border-brand-primary outline-none ${overdue && !isDone ? 'text-status-danger font-bold bg-status-danger/10 border-status-danger/30' : 'text-text-primary'}`}
                                         />
                                       ) : (
                                         <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${overdue && !isDone ? 'bg-status-danger/20 text-status-danger' : 'bg-surface text-text-muted'}`}>
                                           {prettyDate(deadline)}
                                         </span>
                                       )}
                                    </div>
                                  </div>

                                  {!isDone && (
                                     <button
                                       onClick={() => handleTaskDetachToggle(task.id, stg.endDate)}
                                       className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isDetached ? 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20' : 'bg-surface hover:bg-surface-muted text-text-muted'}`}
                                       title={isDetached ? "Desvincular da Etapa. Prazo manual." : "Vinculado à Etapa."}
                                     >
                                       {isDetached ? <Unlink size={14} /> : <Link2 size={14} />}
                                     </button>
                                  )}
                                </div>
                             </div>
                           )
                        })}
                     </div>
                  </div>
               )
            })}
         </div>
      </div>

       {/* Floating Save Bar */}
       <div className={`fixed bottom-8 max-w-[1550px] mx-auto w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] lg:w-[calc(100%-8rem)] z-50 transition-all duration-500 ease-in-out`}>
         <div className="edge-light bg-surface-elevated/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-[32px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
           <div className="absolute inset-0 bg-brand-primary/5 mix-blend-overlay" />
           
           <div className="flex items-center gap-3 relative z-10 px-2">
             <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
               <Calendar size={20} />
             </div>
             <div>
               <p className="text-[11px] text-text-muted font-black uppercase tracking-widest">Resumo do Pipeline</p>
               <p className="text-sm font-bold text-text-primary mt-0.5">Fim Estimado: {prettyDate(ganttEnd)}</p>
             </div>
           </div>
 
           <div className="flex gap-3 w-full sm:w-auto relative z-10">
             <button
                onClick={() => router.push(`/dashboard/projects/${projectId}`)}
                className="flex-1 sm:flex-none px-6 py-3 rounded-full text-xs font-bold font-heading uppercase tracking-widest text-text-primary hover:bg-surface-muted transition-colors border border-border"
             >
                Voltar
             </button>
             <button
                onClick={handleSave}
                disabled={isPending}
                className="flex-1 sm:flex-none px-6 py-3 rounded-full text-xs font-bold font-heading uppercase tracking-widest bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors shadow-brand border border-brand-primary/50 flex items-center justify-center gap-2 disabled:opacity-50"
             >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Confirmar Prazos
             </button>
           </div>
         </div>
       </div>

    </div>
  )
}

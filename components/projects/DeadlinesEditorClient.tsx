'use client'

import React, { useState, useTransition } from 'react'
import { V2ProjectStage, Task, PRIORITY_LABELS, TaskStatusV2 } from '@/types/database'
import { bulkUpdateTaskDeadlines } from '@/app/dashboard/projects/[id]/deadlines/deadline-actions'
import { Calendar, Save, AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeadlinesEditorProps {
  projectId: string
  stages: any[]
  tasks: any[] // Using any here to bypass strict V1/V2 mix type issues if present, but safe downcast
}

export function DeadlinesEditorClient({ projectId, stages, tasks }: DeadlinesEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Track modified deadlines: record of TaskID -> string (date form value like "2026-05-12")
  const [modifiedDeadlines, setModifiedDeadlines] = useState<Record<string, string | null>>({})

  // Initialize dates safely converting ISO to standard native date input format YYYY-MM-DD
  const getInitialDate = (task: any) => {
    if (!task.deadline) return ''
    try {
      const dt = new Date(task.deadline)
      return dt.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  const handleDateChange = (taskId: string, value: string) => {
    setModifiedDeadlines(prev => ({
      ...prev,
      [taskId]: value === '' ? null : value
    }))
  }

  const handleSave = () => {
    if (Object.keys(modifiedDeadlines).length === 0) return

    startTransition(async () => {
      try {
        const payload = Object.entries(modifiedDeadlines).map(([taskId, deadline]) => ({
          taskId,
          deadline: deadline ? (new Date(deadline).toISOString()) : null
        }))
        
        await bulkUpdateTaskDeadlines(projectId, payload)
        
        // Reset modified state upon successful push
        setModifiedDeadlines({})
        
        // Let the user know via a native alert for now
        alert('Prazos atualizados com sucesso!')
        
      } catch (err: any) {
        alert(err.message || 'Houve um erro ao atualizar os prazos.')
      }
    })
  }

  const hasUnsavedChanges = Object.keys(modifiedDeadlines).length > 0

  return (
    <div className="flex flex-col gap-10 pb-20">
      
      {/* Stages and tasks loop */}
      {stages.map((stage) => {
        // Find tasks that belong to this stage
        const stageTasks = tasks.filter(t => t.stage_id === stage.id || t.status === stage.stage_key)

        return (
          <div key={stage.id} className="flex flex-col gap-4">
            <h3 className="text-xl font-bold font-heading text-text-primary uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-primary" />
              {stage.name}
              <span className="ml-2 text-xs text-text-muted bg-surface-muted px-3 py-1 rounded-full font-body tracking-normal normal-case">
                {stageTasks.length} {stageTasks.length === 1 ? 'tarefa' : 'tarefas'}
              </span>
            </h3>

            {stageTasks.length === 0 ? (
              <div className="bg-sand-light/5 dark:bg-slate-950/10 p-6 rounded-2xl border border-dashed border-sand-dark/20 text-center text-text-muted italic text-sm">
                Nenhuma tarefa pendente nesta etapa.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {stageTasks.map(task => {
                  const currentValue = modifiedDeadlines[task.id] !== undefined 
                    ? (modifiedDeadlines[task.id] || '') 
                    : getInitialDate(task);
                  
                  const isModified = modifiedDeadlines[task.id] !== undefined;

                  const isUrgent = task.priority === 'urgent'

                  return (
                    <div 
                      key={task.id} 
                      className={`glass rounded-[24px] p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center relative overflow-hidden transition-all duration-300 ${isModified ? 'ring-2 ring-brand-primary/50' : ''}`}
                    >
                      {/* Priority indicator line */}
                      {isUrgent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-danger" />}
                      
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-sm font-bold text-text-primary font-body tracking-tight truncate shrink-0 max-w-[280px]">
                           {task.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isUrgent ? 'bg-status-danger text-white' : 'bg-surface-muted text-text-muted'}`}>
                             {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS] || task.priority}
                           </span>
                           {task.status === 'done' && (
                             <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary">
                               Concluída
                             </span>
                           )}
                        </div>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto relative">
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] block mb-2">Prazo Final</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={currentValue}
                            onChange={(e) => handleDateChange(task.id, e.target.value)}
                            className="glass-input text-sm font-bold rounded-xl pl-4 pr-10 py-3 w-full sm:w-[180px] hover:border-brand-primary/50 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                          />
                          <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Floating Save Bar */}
      <div className={`fixed bottom-8 max-w-[1550px] mx-auto w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] lg:w-[calc(100%-8rem)] z-50 transition-all duration-500 ease-in-out ${hasUnsavedChanges ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="edge-light bg-surface-elevated/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-[32px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-primary/5 mix-blend-overlay" />
          
          <div className="flex items-center gap-3 relative z-10 px-2">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <AlertCircle size={20} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] text-brand-primary font-black uppercase tracking-widest">Alterações Pendentes</p>
              <p className="text-sm font-bold text-text-primary mt-0.5">{Object.keys(modifiedDeadlines).length} tarefa(s) modificada(s)</p>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto relative z-10">
            <button
               onClick={() => setModifiedDeadlines({})}
               disabled={isPending}
               className="flex-1 sm:flex-none px-6 py-3 rounded-full text-xs font-bold font-heading uppercase tracking-widest text-text-primary hover:bg-surface-muted transition-colors border border-border disabled:opacity-50"
            >
               Cancelar
            </button>
            <button
               onClick={handleSave}
               disabled={isPending}
               className="flex-1 sm:flex-none px-6 py-3 rounded-full text-xs font-bold font-heading uppercase tracking-widest bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors shadow-brand border border-brand-primary/50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
               {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
               Salvar Prazos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

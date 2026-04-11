'use client'

import React, { useState, useTransition } from 'react'
import { bulkUpdateTaskDeadlines } from '@/app/dashboard/projects/[id]/deadlines/deadline-actions'
import { Calendar, Save, Loader2, ArrowLeft, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeadlinesEditorProps {
  projectId: string
  stages: any[]
  tasks: any[]
}

export function DeadlinesEditorClient({ projectId, stages, tasks }: DeadlinesEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Local state for modified tasks
  const [editedTasks, setEditedTasks] = useState<Record<string, { start_date: string | null; deadline: string | null }>>({})

  const formatDateForInput = (dateStr: string | null) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  const handleDateChange = (taskId: string, field: 'start_date' | 'deadline', value: string) => {
    const task = tasks.find(t => t.id === taskId)
    const currentEdit = editedTasks[taskId] || { 
      start_date: task.start_date, 
      deadline: task.deadline || task.due_date 
    }

    setEditedTasks({
      ...editedTasks,
      [taskId]: {
        ...currentEdit,
        [field]: value === '' ? null : value
      }
    })
  }

  const handleSave = () => {
    if (Object.keys(editedTasks).length === 0) return

    startTransition(async () => {
      try {
        const updates = Object.entries(editedTasks).map(([taskId, dates]) => ({
          taskId,
          startDate: dates.start_date ? new Date(dates.start_date + 'T12:00:00Z').toISOString() : (tasks.find(t => t.id === taskId)?.start_date || null),
          deadline: dates.deadline ? new Date(dates.deadline + 'T12:00:00Z').toISOString() : (tasks.find(t => t.id === taskId)?.deadline || tasks.find(t => t.id === taskId)?.due_date || null)
        }))
        
        await bulkUpdateTaskDeadlines(projectId, updates)
        setEditedTasks({})
        alert('Prazos atualizados com sucesso!')
        router.refresh()
      } catch (err: any) {
        alert(err.message || 'Erro ao atualizar prazos.')
      }
    })
  }

  const hasChanges = Object.keys(editedTasks).length > 0

  return (
    <div className="flex flex-col gap-6 pb-24">
      {stages.map((stage) => {
        const stageTasks = tasks.filter(t => t.stage_id === stage.id)
        if (stageTasks.length === 0) return null

        return (
          <div key={stage.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                {stage.name}
              </h3>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{stageTasks.length} {stageTasks.length === 1 ? 'Tarefa' : 'Tarefas'}</span>
            </div>
            
            <div className="divide-y divide-slate-800/50">
              {stageTasks.map((task) => {
                const edit = editedTasks[task.id]
                const startDate = edit?.start_date !== undefined ? (edit.start_date || '') : formatDateForInput(task.start_date)
                const deadline = edit?.deadline !== undefined ? (edit.deadline || '') : formatDateForInput(task.deadline || task.due_date)

                return (
                  <div key={task.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-slate-800/20 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate">{task.title}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[9px] font-black bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">V2</span>
                        <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">#{task.id.slice(0, 6)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex flex-col gap-2 min-w-[150px]">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.15em] ml-1">Início</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => handleDateChange(task.id, 'start_date', e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none transition-all"
                          />
                          <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[150px]">
                        <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.15em] ml-1">Fim</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={deadline}
                            onChange={(e) => handleDateChange(task.id, 'deadline', e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none transition-all"
                          />
                          <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Floating Save Bar */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-50 transition-all duration-500 ${hasChanges ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-brand-primary/30 rounded-3xl p-2 flex items-center justify-between backdrop-blur-md">
          <div className="px-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <Clock size={16} className="text-brand-primary animate-pulse" />
            </div>
            <span className="text-xs font-black text-slate-200 uppercase tracking-widest">
              {Object.keys(editedTasks).length} Pendente{Object.keys(editedTasks).length > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex gap-1.5">
            <button
              onClick={() => setEditedTasks({})}
              className="px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="bg-brand-primary hover:bg-brand-primary-hover text-white px-7 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_5px_20px_rgba(var(--brand-primary-rgb),0.3)] transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

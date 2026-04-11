'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { TaskStatusV2, TaskPriorityV2, PRIORITY_LABELS, TASK_STATUS_V2_LABELS } from '@/types/database'
import { updateV2Task, getAllProfiles } from '@/app/dashboard/v2/task-actions'
import { X, Save, Loader2, Users, Calendar, AlertCircle, Type, AlignLeft } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface TaskEditModalProps {
  task: any
  open: boolean
  onClose: () => void
  projectId: string
}

export function TaskEditModal({ task, open, onClose, projectId }: TaskEditModalProps) {
  const [isPending, startTransition] = useTransition()
  const [profiles, setProfiles] = useState<any[]>([])
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as TaskStatusV2,
    priority: 'medium' as TaskPriorityV2,
    due_date: '',
    assignees: [] as string[]
  })

  useEffect(() => {
    if (open && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        assignees: task.v2_task_assignees?.map((a: any) => a.user_id) || []
      })

      getAllProfiles().then(setProfiles).catch(console.error)
    }
  }, [open, task])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        await updateV2Task(task.id, projectId, {
          ...formData,
          due_date: formData.due_date ? new Date(formData.due_date + 'T12:00:00Z').toISOString() : null
        })
        onClose()
      } catch (err: any) {
        alert('Erro ao salvar: ' + err.message)
      }
    })
  }

  const toggleAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId]
    }))
  }

  if (!task) return null

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent size="lg" className="overflow-hidden glass rounded-[32px] border-0 shadow-2xl">
        <ModalHeader showClose={false} className="p-8 pb-0">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Editor de Tarefa</span>
               <ModalTitle className="text-3xl font-black font-heading tracking-tight text-text-primary">
                 {formData.title || 'Nova Tarefa'}
               </ModalTitle>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl border border-border hover:bg-surface-muted transition-colors">
              <X size={20} className="text-text-muted" />
            </button>
          </div>
        </ModalHeader>

        <ModalBody className="p-8">
          <form onSubmit={handleSave} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Core Data */}
              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block flex items-center gap-2">
                    <Type size={12} /> Título da Tarefa
                  </label>
                  <input 
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    className="glass-input w-full p-4 rounded-xl font-bold text-sm"
                    placeholder="Ex: Criação de Logo"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block flex items-center gap-2">
                    <AlignLeft size={12} /> Descrição
                  </label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    className="glass-input w-full p-4 rounded-xl text-sm min-h-[120px] resize-none"
                    placeholder="Descreva o que deve ser feito..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Prioridade</label>
                    <select 
                      value={formData.priority}
                      onChange={e => setFormData(p => ({ ...p, priority: e.target.value as any }))}
                      className="glass-input w-full p-4 rounded-xl text-sm font-bold"
                    >
                      {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                   </div>
                   <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Status</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData(p => ({ ...p, status: e.target.value as any }))}
                      className="glass-input w-full p-4 rounded-xl text-sm font-bold"
                    >
                      {Object.entries(TASK_STATUS_V2_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                   </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block flex items-center gap-2">
                    <Calendar size={12} /> Prazo Final
                  </label>
                  <input 
                    type="date"
                    value={formData.due_date}
                    onChange={e => setFormData(p => ({ ...p, due_date: e.target.value }))}
                    className="glass-input w-full p-4 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              {/* Right Column: Team Management */}
              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block flex items-center gap-2">
                  <Users size={12} /> Equipe Designada
                </label>
                
                <div className="glass-input rounded-2xl p-4 min-h-[400px] flex flex-col gap-2 overflow-y-auto max-h-[500px]">
                  {profiles.map(profile => {
                    const isSelected = formData.assignees.includes(profile.id)
                    return (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => toggleAssignee(profile.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl transition-all border border-transparent",
                          isSelected 
                            ? "bg-brand-primary/10 border-brand-primary/20" 
                            : "hover:bg-surface-muted"
                        )}
                      >
                         <Avatar 
                          name={profile.full_name} 
                          src={profile.avatar_url} 
                          size="sm" 
                         />
                         <div className="flex flex-col items-start truncate">
                            <span className="text-xs font-bold text-text-primary text-left">{profile.full_name}</span>
                            <span className="text-[9px] text-text-muted uppercase tracking-wider">{profile.role}</span>
                         </div>
                         {isSelected && <div className="ml-auto w-2 h-2 rounded-full bg-brand-primary" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-4">
               <button 
                type="button"
                onClick={onClose}
                className="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
               >
                 Cancelar
               </button>
               <button 
                type="submit"
                disabled={isPending}
                className="px-12 py-4 rounded-2xl bg-brand-primary text-white text-xs font-black uppercase tracking-widest shadow-brand hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
               >
                 {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                 Salvar Alterações
               </button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

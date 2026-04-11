'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { TaskStatusV2, TaskPriorityV2, PRIORITY_LABELS, TASK_STATUS_V2_LABELS, DeliverableTypeV2 } from '@/types/database'
import { updateV2Task, getAllProfiles, syncSocialPosts } from '@/app/dashboard/v2/task-actions'
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
    assignees: [] as string[],
    deliverable_type: 'default' as DeliverableTypeV2,
    social_post_count: 0
  })

  useEffect(() => {
    if (open && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        assignees: task.v2_task_assignees?.map((a: any) => a.user_id) || [],
        deliverable_type: task.deliverable_type || 'default',
        social_post_count: task.social_post_count || 0
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
        
        // Sync social posts if count changed and type is social
        if (formData.deliverable_type === 'social_copy' || formData.deliverable_type === 'social_design') {
          await syncSocialPosts(task.id, formData.social_post_count)
        }

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
      <ModalContent size="giant" className="overflow-hidden bg-gradient-to-br from-surface to-background/50 dark:from-surface dark:to-background/80 shadow-2xl">
        <ModalHeader showClose={false} className="p-8 lg:px-12 lg:py-10 border-b border-sand-dark/10">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                 <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                 Atmosfera de Edição
               </div>
               <ModalTitle className="text-3xl lg:text-4xl font-black font-heading tracking-tight text-text-primary leading-tight">
                 {formData.title || 'Nova Tarefa'}
               </ModalTitle>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 rounded-2xl border border-sand-dark/20 hover:bg-surface-muted transition-all duration-200 group active:scale-95"
            >
              <X size={20} className="text-text-muted group-hover:text-text-primary transition-colors" />
            </button>
          </div>
        </ModalHeader>

        <ModalBody className="p-0 flex-1 overflow-hidden">
          <form onSubmit={handleSave} className="flex flex-col h-full">
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              
              {/* Left Column: Core Data (Scrollable) */}
              <div className="flex-1 p-8 lg:p-12 overflow-y-auto space-y-10 border-r border-sand-dark/10">
                
                {/* Section: Basic Info */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-5 rounded-full bg-brand-primary" />
                    <h4 className="text-xs font-black text-text-primary uppercase tracking-widest">Estrutura da Tarefa</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block flex items-center gap-2 px-1">
                        <Type size={12} className="text-brand-primary/60" /> Título Editorial
                      </label>
                      <input 
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                        className="glass-input w-full p-5 rounded-2xl font-black text-lg xl:text-xl focus:shadow-lg transition-all"
                        placeholder="Ex: Refinamento de Campanha v2"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block flex items-center gap-2 px-1">
                        <AlignLeft size={12} className="text-brand-primary/60" /> Descritivo de Operação
                      </label>
                      <textarea 
                        value={formData.description}
                        onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                        className="glass-input w-full p-5 rounded-2xl text-base min-h-[160px] resize-none leading-relaxed"
                        placeholder="Prazos, diretrizes e objetivos claros..."
                      />
                    </div>
                  </div>
                </section>

                {/* Section: Parameters */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-5 rounded-full bg-brand-secondary" />
                    <h4 className="text-xs font-black text-text-primary uppercase tracking-widest">Parâmetros de Entrega</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block px-1">Prioridade</label>
                      <div className="relative group">
                        <AlertCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                        <select 
                          value={formData.priority}
                          onChange={e => setFormData(p => ({ ...p, priority: e.target.value as any }))}
                          className="glass-input w-full pl-12 pr-4 py-4 rounded-xl text-sm font-black uppercase tracking-widest appearance-none cursor-pointer"
                        >
                          {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                            <option key={val} value={val} className="bg-surface text-text-primary">{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block px-1">Estado Atual</label>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block px-1">Tipo de Entrega</label>
                      <select 
                        value={formData.deliverable_type}
                        onChange={e => setFormData(p => ({ ...p, deliverable_type: e.target.value as any }))}
                        className="glass-input w-full p-4 rounded-xl text-sm font-black uppercase tracking-widest appearance-none cursor-pointer"
                      >
                        <option value="default" className="bg-surface">Padrão</option>
                        <option value="social_copy" className="bg-surface">Social Copy</option>
                        <option value="social_design" className="bg-surface">Social Design</option>
                        <option value="copy" className="bg-surface">Copywriting</option>
                        <option value="design" className="bg-surface">Design Geral</option>
                      </select>
                    </div>

                    {(formData.deliverable_type === 'social_copy' || formData.deliverable_type === 'social_design') && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block px-1">Qtd. de Posts</label>
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={formData.social_post_count}
                          onChange={e => setFormData(p => ({ ...p, social_post_count: parseInt(e.target.value) || 0 }))}
                          className="glass-input w-full p-4 rounded-xl text-sm font-black tracking-widest"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block flex items-center gap-2 px-1">
                      <Calendar size={12} className="text-brand-primary/60" /> Data Limite de Execução
                    </label>
                    <input 
                      type="date"
                      value={formData.due_date}
                      onChange={e => setFormData(p => ({ ...p, due_date: e.target.value }))}
                      className="glass-input w-full p-5 rounded-2xl text-sm font-black tracking-widest transition-all focus:shadow-md"
                    />
                  </div>
                </section>
              </div>

              {/* Right Column: Team Management (Focussed List) */}
              <div className="w-full lg:w-[420px] bg-sand-light/10 dark:bg-slate-950/20 p-8 lg:p-12 flex flex-col gap-6 shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col gap-1">
                      <h4 className="text-xs font-black text-text-primary uppercase tracking-widest">Equipe Operacional</h4>
                      <p className="text-[10px] text-text-muted font-bold">Selecione os responsáveis diretos</p>
                    </div>
                    <div className="bg-brand-primary text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                      {formData.assignees.length} ativos
                    </div>
                  </div>
                  
                  <div className="space-y-3 overflow-y-auto max-h-[calc(85vh-350px)] pr-2 custom-scrollbar">
                    {profiles.map(profile => {
                      const isSelected = formData.assignees.includes(profile.id)
                      return (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => toggleAssignee(profile.id)}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-[24px] transition-all duration-300 border text-left group",
                            isSelected 
                              ? "bg-white dark:bg-slate-900 border-brand-primary/30 shadow-md scale-[1.02]" 
                              : "bg-white/40 dark:bg-white/5 border-transparent hover:border-sand-dark/30 hover:bg-white/60"
                          )}
                        >
                           <div className="relative">
                             <Avatar 
                               name={profile.full_name} 
                               src={profile.avatar_url} 
                               size="md" 
                               className={cn(
                                 "ring-2 transition-all",
                                 isSelected ? "ring-brand-primary" : "ring-transparent grayscale-[30%]"
                               )}
                             />
                             {isSelected && (
                               <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-primary border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                 <Save size={8} className="text-white" />
                               </div>
                             )}
                           </div>
                           <div className="flex flex-col flex-1 truncate">
                               <span className={cn(
                                 "text-sm font-black tracking-tight truncate transition-colors",
                                 isSelected ? "text-text-primary" : "text-text-secondary"
                               )}>{profile.full_name}</span>
                               <span className="text-[10px] text-brand-primary font-black uppercase tracking-widest mt-0.5 opacity-80">{profile.role || 'Especialista'}</span>
                            </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-auto pt-8 relative z-10">
                   <div className="p-6 rounded-[28px] bg-slate-950 dark:bg-slate-900 text-white relative overflow-hidden shadow-2xl border border-white/5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                      <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-brand-primary">Dica Operacional</h5>
                      <p className="text-[12px] font-medium leading-[1.6] opacity-90 text-slate-300">
                        Prazos curtos exigem equipes seniores. Certifique-se de alinhar as expectativas com os envolvidos.
                      </p>
                   </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 lg:p-8 border-t border-sand-dark/10 bg-white/40 dark:bg-slate-950/20 backdrop-blur-md flex items-center justify-between shrink-0">
               <button 
                type="button"
                onClick={onClose}
                className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-brand-primary transition-all active:scale-95"
               >
                 Descartar Alterações
               </button>
               <button 
                type="submit"
                disabled={isPending}
                className="px-10 py-4.5 rounded-[24px] bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-brand hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:translate-y-0"
               >
                 {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />}
                 Finalizar Edição & Sincronizar
               </button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>

  )
}

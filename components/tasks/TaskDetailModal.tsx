'use client'

import React, { useEffect, useState } from 'react'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { V2Task, PRIORITY_LABELS, TASK_STATUS_V2_LABELS } from '@/types/database'
import { Avatar } from '@/components/ui/avatar'
import { Calendar, Clock, ClipboardList, AlertCircle, ChevronLeft, X } from 'lucide-react'
import { TaskComments } from './TaskComments'
import { getTaskComments } from '@/app/dashboard/tasks/comment-actions'
import Link from 'next/link'

interface TaskDetailModalProps {
  task: (V2Task & { profiles?: { full_name: string; avatar_url: string | null } | null }) | null
  open: boolean
  onClose: () => void
}

export function TaskDetailModal({ task, open, onClose }: TaskDetailModalProps) {
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    if (open && task) {
      setLoadingComments(true)
      getTaskComments(task.id)
        .then(setComments)
        .catch(err => console.error('Error fetching comments:', err))
        .finally(() => setLoadingComments(false))
    }
  }, [open, task])

  if (!task) return null

  // Define priority colors matching theme for light and dark
  const priorityColorMap = {
    low: 'text-text-muted bg-surface-muted border-border',
    medium: 'text-warning bg-warning/10 border-warning/20',
    high: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20',
    urgent: 'text-white bg-status-danger border-status-danger',
  }

  const pColor = priorityColorMap[task.priority as keyof typeof priorityColorMap] || 'text-text-muted bg-surface-muted'

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent size="giant" className="overflow-hidden flex flex-col border border-border/50 shadow-xl glass depth-modal">
        <ModalHeader showClose={false} className="border-b border-border/40 px-5 sm:px-10 py-5 sm:py-8 relative shrink-0 flex items-start justify-between">
          <div className="flex flex-col gap-1.5 pt-2 sm:pt-0">
            {/* Mobile Back Button */}
            <button 
              onClick={onClose} 
              className="sm:hidden flex items-center text-text-muted hover:text-brand-primary transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-4 active:-translate-x-1"
            >
               <ChevronLeft size={16} className="mr-0.5" />
               Voltar
            </button>
            <div className="flex items-center gap-2 text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              Detalhamento da Operação
            </div>
            <ModalTitle className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-text-primary leading-tight">
              {task.title}
            </ModalTitle>
          </div>
          
          {/* Desktop Close Button */}
          <button 
            onClick={onClose}
            className="hidden sm:flex shrink-0 p-2 rounded-xl text-text-muted hover:bg-sand/50 dark:hover:bg-white/5 hover:text-text-primary transition-colors -mr-2"
          >
            <X size={20} />
          </button>
        </ModalHeader>

        <ModalBody className="overflow-y-auto overflow-x-hidden flex-1 p-0">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Main Area: Description & Comments */}
            <div className="flex-1 p-5 sm:p-8 lg:p-10 space-y-10 sm:space-y-12 border-b lg:border-b-0 lg:border-r border-sand-dark/10">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-sand/50 dark:bg-slate-900/50 flex items-center justify-center text-brand-primary shadow-sm border border-sand-dark/10">
                    <ClipboardList size={20} strokeWidth={2.5} />
                  </div>
                  <h4 className="text-sm font-black text-text-primary uppercase tracking-widest">
                    Escopo & Instruções
                  </h4>
                </div>
                
                <div className="bg-sand-light/20 dark:bg-slate-950/40 rounded-[28px] p-7 border border-sand-dark/10 shadow-inner">
                  {task.description ? (
                    <div className="text-text-secondary font-body leading-relaxed whitespace-pre-wrap text-base">
                      {task.description}
                    </div>
                  ) : (
                    <p className="text-text-muted italic font-body text-sm opacity-80">Esta tarefa ainda não possui uma descrição estruturada.</p>
                  )}
                </div>
              </section>

              {/* Social Media Production Grid Replacement */}
              {((task as any).projects?.workflow_type !== 'social_media' && (task as any).v2_projects?.workflow_type !== 'social_media' && (task as any).project?.workflow_type !== 'social_media') && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary shadow-brand flex items-center justify-center text-white">
                      <ClipboardList size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-sm font-black text-text-primary uppercase tracking-widest">
                        Estúdio Editorial
                      </h4>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Gestão Multi-Post Ativa</p>
                    </div>
                  </div>
                  
                  <div className="p-8 rounded-[32px] bg-brand-primary/5 border-2 border-dashed border-brand-primary/20 flex flex-col items-center justify-center text-center gap-4">
                     <p className="text-sm text-text-secondary font-medium max-w-xs">
                        Esta tarefa agora é gerenciada através do novo **Estúdio Editorial**, permitindo múltiplos posts e versionamento.
                     </p>
                     <Link 
                       href={`/dashboard/tasks/${task.id}`}
                       className="px-6 py-3 bg-brand-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-brand hover:scale-105 transition-all"
                     >
                        Abrir Estúdio Editorial
                     </Link>
                  </div>
                </section>
              )}

              <section className="pt-4">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/5 dark:bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm border border-brand-primary/10">
                    <Clock size={20} strokeWidth={2.5} />
                  </div>
                  <h4 className="text-sm font-black text-text-primary uppercase tracking-widest">
                    Histórico & Diálogo
                  </h4>
                  {loadingComments && <span className="text-[10px] font-bold text-brand-primary animate-pulse ml-2 uppercase tracking-widest">Sincronizando...</span>}
                </div>
                
                <div className="bg-white/30 dark:bg-slate-950/20 rounded-[32px] p-2 border border-sand-dark/5 shadow-sm">
                   <TaskComments taskId={task.id} comments={comments} />
                </div>
              </section>
            </div>

            {/* Sidebar: Metadata */}
            <div className="w-full lg:w-[380px] bg-sand-light/10 dark:bg-slate-950/20 p-5 sm:p-8 lg:p-10 flex flex-col gap-8 shrink-0">
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block mb-4">Etapa</label>
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3.5 rounded-2xl border border-sand-dark/10 dark:border-white/5 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-brand-primary shadow-[0_0_12px_rgba(var(--brand-primary-rgb),0.4)]" />
                    <span className="text-sm font-bold text-text-primary font-body">{TASK_STATUS_V2_LABELS[task.status as import('@/types/database').TaskStatusV2] || task.status}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block mb-4">Prioridade</label>
                  <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-sm transition-all ${pColor}`}>
                    <AlertCircle size={18} strokeWidth={2.5} />
                    <span className="text-sm font-black uppercase tracking-widest">{PRIORITY_LABELS[task.priority]}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block mb-4">Prazo de Entrega</label>
                  <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-5 py-4.5 rounded-[24px] border border-sand-dark/10 shadow-sm group hover:border-brand-primary/30 transition-all">
                    <div className="w-11 h-11 rounded-full bg-sand-dark/20 dark:bg-slate-800 flex items-center justify-center text-text-muted group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                      <Calendar size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-primary font-body">
                         {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Fluxo Contínuo'}
                      </span>
                      <span className="text-[10px] text-text-muted font-black uppercase tracking-wider mt-0.5 mt-1">Estimativa de Finalização</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block mb-4">Responsável Direto</label>
                  <div className="flex items-center gap-4 bg-slate-950 dark:bg-slate-900 p-5 rounded-[28px] text-white shadow-xl transform transition-all group border border-white/5">
                    <Avatar 
                      name={task.profiles?.full_name || 'U'} 
                      src={task.profiles?.avatar_url || undefined} 
                      size="md" 
                      className="border-2 border-white/10 ring-0 shadow-lg shrink-0"
                    />
                    <div className="flex flex-col relative z-10 truncate">
                      <span className="text-sm font-black tracking-tight truncate">
                         {task.profiles?.full_name || 'Agência Duas Mãos'}
                      </span>
                      <span className="text-[10px] text-brand-primary font-black uppercase tracking-widest mt-1">Executor Especialista</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-4 pt-10">
                 <div className="p-6 rounded-[28px] bg-brand-primary shadow-brand text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-12 -mt-12 blur-2xl" />
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 opacity-90">Radar Duas Mãos</h5>
                    <p className="text-[13px] font-body font-medium leading-[1.4] opacity-95">
                      Esta tarefa está no caminho crítico. Foco total para manter a saúde do projeto em 100%.
                    </p>
                 </div>
                 
                 <button 
                  onClick={onClose}
                  className="w-full py-4.5 rounded-[20px] bg-white dark:bg-slate-900 border border-sand-dark/20 dark:border-white/5 text-text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sand-light dark:hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98]"
                 >
                   Fechar Visualização
                 </button>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

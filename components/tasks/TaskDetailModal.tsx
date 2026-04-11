'use client'

import React, { useEffect, useState } from 'react'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Task, PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/types/database'
import { Avatar } from '@/components/ui/avatar'
import { Calendar, Clock, ClipboardList, AlertCircle } from 'lucide-react'
import { TaskComments } from './TaskComments'
import { getTaskComments } from '@/app/dashboard/tasks/comment-actions'

interface TaskDetailModalProps {
  task: (Task & { profiles?: { full_name: string; avatar_url: string | null } | null }) | null
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

  // Define priority colors matching theme
  const priorityColorMap = {
    low: 'text-blue-600 bg-blue-50 border-blue-100',
    medium: 'text-yellow-700 bg-yellow-50 border-yellow-100',
    high: 'text-orange-600 bg-orange-50 border-orange-100',
    urgent: 'text-white bg-terracotta border-terracotta',
  }

  const pColor = priorityColorMap[task.priority as keyof typeof priorityColorMap] || 'text-text-muted bg-surface-muted'

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent size="full" className="max-h-[85vh] overflow-hidden flex flex-col rounded-[32px] border-none shadow-2xl">
        <ModalHeader className="border-b border-sand-dark/20 px-8 py-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              Tarefa Detalhada
            </div>
            <ModalTitle className="text-3xl font-black font-heading tracking-tight text-text-primary">
              {task.title}
            </ModalTitle>
          </div>
        </ModalHeader>

        <ModalBody className="overflow-y-auto flex-1 p-0">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Main Area: Description & Comments */}
            <div className="flex-1 p-8 lg:p-10 space-y-12 border-r border-sand-dark/10">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-sand-warm flex items-center justify-center text-brand-primary shadow-sm">
                    <ClipboardList size={20} strokeWidth={2.5} />
                  </div>
                  <h4 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    Descrição do Escopo
                  </h4>
                </div>
                
                <div className="bg-sand-light/30 rounded-[24px] p-6 border border-sand-dark/10">
                  {task.description ? (
                    <div className="text-text-secondary font-body leading-relaxed whitespace-pre-wrap text-base">
                      {task.description}
                    </div>
                  ) : (
                    <p className="text-text-muted italic font-body text-sm">Esta tarefa ainda não possui uma descrição detalhada.</p>
                  )}
                </div>
              </section>

              <section className="pt-4">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm">
                    <Clock size={20} strokeWidth={2.5} />
                  </div>
                  <h4 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    Atividade & Comentários
                  </h4>
                  {loadingComments && <span className="text-[10px] font-bold text-brand-primary animate-pulse ml-2 uppercase">Sincronizando...</span>}
                </div>
                
                <div className="bg-white/50 rounded-[28px] p-2">
                   <TaskComments taskId={task.id} comments={comments} />
                </div>
              </section>
            </div>

            {/* Sidebar: Metadata */}
            <div className="w-full lg:w-[360px] bg-sand-light/20 p-8 lg:p-10 flex flex-col gap-8">
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block mb-4">Status da Entrega</label>
                  <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-sand-dark/20 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.5)]" />
                    <span className="text-sm font-bold text-text-primary font-body">{TASK_STATUS_LABELS[task.status]}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block mb-4">Urgentômetro</label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-sm transition-all ${pColor}`}>
                    <AlertCircle size={18} strokeWidth={2.5} />
                    <span className="text-sm font-black uppercase tracking-wider">{PRIORITY_LABELS[task.priority]}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block mb-4">Deadline</label>
                  <div className="flex items-center gap-4 bg-white px-5 py-4 rounded-3xl border border-sand-dark/20 shadow-sm group hover:border-brand-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-sand-dark/30 flex items-center justify-center text-text-muted group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                      <Calendar size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-text-primary font-body">
                         {task.deadline ? new Date(task.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Fluxo contínuo'}
                      </span>
                      <span className="text-[10px] text-text-muted font-medium uppercase mt-0.5">Prazo de entrega</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block mb-4">Responsável</label>
                  <div className="flex items-center gap-4 bg-[#111] p-5 rounded-[24px] text-white shadow-xl transform hover:scale-[1.02] transition-transform cursor-default overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-brand-primary/20 transition-colors" />
                    <Avatar 
                      name={task.profiles?.full_name || 'U'} 
                      src={task.profiles?.avatar_url} 
                      size="md" 
                      className="border-2 border-white/20 ring-0 shadow-lg shrink-0"
                    />
                    <div className="flex flex-col relative z-10 truncate">
                      <span className="text-sm font-black tracking-tight truncate">
                         {task.profiles?.full_name || 'Agência Duas Mãos'}
                      </span>
                      <span className="text-[10px] text-brand-primary font-bold uppercase tracking-widest mt-0.5">Executor Ativo</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                 <div className="p-6 rounded-[24px] bg-brand-primary shadow-[0_15px_35px_rgba(var(--brand-primary-rgb),0.2)] text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full -mr-8 -mt-8" />
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Insight de IA</h5>
                    <p className="text-[13px] font-body font-medium leading-snug">
                      Esta tarefa está em seu fluxo crítico. Mantenha os prazos para garantir a saúde do projeto.
                    </p>
                 </div>
                 
                 <button 
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-white border border-sand-dark/30 text-text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sand-light transition-colors shadow-sm"
                 >
                   Fechar Detalhes
                 </button>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

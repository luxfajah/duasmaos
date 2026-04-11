'use client'

import React, { useEffect, useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import {
  ChevronDown,
  PhoneCall,
  Layout,
  Play,
  Plus,
  Mic,
  Calendar,
  MessageCircle,
  FileText,
  Clock,
  ArrowRight,
  CalendarDays
} from 'lucide-react'
import { useProjectContext } from '@/components/providers/project-provider'
import { ExtendedProject } from '@/app/dashboard/projects/actions'
import { Task } from '@/types/database'
import Link from 'next/link'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'

function getGreeting(hour: number) {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

interface DashboardClientViewProps {
  user: {
    firstName: string
    displayName: string
    avatarUrl?: string | null
  }
  team: Array<{ id: string; full_name: string; avatar_url: string | null }>
  initialProjects: any[] // BaseProject / ExtendedProject
  initialTasks: any[] // Extended Task
}

export function DashboardClientView({ user, team, initialProjects, initialTasks }: DashboardClientViewProps) {
  const { projects, selectedProject, setProjects, setSelectedProject } = useProjectContext()
  const now = new Date()
  const greeting = getGreeting(now.getHours())

  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [meetingModalOpen, setMeetingModalOpen] = useState(false)
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false)
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<any>(null)

  useEffect(() => {
    // Populate context strictly bypassing tasks array from global state payload
    if (projects.length === 0 && initialProjects.length > 0) {
      const lightweightProjects = initialProjects.map(p => ({
        id: p.id,
        name: p.name,
        client_id: p.client_id,
        status: p.status,
        progress: p.progress,
        type: p.type
      }))
      setProjects(lightweightProjects)
    }
  }, [initialProjects, projects.length, setProjects])

  const safeSelectedProject = selectedProject || initialProjects.find(p => p.status !== 'completed' && p.status !== 'delayed') || initialProjects[0]

  // Filter local payload tasks directly derived from server
  const activeProjectId = safeSelectedProject?.id
  const projectTasks = initialTasks.filter(t => t.project_id === activeProjectId)
  
  // Global Agency Tasks Logic
  const allTasks = initialTasks || []
  const globalPendingTasks = allTasks.filter(t => t.status !== 'done')
  
  // Sort global tasks: Overdue first, then by deadline
  const tasksToDisplay = [...globalPendingTasks].sort((a, b) => {
    const isAOverdue = a.deadline && new Date(a.deadline) < now
    const isBOverdue = b.deadline && new Date(b.deadline) < now
    
    if (isAOverdue && !isBOverdue) return -1
    if (!isAOverdue && isBOverdue) return 1
    
    // Fallback to deadline date
    if (!a.deadline) return 1
    if (!b.deadline) return -1
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  })

  const globalCompletedTasks = allTasks
    .filter(t => t.status === 'done')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  const completedTasks = projectTasks
    .filter(t => t.status === 'done')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  // Active Health Logic
  // Mimicking dynamic 85% visually
  const projectHealth = safeSelectedProject?.progress || 0
  const isHealthy = projectHealth >= 70

  return (
    <div className="animate-fade-in-up pb-24 max-w-[1600px] mx-auto w-full">
      {/* 2. Header (Humanized) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-12 gap-6 relative z-10 w-full">
        {/* LEFT */}
        <div className="flex items-center gap-5 w-full xl:w-[40%]">
          <Avatar
            name={user.displayName}
            src={user.avatarUrl || undefined}
            size="lg"
            variant="brand"
            className="ring-4 ring-brand-primary/10 shadow-sm w-16 h-16 shrink-0"
          />
          <div>
            <h1 className="heading-editorial text-3xl md:text-5xl text-text-primary leading-tight font-black tracking-tight flex items-center gap-2">
              {greeting}, {user.firstName} <span className="inline-block animate-wave transform origin-bottom-right">👋</span>
            </h1>
            <p className="text-text-secondary mt-1 font-medium font-body text-sm">
              Você tem acompanhamento em <span className="font-bold text-text-primary">{globalPendingTasks.length} tarefas</span> hoje.
            </p>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex-1 hidden xl:flex justify-center">
            <h2 className="text-lg font-bold font-heading text-text-primary tracking-wide">Tarefas de Hoje</h2>
        </div>
        
        {/* RIGHT */}
        <div className="flex items-center gap-3 self-start xl:self-center shrink-0 w-full xl:w-[300px] xl:justify-end">
          <span className="text-sm font-bold text-text-muted font-body">Equipe:</span>
          <div className="flex -space-x-2">
            {team.slice(0, 3).map((member, i) => (
              <Avatar 
                key={member.id} 
                name={member.full_name} 
                src={member.avatar_url || undefined}
                size="sm" 
                className={`border-2 border-background/50 ring-0 shadow-sm ${i % 2 === 0 ? 'bg-sand-dark' : 'bg-brand-primary text-white'}`} 
              />
            ))}
            {team.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-background/50 bg-sand-dark flex items-center justify-center text-[10px] font-bold text-text-secondary z-10 transition-transform hover:scale-105 cursor-pointer shadow-sm">
                +{team.length - 3}
              </div>
            )}
            {team.length === 0 && (
               <div className="w-8 h-8 rounded-full border-2 border-background/50 bg-sand-dark flex items-center justify-center text-[10px] font-bold text-text-secondary z-10 shadow-sm">
                 +0
               </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Layout: 3 Columns with gap-8 */}
      <div className="flex flex-col xl:flex-row gap-8 items-start relative z-10">
        
        {/* LEFT: Main Focus Block (~40%) */}
        <div className="w-full xl:w-[40%] shrink-0 flex flex-col gap-6">
          
          {/* Project Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="floating-card rounded-[20px] p-4 inline-flex items-center justify-between gap-6 cursor-pointer self-start min-w-[280px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F6E3A2] text-[#A67C00] flex items-center justify-center shadow-inner">
                     <Layout size={20} strokeWidth={2.5}/>
                  </div>
                  <div>
                    <h3 className="font-bold font-heading text-text-primary leading-tight max-w-[200px] truncate">{safeSelectedProject?.name || 'Selecione...'}</h3>
                    <p className="text-[11px] text-text-muted font-body capitalize">{safeSelectedProject?.type || 'Geral'}</p>
                  </div>
                </div>
                <ChevronDown size={18} className="text-text-muted ml-4 shrink-0" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[300px] p-2 bg-surface rounded-2xl border border-border shadow-xl">
              {projects.map(p => (
                <DropdownMenuItem key={p.id} asChild>
                  <button
                    onClick={() => setSelectedProject(p)}
                    className="w-full flex items-center p-3 rounded-xl hover:bg-brand-primary/10 cursor-pointer transition-colors text-text-primary"
                  >
                     <span className="font-medium font-body truncate">{p.name}</span>
                  </button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Huge Number & Label */}
          <div className="px-2 mt-2 mb-0 relative">
            <div className="text-[8rem] xl:text-[10rem] font-bold font-heading text-text-primary leading-none tracking-tighter tabular-nums drop-shadow-sm flex items-end relative z-10 -ml-2">
              {projectHealth}<span className="text-5xl xl:text-7xl mb-5 xl:mb-7 ml-1 opacity-90">%</span>
            </div>
            <p className="text-text-secondary font-medium font-body mt-2 text-lg xl:text-xl relative z-10">
              Saúde da operação do projeto
            </p>
          </div>

          {/* Subcard with Metrics - Yellow Theme */}
          <div className="w-full bg-[#FFD166] dark:bg-[#d4a841] rounded-[32px] p-7 xl:p-8 text-[#4a3915] dark:text-[#2c220c] shadow-lg relative overflow-hidden flex flex-col mt-4">
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/40" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <span className="text-sm font-bold font-body">Resumo do Projeto</span>
              <span className="px-4 py-1.5 bg-black/5 rounded-full text-[10px] font-bold font-heading uppercase tracking-widest text-[#4a3915]/60">
                Estatística
              </span>
            </div>
            <div className="flex justify-between relative z-10 px-1">
              <div>
                <p className="text-3xl xl:text-4xl font-black font-heading mb-1 tabular-nums flex items-baseline gap-0.5 tracking-tight">{projectTasks.length}<span className="text-lg xl:text-xl opacity-60"></span></p>
                <p className="text-[11px] xl:text-xs font-bold opacity-80 font-body uppercase tracking-wider">Tarefas</p>
              </div>
              <div>
                <p className="text-3xl xl:text-4xl font-black font-heading mb-1 tabular-nums flex items-baseline gap-0.5 tracking-tight">{completedTasks.length}<span className="text-lg xl:text-xl opacity-60"></span></p>
                <p className="text-[11px] xl:text-xs font-bold opacity-80 font-body uppercase tracking-wider">Concluídas</p>
              </div>
              <div>
                <p className="text-3xl xl:text-4xl font-black font-heading mb-1 tabular-nums flex items-baseline gap-0.5 tracking-tight">{projectHealth >= 50 ? 'Bom' : 'Ops'}<span className="text-lg xl:text-xl opacity-60"></span></p>
                <p className="text-[11px] xl:text-xs font-bold opacity-80 font-body uppercase tracking-wider">Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Task Cards (flex-1 main content) */}
        <div className="flex-1 flex flex-col gap-6 pt-2">
          {tasksToDisplay.length === 0 ? (
             <div className="p-8 text-center rounded-3xl floating-card text-text-muted">
               Nenhuma tarefa para listar.
             </div>
           ) : tasksToDisplay.map((task, index) => {
             
             const dateObj = task.deadline ? new Date(task.deadline) : null
             const isOverdue = dateObj && dateObj < now && task.status !== 'done'
             const isHighPriority = task.priority === 'urgent' || task.priority === 'high' || isOverdue
             const isMeeting = task.status === 'review' 
             const isToday = dateObj && dateObj.toDateString() === now.toDateString()

             return (
             <div key={task.id} className={`floating-card rounded-[32px] p-7 xl:p-9 transition-all group relative overflow-hidden w-full ${isOverdue ? 'border-status-danger/30' : ''}`}>
               {isHighPriority && <div className={`absolute top-0 right-0 w-32 h-32 ${isOverdue ? 'bg-status-danger/5' : 'bg-brand-terracotta/5'} rounded-bl-[100px] pointer-events-none`} />}
               
               <div className="flex items-center justify-between mb-6 flex-wrap gap-2 relative z-10">
                 <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold font-heading flex items-center gap-3">
                      {isMeeting ? <PhoneCall size={20} strokeWidth={2.5}/> : <Layout size={20} className={isOverdue ? "text-status-danger" : isHighPriority ? "text-brand-terracotta" : ""} strokeWidth={2.5}/>}
                      {task.title}
                    </h3>
                    <p className="text-[10px] text-text-muted font-bold flex items-center gap-1">
                       <Layout size={10} /> {task.v2_projects?.name || 'Projeto Geral'}
                    </p>
                 </div>
                 <div className="flex items-center gap-2">
                   {isOverdue && (
                     <span className="px-3 py-1.5 bg-status-danger text-white rounded-full text-[10px] font-black font-body uppercase tracking-widest shadow-lg animate-pulse">
                        Atrasada
                     </span>
                   )}
                   {isHighPriority && !isOverdue && <span className="px-3 py-1.5 bg-terracotta text-white rounded-full text-[11px] font-bold font-body shadow-sm whitespace-nowrap">Alta Prioridade</span>}
                   <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold font-body tracking-wide whitespace-nowrap ${isMeeting ? 'bg-[#34A853]/15 text-[#21813A]' : 'bg-[#FFD166] text-[#4a3915]'}`}>
                     {isMeeting ? 'Reunião' : 'Tarefa'}
                   </span>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 border-t border-b border-sand-dark/20 py-4 relative z-10">
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Prazo:</p>
                  <p className="text-sm font-bold font-body text-text-primary">{isToday ? 'Hoje' : dateObj ? dateObj.toLocaleDateString() : 'Aberto'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Responsável:</p>
                  <p className="text-sm font-bold font-body text-text-primary capitalize">{task.profiles?.full_name || 'Design & Crescimento'}</p>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-2 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <Avatar name={task.profiles?.full_name || 'Usuário'} src={task.profiles?.avatar_url || undefined} size="sm" className="border-2 border-white ring-0" />
                  </div>
                  <span className="text-[11px] text-text-muted font-bold whitespace-nowrap">Responsável ativo</span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedTaskDetail(task)
                    setTaskDetailModalOpen(true)
                  }}
                  className={`px-5 py-2.5 rounded-full text-[11px] font-bold font-heading shrink-0 uppercase tracking-widest hover:scale-105 active:scale-95 duration-200 shadow-sm flex items-center gap-2 ${
                    isHighPriority 
                      ? 'bg-status-danger/90 hover:bg-status-danger text-white border border-status-danger/20' 
                      : 'bg-brand-primary/15 hover:bg-brand-primary/25 text-brand-primary dark:text-brand-primary-light border border-brand-primary/20 backdrop-blur-md'
                  }`}
                >
                  {isHighPriority && <span className="text-white/80 group-hover:rotate-12 transition-transform">✦</span>}
                  {isMeeting ? 'Juntar-se à Reunião' : 'Ver Detalhes'}
                </button>
              </div>
            </div>
          )})}
        </div>

        {/* RIGHT: Quick Actions Panel (~300px) */}
        <div className="w-full xl:w-[300px] shrink-0 flex flex-col gap-6 pt-2 h-full">
          
          <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="font-bold font-heading text-lg flex items-center gap-2 text-text-primary">
              <span className="text-brand-primary text-xl relative">
                <span className="absolute inset-0 blur-[4px] bg-brand-primary/50 text-transparent">✦</span>
                ✦
              </span> 
              Ações Rápidas
            </h3>
          </div>

          {/* Minimal Quick Actions list */}
          <div className="flex flex-col gap-2">
            {safeSelectedProject ? (
              <Link 
                href={`/dashboard/projects/${safeSelectedProject.id}/deadlines`} 
                className="group relative flex items-center justify-between p-4 py-4 rounded-2xl hover:bg-white/40 cursor-pointer transition-all duration-300 border border-transparent hover:border-brand-primary/30 text-left w-full"
              >
                <div className="flex items-center gap-3">
                  <CalendarDays size={16} className="text-brand-primary group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-[14px] font-bold text-text-primary font-body tracking-tight">Prazos e equipes</span>
                </div>
              </Link>
            ) : (
              <button disabled className="opacity-50 group relative flex items-center justify-between p-4 py-4 rounded-2xl cursor-not-allowed border border-transparent text-left w-full">
                <div className="flex items-center gap-3">
                  <CalendarDays size={16} className="text-text-muted" />
                  <span className="text-[14px] font-medium text-text-muted font-body">Selecione um projeto...</span>
                </div>
              </button>
            )}
            <Link 
              href="/dashboard/calendar" 
              className="group relative flex items-center justify-between p-4 py-4 rounded-2xl hover:bg-white/40 cursor-pointer transition-all duration-300 border border-transparent hover:border-white/30 text-left w-full"
            >
              <div className="flex items-center gap-3">
                <PhoneCall size={16} className="text-text-muted group-hover:text-brand-primary" />
                <span className="text-[14px] font-medium text-text-primary font-body">Agendar reuniões</span>
              </div>
            </Link>
            <Link href="/dashboard/projects" className="group relative flex items-center justify-between p-4 py-4 rounded-2xl hover:bg-white/40 cursor-pointer transition-all duration-300 border border-transparent hover:border-white/30 text-left">
              <div className="flex items-center gap-3">
                <Layout size={16} className="text-text-muted group-hover:text-brand-primary" />
                <span className="text-[14px] font-medium text-text-primary font-body">Ver projetos</span>
              </div>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary" />
            </Link>
          </div>

          {/* Últimas tarefas concluídas Block instead of Voice AI Block  */}
          <div className="mt-8 floating-card rounded-[28px] p-6 flex flex-col gap-5 shadow-lg cursor-default group relative overflow-hidden">
             
            <div className="flex items-center justify-between relative z-10 w-full mb-1 border-b border-sand-dark/20 pb-4">
              <h4 className="font-bold font-heading text-text-primary text-[1.10rem] leading-snug">
                Últimas tarefas concluídas
              </h4>
            </div>

            <div className="flex flex-col gap-5 mt-1 relative z-10">
              {globalCompletedTasks.length === 0 ? (
                 <p className="text-xs text-text-muted text-center py-4">Nenhuma tarefa concluída.</p>
              ) : (
                globalCompletedTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-sand-dark flex items-center justify-center shrink-0">
                       <Clock size={14} className="text-text-muted" />
                     </div>
                     <div className="flex flex-col flex-1 truncate">
                        <span className="text-xs font-bold text-text-primary truncate">{t.title}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-text-muted uppercase tracking-wider">
                            {new Date(t.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                     </div>
                     <Avatar 
                        name={t.profiles?.full_name || 'IA'} 
                        src={t.profiles?.avatar_url || undefined}
                        size="sm" 
                        className="w-7 h-7 ring-2 ring-white" 
                     />
                  </div>
                ))
              )}
            </div>

            <Link 
              href="/dashboard/tasks/log"
              className="mt-2 w-full py-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-brand-primary/20 transition-all flex items-center justify-center gap-2 group"
            >
               Ver Histórico Completo
               <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
          </div>

        </div>

      </div>

      {/* Modals for Quick Actions */}
      <Modal open={taskModalOpen} onClose={() => setTaskModalOpen(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Nova Tarefa</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-text-secondary">
              Criando tarefa vinculada ao projeto: <span className="font-bold">{safeSelectedProject?.name}</span> (ID: {activeProjectId}).
            </p>
            <div className="mt-4 p-4 border border-border bg-surface-muted rounded-xl text-xs text-text-muted">
              (Formulário de criação seria renderizado aqui)
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal open={meetingModalOpen} onClose={() => setMeetingModalOpen(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Agendar Reunião</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-text-secondary">
              Agendando reunião para o projeto: <span className="font-bold">{safeSelectedProject?.name}</span> (Tipo Padrão: meeting).
            </p>
            <div className="mt-4 p-4 border border-border bg-surface-muted rounded-xl text-xs text-text-muted">
              (Integração com calendário seria renderizada aqui)
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <TaskDetailModal 
        open={taskDetailModalOpen} 
        onClose={() => setTaskDetailModalOpen(false)} 
        task={selectedTaskDetail} 
      />
    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  CalendarDays,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useProjectContext } from '@/components/providers/project-provider'
import { ProjectDTO } from '@/app/dashboard/projects/actions'
import Link from 'next/link'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { TaskEditModal } from '@/components/tasks/TaskEditModal'

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
  initialProjects: ProjectDTO[]
  initialTasks: any[] // Extended Task
}

export function DashboardClientView({ user, team, initialProjects, initialTasks }: DashboardClientViewProps) {
  const router = useRouter()
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

  let safeSelectedProject = selectedProject
  if (!safeSelectedProject) {
    safeSelectedProject = projects.find(p => p.status !== 'completed') || projects[0]
  }

  // Filter local payload tasks directly derived from server
  const activeProjectId = safeSelectedProject?.id
  const projectTasks = initialTasks.filter(t => t.project_id === activeProjectId)
  
  // Dashboard Tasks: only actionable (pending/in_progress/in_review), max 5
  const allTasks = initialTasks || []
  const DASH_VISIBLE_STATUSES = ['pending', 'in_progress', 'in_review', 'blocked']
  const globalPendingTasks = allTasks.filter(t => DASH_VISIBLE_STATUSES.includes(t.status))
  
  // Sort: overdue first, then by deadline
  const tasksSorted = [...globalPendingTasks].sort((a, b) => {
    const isAOverdue = a.deadline && new Date(a.deadline) < now
    const isBOverdue = b.deadline && new Date(b.deadline) < now
    if (isAOverdue && !isBOverdue) return -1
    if (!isAOverdue && isBOverdue) return 1
    if (!a.deadline) return 1
    if (!b.deadline) return -1
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  })
  const tasksToDisplay = tasksSorted.slice(0, 5)
  const hasMoreTasks = tasksSorted.length > 5

  const globalCompletedTasks = allTasks
    .filter(t => t.status === 'done')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  const completedTasks = projectTasks
    .filter(t => t.status === 'done')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  // Active Health Logic
  const projectHealth = safeSelectedProject?.progress || 0

  // Status Calculation Logic
  const hasOverdueTasks = projectTasks.some(t => {
    const deadline = t.due_date || t.deadline
    if (!deadline || t.status === 'done' || t.status === 'approved') return false
    return new Date(deadline) < now
  })

  // Dynamic status label based on project state
  let statusText = 'Em Ordem'
  if (hasOverdueTasks) statusText = 'Atenção'
  else if (projectHealth >= 90) statusText = 'Excelente'

  return (
    <div className="animate-fade-in-up pb-24 w-full">
      
      {/* ── BENTO GRID TOP SECTION ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12 relative z-10">
        
        {/* Bento: Profile & Welcome (Span 7) */}
        <div className="md:col-span-12 lg:col-span-7 glass-card-super rounded-[32px] p-8 xl:p-12 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-brand-primary/20 transition-all duration-700" />
          
          <div className="flex flex-col gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <Avatar
                name={user.displayName}
                src={user.avatarUrl || undefined}
                size="lg"
                variant="brand"
                className="w-16 h-16 xl:w-20 xl:h-20 shrink-0 ring-1 ring-black/5 dark:ring-white/5 shadow-sm"
              />
              <div>
                <h1 className="text-3xl xl:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
                  {greeting}, {user.firstName}
                </h1>
                <p className="text-text-secondary mt-1 font-medium font-body text-sm xl:text-base opacity-80">
                  {globalPendingTasks.length > 0 
                    ? `Você tem acompanhamento em ${globalPendingTasks.length} tarefas hoje.`
                    : 'Nenhuma tarefa pendente para hoje. Bom descanso!'}
                </p>
              </div>
            </div>

            {/* Project Selector - Minimal Pill */}
            <div className="mt-4 inline-block">
              <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2 font-bold ml-1">Projeto Ativo</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="glass-pill rounded-full px-5 py-3 flex items-center justify-between gap-6 cursor-pointer border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                         <Layout size={16} strokeWidth={2}/>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-text-primary text-sm max-w-[200px] truncate">
                          {safeSelectedProject?.name || 'Selecione um projeto...'}
                        </h3>
                      </div>
                    </div>
                    <ChevronDown size={16} className="text-text-muted" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[320px] p-2 glass-card-super rounded-3xl border border-black/5 dark:border-white/10 shadow-2xl">
                  {projects.map(p => (
                    <DropdownMenuItem key={p.id} asChild>
                      <button
                        onClick={() => setSelectedProject(p)}
                        className="w-full flex items-center p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors text-text-primary"
                      >
                         <span className="font-medium font-body truncate">{p.name}</span>
                      </button>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-10 relative z-10 pt-6 border-t border-black/5 dark:border-white/5">
            <span className="text-xs font-semibold text-text-muted font-body uppercase tracking-wider">Equipe Ativa</span>
            <div className="flex -space-x-2">
              {team.slice(0, 5).map((member, i) => (
                <Avatar 
                  key={member.id} 
                  name={member.full_name} 
                  src={member.avatar_url || undefined}
                  size="sm" 
                  className="border-2 border-background ring-0 shadow-sm transition-transform hover:scale-110 z-10" 
                />
              ))}
              {team.length > 5 && (
                <div className="w-8 h-8 rounded-full border-2 border-background bg-black/5 dark:bg-white/5 flex items-center justify-center text-[10px] font-bold text-text-secondary z-0 shadow-sm">
                  +{team.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bento: Health Metric (Span 5) */}
        <div className="md:col-span-12 lg:col-span-5 glass-card-super rounded-[32px] p-8 xl:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-brand-accent/10 transition-all duration-700" />
          
          <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-4 z-10">Saúde do Projeto</p>
          <div className="relative z-10">
            <div className="text-[8rem] xl:text-[9rem] font-black text-text-primary leading-none tracking-tighter tabular-nums opacity-90 mix-blend-multiply dark:mix-blend-screen flex items-start">
              {projectHealth}
              <span className="text-4xl xl:text-5xl mt-6 opacity-40">%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 z-10 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full">
            {hasOverdueTasks ? <AlertCircle size={14} className="text-status-danger" /> : <CheckCircle2 size={14} className="text-green-500" />}
            <span className="text-sm font-semibold text-text-primary">{statusText}</span>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t border-black/5 dark:border-white/5 w-full z-10">
            <div>
              <p className="text-2xl font-bold tabular-nums text-text-primary">{projectTasks.length}</p>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mt-1">Total de Tarefas</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-text-primary">{completedTasks.length}</p>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mt-1">Concluídas</p>
            </div>
          </div>
        </div>

      </div>

      {/* ── BENTO GRID BOTTOM SECTION ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        
        {/* Left: Task List (Span 8) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold tracking-tight text-text-primary">Tarefas Abertas</h2>
            {hasMoreTasks && (
              <Link href="/dashboard/tasks?status=open" className="text-xs font-semibold uppercase tracking-wider text-brand-primary hover:text-brand-primary-dark transition-colors">
                Ver todas ({tasksSorted.length})
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {tasksToDisplay.length === 0 ? (
               <div className="p-12 text-center rounded-[32px] glass-card text-text-muted">
                 Tudo tranquilo por aqui. Nenhuma tarefa pendente!
               </div>
             ) : tasksToDisplay.map((task) => {
               
               const dateObj = task.deadline ? new Date(task.deadline) : null
               const isOverdue = dateObj && dateObj < now && task.status !== 'done'
               const isHighPriority = task.priority === 'urgent' || task.priority === 'high' || isOverdue
               const isMeeting = task.status === 'review' 
               const isToday = dateObj && dateObj.toDateString() === now.toDateString()
  
               return (
               <div key={task.id} className="glass-card rounded-[24px] p-5 xl:p-6 transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 group relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer" onClick={() => router.push(`/dashboard/tasks/${task.id}`)}>
                 {isHighPriority && <div className="absolute top-0 left-0 w-1 h-full bg-status-danger/80" />}
                 
                 <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-3 mb-1">
                      {isMeeting ? <PhoneCall size={18} className="text-green-500"/> : <Layout size={18} className="text-brand-primary opacity-60" />}
                      <h3 className="text-lg font-semibold text-text-primary line-clamp-1 group-hover:text-brand-primary transition-colors">
                        {task.title}
                      </h3>
                    </div>
                    {task.description && (
                      <p className="text-sm text-text-secondary line-clamp-1 ml-7">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 ml-7">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">
                         {task.v2_projects?.name || 'Projeto Geral'}
                      </span>
                      {isOverdue && (
                        <span className="px-2 py-0.5 bg-status-danger/10 text-status-danger rounded text-[10px] font-bold uppercase tracking-wider">
                           Atrasada
                        </span>
                      )}
                      {isHighPriority && !isOverdue && (
                        <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded text-[10px] font-bold uppercase tracking-wider">
                          Prioridade
                        </span>
                      )}
                    </div>
                 </div>

                 <div className="flex items-center gap-6 md:w-[280px] shrink-0 justify-between md:justify-end border-t border-black/5 dark:border-white/5 md:border-0 pt-4 md:pt-0">
                  <div className="flex flex-col md:items-end gap-1">
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Prazo</p>
                    <p className={`text-sm font-semibold ${isOverdue ? 'text-status-danger' : 'text-text-primary'}`}>
                      {isToday ? 'Hoje' : dateObj ? dateObj.toLocaleDateString() : 'Aberto'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar name={task.profiles?.full_name || 'Usuário'} src={task.profiles?.avatar_url || undefined} size="sm" className="w-8 h-8 ring-1 ring-black/5 dark:ring-white/5" />
                    <ArrowRight size={18} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 hidden md:block" />
                  </div>
                 </div>
               </div>
             )})}
          </div>
        </div>

        {/* Right: Quick Actions & Log (Span 4) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <h2 className="text-xl font-semibold tracking-tight text-text-primary mb-2">Ações Rápidas</h2>
          
          <div className="glass-card-super rounded-[32px] p-3 flex flex-col gap-1 shadow-sm">
            {safeSelectedProject ? (
              <Link 
                href={`/dashboard/projects/${safeSelectedProject.id}/deadlines`} 
                className="group flex items-center gap-4 p-4 rounded-[24px] hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CalendarDays size={18} strokeWidth={2}/>
                </div>
                <span className="font-semibold text-text-primary text-sm">Prazos e Equipes</span>
              </Link>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-[24px] opacity-50 grayscale">
                <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                  <CalendarDays size={18} strokeWidth={2}/>
                </div>
                <span className="font-semibold text-text-primary text-sm">Selecione um projeto...</span>
              </div>
            )}
            
            <Link 
              href="/dashboard/calendar" 
              className="group flex items-center gap-4 p-4 rounded-[24px] hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PhoneCall size={18} strokeWidth={2}/>
              </div>
              <span className="font-semibold text-text-primary text-sm">Agendar Reunião</span>
            </Link>

            <Link 
              href="/dashboard/projects" 
              className="group flex items-center gap-4 p-4 rounded-[24px] hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layout size={18} strokeWidth={2}/>
              </div>
              <span className="font-semibold text-text-primary text-sm">Ver Todos os Projetos</span>
            </Link>
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-text-primary mb-2 mt-4">Concluídas Recentes</h2>
          <div className="glass-card-super rounded-[32px] p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              {globalCompletedTasks.length === 0 ? (
                 <p className="text-sm text-text-muted text-center py-2">Nenhuma tarefa finalizada.</p>
              ) : (
                globalCompletedTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                       <CheckCircle2 size={14} className="text-text-muted opacity-50" />
                     </div>
                     <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-semibold text-text-primary truncate">{t.title}</span>
                        <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">
                          {new Date(t.updated_at).toLocaleDateString()}
                        </span>
                     </div>
                  </div>
                ))
              )}
            </div>
            
            <Link 
              href="/dashboard/tasks/log"
              className="mt-6 w-full py-3.5 rounded-2xl glass-pill text-text-secondary hover:text-text-primary text-[10px] font-bold uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 group border border-black/5 dark:border-white/5"
            >
               Ver Histórico Completo
               <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

      </div>

      {/* Modals for Quick Actions */}
      <TaskEditModal 
        open={taskModalOpen} 
        onClose={() => setTaskModalOpen(false)} 
        projectId={activeProjectId}
        projects={projects}
      />

      <Modal open={meetingModalOpen} onClose={() => setMeetingModalOpen(false)}>
        <ModalContent>
          <ModalHeader>
             <ModalTitle>Agendar Reunião</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-text-secondary">
              Agendando reunião para o projeto: <span className="font-bold">{safeSelectedProject?.name}</span>
            </p>
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

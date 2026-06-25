"use client"

import { useState } from "react"
import { V2ProjectStage, V2Task, StageStatusV2, ProjectStatusV2 } from "@/types/database"
import { PipelineNavigator } from "./PipelineNavigator"
import { TaskGroupGrid } from "./TaskGroupGrid"
import { ApprovalBanner } from "./ApprovalBanner"
import { Badge } from "@/components/ui/badge"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, AlertCircle, Building2, User2, MessageSquare, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { updateTaskStatus } from "@/app/dashboard/tasks/actions"
import Link from "next/link"

interface V2ProjectWorkspaceProps {
  project: any // V2Project + clients + stages + tasks + progress
  profile: any // My user profile
}

export function V2ProjectWorkspace({ project, profile }: V2ProjectWorkspaceProps) {
  const [selectedStageId, setSelectedStageId] = useState<string>(
    project.stages.find((s: V2ProjectStage) => s.status === 'in_progress')?.id || 
    project.stages[0]?.id
  )
  const [selectedTask, setSelectedTask] = useState<V2Task | null>(null)

  const activeStage = project.stages.find((s: any) => s.id === selectedStageId)
  const filteredTasks = project.tasks.filter((t: V2Task) => t.stage_id === selectedStageId)
  const canApprove = ['admin', 'gestor'].includes(profile?.role)

  const isBlocked = activeStage?.status === 'waiting_approval'

  const router = useRouter()
  const [isUpdatingTask, setIsUpdatingTask] = useState(false)

  const handleUpdateTaskStatus = async (taskId: string, newStatus: any) => {
    setIsUpdatingTask(true)
    try {
      await updateTaskStatus(taskId, newStatus)
      setSelectedTask(null)
      router.refresh()
    } catch (err: any) {
      alert('Erro ao atualizar tarefa: ' + err.message)
    } finally {
      setIsUpdatingTask(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-700">
      {/* 1. Header (Project Context) */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-surface-muted text-text-muted">
              <Building2 size={14} />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
              {project.clients?.name}
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tighter text-text-primary heading-editorial">
              {project.name}
            </h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-surface border-border">
                {project.status === 'active' ? (
                  <span className="flex items-center gap-1.5"><Clock size={10} className="text-info" /> Ativo</span>
                ) : (
                  <span className="flex items-center gap-1.5"><CheckCircle size={10} className="text-success" /> Concluído</span>
                )}
              </Badge>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2.5 bg-surface-muted rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-brand-primary transition-all duration-1000 ease-out rounded-full" 
                    style={{ width: `${project.progress}%` }} 
                  />
                </div>
                <span className="text-[11px] font-bold text-text-secondary">{project.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Pipeline (Stage Navigator) */}
      <section className="space-y-3">
        <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted px-2">
          Pipeline do Projeto
        </label>
        <PipelineNavigator 
          stages={project.stages} 
          activeStageId={selectedStageId} 
          onStageClick={setSelectedStageId} 
        />
      </section>

      {/* 3. Waiting Approval Banner */}
      {isBlocked && (
        <section className="animate-in fade-in slide-in-from-top-2 duration-500">
          <ApprovalBanner stage={activeStage} canApprove={canApprove} />
        </section>
      )}

      {/* 4. Main Execution Area (Tasks) */}
      <main className={cn(
        "transition-all duration-500",
        isBlocked ? "opacity-60 scale-[0.99] translate-y-1 blur-[0.5px]" : "opacity-100"
      )}>
        <TaskGroupGrid 
          tasks={filteredTasks} 
          onTaskClick={(task) => setSelectedTask(task)} 
        />
      </main>

      {/* 5. Task Detail Side Panel */}
      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="sm:max-w-xl bg-white/80 dark:bg-black/80 backdrop-blur-xl border-l border-white/20 dark:border-white/10 shadow-2xl">
          {selectedTask && (
            <div className="h-full flex flex-col gap-6 pt-10">
              <SheetHeader className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-brand-primary/10 text-brand-primary border-transparent">
                      {activeStage?.name}
                    </Badge>
                    <span className="text-xs text-text-muted uppercase font-bold tracking-widest">
                      ID: {selectedTask.id.slice(0, 8)}
                    </span>
                  </div>
                  <Link 
                    href={`/dashboard/tasks/${selectedTask.id}`}
                    className="flex items-center gap-1 text-xs text-brand-primary hover:underline font-bold"
                  >
                    Abrir Studio <ExternalLink size={12} />
                  </Link>
                </div>
                <SheetTitle className="text-2xl font-bold tracking-tight">
                  {selectedTask.title}
                </SheetTitle>
                <SheetDescription className="text-sm leading-relaxed text-text-secondary">
                  {selectedTask.description || "Nenhuma descrição fornecida."}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin">
                {/* Details Section */}
                <div className="flex flex-col gap-3">
                  <h5 className="text-[11px] font-bold uppercase tracking-widest text-text-muted px-2">Detalhes</h5>
                  <div className="bg-white dark:bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-border/50">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Clock size={16} />
                        <span className="text-sm font-medium">Prazo</span>
                      </div>
                      <p className="text-sm font-semibold text-text-primary">
                        {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <AlertCircle size={16} />
                        <span className="text-sm font-medium">Prioridade</span>
                      </div>
                      <p className="text-sm font-semibold text-text-primary capitalize">{selectedTask.priority}</p>
                    </div>
                  </div>
                </div>

                {/* Comments Section placeholder */}
                <div className="space-y-4">
                  <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted">
                    <MessageSquare size={14} /> Discussão
                  </h5>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-muted/30 border border-border/50">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-[10px] font-bold text-brand-primary">
                        JD
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-text-primary">Jane Doe <span className="text-[9px] font-normal text-text-muted ml-2">Há 2 horas</span></p>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Finalizei a primeira versão da copy. Aguardando revisão do design.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-border flex items-center justify-between gap-4">
                <Button 
                  variant="outline" 
                  className="rounded-xl flex-1"
                  disabled={isUpdatingTask}
                  onClick={() => handleUpdateTaskStatus(selectedTask.id, 'blocked')}
                >
                  Marcar como Impedido
                </Button>
                <Button 
                  className="bg-brand-primary shadow-brand rounded-xl flex-1"
                  disabled={isUpdatingTask}
                  onClick={() => handleUpdateTaskStatus(selectedTask.id, 'done')}
                >
                  {isUpdatingTask ? 'Atualizando...' : 'Concluir Tarefa'}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

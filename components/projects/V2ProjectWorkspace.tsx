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
import { Clock, CheckCircle, AlertCircle, Building2, User2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

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

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-700">
      {/* 1. Header (Project Context) */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
              <Building2 size={18} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
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
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-primary transition-all duration-1000 ease-out" 
                    style={{ width: `${project.progress}%` }} 
                  />
                </div>
                <span className="text-[10px] font-bold text-text-muted">{project.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Pipeline (Stage Navigator) */}
      <section className="space-y-2">
        <label className="label-eyebrow text-text-muted px-1">Pipeline do Projeto</label>
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
        isBlocked ? "opacity-40 pointer-events-none scale-[0.99] translate-y-1 blur-[1px]" : "opacity-100"
      )}>
        <TaskGroupGrid 
          tasks={filteredTasks} 
          onTaskClick={(task) => setSelectedTask(task)} 
        />
      </main>

      {/* 5. Task Detail Side Panel */}
      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="sm:max-w-xl glass glass-reflection border-l border-white/10">
          {selectedTask && (
            <div className="h-full flex flex-col gap-6 pt-10">
              <SheetHeader className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-brand-primary/10 text-brand-primary border-transparent">
                    {activeStage?.name}
                  </Badge>
                  <span className="text-xs text-text-muted uppercase font-bold tracking-widest">
                    ID: {selectedTask.id.slice(0, 8)}
                  </span>
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
                <div className="grid grid-cols-2 gap-px bg-border rounded-xl border border-border overflow-hidden">
                  <div className="bg-surface/50 p-4 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-text-muted">Prazo</p>
                    <p className="text-sm font-medium text-text-primary">
                      {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div className="bg-surface/50 p-4 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-text-muted">Prioridade</p>
                    <p className="text-sm font-medium text-text-primary capitalize">{selectedTask.priority}</p>
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
                <Button variant="outline" className="rounded-xl flex-1">
                  Marcar como Impedido
                </Button>
                <Button className="bg-brand-primary shadow-brand rounded-xl flex-1">
                  Concluir Tarefa
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

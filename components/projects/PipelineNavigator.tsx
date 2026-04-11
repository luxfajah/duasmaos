"use client"

import { V2ProjectStage, StageStatusV2 } from "@/types/database"
import { cn } from "@/lib/utils"
import { Check, Clock, AlertTriangle, Circle, Lock } from "lucide-react"

interface PipelineNavigatorProps {
  stages: V2ProjectStage[]
  activeStageId: string
  onStageClick: (stageId: string) => void
}

const STATUS_CONFIG: Record<StageStatusV2, { icon: any, color: string, label: string }> = {
  pending: {
    icon: Circle,
    color: "text-text-muted border-border",
    label: "Pendente"
  },
  in_progress: {
    icon: Clock,
    color: "text-brand-primary border-brand-primary/30 bg-brand-primary/5",
    label: "Em andamento"
  },
  waiting_approval: {
    icon: AlertTriangle,
    color: "text-warning border-warning/30 bg-warning/5 animate-pulse",
    label: "Aguardando aprovação"
  },
  approved: {
    icon: Check,
    color: "text-success border-success/30 bg-success/5",
    label: "Aprovado"
  },
  done: {
    icon: Check,
    color: "text-success border-success/30 bg-success/5",
    label: "Concluído"
  }
}

export function PipelineNavigator({ stages, activeStageId, onStageClick }: PipelineNavigatorProps) {
  // Find current active stage index (the one in_progress or waiting_approval)
  const currentActiveIdx = stages.findIndex(s => s.status === 'in_progress' || s.status === 'waiting_approval')
  const lastApprovedIdx = stages.findLastIndex(s => s.status === 'done' || s.status === 'approved')
  const accessibleIdx = Math.max(currentActiveIdx, lastApprovedIdx + 1)

  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-2">
      <div className="flex items-center gap-2 min-w-max px-1">
        {stages.map((stage, idx) => {
          const isActive = stage.id === activeStageId
          const isLocked = idx > accessibleIdx
          const config = STATUS_CONFIG[stage.status]
          
          return (
            <button
              key={stage.id}
              disabled={isLocked}
              onClick={() => onStageClick(stage.id)}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300",
                isLocked ? "opacity-40 grayscale bg-surface/30 cursor-not-allowed" : "hover:shadow-md hover:translate-y-[-1px]",
                isActive 
                  ? "bg-surface-elevated border-brand-primary shadow-brand ring-1 ring-brand-primary/20 scale-[1.02] z-10" 
                  : !isLocked && "bg-surface/50 border-border hover:border-border-strong",
                isActive ? "glass" : ""
              )}
            >
              {/* Index & Icon */}
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border text-[10px] font-bold transition-colors",
                isActive ? "bg-brand-primary border-brand-primary text-white" : "bg-surface-muted border-border text-text-muted",
              )}>
                {isLocked ? (
                  <Lock size={12} className="text-text-muted" />
                ) : (stage.status === 'done' || stage.status === 'approved') ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  String(idx + 1).padStart(2, '0')
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col text-left">
                <span className={cn(
                  "text-xs font-bold tracking-tight transition-colors",
                  isActive ? "text-text-primary" : "text-text-secondary"
                )}>
                  {stage.name}
                </span>
                <span className={cn(
                  "text-[9px] uppercase font-bold tracking-wider",
                  isLocked ? "text-text-muted" : config.color
                )}>
                  {isLocked ? "Bloqueado" : config.label}
                </span>
              </div>

              {/* Status Indicator Dot (if not active and not locked) */}
              {!isActive && !isLocked && (
                <div className={cn(
                  "absolute top-2 right-2 w-1.5 h-1.5 rounded-full",
                  stage.status === 'in_progress' ? "bg-brand-primary" : 
                  stage.status === 'waiting_approval' ? "bg-warning" : 
                  (stage.status === 'done' || stage.status === 'approved') ? "bg-success" : "bg-transparent"
                )} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

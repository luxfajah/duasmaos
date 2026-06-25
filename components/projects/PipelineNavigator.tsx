import { V2ProjectStage, StageStatusV2 } from "@/types/database"
import { cn } from "@/lib/utils"
import { Check, Clock, AlertTriangle, Circle, Lock } from "lucide-react"

interface PipelineNavigatorProps {
  stages: V2ProjectStage[]
  activeStageId: string
  onStageClick: (stageId: string) => void
}

const STATUS_CONFIG: Record<StageStatusV2, { color: string, ring: string }> = {
  pending: {
    color: "bg-surface-muted border-border text-text-muted",
    ring: "ring-0"
  },
  in_progress: {
    color: "bg-brand-primary border-brand-primary text-white",
    ring: "ring-4 ring-brand-primary/20"
  },
  waiting_approval: {
    color: "bg-warning border-warning text-white animate-pulse",
    ring: "ring-4 ring-warning/20"
  },
  approved: {
    color: "bg-success border-success text-white",
    ring: "ring-0"
  },
  done: {
    color: "bg-success border-success text-white",
    ring: "ring-0"
  }
}

export function PipelineNavigator({ stages, activeStageId, onStageClick }: PipelineNavigatorProps) {
  // Find current active stage index
  const currentActiveIdx = stages.findIndex(s => s.status === 'in_progress' || s.status === 'waiting_approval')
  const lastApprovedIdx = stages.findLastIndex(s => s.status === 'done' || s.status === 'approved')
  const accessibleIdx = Math.max(currentActiveIdx, lastApprovedIdx + 1)

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-4">
      <div className="flex items-center min-w-max px-2 relative">
        {stages.map((stage, idx) => {
          const isActive = stage.id === activeStageId
          const isLocked = idx > accessibleIdx
          const isDone = stage.status === 'done' || stage.status === 'approved'
          const config = STATUS_CONFIG[stage.status]
          const isLast = idx === stages.length - 1

          return (
            <div key={stage.id} className="flex items-center">
              <button
                disabled={isLocked}
                onClick={() => onStageClick(stage.id)}
                className={cn(
                  "group relative flex flex-col items-center gap-2 transition-all duration-300 w-28",
                  isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]",
                )}
              >
                {/* Node */}
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-500 z-10 relative",
                  config.color,
                  isActive && !isLocked && config.ring,
                  isActive ? "scale-110 shadow-sm" : ""
                )}>
                  {isLocked ? (
                    <Lock size={12} className="opacity-70" />
                  ) : isDone ? (
                    <Check size={14} strokeWidth={3} />
                  ) : stage.status === 'waiting_approval' ? (
                    <AlertTriangle size={12} strokeWidth={2.5} />
                  ) : (
                    <span className="text-[11px] font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Label */}
                <div className="flex flex-col items-center text-center mt-1">
                  <span className={cn(
                    "text-[11px] font-semibold tracking-tight transition-colors leading-tight",
                    isActive ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"
                  )}>
                    {stage.name}
                  </span>
                  {isActive && stage.status === 'waiting_approval' && (
                    <span className="text-[9px] uppercase font-bold tracking-wider text-warning mt-0.5">
                      Aguardando
                    </span>
                  )}
                </div>
              </button>

              {/* Connecting Line */}
              {!isLast && (
                <div className="w-16 sm:w-24 h-0.5 -mt-8 relative -mx-4 z-0 bg-border">
                  <div 
                    className={cn(
                      "absolute inset-y-0 left-0 bg-brand-primary transition-all duration-700 ease-in-out",
                      isDone || (stages[idx + 1]?.status === 'in_progress' || stages[idx + 1]?.status === 'waiting_approval') || stages[idx + 1]?.status === 'done' || stages[idx + 1]?.status === 'approved' 
                        ? "w-full" 
                        : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { ProjectStage } from '@/types/database'
import { markStageComplete } from '@/app/dashboard/projects/stage-actions'
import { Check, Circle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useTransition } from 'react'

interface ProjectPipelineProps {
  stages: ProjectStage[]
  canEdit?: boolean
}

export function ProjectPipeline({ stages, canEdit = false }: ProjectPipelineProps) {
  const [pending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const completedCount = stages.filter((s) => s.completed).length
  const progress = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0

  function toggleStage(stage: ProjectStage) {
    if (!canEdit) return
    setLoadingId(stage.id)
    startTransition(async () => {
      await markStageComplete(stage.id, !stage.completed)
      setLoadingId(null)
    })
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-text-secondary tabular-nums shrink-0">
          {completedCount}/{stages.length} etapas
        </span>
      </div>

      {/* Stages — horizontal scroll on small screens, vertical list */}
      <div className="flex flex-col gap-1">
        {stages.map((stage, idx) => {
          const isLoading = loadingId === stage.id && pending
          const isCompleted = stage.completed
          const isCurrent = !isCompleted && stages.slice(0, idx).every((s) => s.completed)

          return (
            <button
              key={stage.id}
              disabled={!canEdit || isLoading}
              onClick={() => toggleStage(stage)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-150',
                canEdit && 'cursor-pointer hover:bg-surface-muted',
                !canEdit && 'cursor-default',
                isCompleted && 'opacity-60',
                isCurrent && 'bg-brand-primary/5 border border-brand-primary/20',
              )}
            >
              {/* Icon */}
              <span
                className={cn(
                  'flex items-center justify-center w-5 h-5 rounded-full border shrink-0 transition-colors',
                  isCompleted
                    ? 'bg-status-success border-status-success text-white'
                    : isCurrent
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-border text-text-muted',
                )}
              >
                {isLoading ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : isCompleted ? (
                  <Check size={11} strokeWidth={3} />
                ) : (
                  <Circle size={10} />
                )}
              </span>

              {/* Position badge */}
              <span className="text-[10px] font-bold text-text-muted w-4 shrink-0 tabular-nums">
                {String(idx + 1).padStart(2, '0')}
              </span>

              {/* Name */}
              <span
                className={cn(
                  'flex-1 font-medium',
                  isCompleted ? 'line-through text-text-muted' : 'text-text-primary',
                  isCurrent && 'text-brand-primary',
                )}
              >
                {stage.name}
              </span>

              {/* Completed date */}
              {stage.completed_at && (
                <span className="text-[10px] text-text-muted shrink-0">
                  {new Date(stage.completed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

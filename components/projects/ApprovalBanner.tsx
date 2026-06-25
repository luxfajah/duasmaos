"use client"

import { V2ProjectStage, StageStatusV2 } from "@/types/database"
import { cn } from "@/lib/utils"
import { AlertCircle, Lock, ShieldCheck, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { approveV2Stage } from "@/app/dashboard/v2/actions"
import { useTransition } from "react"

interface ApprovalBannerProps {
  stage: V2ProjectStage
  canApprove?: boolean
}

export function ApprovalBanner({ stage, canApprove = false }: ApprovalBannerProps) {
  const [isPending, startTransition] = useTransition()

  if (stage.status !== "waiting_approval") return null

  const handleApprove = () => {
    startTransition(async () => {
      await approveV2Stage(stage.id)
    })
  }

  return (
    <div className="relative overflow-hidden p-6 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Background decoration */}
      <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="mt-1 p-2 rounded-xl bg-brand-primary text-white shadow-brand">
            <Lock size={18} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              Aguardando aprovação
              <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] uppercase font-bold tracking-widest">
                Etapa: {stage.name}
              </span>
            </h3>
            <p className="text-sm text-text-secondary max-w-lg leading-relaxed">
              Esta etapa requer revisão e aprovação para prosseguir. As ações de execução estão temporariamente bloqueadas.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          {canApprove ? (
            <Button 
              onClick={handleApprove}
              disabled={isPending}
              className="bg-brand-primary hover:bg-brand-primary-hover text-white shadow-brand px-6 rounded-xl font-bold h-11"
            >
              <ShieldCheck size={18} className="mr-2" />
              {isPending ? "Aprovando..." : "Liberar Etapa"}
            </Button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-xs font-medium text-text-muted">
              Apenas gestores podem aprovar
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

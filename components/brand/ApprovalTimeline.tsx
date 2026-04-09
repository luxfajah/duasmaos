import React from 'react';
import { cn } from "@/lib/utils";

import { PostStatus } from '@/types/database';

interface ApprovalTimelineProps {
  status: PostStatus;
  className?: string;
}

const STEPS: { id: PostStatus, label: string }[] = [
  { id: 'draft', label: 'Copy em produção' },
  { id: 'copy_review', label: 'Aguardando validação verbal' },
  { id: 'design_draft', label: 'Design em produção' },
  { id: 'design_review', label: 'Aguardando validação visual' },
  { id: 'approved', label: 'Peça finalizada' },
];

export function ApprovalTimeline({ status, className }: ApprovalTimelineProps) {
  // Handle rejected states by mapping them to their respective review steps for the timeline position
  const normalizedStatus = status === 'copy_rejected' ? 'copy_review' : 
                          status === 'design_rejected' ? 'design_review' : 
                          status;

  const currentIndex = STEPS.findIndex(s => s.id === normalizedStatus);

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="font-sans font-semibold text-text-primary uppercase tracking-widest text-xs mb-8">Cronologia da Pauta</h3>
      <div className="relative border-l border-border ml-2 space-y-8 pb-4">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.id} className="relative flex items-center pl-6">
              {/* Point */}
              <div 
                className={cn(
                  "absolute left-[-5px] w-[9px] h-[9px] rounded-full border-2 bg-surface",
                  isCompleted ? "border-brand-primary bg-brand-primary" : 
                  isCurrent ? "border-pending shadow-[0_0_0_4px_hsl(var(--pending)/0.2)]" : 
                  "border-border"
                )}
              />
              <span className={cn(
                "text-sm font-medium",
                isCompleted ? "text-text-secondary" :
                isCurrent ? "text-text-primary translate-x-1 font-semibold transition-transform" :
                "text-text-muted"
              )}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

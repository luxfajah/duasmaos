import React from 'react';
import { cn } from "@/lib/utils";

import { PostStatusV2 } from '@/types/database';

interface ApprovalTimelineProps {
  status: PostStatusV2;
  className?: string;
}

const STEPS: { id: PostStatusV2, label: string }[] = [
  { id: 'draft', label: 'Rascunho' },
  { id: 'in_production', label: 'Em produção' },
  { id: 'awaiting_review', label: 'Aguardando revisão' },
  { id: 'approved', label: 'Aprovado' },
];

export function ApprovalTimeline({ status, className }: ApprovalTimelineProps) {
  // Handle rejected state by mapping to awaiting_review position
  const normalizedStatus = status === 'rejected' ? 'awaiting_review' : status;
  const currentIndex = STEPS.findIndex(s => s.id === normalizedStatus);

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="font-sans font-semibold text-text-primary uppercase tracking-widest text-xs mb-8">Cronologia do Post</h3>
      <div className="relative border-l border-border ml-2 space-y-8 pb-4">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isRejected = isCurrent && status === 'rejected';

          return (
            <div key={step.id} className="relative flex items-center pl-6">
              {/* Point */}
              <div 
                className={cn(
                  "absolute left-[-5px] w-[9px] h-[9px] rounded-full border-2 bg-surface",
                  isCompleted ? "border-brand-primary bg-brand-primary" : 
                  isRejected ? "border-danger shadow-[0_0_0_4px_hsl(var(--danger)/0.2)]" :
                  isCurrent ? "border-pending shadow-[0_0_0_4px_hsl(var(--pending)/0.2)]" : 
                  "border-border"
                )}
              />
              <span className={cn(
                "text-sm font-medium",
                isCompleted ? "text-text-secondary" :
                isRejected ? "text-danger translate-x-1 font-semibold transition-transform" :
                isCurrent ? "text-text-primary translate-x-1 font-semibold transition-transform" :
                "text-text-muted"
              )}>
                {isRejected ? 'Rejeitado — aguardando correção' : step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

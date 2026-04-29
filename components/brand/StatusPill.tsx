import React from 'react';
import { cn } from "@/lib/utils";

import { PostStatusV2, ClientApprovalStatus } from '@/types/database';

type StatusType = PostStatusV2 | ClientApprovalStatus;

interface StatusPillProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<string, { label: string, className: string }> = {
  // V2 Post statuses (internal workflow)
  draft: { label: 'Rascunho', className: 'bg-draft text-text-inverse border-transparent' },
  in_production: { label: 'Em Produção', className: 'bg-info text-text-inverse border-transparent' },
  awaiting_review: { label: 'Aguardando Revisão', className: 'bg-warning text-text-inverse border-transparent' },
  approved: { label: 'Aprovado', className: 'bg-success text-text-inverse border-transparent' },
  rejected: { label: 'Rejeitado', className: 'bg-danger text-text-inverse border-transparent' },

  // Client approval statuses (portal)
  pending: { label: 'Pendente', className: 'bg-pending text-text-inverse border-transparent' },
  revision_requested: { label: 'Revisão Solicitada', className: 'bg-warning text-text-inverse border-transparent' },
};

export function StatusPill({ status, className }: StatusPillProps) {
  const config = statusConfig[status];
  
  if (!config) return null;

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors",
      config.className,
      className
    )}>
      {config.label}
    </span>
  )
}

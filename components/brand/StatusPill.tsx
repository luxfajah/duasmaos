import React from 'react';
import { cn } from "@/lib/utils";

import { PostStatus } from '@/types/database';

interface StatusPillProps {
  status: PostStatus;
  className?: string;
}

const statusConfig: Record<PostStatus, { label: string, className: string }> = {
  draft: { label: 'Rascunho', className: 'bg-draft text-text-inverse border-transparent' },
  copy_review: { label: 'Revisão de Copy', className: 'bg-pending text-text-inverse border-transparent' },
  copy_rejected: { label: 'Copy Rejeitada', className: 'bg-danger text-text-inverse border-transparent' },
  design_draft: { label: 'Design em Produção', className: 'bg-info text-text-inverse border-transparent' },
  design_review: { label: 'Aguardando Cliente', className: 'bg-warning text-text-inverse border-transparent' },
  design_rejected: { label: 'Design Rejeitado', className: 'bg-danger text-text-inverse border-transparent' },
  approved: { label: 'Aprovado', className: 'bg-success text-text-inverse border-transparent' },
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

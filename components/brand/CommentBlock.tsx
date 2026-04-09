import React from 'react';
import { cn } from "@/lib/utils";

interface CommentBlockProps {
  author: string;
  role?: string;
  stage: string;
  date: string;
  content: string;
  highlight?: boolean;
}

export function CommentBlock({ author, role, stage, date, content, highlight }: CommentBlockProps) {
  return (
    <div className={cn(
      "pl-4 border-l-2 py-1 my-6",
      highlight ? "border-brand-primary bg-editorial-highlight/50 p-4 -ml-4" : "border-border"
    )}>
      <div className="flex justify-between items-baseline mb-2">
        <div className="flex items-center gap-2">
          <span className="font-sans font-semibold text-text-primary text-sm">{author}</span>
          {role && <span className="text-xs text-text-muted">({role})</span>}
          <span className="text-[10px] font-mono px-2 py-0.5 bg-surface-muted text-text-secondary border border-border">
            {stage}
          </span>
        </div>
        <span className="text-xs text-text-muted tabular-nums">{date}</span>
      </div>
      <p className="text-sm font-serif italic text-text-secondary leading-relaxed mt-2">
        "{content}"
      </p>
    </div>
  )
}

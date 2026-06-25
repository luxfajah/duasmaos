'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EditorialHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  context?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EditorialHeader({ title, subtitle, context, action, className, ...props }: EditorialHeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* ── Dynamic Top Navbar Title ── */}
      {mounted && document.getElementById('top-bar-center') && createPortal(
        <div className="flex items-center justify-center animate-in fade-in slide-in-from-top-4 duration-300">
          <h1 className="text-[13px] font-bold tracking-widest uppercase text-text-primary text-center">
            {title}
          </h1>
        </div>,
        document.getElementById('top-bar-center')!
      )}

      {(subtitle || context || action) && (
        <header className={cn("flex flex-col gap-3 md:flex-row md:items-end justify-between mb-8", className)} {...props}>
          <div className="space-y-1 max-w-2xl">
            {context && <span className="text-[12px] font-semibold tracking-widest uppercase text-brand-primary">{context}</span>}
            {subtitle && <p className="text-[15px] font-medium text-text-secondary">{subtitle}</p>}
          </div>
          {action && (
            <Button onClick={action.onClick} className="shrink-0 rounded-full shadow-sm active:scale-95 transition-all mt-4 md:mt-0 glass-pill">
              {action.label}
            </Button>
          )}
        </header>
      )}
    </>
  );
}

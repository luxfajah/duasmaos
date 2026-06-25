import React from 'react';
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
  return (
    <header className={cn("flex flex-col gap-3 md:flex-row md:items-end justify-between mb-8", className)} {...props}>
      <div className="space-y-1 max-w-2xl">
        {context && <span className="text-[12px] font-semibold tracking-widest uppercase text-brand-primary">{context}</span>}
        <h1 className="font-sans text-3xl sm:text-[34px] font-bold tracking-tight text-text-primary leading-tight">{title}</h1>
        {subtitle && <p className="text-[15px] font-medium text-text-secondary">{subtitle}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} className="shrink-0 rounded-full shadow-sm active:scale-95 transition-all mt-4 md:mt-0">
          {action.label}
        </Button>
      )}
    </header>
  );
}

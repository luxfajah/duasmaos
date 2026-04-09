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
    <header className={cn("flex flex-col gap-4 border-b border-border pb-8 mb-8 md:flex-row md:items-end justify-between", className)} {...props}>
      <div className="space-y-3 max-w-2xl">
        {context && <span className="text-sm font-medium tracking-widest uppercase text-brand-secondary">{context}</span>}
        <h1 className="font-serif text-4xl lg:text-5xl font-medium tracking-tight text-text-primary leading-[1.1]">{title}</h1>
        {subtitle && <p className="text-lg text-text-muted leading-relaxed">{subtitle}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} variant="primary" size="lg" className="shrink-0">
          {action.label}
        </Button>
      )}
    </header>
  );
}

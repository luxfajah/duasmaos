import React from 'react';
import { cn } from "@/lib/utils";

export function Header({ className, children }: { className?: string, children?: React.ReactNode }) {
  return (
    <header className={cn("h-20 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40 flex items-center px-8 lg:px-12", className)}>
      <div className="w-full flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex-1 flex justify-end">
           {children}
           <div className="flex items-center gap-4">
             <span className="text-xs font-medium text-text-secondary">Conectado como <strong className="text-text-primary">Estrategista</strong></span>
             <div className="w-8 h-8 rounded-full bg-brand-primary text-text-inverse flex items-center justify-center text-xs font-serif">DM</div>
           </div>
        </div>
      </div>
    </header>
  );
}

export function ContentWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <main className={cn("p-8 lg:p-12 max-w-6xl mx-auto w-full", className)}>
      {children}
    </main>
  )
}

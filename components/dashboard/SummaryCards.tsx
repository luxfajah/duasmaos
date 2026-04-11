import React from 'react'
import { ExtendedProject } from '@/app/dashboard/projects/actions'

export function SummaryCards({ projects }: { projects: ExtendedProject[] }) {
  const total = projects.length;
  const healthyCount = projects.filter(p => p.health_score >= 80).length;
  const timelineHealth = total > 0 ? Math.round((healthyCount / total) * 100) : 100;

  const healthColor =
    timelineHealth >= 80 ? 'text-emerald-600 dark:text-emerald-400'
    : timelineHealth >= 50 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400'

  const healthLabel =
    timelineHealth >= 80 ? 'Saudável'
    : timelineHealth >= 50 ? 'Atenção'
    : 'Crítico'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      {/* Card 1: Timeline Health */}
      <div className={cn(
        'rounded-xl p-6 flex flex-col justify-between',
        'bg-surface shadow-sm',
        'transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg',
        'cursor-default relative overflow-hidden'
      )}>
        {/* Subtle editorial line decoration */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-highlight/60 via-brand-highlight/20 to-transparent rounded-t-xl" />

        <div>
          <p className="label-eyebrow text-text-muted">Saúde do Cronograma</p>
          <div className="mt-4 flex items-end gap-3">
            <span className={`text-5xl font-black tracking-tight tabular-nums ${healthColor}`}>
              {timelineHealth}%
            </span>
            <span className={`text-sm mb-2 font-bold ${healthColor}`}>{healthLabel}</span>
          </div>
          {/* Mini progress bar */}
          <div className="mt-4 h-2 bg-surface-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                timelineHealth >= 80 ? 'bg-emerald-500'
                : timelineHealth >= 50 ? 'bg-amber-500'
                : 'bg-red-500'
              }`}
              style={{ width: `${timelineHealth}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-text-muted font-medium">0%</span>
            <span className="text-[10px] text-text-muted font-medium">100%</span>
          </div>
        </div>
        <p className="text-sm text-text-secondary mt-5 leading-relaxed">
          {timelineHealth >= 80
            ? 'A maioria dos projetos está atingindo os marcos antecipadamente.'
            : timelineHealth >= 50
              ? 'Alguns projetos demandam atenção para cumprir os próximos marcos.'
              : 'Atenção crítica necessária em múltiplos cronogramas de projeto.'}
        </p>
      </div>

      {/* Card 2: Monthly Creative Review — DOMINANT BRAND BLOCK */}
      <div className={cn(
        'bg-brand-primary rounded-xl p-6 flex flex-col justify-between',
        'shadow-brand relative overflow-hidden',
        'transition-all duration-200 hover:-translate-y-2',
        'hover:shadow-[0_16px_48px_0_hsl(var(--brand-primary)/0.5)]',
        'cursor-default group'
      )}>

        {/* Organic blob decorations */}
        <div className="doodle-overlay">
          {/* Large blob */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 animate-blob-drift" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-black/10 animate-blob-drift" style={{ animationDelay: '-4s' }} />

          {/* Doodle lines */}
          <svg className="absolute top-4 right-6 opacity-15" width="60" height="60" fill="none" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 50 Q30 10 50 50" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <circle cx="10" cy="50" r="3" fill="white" opacity="0.5"/>
            <circle cx="50" cy="50" r="3" fill="white" opacity="0.5"/>
          </svg>
          <svg className="absolute bottom-6 right-4 opacity-15 rotate-12" width="32" height="32" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 16 L16 4 L28 16 L16 28 Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
          </svg>

          {/* Shimmer strip */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="shimmer absolute inset-0" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <p className="label-eyebrow text-white/60 mb-4">Relatório Criativo Mensal</p>
          <h3 className="text-2xl font-black text-white leading-tight tracking-tight">
            Produtividade &<br />Entregas do Time
          </h3>
          <p className="text-sm text-white/70 mt-3 leading-relaxed font-medium">
            Gere um relatório completo sobre ativos entregues, performance e marcos do ciclo.
          </p>
        </div>

        <div className="mt-6 relative z-10 flex items-center gap-3">
          <button className={cn(
            'bg-white text-brand-primary px-5 py-2.5 rounded-lg text-sm font-bold',
            'hover:bg-white/90 transition-all duration-150',
            'shadow-sm hover:shadow-md',
            'hover:scale-[1.02] active:scale-[0.98]',
            'animate-pulse-brand'
          )}>
            Gerar Relatório
          </button>
          <span className="text-white/50 text-xs font-medium">Junho 2026</span>
        </div>
      </div>

    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

import React from 'react'
import { ExtendedProject } from '@/app/dashboard/projects/actions'

export function SummaryCards({ projects }: { projects: ExtendedProject[] }) {
  const total = projects.length;
  const healthyCount = projects.filter(p => p.health_score >= 80).length;
  const timelineHealth = total > 0 ? Math.round((healthyCount / total) * 100) : 100;

  const healthColor =
    timelineHealth >= 80 ? 'text-olive'
    : timelineHealth >= 50 ? 'text-yellow-dark'
    : 'text-terracotta'

  const progressColor =
    timelineHealth >= 80 ? 'bg-olive'
    : timelineHealth >= 50 ? 'bg-yellow'
    : 'bg-terracotta'

  const healthLabel =
    timelineHealth >= 80 ? 'Saudável'
    : timelineHealth >= 50 ? 'Atenção'
    : 'Crítico'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      {/* Card 1: Timeline Health — Sand elevated surface */}
      <div className={cn(
        'rounded-2xl p-6 flex flex-col justify-between',
        'bg-surface-elevated shadow-sm border border-sand-dark/40',
        'transition-all duration-200 hover:-translate-y-1.5 hover:shadow-card-hover',
        'cursor-default relative overflow-hidden'
      )}>
        {/* Terracotta accent top line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-primary/70 via-brand-primary/25 to-transparent rounded-t-2xl" />

        {/* Olive accent dot right */}
        <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-olive opacity-40" />

        <div>
          <p className="label-eyebrow text-text-muted">Saúde do Cronograma</p>
          <div className="mt-4 flex items-end gap-3">
            <span className={`text-5xl font-black font-heading tracking-tight tabular-nums ${healthColor}`}>
              {timelineHealth}%
            </span>
            <span className={`text-sm mb-2 font-bold font-body ${healthColor}`}>{healthLabel}</span>
          </div>
          {/* Progress bar — brand palette */}
          <div className="mt-4 h-2 bg-sand rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
              style={{ width: `${timelineHealth}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-text-muted font-medium font-body">0%</span>
            <span className="text-[10px] text-text-muted font-medium font-body">100%</span>
          </div>
        </div>
        <p className="text-sm text-text-secondary mt-5 leading-relaxed font-body">
          {timelineHealth >= 80
            ? 'A maioria dos projetos está atingindo os marcos antecipadamente.'
            : timelineHealth >= 50
              ? 'Alguns projetos demandam atenção para cumprir os próximos marcos.'
              : 'Atenção crítica necessária em múltiplos cronogramas de projeto.'}
        </p>
      </div>

      {/* Card 2: Monthly Creative Review — TERRACOTTA DOMINANT BLOCK */}
      <div className={cn(
        'card-terracotta rounded-2xl p-6 flex flex-col justify-between',
        'relative overflow-hidden',
        'transition-all duration-220 hover:-translate-y-2',
        'hover:shadow-[0_16px_52px_0_hsl(13_55%_50%/0.45)]',
        'cursor-default group'
      )}>

        {/* Organic blob decorations */}
        <div className="doodle-overlay">
          {/* Large blob top-right */}
          <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/10 animate-blob-drift" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-black/10 animate-blob-drift" style={{ animationDelay: '-4s' }} />

          {/* Organic flowing curve */}
          <svg className="absolute top-4 right-6 opacity-[0.14]" width="72" height="72" fill="none" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 56 Q36 8 64 56" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <circle cx="8" cy="56" r="3" fill="white" opacity="0.5"/>
            <circle cx="64" cy="56" r="3" fill="white" opacity="0.5"/>
            <circle cx="36" cy="20" r="2" fill="white" opacity="0.4"/>
          </svg>
          {/* Corner diamond doodle */}
          <svg className="absolute bottom-5 right-5 opacity-[0.12] rotate-12" width="28" height="28" fill="none" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2L26 14L14 26L2 14Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
          </svg>

          {/* Shimmer on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="shimmer absolute inset-0" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <p className="label-eyebrow text-white/60 mb-4">Relatório Criativo Mensal</p>
          <h3 className="text-2xl font-black font-heading text-white leading-tight tracking-tight">
            Produtividade &<br />Entregas do Time
          </h3>
          <p className="text-sm text-white/70 mt-3 leading-relaxed font-body font-medium">
            Gere um relatório completo sobre ativos entregues, performance e marcos do ciclo.
          </p>
        </div>

        <div className="mt-6 relative z-10 flex items-center gap-3">
          <button className={cn(
            'bg-white text-brand-primary px-5 py-2.5 rounded-xl text-sm font-bold font-heading',
            'hover:bg-white/92 transition-all duration-150',
            'shadow-sm hover:shadow-md',
            'hover:scale-[1.02] active:scale-[0.98]',
            'animate-pulse-brand'
          )}>
            Gerar Relatório
          </button>
          <span className="text-white/50 text-xs font-medium font-body">Junho 2026</span>
        </div>
      </div>

    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

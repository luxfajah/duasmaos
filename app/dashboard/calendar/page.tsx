"use client"
import { EditorialHeader } from "@/components/brand/EditorialHeader";

export default function CalendarPage() {
  return (
    <div className="space-y-16 animate-in fade-in-50 duration-500">
      <EditorialHeader 
        title="Calendário Global" 
        subtitle="Cronograma tático de publicações para todos os clientes ativos."
      />
      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="bg-surface-muted p-4 text-[10px] uppercase font-bold tracking-widest text-text-secondary text-center">
            {day}
          </div>
        ))}
        {Array.from({length: 35}).map((_, i) => {
          const dayNum = i - 2; // Offset for grid demonstration
          const isValid = dayNum > 0 && dayNum <= 30;
          const isToday = dayNum === 14;
          const hasPost = dayNum === 14 || dayNum === 18 || dayNum === 25;
          return (
            <div key={i} className={`bg-surface min-h-[140px] p-3 hover:bg-surface-muted/30 transition-colors ${isToday ? 'ring-2 ring-brand-primary ring-inset shadow-inner' : ''}`}>
              <span className={`text-xs font-bold ${isToday ? 'text-brand-primary' : 'text-text-muted'} ${!isValid ? 'opacity-20' : ''}`}>{isValid ? dayNum : ''}</span>
              {hasPost && isValid && (
                <div className="mt-3 text-xs p-2 bg-editorial-frame border-l-[3px] border-l-brand-primary text-text-primary font-medium">
                  {dayNum === 14 ? 'Campanha LENA' : 'Copy Institucional'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

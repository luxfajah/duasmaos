import React from 'react'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'

interface LogItem {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  action: string;
  entity: string;
  time_ago: string;
  details?: string;
}

interface TeamActivityFeedProps {
  logs: LogItem[];
}

export function TeamActivityFeed({ logs }: TeamActivityFeedProps) {
  return (
    <Card className="p-6 col-span-1 flex flex-col h-full h-auto min-h-[500px]">
      <h3 className="text-lg font-bold font-serif text-text-primary mb-6">Atividade da Equipe</h3>
      
      <div className="flex-1 flex flex-col gap-6 relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-8 bottom-0 w-px bg-border -z-10" />

        {logs.length === 0 ? (
          <p className="text-text-muted text-sm py-4">Nenhuma atividade recente.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-4 items-start bg-surface z-10">
              <Avatar 
                src={log.user_avatar || undefined} 
                fallback={log.user_name.substring(0, 2).toUpperCase()} 
                className="w-10 h-10 border-2 border-background shrink-0"
              />
              <div className="flex-1 pt-1">
                <p className="text-sm text-text-primary font-semibold">{log.user_name}</p>
                <p className="text-sm text-text-secondary leading-snug mt-0.5">
                  {log.action} <span className="font-semibold text-text-primary">{log.entity}</span>
                </p>
                {log.details && (
                  <p className="text-xs text-text-muted mt-1 italic border-l-2 border-border pl-2">
                    {log.details}
                  </p>
                )}
                <span className="text-[11px] text-text-muted mt-2 block font-medium">
                  {log.time_ago}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="w-full mt-8 py-3 px-4 border border-border rounded-lg text-sm font-semibold text-text-secondary hover:border-text-muted hover:text-text-primary transition-colors bg-surface">
        Ver log completo
      </button>
    </Card>
  )
}

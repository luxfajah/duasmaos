import React from 'react'
import { Avatar } from '@/components/ui/avatar'

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
    <div className="panel-surface p-6 flex flex-col min-h-[400px]">
      {/* Internal header removed — rendered by parent */}

      <div className="flex-1 flex flex-col gap-5 relative">
        {/* Timeline line */}
        {logs.length > 0 && (
          <div className="absolute left-[19px] top-8 bottom-8 w-px bg-gradient-to-b from-brand-highlight/30 via-border/60 to-transparent" />
        )}

        {logs.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-text-muted">Nenhuma atividade recente</p>
            <p className="text-xs text-text-muted/60 mt-1">As ações da equipe aparecerão aqui</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div
              key={log.id}
              className="flex gap-4 items-start relative group/item"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="relative z-10">
                <Avatar
                  src={log.user_avatar || undefined}
                  name={log.user_name}
                  className="w-10 h-10 ring-2 ring-background shrink-0 transition-transform duration-200 group-hover/item:scale-105"
                />
              </div>
              <div className="flex-1 pt-0.5 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm text-text-primary font-bold truncate">{log.user_name}</p>
                  <span className="text-[10px] text-text-muted font-medium shrink-0 tabular-nums">{log.time_ago}</span>
                </div>
                <p className="text-sm text-text-secondary leading-snug mt-0.5">
                  {log.action}{' '}
                  <span className="font-semibold text-text-primary">{log.entity}</span>
                </p>
                {log.details && (
                  <p className="text-xs text-text-muted mt-1.5 italic border-l-2 border-brand-highlight/30 pl-2 leading-relaxed">
                    {log.details}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

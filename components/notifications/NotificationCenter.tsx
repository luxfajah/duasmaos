'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, AlertCircle, Clock, CheckCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Notification {
  id: string
  taskId: string
  title: string
  projectName: string
  type: 'overdue' | 'due_today' | 'due_soon'
  dueDate: string | null
}

interface NotificationCenterProps {
  tasks: Array<{
    id: string
    title: string
    status: string
    due_date?: string | null
    deadline?: string | null
    v2_projects?: { name: string } | null
    projects?: { name: string } | null
  }>
}

const DISMISSED_KEY = 'duasmaos_dismissed_notifications'

function getDismissed(): string[] {
  try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]') } catch { return [] }
}
function addDismissed(id: string) {
  const list = getDismissed()
  if (!list.includes(id)) localStorage.setItem(DISMISSED_KEY, JSON.stringify([...list, id]))
}
function clearAllDismissed() {
  localStorage.removeItem(DISMISSED_KEY)
}

export function NotificationCenter({ tasks }: NotificationCenterProps) {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState<string[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)
  const soonEnd = new Date(now)
  soonEnd.setDate(soonEnd.getDate() + 3)

  useEffect(() => { setDismissed(getDismissed()) }, [open])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const notifications: Notification[] = tasks
    .filter(t => !['done', 'locked', 'approved'].includes(t.status))
    .flatMap(t => {
      const dateStr = t.due_date || t.deadline
      if (!dateStr) return []
      const due = new Date(dateStr)
      due.setHours(0, 0, 0, 0)
      const projectName = t.v2_projects?.name || t.projects?.name || 'Projeto'
      let type: Notification['type'] | null = null
      if (due < now) type = 'overdue'
      else if (due <= todayEnd) type = 'due_today'
      else if (due <= soonEnd) type = 'due_soon'
      if (!type) return []
      return [{
        id: `notif-${t.id}`,
        taskId: t.id,
        title: t.title,
        projectName,
        type,
        dueDate: dateStr,
      }]
    })
    .filter(n => !dismissed.includes(n.id))
    .sort((a, b) => {
      const order = { overdue: 0, due_today: 1, due_soon: 2 }
      return order[a.type] - order[b.type]
    })

  function dismiss(id: string) {
    addDismissed(id)
    setDismissed(prev => [...prev, id])
  }

  function dismissAll() {
    notifications.forEach(n => addDismissed(n.id))
    setDismissed(prev => [...prev, ...notifications.map(n => n.id)])
  }

  const count = notifications.length

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'relative rounded-xl p-2',
          'text-text-muted hover:bg-sand-warm hover:text-text-primary',
          'transition-all duration-150 hover:scale-105'
        )}
        aria-label="Notificações"
      >
        <Bell size={17} strokeWidth={1.75} />
        {count > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-status-danger text-white text-[9px] font-black flex items-center justify-center leading-none ring-2 ring-background animate-pulse">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[520px] glass depth-modal border border-border/50 rounded-[20px] shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-brand-primary" />
              <h3 className="font-bold font-heading text-text-primary">Notificações</h3>
              {count > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-status-danger/10 text-status-danger text-[10px] font-black">{count}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <button onClick={dismissAll} className="text-[10px] font-bold text-text-muted hover:text-text-primary transition-colors">
                  Limpar tudo
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-surface-muted rounded-lg transition-colors">
                <X size={14} className="text-text-muted" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-muted">
                <CheckCircle size={32} className="opacity-20" />
                <p className="text-sm font-medium">Tudo em dia! 🎉</p>
                <p className="text-xs opacity-60">Nenhuma tarefa pendente ou atrasada.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {notifications.map(n => (
                  <div key={n.id} className={cn(
                    'flex items-start gap-3 px-4 py-3 transition-all group cursor-pointer',
                    'hover:bg-black/5 dark:hover:bg-white/5',
                    n.type === 'overdue' ? 'hover:bg-status-danger/5'
                      : n.type === 'due_today' ? 'hover:bg-status-warning/5'
                      : ''
                  )}>
                    <div className="shrink-0 mt-0.5">
                      {n.type === 'overdue'
                        ? <AlertCircle size={16} className="text-status-danger" />
                        : n.type === 'due_today'
                        ? <Clock size={16} className="text-status-warning" />
                        : <Clock size={16} className="text-text-muted" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary leading-tight truncate">{n.title}</p>
                      <p className="text-[11px] text-text-muted mt-0.5 truncate">{n.projectName}</p>
                      <span className={cn(
                        'inline-block mt-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full',
                        n.type === 'overdue' ? 'bg-status-danger text-white'
                          : n.type === 'due_today' ? 'bg-status-warning/20 text-status-warning'
                          : 'bg-surface text-text-muted border border-border'
                      )}>
                        {n.type === 'overdue' ? '⚠ Atrasada'
                          : n.type === 'due_today' ? 'Vence hoje'
                          : 'Vence em breve'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Link
                        href={`/dashboard/tasks/${n.taskId}`}
                        onClick={() => setOpen(false)}
                        className="p-1.5 hover:bg-brand-primary/10 text-text-muted hover:text-brand-primary rounded-full transition-colors"
                        title="Ver tarefa"
                      >
                        <ExternalLink size={12} />
                      </Link>
                      <button
                        onClick={() => dismiss(n.id)}
                        className="p-1.5 hover:bg-status-danger/10 text-text-muted hover:text-status-danger rounded-full transition-colors"
                        title="Descartar"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

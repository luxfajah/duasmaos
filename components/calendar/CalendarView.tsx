'use client'

import { useState } from 'react'

interface CalendarEvent {
  id: string
  title: string
  date: string // ISO date string
  type: 'project' | 'task'
  status?: string
}

interface CalendarViewProps {
  events: CalendarEvent[]
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-status-draft/20 text-status-draft border-status-draft/30',
  copy: 'bg-status-info/20 text-status-info border-status-info/30',
  review: 'bg-status-warning/20 text-status-warning border-status-warning/30',
  approved: 'bg-status-success/20 text-status-success border-status-success/30',
  delayed: 'bg-status-danger/20 text-status-danger border-status-danger/30',
  completed: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
  todo: 'bg-status-draft/20 text-status-draft border-status-draft/30',
  in_progress: 'bg-status-info/20 text-status-info border-status-info/30',
  done: 'bg-status-success/20 text-status-success border-status-success/30',
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function CalendarView({ events }: CalendarViewProps) {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()) // 0-indexed

  function navigateMonth(direction: -1 | 1) {
    setCurrentMonth((prev) => {
      let next = prev + direction
      if (next < 0) {
        setCurrentYear((y) => y - 1)
        return 11
      }
      if (next > 11) {
        setCurrentYear((y) => y + 1)
        return 0
      }
      return next
    })
  }

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1)
  const startDayOfWeek = firstDay.getDay() // 0 = Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Previous month days to fill
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate()

  const cells: { date: Date; isCurrentMonth: boolean }[] = []

  // Padding days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    cells.push({
      date: new Date(currentYear, currentMonth - 1, prevMonthDays - i),
      isCurrentMonth: false,
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: new Date(currentYear, currentMonth, d),
      isCurrentMonth: true,
    })
  }

  // Padding days for next month
  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++) {
    cells.push({
      date: new Date(currentYear, currentMonth + 1, i),
      isCurrentMonth: false,
    })
  }

  function getEventsForDate(date: Date) {
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return events.filter((e) => e.date.startsWith(iso))
  }

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button
          onClick={() => navigateMonth(-1)}
          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-surface-muted transition-colors text-text-secondary hover:text-text-primary"
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <h2 className="font-semibold text-text-primary">
          {MONTHS_PT[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-surface-muted transition-colors text-text-secondary hover:text-text-primary"
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAYS_PT.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          const dayEvents = getEventsForDate(cell.date)
          const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6
          return (
            <div
              key={idx}
              className={`
                min-h-[100px] p-2 border-r border-b border-border last-of-type:border-r-0
                ${!cell.isCurrentMonth ? 'bg-surface-muted/30' : ''}
                ${isWeekend && cell.isCurrentMonth ? 'bg-editorial-frame/30' : ''}
              `}
            >
              <span
                className={`
                  inline-flex items-center justify-center w-7 h-7 text-sm rounded-full mb-1.5 font-medium
                  ${isToday(cell.date)
                    ? 'bg-brand-primary text-text-inverse'
                    : cell.isCurrentMonth
                    ? 'text-text-primary'
                    : 'text-text-muted'
                  }
                `}
              >
                {cell.date.getDate()}
              </span>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className={`
                      text-[10px] font-medium px-1.5 py-0.5 rounded border truncate leading-4
                      ${STATUS_COLORS[ev.status ?? ''] ?? 'bg-surface-muted text-text-secondary border-border'}
                    `}
                    title={ev.title}
                  >
                    {ev.type === 'project' ? '📋' : '✅'} {ev.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-text-muted pl-1">
                    +{dayEvents.length - 3} mais
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

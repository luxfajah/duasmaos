'use client'

import React, { useState } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { TaskWithRelations } from '@/types/database'
import { cn } from '@/lib/utils'

interface TaskCalendarProps {
  tasks: TaskWithRelations[]
  onTaskClick?: (task: TaskWithRelations) => void
}

export function TaskCalendar({ tasks, onTaskClick }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const today = () => setCurrentDate(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const dateFormat = 'd'
  const rows = []

  let days = []
  let day = startDate
  let formattedDate = ''

  // Build the calendar grid
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat)
      const cloneDay = day

      // Filter tasks for this day based on due_date
      const dayTasks = tasks.filter((t) => {
        if (!t.due_date) return false
        // Extract local date assuming ISO string "YYYY-MM-DD"
        // parseISO handles it, or string match
        const taskDate = parseISO(t.due_date)
        return isSameDay(taskDate, cloneDay)
      })

      days.push(
        <div
          key={day.toString()}
          className={cn(
            'min-h-[100px] p-2 border-b border-r border-border/40 relative group transition-colors duration-200',
            !isSameMonth(day, monthStart)
              ? 'bg-black/[0.02] dark:bg-white/[0.02] text-text-muted/40'
              : isSameDay(day, new Date())
              ? 'bg-brand-primary/5 dark:bg-brand-primary/10'
              : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold',
                isSameDay(day, new Date())
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30'
                  : 'text-text-primary group-hover:bg-black/5 dark:group-hover:bg-white/10'
              )}
            >
              {formattedDate}
            </span>
            {dayTasks.length > 0 && (
              <span className="text-[10px] font-bold text-text-muted px-1.5 rounded-full bg-surface-muted">
                {dayTasks.length}
              </span>
            )}
          </div>

          <div className="mt-2 space-y-1.5 flex flex-col items-center sm:items-start">
            {dayTasks.slice(0, 3).map((task) => {
              const isDone = task.status === 'done' || task.status === 'approved'
              const isOverdue = !isDone && new Date(task.due_date!) < new Date() && !isSameDay(new Date(task.due_date!), new Date())
              
              return (
                <div
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className={cn(
                    'w-full text-xs px-2 py-1 rounded-md truncate cursor-pointer transition-transform hover:scale-[1.02] shadow-sm',
                    isDone
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 line-through opacity-70'
                      : isOverdue
                      ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 font-semibold'
                      : 'bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-text-primary'
                  )}
                  title={task.title}
                >
                  <div className="flex items-center gap-1.5">
                    {isDone ? (
                      <CheckCircle2 size={10} className="shrink-0" />
                    ) : isOverdue ? (
                      <AlertCircle size={10} className="shrink-0" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    )}
                    <span className="truncate">{task.title}</span>
                  </div>
                </div>
              )
            })}
            {dayTasks.length > 3 && (
              <div className="text-[10px] text-text-muted font-medium pl-1">
                + {dayTasks.length - 3} mais
              </div>
            )}
          </div>
        </div>
      )
      day = addDays(day, 1)
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    )
    days = []
  }

  return (
    <div className="glass-card-super overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-heading font-black text-text-primary capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <button
            onClick={today}
            className="px-3 py-1 text-xs font-bold rounded-full bg-surface-muted text-text-secondary hover:text-text-primary transition-colors"
          >
            Hoje
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 border-b border-border/40 bg-black/[0.02] dark:bg-white/[0.02]">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName) => (
          <div
            key={dayName}
            className="py-2 text-center text-xs font-bold text-text-muted uppercase tracking-wider border-r border-border/40 last:border-0"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-col border-l border-t border-border/40 -mt-px -ml-px">
        {rows}
      </div>
    </div>
  )
}

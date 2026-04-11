'use client'

import { AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProjectDTO } from '@/app/dashboard/projects/actions'

interface DashboardAlertsProps {
  projects: ProjectDTO[]
}

export function DashboardAlerts({ projects }: DashboardAlertsProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const afterTomorrow = new Date(today)
  afterTomorrow.setDate(afterTomorrow.getDate() + 2)

  const projectsDueSoon = projects.filter(p => {
    if (p.status === 'completed' || !p.deadline) return false
    const deadlineDate = new Date(p.deadline)
    deadlineDate.setHours(0, 0, 0, 0)
    return deadlineDate.getTime() === tomorrow.getTime()
  })

  const projectsAlreadyDelayed = projects.filter(p => {
    if (p.status === 'completed' || !p.deadline) return false
    const deadlineDate = new Date(p.deadline)
    deadlineDate.setHours(0, 0, 0, 0)
    return deadlineDate.getTime() < today.getTime()
  })

  if (projectsDueSoon.length === 0 && projectsAlreadyDelayed.length === 0) return null

  return (
    <div className="space-y-3 mb-8">
      {projectsAlreadyDelayed.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-terracotta/10 border border-terracotta/20 animate-in slide-in-from-top duration-500">
          <div className="bg-terracotta rounded-full p-2">
            <AlertCircle size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-terracotta-dark">
              {projectsAlreadyDelayed.length} projeto{projectsAlreadyDelayed.length !== 1 ? 's' : ''} em atraso
            </p>
            <p className="text-xs text-terracotta-dark/70 font-medium">
              Ação imediata necessária para regularizar o cronograma.
            </p>
          </div>
        </div>
      )}

      {projectsDueSoon.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 animate-in slide-in-from-top duration-700">
          <div className="bg-amber-500 rounded-full p-2">
            <Clock size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-700">
              {projectsDueSoon.length} projeto{projectsDueSoon.length !== 1 ? 's' : ''} vencem amanhã
            </p>
            <p className="text-xs text-amber-700/70 font-medium">
              Verifique o status das tarefas críticas para evitar atrasos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

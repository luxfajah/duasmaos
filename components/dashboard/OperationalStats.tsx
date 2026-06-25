'use client'

import { ProjectDTO } from '@/app/dashboard/projects/actions'
import { CheckCircle2, Users, Timer, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OperationalStatsProps {
  projects: ProjectDTO[]
  team: { id: string; full_name: string }[]
}

export function OperationalStats({ projects, team }: OperationalStatsProps) {
  // 1. Lead Time Calculation (Average completion time)
  const completedProjects = projects.filter(p => p.status === 'completed' && p.completed_at && p.created_at)
  const totalDays = completedProjects.reduce((acc, p) => {
    const start = new Date(p.created_at)
    const end = new Date(p.completed_at!)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return acc + diff
  }, 0)
  const avgLeadTime = completedProjects.length > 0 ? (totalDays / completedProjects.length).toFixed(1) : '-'

  // 2. Delay Rate
  const totalActiveAndCompleted = projects.filter(p => p.status !== 'archived')
  const delayedProjects = projects.filter(p => {
    if (p.status === 'completed') {
      if (!p.deadline || !p.completed_at) return false
      return new Date(p.completed_at) > new Date(p.deadline)
    }
    if (!p.deadline) return false
    return new Date() > new Date(p.deadline)
  })
  const delayRate = totalActiveAndCompleted.length > 0 
    ? Math.round((delayedProjects.length / totalActiveAndCompleted.length) * 100) 
    : 0

  // 3. Team Productivity (Tasks completed per member)
  const memberProductivity = team.map(member => {
    const completedTasks = projects.reduce((total, project) => {
      const tasksForMember = project.tasks?.filter(t => 
        t.status === 'done' && 
        t.v2_task_assignees?.some((a: any) => a.user_id === member.id)
      ) || []
      return total + tasksForMember.length
    }, 0)
    return { name: member.full_name, count: completedTasks }
  }).sort((a, b) => b.count - a.count)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Productivity Card */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
            <BarChart3 size={18} />
          </div>
          <h3 className="font-bold text-text-primary">Produtividade por Equipe</h3>
        </div>
        
        <div className="space-y-4">
          {memberProductivity.slice(0, 5).map((member, i) => (
            <div key={i} className="group">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-text-secondary font-medium group-hover:text-text-primary transition-colors">{member.name}</span>
                <span className="text-text-muted font-bold">{member.count} tarefas</span>
              </div>
              <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-primary rounded-full transition-all duration-1000" 
                  style={{ width: member.count > 0 ? `${Math.min(100, (member.count / Math.max(...memberProductivity.map(m => m.count), 1)) * 100)}%` : '0%' }}
                />
              </div>
            </div>
          ))}
          {memberProductivity.length === 0 && (
            <p className="text-sm text-text-muted italic py-4">Nenhuma tarefa concluída nesta conta.</p>
          )}
        </div>
      </div>

      {/* Operational Health Card */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-olive-soft rounded-lg text-olive-dark">
            <Timer size={18} />
          </div>
          <h3 className="font-bold text-text-primary">Eficiência Operacional</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-background border border-border/50">
            <p className="text-xs text-text-muted font-medium mb-1">Tempo Médio</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-black text-text-primary">{avgLeadTime}</p>
              <p className="text-xs text-text-muted">dias</p>
            </div>
            <p className="text-[10px] text-text-muted mt-2">Do início à conclusão</p>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border/50">
            <p className="text-xs text-text-muted font-medium mb-1">Taxa de Atraso</p>
            <div className="flex items-baseline gap-1">
              <p className={cn(
                "text-2xl font-black",
                delayRate > 20 ? "text-terracotta" : "text-olive"
              )}>{delayRate}%</p>
            </div>
            <p className="text-[10px] text-text-muted mt-2">Vencidos vs Total</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-text-secondary">
              <CheckCircle2 size={16} className="text-olive" />
              <span>Taxa de Entrega</span>
            </div>
            <span className="font-bold text-text-primary font-heading">
              {completedProjects.length} projetos concluídos
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

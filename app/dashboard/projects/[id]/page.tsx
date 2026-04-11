import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getProjectById } from '../actions'
import { getProjectStages } from '../stage-actions'
import { getV2ProjectById } from '@/app/dashboard/v2/actions'
import { getTasks } from '@/app/dashboard/tasks/actions'
import { EditorialHeader } from '@/components/brand/EditorialHeader'
import { Badge } from '@/components/ui/badge'
import { ProjectPipeline } from '@/components/projects/ProjectPipeline'
import { V2ProjectWorkspace } from '@/components/projects/V2ProjectWorkspace'
import { ProjectTypeBadge } from '@/components/projects/ProjectTypeSelect'
import { TaskKanban } from '@/components/tasks/TaskKanban'
import { PRIORITY_LABELS, WorkflowTypeV2, Priority } from '@/types/database'
import {
  Calendar,
  User,
  Building2,
  Layout,
  GitBranch,
} from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: { id: string }
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  // V2 statuses
  active: 'default',
  paused: 'destructive',
  completed: 'default',
  archived: 'outline',
  // Legacy fallback statuses
  draft: 'outline',
  copy: 'secondary',
  review: 'secondary',
  approved: 'default',
  delayed: 'destructive',
}

const PROJECT_STATUS_LABELS: Record<string, string> = {
  // V2 statuses
  active: 'Ativo',
  paused: 'Pausado',
  completed: 'Concluído',
  archived: 'Arquivado',
  // Legacy fallback statuses
  draft: 'Rascunho',
  copy: 'Copy',
  review: 'Revisão',
  approved: 'Aprovado',
  delayed: 'Atrasado',
}

const PRIORITY_COLOR: Record<string, string> = {
  low:    'text-status-info',
  medium: 'text-status-warning',
  high:   'text-status-danger',
  urgent: 'font-bold text-status-danger',
}

export default async function ProjectDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user profile for edit permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const canEdit = profile?.role
    ? ['admin', 'gestor'].includes(profile.role)
    : false

  // 1. Try V2 Project Fetch
  const v2Project = await getV2ProjectById(params.id)

  if (v2Project) {
    return (
      <V2ProjectWorkspace project={v2Project} profile={profile} />
    )
  }

  // 2. Legacy Fallback
  let project, stages, tasks
  try {
    ;[project, stages, tasks] = await Promise.all([
      getProjectById(params.id),
      getProjectStages(params.id),
      getTasks(params.id),
    ])
  } catch {
    notFound()
  }

  const statusVariant = STATUS_VARIANT[project.status] ?? 'outline'

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/dashboard/projects"
              className="text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              Projetos
            </Link>
            <span className="text-text-muted text-xs">/</span>
            <span className="text-xs text-text-secondary truncate">{project.name}</span>
          </div>
          <EditorialHeader
            title={project.name}
            subtitle={project.clients ? project.clients.name + (project.clients.company ? ` · ${project.clients.company}` : '') : ''}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusVariant}>{PROJECT_STATUS_LABELS[project.status]}</Badge>
            {(project as any).workflow_type && (
              <ProjectTypeBadge type={(project as any).workflow_type as WorkflowTypeV2} />
            )}
            {(project as any).priority && (
              <span className={`text-xs font-semibold ${PRIORITY_COLOR[(project as any).priority]}`}>
                &uarr; {PRIORITY_LABELS[(project as any).priority as Priority]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Meta info */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
        {[
          {
            icon: Building2,
            label: 'Cliente',
            value: project.clients?.name ?? '—',
            href: `/dashboard/clients/${project.client_id}`,
          },
          {
            icon: User,
            label: 'Responsável',
            value: (project as any).profiles?.full_name ?? '—',
          },
          {
            icon: Calendar,
            label: 'Prazo',
            value: project.deadline
              ? new Date(project.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
              : '—',
          },
          {
            icon: GitBranch,
            label: 'Etapas',
            value: `${stages.filter((s) => s.completed).length} / ${stages.length} concluídas`,
          },
        ].map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="bg-surface px-4 py-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className="text-text-muted" />
              <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">{label}</p>
            </div>
            {href ? (
              <Link href={href} className="text-sm font-medium text-brand-primary hover:underline">
                {value}
              </Link>
            ) : (
              <p className="text-sm font-medium text-text-primary">{value}</p>
            )}
          </div>
        ))}
      </section>

      {/* Pipeline */}
      {stages.length > 0 && (
        <section className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <GitBranch size={15} className="text-text-muted" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">
              Pipeline do Projeto
            </h2>
          </div>
          <ProjectPipeline stages={stages} canEdit={canEdit} />
        </section>
      )}

      {/* Task kanban */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Layout size={15} className="text-text-muted" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Kanban de Tarefas
          </h2>
          <span className="ml-auto text-xs text-text-muted">
            {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
          </span>
        </div>
        <TaskKanban tasks={tasks} />
      </section>
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getClientById, getClientStats } from '../actions'
import { getProjects } from '@/app/dashboard/projects/actions'
import { EditorialHeader } from '@/components/brand/EditorialHeader'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { FolderOpen, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: { id: string }
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Rascunho', variant: 'outline' },
  copy: { label: 'Copy', variant: 'secondary' },
  review: { label: 'Revisão', variant: 'secondary' },
  approved: { label: 'Aprovado', variant: 'default' },
  delayed: { label: 'Atrasado', variant: 'destructive' },
  completed: { label: 'Concluído', variant: 'default' },
}

export default async function ClientDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let client, stats, projects
  try {
    ;[client, stats, projects] = await Promise.all([
      getClientById(params.id),
      getClientStats(params.id),
      getProjects(params.id),
    ])
  } catch {
    notFound()
  }

  const clientStatusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    active: { label: 'Ativo', variant: 'default' },
    inactive: { label: 'Inativo', variant: 'secondary' },
    paused: { label: 'Pausado', variant: 'destructive' },
  }
  const clientStatus = clientStatusMap[client.status]

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-500">
      <div className="flex items-start justify-between gap-4">
        <EditorialHeader
          title={client.name}
          subtitle={client.company ?? 'Cliente'}
        />
        <Badge variant={clientStatus.variant} className="mt-2">
          {clientStatus.label}
        </Badge>
      </div>

      {/* Client info */}
      <section className="bg-surface border border-border rounded-xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <p className="text-xs uppercase font-bold tracking-widest text-text-muted mb-1">E-mail</p>
          <p className="text-text-primary">{client.email ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase font-bold tracking-widest text-text-muted mb-1">Telefone</p>
          <p className="text-text-primary">{client.phone ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase font-bold tracking-widest text-text-muted mb-1">Cliente desde</p>
          <p className="text-text-primary">
            {new Date(client.created_at).toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </section>

      {/* Project stats */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">
          Projetos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <MetricCard label="Total" value={stats.total} icon={FolderOpen} accent="default" />
          <MetricCard label="Ativos" value={stats.active} icon={Clock} accent="info" />
          <MetricCard label="Atrasados" value={stats.delayed} icon={AlertTriangle} accent="danger" />
          <MetricCard label="Concluídos" value={stats.completed} icon={CheckCircle2} accent="success" />
        </div>

        {projects.length > 0 ? (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {projects.map((project) => {
                const cfg = statusConfig[project.status] ?? { label: project.status, variant: 'outline' as const }
                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-surface-muted/40 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-text-primary">{project.name}</p>
                      {project.deadline && (
                        <p className="text-xs text-text-muted mt-0.5">
                          Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </Link>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-text-muted text-sm py-6 text-center">Nenhum projeto para este cliente.</p>
        )}
      </section>
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getClientById, getClientStats } from '../actions'
import { getV2ProjectsByClient } from '@/app/dashboard/v2/actions'
import { EditorialHeader } from '@/components/brand/EditorialHeader'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ProjectTypeBadge } from '@/components/projects/ProjectTypeSelect'
import {
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Globe,
  Mail,
  Phone,
  Building2,
  Tag,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { ProjectType } from '@/types/database'

interface Props {
  params: { id: string }
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Ativo', variant: 'default' },
  paused: { label: 'Pausado', variant: 'destructive' },
  completed: { label: 'Concluído', variant: 'default' },
  archived: { label: 'Arquivado', variant: 'outline' },
}

const clientStatusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active: { label: 'Ativo', variant: 'default' },
  inactive: { label: 'Inativo', variant: 'secondary' },
  paused: { label: 'Pausado', variant: 'destructive' },
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
      getV2ProjectsByClient(params.id),
    ])
  } catch {
    notFound()
  }

  const clientStatus = clientStatusMap[client.status]

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <EditorialHeader
          title={client.name}
          subtitle={client.company ?? 'Cliente'}
        />
        <Badge variant={clientStatus.variant} className="mt-2">
          {clientStatus.label}
        </Badge>
      </div>

      {/* Client info card */}
      <section className="bg-surface border border-border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail size={16} className="text-text-muted mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-0.5">E-mail</p>
              <p className="text-sm text-text-primary">{client.email ?? '—'}</p>
            </div>
          </div>
          {/* Phone */}
          <div className="flex items-start gap-3">
            <Phone size={16} className="text-text-muted mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-0.5">Telefone</p>
              <p className="text-sm text-text-primary">{client.phone ?? '—'}</p>
            </div>
          </div>
          {/* Company */}
          <div className="flex items-start gap-3">
            <Building2 size={16} className="text-text-muted mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-0.5">Empresa</p>
              <p className="text-sm text-text-primary">{client.company ?? '—'}</p>
            </div>
          </div>
          {/* Sector */}
          <div className="flex items-start gap-3">
            <Tag size={16} className="text-text-muted mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-0.5">Segmento</p>
              <p className="text-sm text-text-primary">{client.sector ?? '—'}</p>
            </div>
          </div>
          {/* Website */}
          <div className="flex items-start gap-3">
            <Globe size={16} className="text-text-muted mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-0.5">Site</p>
              {client.website ? (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-primary hover:underline"
                >
                  {client.website.replace(/^https?:\/\//, '')}
                </a>
              ) : (
                <p className="text-sm text-text-primary">—</p>
              )}
            </div>
          </div>
          {/* Since */}
          <div className="flex items-start gap-3">
            <Clock size={16} className="text-text-muted mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-0.5">Cliente desde</p>
              <p className="text-sm text-text-primary">
                {new Date(client.created_at).toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {client.notes && (
          <div className="flex items-start gap-3 pt-4 border-t border-border">
            <FileText size={16} className="text-text-muted mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">Observações</p>
              <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{client.notes}</p>
            </div>
          </div>
        )}
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
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-text-primary">{project.name}</p>
                        {project.created_at && (
                          <p className="text-xs text-text-muted mt-0.5">
                            Criado em: {new Date(project.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      {project.type && (
                        <ProjectTypeBadge type={project.type as ProjectType} />
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

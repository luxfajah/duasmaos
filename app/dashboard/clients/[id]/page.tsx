import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getClientById, getClientStats } from '../actions'
import { getClientPortalSettings } from '@/app/dashboard/clients/actions'
import { getV2ProjectsByClient } from '@/app/dashboard/v2/actions'
import { PortalConfigModal } from '@/components/clients/PortalConfigModal'
import { EditorialHeader } from '@/components/brand/EditorialHeader'
import { Badge } from '@/components/ui/badge'
import { ProjectTypeBadge } from '@/components/projects/ProjectTypeSelect'
import {
  FolderOpen,
  Mail,
  Phone,
  Building2,
  Tag,
  FileText,
  MapPin,
  User,
  Download,
  Upload,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { WorkflowTypeV2, ClientAddress, ClientDocument } from '@/types/database'
import { Button } from '@/components/ui/button'

interface Props {
  params: { id: string }
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Ativo', variant: 'default' },
  paused: { label: 'Pausado', variant: 'destructive' },
  completed: { label: 'Concluído', variant: 'default' },
  archived: { label: 'Arquivado', variant: 'outline' },
}

const clientStatusMap: Record<string, { label: string; colorClass: string }> = {
  active: { label: 'Ativo', colorClass: 'bg-[#34c759]/15 text-[#34c759]' },
  inactive: { label: 'Inativo', colorClass: 'bg-[#8e8e93]/15 text-[#8e8e93]' },
  paused: { label: 'Pausado', colorClass: 'bg-[#ff9500]/15 text-[#ff9500]' },
}

function formatCPF(v: string) {
  return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

function formatCNPJ(v: string) {
  return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
}

function formatPhone(v: string) {
  if (v.length === 11) {
    return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
  return v.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
}

// Reusable card for HIG structure
const DashboardCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-surface-primary/70 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-3xl saturate-150 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] overflow-hidden ${className}`}>
    {children}
  </div>
)

const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
  <h2 className="text-[12px] font-medium text-text-muted uppercase ml-4 mb-3 tracking-wider flex items-center gap-2">
    {Icon && <Icon size={14} />} {children}
  </h2>
)

export default async function ClientDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let client: any, stats, projects, portalSettings
  try {
    ;[client, stats, projects, portalSettings] = await Promise.all([
      getClientById(params.id),
      getClientStats(params.id),
      getV2ProjectsByClient(params.id),
      getClientPortalSettings(params.id)
    ])
  } catch {
    notFound()
  }

  const clientStatus = clientStatusMap[client.status] ?? { label: client.status, colorClass: 'bg-black/5 text-text-secondary' }
  const isPJ = client.type === 'pj'
  const identifier = isPJ ? client.cnpj : client.cpf
  const formattedIdentifier = identifier 
    ? (isPJ ? formatCNPJ(identifier) : formatCPF(identifier))
    : '—'

  const mainAddress = client.client_addresses?.[0] as ClientAddress | undefined

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-500 max-w-7xl mx-auto pb-24">
      
      {/* ── Hero Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar com soft shadow e mesh gradient sutil no CSS */}
          <div className="w-20 h-20 shrink-0 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent pointer-events-none" />
            {isPJ ? <Building2 size={36} strokeWidth={1.5} /> : <User size={36} strokeWidth={1.5} />}
          </div>
          
          <div>
            <EditorialHeader
              title={isPJ ? (client.company || client.name) : client.name}
              subtitle={isPJ ? (client.trade_name || 'Empresa PJ') : 'Pessoa Física'}
              className="mb-2"
            />
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${clientStatus.colorClass} uppercase tracking-wider`}>
                {clientStatus.label}
              </span>
              {client.segment && (
                <span className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-black/5 dark:bg-white/10 text-text-secondary">
                  {client.segment}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <PortalConfigModal 
            clientId={client.id} 
            clientName={isPJ ? (client.company || client.name) : client.name} 
            existingSettings={portalSettings} 
          />
          <Link href={`/dashboard/clients/${client.id}/edit`}>
            <Button className="rounded-full shadow-sm active:scale-95 transition-all">Editar Cliente</Button>
          </Link>
        </div>
      </div>

      {/* ── Grid Layout de 2 Colunas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        
        {/* =========================================================
            LEFT COLUMN (CRM Data, Projects)
        ========================================================= */}
        <div className="space-y-10">
          
          {/* CRM Profile Data */}
          <section>
            <SectionTitle icon={User}>Ficha Cadastral</SectionTitle>
            <DashboardCard>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.04] dark:divide-white/[0.04]">
                
                {/* Info Block 1 */}
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-[11px] uppercase font-semibold tracking-wider text-text-muted mb-0.5">E-mail de Contato</p>
                    <p className="text-[15px] text-text-primary truncate">{client.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-semibold tracking-wider text-text-muted mb-0.5">Documento ({client.type?.toUpperCase()})</p>
                    <p className="text-[15px] font-mono text-text-primary">{formattedIdentifier}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-semibold tracking-wider text-text-muted mb-0.5">Origem / Gestor</p>
                    <div className="text-[15px] text-text-primary flex items-center gap-1.5 flex-wrap">
                       {client.lead_source || 'S/N'} <span className="text-text-muted">•</span> {client.account_manager?.full_name || 'Sem gestor'}
                    </div>
                  </div>
                </div>

                {/* Info Block 2 */}
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-[11px] uppercase font-semibold tracking-wider text-text-muted mb-0.5">Telefones</p>
                    <div className="text-[15px] text-text-primary space-y-1">
                      <p>{client.phone ? formatPhone(client.phone) : '—'}</p>
                      {client.whatsapp && (
                        <p className="flex items-center gap-1.5 text-status-success font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                          {formatPhone(client.whatsapp)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-semibold tracking-wider text-text-muted mb-0.5">Endereço Principal</p>
                    {mainAddress ? (
                       <div className="text-[15px] text-text-primary">
                          <p className="truncate">{mainAddress.street}, {mainAddress.number}</p>
                          <p className="text-sm text-text-secondary truncate">{mainAddress.city} - {mainAddress.state}</p>
                       </div>
                    ) : (
                       <p className="text-[15px] text-text-secondary italic">Não cadastrado</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Notes */}
              {client.notes && (
                <div className="border-t border-black/[0.04] dark:border-white/[0.04] p-5 bg-black/[0.01] dark:bg-white/[0.01]">
                   <p className="text-[11px] uppercase font-semibold tracking-wider text-text-muted mb-2">Observações Internas</p>
                   <p className="text-[14px] leading-relaxed text-text-secondary">{client.notes}</p>
                </div>
              )}
            </DashboardCard>
          </section>

          {/* Projects Collection List */}
          <section>
            <SectionTitle icon={FolderOpen}>Cronograma de Projetos</SectionTitle>
            <DashboardCard>
              {projects.length > 0 ? (
                <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  {projects.map((project: any) => {
                    const cfg = statusConfig[project.status] ?? { label: project.status, variant: 'outline' as const }
                    return (
                      <Link
                        key={project.id}
                        href={`/dashboard/projects/${project.id}`}
                        className="flex items-center justify-between p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-text-muted group-hover:text-brand-primary transition-colors">
                            <FolderOpen size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-text-primary text-[15px] truncate">{project.name}</p>
                            <p className="text-[13px] text-text-secondary mt-0.5">
                              Iniciado em {new Date(project.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {project.type && <div className="hidden sm:block"><ProjectTypeBadge type={project.type as WorkflowTypeV2} /></div>}
                          <Badge variant={cfg.variant} className="rounded-md font-medium">{cfg.label}</Badge>
                          <ArrowRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-text-muted">
                  <FolderOpen size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-[14px]">Nenhum projeto vinculado a este cliente.</p>
                </div>
              )}
            </DashboardCard>
          </section>

        </div>

        {/* =========================================================
            RIGHT COLUMN (Metrics, Documents, Actions)
        ========================================================= */}
        <div className="space-y-10">

          {/* Metrics Lockups */}
          <section>
            <SectionTitle>Engajamento</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <DashboardCard className="p-4 flex flex-col justify-between aspect-[4/3]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Total</p>
                <div>
                  <p className="text-[34px] font-bold tracking-tight text-text-primary leading-none">{stats.total}</p>
                  <p className="text-[13px] text-text-secondary mt-1">Projetos</p>
                </div>
              </DashboardCard>
              <DashboardCard className="p-4 flex flex-col justify-between aspect-[4/3] bg-status-success/5 border-status-success/10">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#34c759]">Ativos</p>
                <div>
                  <p className="text-[34px] font-bold tracking-tight text-[#34c759] leading-none">{stats.active}</p>
                  <p className="text-[13px] text-[#34c759]/70 mt-1">Em andamento</p>
                </div>
              </DashboardCard>
            </div>
            
            <DashboardCard className="mt-3 p-4">
              <div className="flex items-center justify-between text-[13px] mb-2">
                 <span className="text-text-secondary font-medium">Taxa de Conversão</span>
                 <span className="font-bold text-text-primary">92%</span>
              </div>
              <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-brand-primary rounded-full" style={{ width: '92%' }} />
              </div>
            </DashboardCard>
          </section>

          {/* Documents */}
          <section>
            <div className="flex items-center justify-between mb-3 ml-4">
              <h2 className="text-[12px] font-medium text-text-muted uppercase tracking-wider m-0">Arquivos</h2>
            </div>
            <DashboardCard>
              <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04] p-2">
                {client.client_documents && client.client_documents.length > 0 ? (
                  client.client_documents.map((doc: ClientDocument) => (
                    <a 
                      key={doc.id} 
                      href={doc.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group"
                    >
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-text-muted group-hover:text-brand-primary transition-colors">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-text-primary truncate">{doc.file_name}</p>
                        <p className="text-[11px] text-text-secondary font-medium">
                          {doc.type} • {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-black shadow-sm">
                        <Download size={14} className="text-text-primary" />
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="p-6 text-center text-text-muted text-[13px]">
                    Nenhum documento
                  </div>
                )}
              </div>
              <div className="p-3 pt-0">
                <Button variant="ghost" className="w-full justify-center h-9 text-[13px] font-medium rounded-lg text-brand-primary hover:bg-brand-primary/10">
                  <Upload size={14} className="mr-2" /> Novo Arquivo
                </Button>
              </div>
            </DashboardCard>
          </section>

          {/* Quick Actions */}
          <section>
            <SectionTitle>Ações Rápidas</SectionTitle>
            <DashboardCard className="p-2 space-y-1">
              <Button variant="ghost" className="w-full justify-start h-10 text-[14px] font-medium text-text-primary rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                <Mail size={16} className="mr-3 text-text-muted" /> Enviar E-mail
              </Button>
              <Button variant="ghost" className="w-full justify-start h-10 text-[14px] font-medium text-text-primary rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                <FileText size={16} className="mr-3 text-text-muted" /> Gerar Ficha Cadastral
              </Button>
              <Button variant="ghost" className="w-full justify-start h-10 text-[14px] font-medium text-status-danger rounded-lg hover:bg-status-danger/10 hover:text-status-danger">
                <AlertCircle size={16} className="mr-3" /> Suspender Cliente
              </Button>
            </DashboardCard>
          </section>

        </div>

      </div>
    </div>
  )
}

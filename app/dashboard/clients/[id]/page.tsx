import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getClientById, getClientStats } from '../actions'
import { getClientPortalSettings } from '@/app/dashboard/clients/actions'
import { getV2ProjectsByClient } from '@/app/dashboard/v2/actions'
import { PortalConfigModal } from '@/components/clients/PortalConfigModal'
import { Badge } from '@/components/ui/badge'
import { ProjectTypeBadge } from '@/components/projects/ProjectTypeSelect'
import {
  FolderOpen,
  Mail,
  Phone,
  Building2,
  FileText,
  User,
  Download,
  Upload,
  ChevronRight,
  MessageCircle,
  Pencil,
  ArrowLeft,
  Link as LinkIcon
} from 'lucide-react'
import Link from 'next/link'
import { WorkflowTypeV2, ClientAddress, ClientDocument } from '@/types/database'
import { Button } from '@/components/ui/button'

interface Props {
  params: { id: string }
}

const statusConfig: Record<string, { label: string; colorClass: string }> = {
  active: { label: 'Ativo', colorClass: 'text-[#34c759]' },
  paused: { label: 'Pausado', colorClass: 'text-[#ff9500]' },
  completed: { label: 'Concluído', colorClass: 'text-[#8e8e93]' },
  archived: { label: 'Arquivado', colorClass: 'text-[#8e8e93]' },
}

const clientStatusMap: Record<string, { label: string; colorClass: string }> = {
  active: { label: 'Ativo', colorClass: 'text-[#34c759]' },
  inactive: { label: 'Inativo', colorClass: 'text-[#8e8e93]' },
  paused: { label: 'Pausado', colorClass: 'text-[#ff9500]' },
}

function formatCPF(v: string) {
  if (!v) return '—'
  return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

function formatCNPJ(v: string) {
  if (!v) return '—'
  return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
}

function formatPhone(v: string) {
  if (!v) return '—'
  if (v.length === 11) {
    return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
  return v.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
}

function InfoRow({ label, value, valueClass = 'text-text-secondary', icon }: { label: string, value: React.ReactNode, valueClass?: string, icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 min-h-[44px]">
      <span className="text-[15px] font-medium text-text-primary shrink-0">{label}</span>
      <div className={`flex items-center gap-2 text-[15px] ${valueClass} text-right break-words max-w-[60%]`}>
        {icon}
        <span>{value}</span>
      </div>
    </div>
  )
}

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

  const clientStatus = clientStatusMap[client.status] ?? { label: client.status, colorClass: 'text-text-secondary' }
  const isPJ = client.type === 'pj'
  const identifier = isPJ ? client.cnpj : client.cpf
  const formattedIdentifier = isPJ ? formatCNPJ(identifier) : formatCPF(identifier)
  const mainAddress = client.client_addresses?.[0] as ClientAddress | undefined

  const displayName = isPJ ? (client.company || client.name) : client.name
  const displaySubtitle = isPJ ? (client.trade_name || 'Pessoa Jurídica') : 'Pessoa Física'

  return (
    <div className="animate-in fade-in-50 duration-500 max-w-4xl mx-auto pb-24">
      
      {/* ── Top Nav ── */}
      <div className="flex items-center mb-6">
        <Link href="/dashboard/clients" className="flex items-center gap-1.5 text-[15px] text-brand-primary hover:opacity-80 transition-opacity">
          <ChevronLeftIcon size={20} strokeWidth={2.5} />
          <span>Clientes</span>
        </Link>
      </div>

      {/* ── Contact Profile Header (iOS Style) ── */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-24 h-24 rounded-full bg-surface-muted/50 border border-black/[0.04] dark:border-white/[0.08] shadow-sm flex items-center justify-center text-text-secondary mb-4 backdrop-blur-xl">
          {isPJ ? <Building2 size={40} strokeWidth={1.5} /> : <User size={40} strokeWidth={1.5} />}
        </div>
        <h1 className="text-[28px] font-bold text-text-primary tracking-tight leading-tight">{displayName}</h1>
        <p className="text-[15px] text-text-secondary mt-1">{displaySubtitle}</p>
        
        {/* Quick Actions */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <Link href={`/dashboard/clients/${client.id}/edit`}>
            <Button variant="ghost" className="flex flex-col gap-1.5 h-auto py-2.5 px-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl w-[88px] transition-colors">
              <Pencil size={20} className="text-brand-primary" />
              <span className="text-[11px] font-medium text-brand-primary">Editar</span>
            </Button>
          </Link>
          {client.email && (
            <a href={`mailto:${client.email}`}>
              <Button variant="ghost" className="flex flex-col gap-1.5 h-auto py-2.5 px-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl w-[88px] transition-colors">
                <Mail size={20} className="text-brand-primary" />
                <span className="text-[11px] font-medium text-brand-primary">E-mail</span>
              </Button>
            </a>
          )}
          {client.whatsapp && (
            <a href={`https://wa.me/55${client.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="flex flex-col gap-1.5 h-auto py-2.5 px-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl w-[88px] transition-colors">
                <MessageCircle size={20} className="text-brand-primary" />
                <span className="text-[11px] font-medium text-brand-primary">Message</span>
              </Button>
            </a>
          )}
        </div>
      </div>

      <div className="space-y-8">
        
        {/* ── Status & Integração ── */}
        <section>
          <div className="bg-surface-primary/70 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-3xl saturate-150 rounded-2xl overflow-hidden shadow-sm">
            <InfoRow 
              label="Status" 
              value={clientStatus.label} 
              valueClass={clientStatus.colorClass} 
            />
            <InfoRow 
              label="Métricas" 
              value={`${stats.active} projetos ativos (${stats.total} total)`} 
            />
            <div className="flex items-center justify-between py-3 px-4 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 min-h-[44px]">
              <span className="text-[15px] font-medium text-text-primary shrink-0">Portal do Cliente</span>
              <div className="flex items-center">
                <PortalConfigModal 
                  clientId={client.id} 
                  clientName={displayName} 
                  existingSettings={portalSettings} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Identificação & Contato ── */}
        <section>
          <h2 className="text-[12px] font-medium text-text-muted uppercase ml-4 mb-2 tracking-wider">Identificação</h2>
          <div className="bg-surface-primary/70 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-3xl saturate-150 rounded-2xl overflow-hidden shadow-sm">
            <InfoRow label={isPJ ? 'CNPJ' : 'CPF'} value={formattedIdentifier} />
            <InfoRow label="E-mail" value={client.email || '—'} />
            <InfoRow label="Telefone" value={formatPhone(client.phone)} />
            <InfoRow label="WhatsApp" value={formatPhone(client.whatsapp)} />
            <InfoRow label="Gestor de Conta" value={client.account_manager?.full_name || 'Não atribuído'} />
            <InfoRow label="Segmento" value={client.segment || '—'} />
            <InfoRow label="Origem do Lead" value={client.lead_source || '—'} />
          </div>
        </section>

        {/* ── Endereço ── */}
        {mainAddress && (
          <section>
            <h2 className="text-[12px] font-medium text-text-muted uppercase ml-4 mb-2 tracking-wider">Endereço</h2>
            <div className="bg-surface-primary/70 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-3xl saturate-150 rounded-2xl overflow-hidden shadow-sm p-4">
              <p className="text-[15px] text-text-primary leading-relaxed">
                {mainAddress.street}, {mainAddress.number}
                {mainAddress.complement ? ` - ${mainAddress.complement}` : ''}
                <br />
                {mainAddress.city} - {mainAddress.state}
                <br />
                {mainAddress.zip_code}
              </p>
            </div>
          </section>
        )}

        {/* ── Observações Internas ── */}
        {client.notes && (
          <section>
            <h2 className="text-[12px] font-medium text-text-muted uppercase ml-4 mb-2 tracking-wider">Observações Internas</h2>
            <div className="bg-surface-primary/70 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-3xl saturate-150 rounded-2xl overflow-hidden shadow-sm p-4">
              <p className="text-[15px] text-text-secondary leading-relaxed whitespace-pre-wrap">
                {client.notes}
              </p>
            </div>
          </section>
        )}

        {/* ── Projetos ── */}
        <section>
          <h2 className="text-[12px] font-medium text-text-muted uppercase ml-4 mb-2 tracking-wider">Projetos</h2>
          <div className="bg-surface-primary/70 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-3xl saturate-150 rounded-2xl overflow-hidden shadow-sm">
            {projects.length > 0 ? (
              projects.map((project: any) => {
                const cfg = statusConfig[project.status] ?? { label: project.status, colorClass: 'text-text-secondary' }
                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between py-3 px-4 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group min-h-[44px]"
                  >
                    <div className="flex flex-col">
                      <span className="text-[15px] font-medium text-text-primary group-hover:text-brand-primary transition-colors">
                        {project.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[13px] ${cfg.colorClass}`}>{cfg.label}</span>
                        {project.type && <span className="text-[13px] text-text-muted">• {project.type}</span>}
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-text-muted/50 group-hover:text-brand-primary" />
                  </Link>
                )
              })
            ) : (
              <div className="py-4 px-4 text-[15px] text-text-secondary text-center">
                Nenhum projeto registrado.
              </div>
            )}
          </div>
        </section>

        {/* ── Documentos ── */}
        <section>
          <div className="flex items-center justify-between ml-4 mb-2">
            <h2 className="text-[12px] font-medium text-text-muted uppercase tracking-wider">Documentos Anexados</h2>
          </div>
          <div className="bg-surface-primary/70 dark:bg-black/40 border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-3xl saturate-150 rounded-2xl overflow-hidden shadow-sm">
            {client.client_documents && client.client_documents.length > 0 ? (
              client.client_documents.map((doc: ClientDocument) => (
                <a 
                  key={doc.id} 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-3 px-4 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group min-h-[44px]"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText size={20} className="text-brand-primary shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[15px] font-medium text-text-primary truncate">
                        {doc.file_name}
                      </span>
                      <span className="text-[13px] text-text-secondary">
                        {doc.type} {doc.file_size ? `• ${(doc.file_size / 1024).toFixed(1)} KB` : ''}
                      </span>
                    </div>
                  </div>
                  <Download size={18} className="text-text-muted/50 group-hover:text-brand-primary shrink-0" />
                </a>
              ))
            ) : (
              <div className="py-4 px-4 text-[15px] text-text-secondary text-center">
                Nenhum documento anexado.
              </div>
            )}
            
            <div className="py-2 px-4 border-t border-black/[0.04] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.01]">
              <Button variant="ghost" className="w-full h-10 text-[15px] text-brand-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-xl gap-2">
                <Upload size={16} /> Anexar Documento
              </Button>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

function ChevronLeftIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getClientById, getClientStats } from '../actions'
import { getClientPortalSettings } from '@/app/dashboard/clients/actions'
import { getV2ProjectsByClient } from '@/app/dashboard/v2/actions'
import { PortalConfigModal } from '@/components/clients/PortalConfigModal'
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
  MapPin,
  User,
  ShieldCheck,
  Download,
  Upload,
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

const clientStatusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active: { label: 'Ativo', variant: 'default' },
  inactive: { label: 'Inativo', variant: 'secondary' },
  paused: { label: 'Pausado', variant: 'destructive' },
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

  const clientStatus = clientStatusMap[client.status] ?? { label: client.status, variant: 'secondary' }
  const isPJ = client.type === 'pj'
  const identifier = isPJ ? client.cnpj : client.cpf
  const formattedIdentifier = identifier 
    ? (isPJ ? formatCNPJ(identifier) : formatCPF(identifier))
    : '—'

  const mainAddress = client.client_addresses?.[0] as ClientAddress | undefined

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-xl shadow-brand-primary/20">
            {isPJ ? <Building2 size={32} /> : <User size={32} />}
          </div>
          <div>
            <EditorialHeader
              title={isPJ ? (client.company || client.name) : client.name}
              subtitle={isPJ ? (client.trade_name || 'Empresa PJ') : 'Pessoa Física'}
            />
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={clientStatus.variant}>{clientStatus.label}</Badge>
              {client.segment && (
                <Badge variant="outline" className="text-text-muted border-border">{client.segment}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PortalConfigModal 
            clientId={client.id} 
            clientName={isPJ ? (client.company || client.name) : client.name} 
            existingSettings={portalSettings} 
          />
          <Button variant="outline" size="sm" className="h-9">Exportar PDF</Button>
          <Link href={`/dashboard/clients/${client.id}/edit`}>
            <Button size="sm" className="h-9">Editar CRM</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: CRM Profile */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-surface border border-border rounded-xl p-6 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 p-3 opacity-10">
                <ShieldCheck size={120} />
             </div>
             
             <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6 flex items-center gap-2">
                <User size={14} /> Perfil CRM Detalhado
             </h3>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                   <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">E-mail</p>
                   <div className="flex items-center gap-2 text-sm text-text-primary">
                      <Mail size={14} className="text-text-muted" />
                      {client.email ?? '—'}
                   </div>
                </div>

                <div>
                   <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">Documento ({client.type?.toUpperCase()})</p>
                   <div className="flex items-center gap-2 text-sm text-text-primary font-mono">
                      <FileText size={14} className="text-text-muted" />
                      {formattedIdentifier}
                   </div>
                </div>

                <div>
                   <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">Contatos</p>
                   <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm text-text-primary">
                         <Phone size={14} className="text-text-muted" />
                         {client.phone ? formatPhone(client.phone) : '—'}
                      </div>
                      {client.whatsapp && (
                         <div className="flex items-center gap-2 text-sm text-status-success font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                            {formatPhone(client.whatsapp)}
                         </div>
                      )}
                   </div>
                </div>

                <div>
                   <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">Localização</p>
                   <div className="flex items-start gap-2 text-sm text-text-primary">
                      <MapPin size={14} className="text-text-muted mt-0.5" />
                      {mainAddress ? (
                         <div>
                            <p>{mainAddress.street}, {mainAddress.number}</p>
                            <p className="text-xs text-text-muted">{mainAddress.city} - {mainAddress.state} | {mainAddress.zip_code}</p>
                         </div>
                      ) : 'Endereço não informado'}
                   </div>
                </div>

                <div>
                   <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">Gestor de Conta</p>
                   <div className="flex items-center gap-2 text-sm text-text-primary">
                      <User size={14} className="text-text-muted" />
                      {client.account_manager?.full_name || 'Sem gestor atribuído'}
                   </div>
                </div>

                <div>
                   <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">Origem do Lead</p>
                   <div className="flex items-center gap-2 text-sm text-text-primary">
                      <Tag size={14} className="text-text-muted" />
                      {client.lead_source || 'Indefinida'}
                   </div>
                </div>
             </div>

             {client.notes && (
                <div className="mt-8 pt-6 border-t border-border">
                   <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2">Observações Internas</p>
                   <div className="bg-surface-muted/30 rounded-lg p-4 text-sm text-text-secondary leading-relaxed italic">
                      {client.notes}
                   </div>
                </div>
             )}
          </section>

          {/* Project History */}
          <section>
             <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                <FolderOpen size={14} /> Cronograma de Projetos
             </h2>
             {projects.length > 0 ? (
               <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                 <div className="divide-y divide-border">
                   {projects.map((project: any) => {
                     const cfg = statusConfig[project.status] ?? { label: project.status, variant: 'outline' as const }
                     return (
                       <Link
                         key={project.id}
                         href={`/dashboard/projects/${project.id}`}
                         className="flex items-center justify-between px-6 py-4 hover:bg-surface-muted/40 transition-all group"
                       >
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-text-muted group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                              <FolderOpen size={20} />
                           </div>
                           <div>
                             <p className="font-medium text-text-primary">{project.name}</p>
                             <p className="text-xs text-text-muted mt-0.5">
                               Iniciado em: {new Date(project.created_at).toLocaleDateString('pt-BR')}
                             </p>
                           </div>
                         </div>
                         <div className="flex items-center gap-3">
                           {project.type && <ProjectTypeBadge type={project.type as WorkflowTypeV2} />}
                           <Badge variant={cfg.variant}>{cfg.label}</Badge>
                         </div>
                       </Link>
                     )
                   })}
                 </div>
               </div>
             ) : (
               <div className="bg-surface-muted/10 border-2 border-dashed border-border rounded-xl py-12 text-center text-text-muted">
                  Nenhum projeto registrado para este perfil.
               </div>
             )}
          </section>
        </div>

        {/* Right Column: Stats & Documents */}
        <div className="space-y-8">
          <section className="bg-surface border border-border rounded-xl p-6 shadow-sm">
             <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">Métricas de Engajamento</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-muted/40">
                   <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
                   <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Total</p>
                </div>
                <div className="p-4 rounded-xl bg-status-success/5 border border-status-success/10">
                   <p className="text-2xl font-bold text-status-success">{stats.active}</p>
                   <p className="text-[10px] uppercase font-bold text-status-success tracking-widest">Ativos</p>
                </div>
             </div>
             
             <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                   <span className="text-text-muted">Conversão</span>
                   <span className="font-bold text-text-primary">92%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden">
                   <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: '92%' }} />
                </div>
             </div>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Documentos</h3>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase tracking-tighter">Gerenciar</Button>
             </div>
             
             <div className="space-y-3">
                {client.client_documents && client.client_documents.length > 0 ? (
                   client.client_documents.map((doc: ClientDocument) => (
                      <a 
                        key={doc.id} 
                        href={doc.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all group"
                      >
                         <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded bg-surface-muted flex items-center justify-center text-text-muted group-hover:text-brand-primary">
                               <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                               <p className="text-xs font-medium text-text-primary truncate">{doc.file_name}</p>
                               <p className="text-[10px] text-text-muted uppercase font-bold tracking-tighter">
                                  {doc.type} • {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ''}
                                </p>
                             </div>
                          </div>
                          <Download size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                       </a>
                    ))
                 ) : (
                    <p className="text-xs text-text-muted py-4 italic">Nenhum documento anexado.</p>
                 )}
              </div>
 
              <Button variant="outline" className="w-full mt-6 gap-2 border-dashed h-11">
                 <Upload size={14} /> Anexar Documento
              </Button>
           </section>
 
           <section className="bg-surface border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Ações Rápidas</h3>
              <div className="flex flex-col gap-2">
                 <Button variant="ghost" className="justify-start h-9 text-xs text-text-secondary gap-3">
                    <Mail size={14} /> Enviar E-mail
                 </Button>
                 <Button variant="ghost" className="justify-start h-9 text-xs text-text-secondary gap-3">
                    <Building2 size={14} /> Ficha Cadastral
                 </Button>
                 <Button variant="ghost" className="justify-start h-9 text-xs text-status-danger hover:bg-status-danger/5 gap-3">
                    <AlertTriangle size={14} /> Desativar Cliente
                 </Button>
              </div>
           </section>
         </div>
       </div>
     </div>
   )
 }

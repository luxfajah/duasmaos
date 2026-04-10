import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getDashboardStats } from './projects/actions'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { EditorialHeader } from '@/components/brand/EditorialHeader'
import {
  Users,
  FolderOpen,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const stats = await getDashboardStats()

  const firstName = user.email?.split('@')[0] ?? 'Equipe'

  return (
    <div className="space-y-12 animate-in fade-in-50 duration-500">
      <EditorialHeader
        title="Mesa de Trabalho"
        subtitle={`Visão geral de clientes, projetos e entregas. Olá, ${firstName}.`}
      />

      {/* Metrics grid */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">
          Resumo Geral
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <MetricCard
            label="Clientes ativos"
            value={stats.totalClients}
            icon={Users}
            description="Total de clientes ativos"
            accent="info"
          />
          <MetricCard
            label="Projetos ativos"
            value={stats.activeProjects}
            icon={FolderOpen}
            description="Em andamento"
            accent="default"
          />
          <MetricCard
            label="Projetos atrasados"
            value={stats.delayedProjects}
            icon={AlertTriangle}
            description="Precisam de atenção"
            accent="danger"
          />
          <MetricCard
            label="Projetos aprovados"
            value={stats.approvedProjects}
            icon={CheckCircle2}
            description="Aprovados pelos clientes"
            accent="success"
          />
          <MetricCard
            label="Tarefas da semana"
            value={stats.weekTasks}
            icon={CalendarClock}
            description="Com prazo nos próximos 7 dias"
            accent="warning"
          />
        </div>
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            href: '/dashboard/clients',
            icon: '👥',
            title: 'Gerenciar Clientes',
            desc: 'Adicionar e editar clientes',
          },
          {
            href: '/dashboard/projects',
            icon: '📋',
            title: 'Gerenciar Projetos',
            desc: 'Ver e atualizar projetos',
          },
          {
            href: '/dashboard/kanban',
            icon: '🏷️',
            title: 'Kanban de Projetos',
            desc: 'Arrastar e soltar por status',
          },
          {
            href: '/dashboard/tasks',
            icon: '✅',
            title: 'Minhas Tarefas',
            desc: 'Tarefas e entregas',
          },
          {
            href: '/dashboard/calendar',
            icon: '📅',
            title: 'Calendário',
            desc: 'Prazos e entregas do mês',
          },
          {
            href: '/dashboard/files',
            icon: '📁',
            title: 'Arquivos',
            desc: 'Upload de artes e documentos',
          },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="group flex items-start gap-4 p-5 bg-surface border border-border rounded-xl hover:border-border-strong hover:shadow-sm transition-all duration-200"
          >
            <span className="text-2xl">{link.icon}</span>
            <div>
              <p className="font-semibold text-text-primary group-hover:text-brand-primary transition-colors">
                {link.title}
              </p>
              <p className="text-sm text-text-secondary mt-0.5">{link.desc}</p>
            </div>
          </a>
        ))}
      </section>
    </div>
  )
}

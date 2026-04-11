import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDashboardStats, getProjects } from './projects/actions'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ProductivityChart } from '@/components/dashboard/ProductivityChart'
import { DailyTasksList } from '@/components/dashboard/DailyTasksList'
import { TeamActivityFeed } from '@/components/dashboard/TeamActivityFeed'
import { ProjectTable } from '@/components/dashboard/ProjectTable'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import {
  FolderOpen,
  CalendarClock,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Filter,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [stats, projects, rawTasks, rawLogs] = await Promise.all([
    getDashboardStats(),
    getProjects(),
    supabase.from('tasks').select('*').limit(5).order('deadline', { ascending: true }),
    supabase.from('activity_logs').select('*, profiles(full_name, avatar_url)').order('created_at', { ascending: false }).limit(6)
  ])

  const todaysTasks = rawTasks.data ?? [];

  const teamLogs = (rawLogs.data ?? []).map(log => ({
    id: log.id,
    user_id: log.user_id,
    user_name: log.profiles?.full_name ?? 'Usuário',
    user_avatar: log.profiles?.avatar_url,
    action: log.action,
    entity: log.entity_type,
    time_ago: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    details: log.details
  }));

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Olá'

  return (
    <div className="space-y-10 animate-fade-in-up pb-20">

      {/* ══════════════════════════════════════════
          EDITORIAL PAGE HEADER
      ══════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          {/* Eyebrow — Terracotta + Muted */}
          <div className="flex items-center gap-2 mb-2">
            <span className="label-eyebrow text-brand-primary">Painel de Controle</span>
            <span className="text-brand-primary/30">·</span>
            <span className="label-eyebrow text-text-muted">Q2 2026</span>
          </div>
          {/* Strong editorial heading — Plus Jakarta Sans */}
          <h1 className="heading-editorial text-4xl md:text-5xl text-text-primary">
            Bom dia, {firstName} 👋
          </h1>
          <p className="text-text-secondary mt-2 font-medium text-base font-body">
            Ciclo ativo encerrando em{' '}
            <span className="font-bold text-text-primary">15 de Junho</span>.
            {' '}Reveja seus projetos e entregáveis.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="px-4 py-2.5 text-sm font-bold font-heading text-text-primary bg-surface-elevated border border-sand-dark/50 rounded-xl hover:bg-sand hover:-translate-y-0.5 transition-all duration-150 shadow-sm">
            Exportar Relatório
          </button>
          <button className="px-4 py-2.5 text-sm font-bold font-heading text-[hsl(35_35%_95%)] bg-brand-primary rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all duration-150 shadow-terracotta/30 shadow-md flex items-center gap-2">
            <Sparkles size={14} />
            Agendar Sincronia
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          METRICS ROW — Asymmetric hierarchy
          First card = Terracotta featured
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Featured / Dominant — Terracotta */}
        <MetricCard
          label="Projetos Ativos"
          value={stats.activeProjects}
          icon={FolderOpen}
          description="Campanhas em produção"
          accent="default"
          featured={true}
          trendValue="+12% vs último mês"
          trend="up"
        />
        <MetricCard
          label="Tarefas Atrasadas"
          value={stats.overdueTasks}
          icon={Clock}
          description="Requerem atenção imediata"
          accent="danger"
          trendValue="Ação necessária"
          trend="neutral"
        />
        <MetricCard
          label="Próximos (7 dias)"
          value={stats.weekTasks}
          icon={CalendarClock}
          description="Entrega em breve"
          accent="info"
        />
        <MetricCard
          label="Faturamento Mensal"
          value="R$ 42,8k"
          icon={ArrowRight}
          description="Meta Q3"
          accent="success"
          trendValue="+8% vs mês anterior"
          trend="up"
        />
      </div>

      {/* ══════════════════════════════════════════
          MAIN CONTENT — Asymmetric editorial grid
          Left (wider) + Right (narrower)
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

        {/* ── Left Column ── */}
        <div className="space-y-10 min-w-0">

          {/* Active Projects */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="heading-section text-xl text-text-primary">Projetos Ativos</h2>
                <p className="text-sm text-text-muted mt-0.5 font-body">Visão geral das campanhas em andamento</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <button className="px-3 py-1.5 text-xs font-bold font-heading bg-surface-elevated border border-sand-dark/50 rounded-lg flex items-center gap-1.5 hover:bg-sand hover:-translate-y-0.5 transition-all duration-150 text-text-secondary">
                    Status <ChevronDown size={12} />
                  </button>
                  <button className="px-3 py-1.5 text-xs font-bold font-heading bg-surface-elevated border border-sand-dark/50 rounded-lg flex items-center gap-1.5 hover:bg-sand hover:-translate-y-0.5 transition-all duration-150 text-text-secondary">
                    Cliente <ChevronDown size={12} />
                  </button>
                </div>
                <button className="px-3 py-1.5 text-xs font-bold font-heading text-brand-primary flex items-center gap-1.5 hover:bg-terracotta-soft rounded-lg transition-colors">
                  <Filter size={12} /> Filtros
                </button>
              </div>
            </div>
            <ProjectTable projects={projects} />
          </section>

          {/* Summary Cards */}
          <SummaryCards projects={projects} />

          {/* Daily Tasks */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-section text-xl text-text-primary">Minhas Tarefas</h2>
              <Link
                href="/dashboard/tasks"
                className="text-sm font-bold font-heading text-brand-primary hover:underline underline-offset-4 flex items-center gap-1 hover:text-brand-primary-hover transition-colors"
              >
                Ver todas <ArrowUpRight size={14} />
              </Link>
            </div>
            <DailyTasksList tasks={todaysTasks} />
          </section>

          {/* Productivity Chart */}
          <section className="space-y-4">
            <h2 className="heading-section text-xl text-text-primary">Tendência de Eficiência</h2>
            <ProductivityChart />
          </section>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">

          {/* Featured Client — DEEP BLUE IMMERSIVE */}
          <div className="card-deep-blue p-0 overflow-hidden min-h-[220px] flex flex-col justify-end relative cursor-default group rounded-2xl">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222_45%_18%)] to-[hsl(222_55%_10%)]" />

            {/* Organic decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Flowing wave */}
              <svg className="absolute top-5 right-5 opacity-[0.10]" width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 44 Q26 16 44 44 Q62 72 80 44" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M8 58 Q26 30 44 58 Q62 86 80 58" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
              </svg>
              {/* Terracotta accent dot cluster */}
              <svg className="absolute bottom-8 left-6 opacity-[0.12]" width="56" height="40" viewBox="0 0 56 40" fill="none">
                <circle cx="8"  cy="8"  r="2.5" fill="hsl(13 55% 70%)"/>
                <circle cx="24" cy="8"  r="2"   fill="hsl(13 55% 70%)"/>
                <circle cx="40" cy="8"  r="2.5" fill="hsl(13 55% 70%)"/>
                <circle cx="8"  cy="24" r="2"   fill="hsl(13 55% 70%)"/>
                <circle cx="24" cy="24" r="2.5" fill="hsl(13 55% 70%)"/>
                <circle cx="40" cy="24" r="2"   fill="hsl(13 55% 70%)"/>
              </svg>
              {/* Large organic blob */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-700" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-6">
              <span className="label-eyebrow text-brand-primary mb-3 block">Cliente em Destaque</span>
              <h3 className="text-2xl font-black font-heading text-white leading-tight mb-1">
                Nordic Design Group
              </h3>
              <p className="text-sm text-white/50 font-medium font-body">
                Revisão Anual de Retainer Pendente
              </p>
              <button className="mt-4 text-xs font-bold font-heading text-white/60 hover:text-white transition-colors flex items-center gap-1 group/btn">
                Ver detalhes
                <ArrowUpRight size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-150" />
              </button>
            </div>
          </div>

          {/* Team Activity */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-section text-xl text-text-primary">Atividade da Equipe</h2>
              <button className="p-1.5 hover:bg-sand rounded-lg transition-colors text-text-muted hover:text-text-primary">
                <MoreHorizontal size={16} />
              </button>
            </div>
            <TeamActivityFeed logs={teamLogs} />
            <button className="w-full py-3 text-xs font-bold font-heading text-text-muted hover:text-text-primary border-t border-sand-dark/50 transition-colors uppercase tracking-widest hover:text-brand-primary">
              Ver histórico completo
            </button>
          </section>

        </div>
      </div>
    </div>
  )
}

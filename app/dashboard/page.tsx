import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDashboardStats, getProjects } from './projects/actions'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { DailyTasksList } from '@/components/dashboard/DailyTasksList'
import { TeamActivityFeed } from '@/components/dashboard/TeamActivityFeed'
import { ProjectTable } from '@/components/dashboard/ProjectTable'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { Avatar } from '@/components/ui/avatar'
import {
  FolderOpen,
  CalendarClock,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MoreHorizontal,
  Filter,
  ChevronDown,
} from 'lucide-react'

/* ─────────────────────────────────────────
   GREETING BANNER helpers
───────────────────────────────────────── */
function getGreeting(hour: number) {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [stats, projects, rawTasks, rawLogs] = await Promise.all([
    getDashboardStats(),
    getProjects(),
    supabase.from('tasks').select('*').limit(8).order('deadline', { ascending: true }),
    supabase.from('activity_logs').select('*, profiles(full_name, avatar_url)').order('created_at', { ascending: false }).limit(6)
  ])

  const todaysTasks = rawTasks.data ?? []

  const teamLogs = (rawLogs.data ?? []).map(log => ({
    id: log.id,
    user_id: log.user_id,
    user_name: log.profiles?.full_name ?? 'Usuário',
    user_avatar: log.profiles?.avatar_url,
    action: log.action,
    entity: log.entity_type,
    time_ago: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    details: log.details
  }))

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Olá'
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Usuário'
  const greeting = getGreeting(new Date().getHours())

  // Pending tasks count for contextual message
  const pendingCount = todaysTasks.filter(t => t.status !== 'done').length
  const overdueCount = stats.overdueTasks

  return (
    <div className="animate-fade-in-up pb-24">

      {/* ══════════════════════════════════════════
          HUMANIZED GREETING BLOCK
          Avatar + name + contextual message
          Not a card — blends into atmosphere
      ══════════════════════════════════════════ */}
      <div className="greeting-block mb-6">
        {/* User avatar */}
        <div className="shrink-0">
          <Avatar
            name={displayName}
            size="lg"
            variant="brand"
            className="ring-4 ring-brand-primary/15 shadow-md"
          />
        </div>

        {/* Text */}
        <div>
          <h1 className="heading-editorial text-3xl md:text-4xl text-text-primary leading-tight">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-text-secondary mt-1 font-medium text-sm font-body">
            {pendingCount > 0
              ? <>Você tem <span className="font-bold text-text-primary">{pendingCount} tarefas</span> pendentes hoje
                {overdueCount > 0 && <> e <span className="font-bold text-red-600">{overdueCount} atrasadas</span> para revisar</>}.
              </>
              : <>Tudo em dia por hoje! Ciclo ativo encerrando em <span className="font-bold text-text-primary">15 de Junho</span>.</>
            }
          </p>
        </div>

        {/* Spacer + Export button */}
        <div className="ml-auto shrink-0 hidden sm:block">
          <button className="px-4 py-2 text-sm font-bold font-heading text-text-secondary bg-surface-elevated border border-border rounded-xl hover:bg-sand hover:-translate-y-0.5 transition-all duration-150 shadow-sm">
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CENTRAL FOCUS BLOCK
          High impact daily status metric
      ══════════════════════════════════════════ */}
      <div className="mb-8 floating-card bg-surface-elevated/60 backdrop-blur-sm p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-stretch relative overflow-hidden group">
        
        {/* Abstract background elements */}
        <div className="absolute -top-32 -right-20 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />
        
        <div className="flex-1 flex flex-col justify-center relative z-10 pl-2 lg:pl-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface text-brand-primary shadow-sm font-bold text-sm">
              <TrendingUp size={16} strokeWidth={2.5}/>
            </span>
            <span className="label-eyebrow text-text-muted">Ciclo de Produção Q2</span>
          </div>
          
          <div className="mb-2">
             <span className="text-7xl md:text-8xl lg:text-[7.5rem] font-black font-heading text-text-primary tracking-tighter tabular-nums drop-shadow-sm leading-none">
                85<span className="text-4xl text-text-muted/60">%</span>
             </span>
          </div>
          <p className="text-text-secondary font-medium font-body text-lg mt-2">
             Produtividade de hoje
          </p>
        </div>

        {/* Secondary Info Block - Yellow Theme */}
        <div className="w-full lg:w-[55%] bg-[#FFD166] dark:bg-[#d4a841] rounded-[24px] p-6 lg:p-8 text-[#4a3915] dark:text-[#2c220c] shadow-sm relative overflow-hidden flex flex-col justify-center transition-transform duration-300">
           {/* Abstract inner shapes */}
           <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-white/40 to-transparent pointer-events-none" />

           <div className="flex items-center justify-between mb-8 relative z-10">
              <span className="text-sm font-bold font-body">Atividade do Projeto</span>
              <span className="px-3 py-1.5 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-black/60">Estatísticas</span>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 relative z-10">
              <div>
                <p className="text-4xl font-black font-heading mb-1 tabular-nums">26<span className="text-xl font-bold opacity-50">h</span></p>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-70 font-body">Horas T.</p>
              </div>
              <div>
                <p className="text-4xl font-black font-heading mb-1 tabular-nums">12</p>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-70 font-body">Tarefas</p>
              </div>
              <div>
                <p className="text-4xl font-black font-heading mb-1 tabular-nums">6</p>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-70 font-body">Revisões</p>
              </div>
              <div>
                <p className="text-4xl font-black font-heading mb-1 tabular-nums">3</p>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-70 font-body">Reuniões</p>
              </div>
           </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          3-ZONE MAIN LAYOUT
          CENTER (tasks) + RIGHT (actions)
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">

        {/* ═══════════════════════════════
            CENTER — Primary task focus
        ═══════════════════════════════ */}
        <div className="space-y-8 min-w-0">

          {/* ── Tarefas de Hoje — PRIMARY SECTION ── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="section-atmosphere">
                <div>
                  <h2 className="heading-section text-xl text-text-primary">Tarefas de Hoje</h2>
                  <p className="text-xs text-text-muted mt-0.5 font-body">
                    {todaysTasks.length} tarefa{todaysTasks.length !== 1 ? 's' : ''} encontradas
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/tasks"
                className="text-sm font-bold font-heading text-brand-primary hover:underline underline-offset-4 flex items-center gap-1 hover:text-brand-primary-hover transition-colors"
              >
                Ver todas <ArrowUpRight size={14} />
              </Link>
            </div>

            {/* Task cards */}
            <DailyTasksList tasks={todaysTasks} />
          </section>

          {/* ── Active Projects — Secondary section ── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="section-atmosphere">
                <div>
                  <h2 className="heading-section text-lg text-text-primary">Projetos Ativos</h2>
                  <p className="text-sm text-text-muted mt-0.5 font-body">Campanhas em andamento</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <button className="px-3 py-1.5 text-xs font-bold font-heading bg-surface-elevated border border-sand-dark/50 rounded-lg flex items-center gap-1.5 hover:bg-sand hover:-translate-y-0.5 transition-all duration-150 text-text-secondary shadow-xs">
                    Status <ChevronDown size={12} />
                  </button>
                  <button className="px-3 py-1.5 text-xs font-bold font-heading bg-surface-elevated border border-sand-dark/50 rounded-lg flex items-center gap-1.5 hover:bg-sand hover:-translate-y-0.5 transition-all duration-150 text-text-secondary shadow-xs">
                    Cliente <ChevronDown size={12} />
                  </button>
                </div>
                <button className="px-3 py-1.5 text-xs font-bold font-heading text-brand-primary flex items-center gap-1.5 hover:bg-terracotta-soft rounded-lg transition-colors">
                  <Filter size={12} /> Filtros
                </button>
              </div>
            </div>
            <div className="floating-card overflow-hidden p-0">
              <ProjectTable projects={projects} />
            </div>
          </section>

          {/* ── Metrics — DEMOTED to bottom secondary strip ── */}
          <section className="space-y-3">
            <div className="section-atmosphere">
              <h2 className="heading-section text-base text-text-muted">Visão Geral</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                label="Projetos Ativos"
                value={stats.activeProjects}
                icon={FolderOpen}
                description="Em produção"
                accent="default"
                trendValue="+12% vs mês anterior"
                trend="up"
              />
              <MetricCard
                label="Tarefas Atrasadas"
                value={stats.overdueTasks}
                icon={Clock}
                description="Atenção imediata"
                accent="danger"
              />
              <MetricCard
                label="Próximos 7 dias"
                value={stats.weekTasks}
                icon={CalendarClock}
                description="Entrega em breve"
                accent="info"
              />
              <MetricCard
                label="Faturamento Mensal"
                value="R$ 42,8k"
                icon={TrendingUp}
                description="Meta Q3"
                accent="success"
                trendValue="+8% vs mês anterior"
                trend="up"
              />
            </div>
          </section>

        </div>

        {/* ═══════════════════════════════
            RIGHT PANEL — Sticky actions
        ═══════════════════════════════ */}
        <div className="right-panel xl:sticky xl:top-20">

          {/* Quick Actions — Vertical panel */}
          <QuickActions />

          {/* Team Activity widget */}
          <section>
            <div className="floating-card p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="section-atmosphere">
                  <h2 className="heading-section text-base text-text-primary">Atividade da Equipe</h2>
                </div>
                <button className="p-1.5 hover:bg-sand rounded-lg transition-colors text-text-muted hover:text-text-primary">
                  <MoreHorizontal size={15} />
                </button>
              </div>

              <TeamActivityFeed logs={teamLogs} />

              <button className="w-full mt-3 pt-3 text-xs font-bold font-heading text-text-muted hover:text-brand-primary border-t border-sand-dark/40 transition-colors uppercase tracking-widest">
                Ver histórico completo
              </button>
            </div>
          </section>

          {/* Featured client — immersive deep-blue mini card */}
          <div className="focus-block p-0 overflow-hidden min-h-[160px] flex flex-col justify-end relative cursor-default group rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222_45%_18%)] to-[hsl(222_55%_10%)]" />
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <svg className="absolute top-4 right-4 opacity-[0.10]" width="72" height="72" viewBox="0 0 88 88" fill="none">
                <path d="M8 44 Q26 16 44 44 Q62 72 80 44" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
              <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="relative z-10 p-5">
              <span className="label-eyebrow text-brand-primary mb-2 block">Cliente em Destaque</span>
              <h3 className="text-lg font-black font-heading text-white leading-tight mb-0.5">
                Nordic Design Group
              </h3>
              <p className="text-xs text-white/50 font-medium font-body">Revisão Anual de Retainer Pendente</p>
              <button className="mt-3 text-xs font-bold font-heading text-white/60 hover:text-white transition-colors flex items-center gap-1 group/btn">
                Ver detalhes
                <ArrowUpRight size={11} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-150" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

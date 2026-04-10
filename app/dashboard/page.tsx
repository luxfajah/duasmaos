import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
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
  ChevronDown,
  Filter,
  Plus,
  ArrowRight
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all necessary data
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
    time_ago: new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    details: log.details
  }));

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-700 pb-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Strategic Dashboard</h1>
          <p className="text-text-muted mt-1.5 font-medium">Status report for the current sprint cycle ending June 15th.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-bold text-text-primary bg-surface border border-border rounded-xl hover:bg-surface-muted transition-colors shadow-sm">
            Export Report
          </button>
          <button className="px-4 py-2 text-sm font-bold text-white bg-brand-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm shadow-brand-primary/20 flex items-center gap-2">
            Schedule Sync
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="ACTIVE PROJECTS"
          value={stats.activeProjects}
          icon={FolderOpen}
          description="+12% vs last month"
          accent="default"
        />
        <MetricCard
          label="DELAYED TASKS"
          value={stats.overdueTasks}
          icon={Clock}
          description="Action Required"
          accent="danger"
        />
        <MetricCard
          label="UPCOMING (7D)"
          value={stats.weekTasks}
          icon={CalendarClock}
          description="Due next 48h"
          accent="info"
        />
        <MetricCard
          label="MONTHLY BILLING"
          value="$42.8k"
          icon={ArrowRight}
          description="Q3 Target"
          accent="success"
        />
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Projects & Daily Tasks */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Active Projects Tablet */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-text-primary">Active Projects</h2>
                <p className="text-sm text-text-muted">Overviewing active campaigns.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                   <button className="px-3 py-1.5 text-xs font-bold bg-surface border border-border rounded-lg flex items-center gap-2 hover:bg-surface-muted transition-colors">
                     Status <ChevronDown size={14} />
                   </button>
                   <button className="px-3 py-1.5 text-xs font-bold bg-surface border border-border rounded-lg flex items-center gap-2 hover:bg-surface-muted transition-colors">
                     Client <ChevronDown size={14} />
                   </button>
                </div>
                <button className="px-3 py-1.5 text-xs font-bold text-brand-primary flex items-center gap-2 hover:bg-brand-primary/5 rounded-lg transition-colors">
                  <Filter size={14} /> Advanced Filters
                </button>
              </div>
            </div>
            
            <ProjectTable projects={projects} />
          </section>

          {/* Daily Tasks & Summary Row */}
          <div className="grid grid-cols-1 xl:grid-cols-1 gap-10">
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <h2 className="text-lg font-bold text-text-primary">My Daily Tasks</h2>
                 <button className="text-sm font-bold text-brand-primary hover:underline">View All</button>
               </div>
               <DailyTasksList tasks={todaysTasks} />
             </div>
             
             {/* Summary Cards below Project Table & Tasks */}
             <SummaryCards projects={projects} />
          </div>

          {/* Productivity Chart */}
          <section className="space-y-4">
             <h2 className="text-lg font-bold text-text-primary">Efficiency Trend</h2>
             <ProductivityChart />
          </section>
        </div>

        {/* Right Column: Activity Feed & Extra */}
        <div className="space-y-10">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">Team Activity</h2>
              <button className="p-1 hover:bg-surface-muted rounded-md transition-colors">
                {/* Horizontal triple dots lucide icon would go here, using a generic placeholder for now */}
                <Plus size={18} className="rotate-45 text-text-muted" />
              </button>
            </div>
            <TeamActivityFeed logs={teamLogs} />
            <button className="w-full py-3 text-sm font-bold text-text-muted hover:text-text-primary border-t border-border transition-colors">
              SHOW MORE HISTORY
            </button>
          </section>

          {/* Featured Review / Nordic Design card like in the image */}
          <div className="bg-text-primary text-surface rounded-2xl p-6 relative overflow-hidden group h-48 flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="relative z-10">
               <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded mb-2 inline-block">Featured Client</span>
               <h3 className="text-xl font-bold text-white">Nordic Design Group</h3>
               <p className="text-sm text-surface/70">Annual Retainer Review Pending</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

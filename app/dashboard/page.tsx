import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getDashboardStats } from './projects/actions'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ProductivityChart } from '@/components/dashboard/ProductivityChart'
import { DailyTasksList } from '@/components/dashboard/DailyTasksList'
import { TeamActivityFeed } from '@/components/dashboard/TeamActivityFeed'
import {
  Users,
  FolderOpen,
  CalendarClock,
  Clock,
  Briefcase,
  DollarSign
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const stats = await getDashboardStats()

  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: rawTasks } = await supabase
    .from('tasks')
    .select('*')
    .gte('deadline', today.toISOString())
    .lt('deadline', tomorrow.toISOString())
    .limit(5);

  const todaysTasks = rawTasks ?? [];
  
  const { data: rawLogs } = await supabase
    .from('activity_logs')
    .select('*, profiles(full_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(5);

  const teamLogs = (rawLogs ?? []).map(log => ({
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
    <div className="space-y-8 animate-in fade-in-50 duration-500 pb-12">
      {/* Top Controls omitted for brevity, header is in layout */}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="PROJETOS ATIVOS"
          value={stats.activeProjects}
          icon={FolderOpen}
          description="+12% vs último mês"
          accent="default"
        />
        <MetricCard
          label="TAREFAS ATRASADAS"
          value={stats.overdueTasks}
          icon={Clock}
          description="Ação Imediata Necessária"
          accent="danger"
        />
        <MetricCard
          label="PRÓXIMOS PRAZOS"
          value={stats.weekTasks}
          icon={CalendarClock}
          description="Próximas 48h"
          accent="info"
        />
        <MetricCard
          label="NOVOS LEADS"
          value={stats.totalClients}
          icon={Users}
          description="No funil comercial"
          accent="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-8">
          {/* Daily Tasks */}
          <DailyTasksList tasks={todaysTasks} />
          
          {/* Productivity Line Chart */}
          <ProductivityChart />
        </div>

        {/* Sidebar Activity */}
        <div className="col-span-1 border-l border-border pl-0 lg:pl-8">
          <TeamActivityFeed logs={teamLogs} />
        </div>
      </div>
    </div>
  )
}

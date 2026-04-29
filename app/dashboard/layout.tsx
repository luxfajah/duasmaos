import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/layouts/Sidebar'
import { TopBar, ContentWrapper } from '@/components/layouts/TopBar'
import { ProjectProvider } from '@/components/providers/project-provider'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single()
  const userName = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? null
  const userEmail = user?.email ?? null
  const userAvatar = profile?.avatar_url ?? null

  // Fetch lookup data for the global "Novo Projeto" modal
  const [{ data: clientsData }, { data: teamData }, { data: tasksData }] = await Promise.all([
    supabase.from('clients').select('id, name').order('name'),
    supabase.from('profiles').select('id, full_name').order('full_name'),
    supabase
      .from('v2_tasks')
      .select('id, title, status, due_date, v2_projects(name)')
      .not('status', 'eq', 'done')
      .not('status', 'eq', 'locked')
      .order('due_date', { ascending: true, nullsFirst: false }),
  ])

  const clients = (clientsData ?? []) as { id: string; name: string }[]
  const team = (teamData ?? []) as { id: string; full_name: string }[]
  const tasks = (tasksData ?? []).map((t: any) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    due_date: t.due_date,
    v2_projects: t.v2_projects,
  }))

  return (
    <ProjectProvider>
      <div className="flex min-h-screen bg-background font-sans">
        {/* Floating Sidebar */}
        <Sidebar
          className="hidden lg:block"
          userName={userName}
          userEmail={userEmail}
        />

        {/* Main area */}
        <div className="flex-1 flex flex-col relative w-full min-w-0 lg:pl-[84px]">

          {/* TopBar with notifications */}
          <TopBar
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
            tasks={tasks}
          />

          {/* Atmospheric environment wrapper */}
          <div className="dashboard-atmosphere flex-1 overflow-y-auto overflow-x-hidden relative">
            
            {/* Glass Overlay */}
            <div className="fixed inset-0 z-[1] bg-background/20 dark:bg-background/40 backdrop-blur-[2px] pointer-events-none" />

            {/* Ambient organic shapes */}
            <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden opacity-40 dark:opacity-20 mix-blend-multiply dark:mix-blend-overlay">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-0 right-0 w-[50vw] h-[50vh] text-brand-primary opacity-[0.03] animate-blob-drift" style={{ animationDuration: '25s' }}>
                <path fill="currentColor" d="M18.8,-27.1C26.5,-19.7,36.5,-16.1,43.2,-8.1C49.9,-0.1,53.4,12.3,49.1,21.8C44.7,31.2,32.4,37.6,19.3,42.8C6.2,48,-7.7,51.9,-18.2,48C-28.7,44.1,-35.8,32.3,-41.4,19.6C-47,6.9,-51,-6.6,-46.8,-17C-42.6,-27.4,-30.2,-34.5,-19.1,-38.3C-8,-42.2,-3.9,-42.7,4.3,-48.2C12.5,-53.8,24.9,-64.3,18.8,-27.1Z" transform="translate(50 50) scale(1.2)" />
              </svg>
            </div>

            {/* Ambient blobs */}
            <div
              className="ambient-blob w-[600px] h-[600px] bg-brand-primary/5 animate-blob-drift"
              style={{ position: 'absolute', top: '-180px', left: '-120px', zIndex: 2, animationDuration: '18s', animationDelay: '0s' }}
            />
            <div
              className="ambient-blob w-[500px] h-[500px] bg-brand-deep-blue/6 animate-blob-drift"
              style={{ position: 'absolute', bottom: '-150px', right: '-100px', zIndex: 2, animationDuration: '22s', animationDelay: '-7s' }}
            />

            {/* Page content */}
            <div style={{ position: 'relative', zIndex: 3 }}>
              <ContentWrapper>
                {children}
              </ContentWrapper>
            </div>
          </div>

        </div>
      </div>
    </ProjectProvider>
  )
}

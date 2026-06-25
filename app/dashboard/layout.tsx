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
        <div className="flex-1 flex flex-col relative w-full min-w-0 lg:pl-16">

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

            {/* Ambient organic shapes - MULTI-BLOB MESH BACKGROUND */}
            <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden mix-blend-multiply dark:mix-blend-screen opacity-70 dark:opacity-40">
              
              {/* Primary Brand Blob - Top Right */}
              <div
                className="ambient-blob absolute w-[700px] h-[700px] bg-brand-primary/10 dark:bg-brand-primary/20 rounded-full blur-[80px] animate-blob-drift"
                style={{ top: '-20%', right: '-10%', animationDuration: '25s' }}
              />
              
              {/* Deep Blue Blob - Bottom Left */}
              <div
                className="ambient-blob absolute w-[800px] h-[800px] bg-brand-deep-blue/10 dark:bg-brand-deep-blue/30 rounded-full blur-[100px] animate-blob-drift"
                style={{ bottom: '-30%', left: '-20%', animationDuration: '30s', animationDelay: '-5s' }}
              />

              {/* Accent Yellow Blob - Center Right */}
              <div
                className="ambient-blob absolute w-[500px] h-[500px] bg-brand-accent/10 dark:bg-brand-accent/15 rounded-full blur-[90px] animate-blob-drift"
                style={{ top: '30%', right: '15%', animationDuration: '20s', animationDelay: '-10s' }}
              />

              {/* Secondary Olive Blob - Top Left */}
              <div
                className="ambient-blob absolute w-[600px] h-[600px] bg-brand-secondary/10 dark:bg-brand-secondary/20 rounded-full blur-[80px] animate-blob-drift"
                style={{ top: '10%', left: '10%', animationDuration: '28s', animationDelay: '-15s' }}
              />

              {/* Terracotta Highlight Blob - Bottom Right */}
              <div
                className="ambient-blob absolute w-[400px] h-[400px] bg-[#ff3b30]/5 dark:bg-[#ff3b30]/15 rounded-full blur-[70px] animate-blob-drift"
                style={{ bottom: '10%', right: '20%', animationDuration: '22s', animationDelay: '-7s' }}
              />

            </div>

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

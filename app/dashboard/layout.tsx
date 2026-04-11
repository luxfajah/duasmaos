import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/layouts/Sidebar'
import { TopBar, ContentWrapper } from '@/components/layouts/TopBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? null
  const userEmail = user?.email ?? null

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Floating Sidebar */}
      <Sidebar
        className="hidden lg:block"
        userName={userName}
        userEmail={userEmail}
      />

      {/* Main area — compensate for fixed floating sidebar (72px collapsed + 12px left margin = 84px) */}
      <div className="flex-1 flex flex-col relative w-full min-w-0 lg:pl-[84px]">

        {/* Slim TopBar */}
        <TopBar
          userName={userName}
          userEmail={userEmail}
        />

        {/* Atmospheric environment wrapper */}
        <div className="dashboard-atmosphere flex-1" style={{ position: 'relative' }}>

          {/* Background photo — fixed cityscape */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              backgroundImage: 'url(/dashboard-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 60%',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Brand color overlay */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1,
              background: [
                'radial-gradient(ellipse 80% 55% at 10% 0%, hsl(13 55% 50% / 0.18) 0%, transparent 55%)',
                'radial-gradient(ellipse 70% 50% at 90% 100%, hsl(222 55% 22% / 0.22) 0%, transparent 55%)',
                'linear-gradient(180deg, hsl(35 22% 93% / 0.82) 0%, hsl(35 22% 93% / 0.70) 40%, hsl(35 18% 90% / 0.80) 100%)',
              ].join(', '),
              backdropFilter: 'blur(1px)',
            }}
          />

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
  )
}

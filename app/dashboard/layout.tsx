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

          {/* Soft gradient background (sand + terracotta tones) */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              background: 'linear-gradient(135deg, hsl(35 22% 93% / 1) 0%, hsl(13 55% 50% / 0.05) 100%)',
            }}
          />

          {/* Brand color overlay and subtle organic SVG shapes */}
          <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden opacity-60 mix-blend-multiply">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-0 right-0 w-[50vw] h-[50vh] text-brand-primary opacity-[0.03] animate-blob-drift" style={{ animationDuration: '25s' }}>
              <path fill="currentColor" d="M18.8,-27.1C26.5,-19.7,36.5,-16.1,43.2,-8.1C49.9,-0.1,53.4,12.3,49.1,21.8C44.7,31.2,32.4,37.6,19.3,42.8C6.2,48,-7.7,51.9,-18.2,48C-28.7,44.1,-35.8,32.3,-41.4,19.6C-47,6.9,-51,-6.6,-46.8,-17C-42.6,-27.4,-30.2,-34.5,-19.1,-38.3C-8,-42.2,-3.9,-42.7,4.3,-48.2C12.5,-53.8,24.9,-64.3,18.8,-27.1Z" transform="translate(50 50) scale(1.2)" />
            </svg>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vh] text-brand-primary opacity-[0.02] animate-blob-drift" style={{ animationDuration: '30s', animationDelay: '-10s' }}>
              <path fill="currentColor" d="M37.5,-59.5C48.6,-53.4,57.7,-43.3,64.3,-31.4C71,-19.5,75.1,-5.9,74.5,7.7C73.9,21.3,68.6,34.8,60.2,46.1C51.8,57.4,40.3,66.4,27.2,71.2C14.1,76,0,76.5,-14.2,74.1C-28.4,71.8,-42.6,66.5,-53.2,56.7C-63.8,46.9,-70.8,32.6,-73.3,17.7C-75.7,2.8,-73.6,-12.7,-66.2,-25.1C-58.8,-37.5,-46.2,-46.8,-33.4,-51.9C-20.6,-57,-7.6,-57.9,5.7,-66C18.9,-74.1,37.8,-89.4,37.5,-59.5Z" transform="translate(50 50) scale(1.1)" />
            </svg>
          </div>

          {/* Background color depth grading overlay */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1,
              background: [
                'radial-gradient(ellipse 80% 55% at 10% 0%, hsl(13 55% 50% / 0.12) 0%, transparent 55%)',
                'radial-gradient(ellipse 70% 50% at 90% 100%, hsl(222 55% 22% / 0.08) 0%, transparent 55%)',
              ].join(', '),
              backdropFilter: 'blur(20px)',
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

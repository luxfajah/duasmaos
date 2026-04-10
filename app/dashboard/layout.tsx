import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/layouts/Sidebar'
import { Header, ContentWrapper } from '@/components/layouts/Header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? null
  const userEmail = user?.email ?? null

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar
        className="hidden lg:flex"
        userName={userName}
        userEmail={userEmail}
      />
      <div className="flex-1 flex flex-col relative w-full min-w-0">
        <Header
          userName={userName}
          userEmail={userEmail}
        />
        <ContentWrapper>
          {children}
        </ContentWrapper>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { SettingsSidebar } from '@/components/settings/SettingsSidebar'
import { ProfileSection } from '@/components/settings/sections/ProfileSection'
import { UsersSection } from '@/components/settings/sections/UsersSection'
import { SecuritySection } from '@/components/settings/sections/SecuritySection'
import { InvitationsSection } from '@/components/settings/sections/InvitationsSection'
import { useSearchParams, useRouter } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'

interface SettingsClientProps {
  profile: any
  users: any[]
  invitations: any[]
  clients: any[]
}

export function SettingsClient({ profile, users, invitations, clients }: SettingsClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState(searchParams.get('section') || 'profile')
  const isAdmin = profile.role === 'admin'

  useEffect(() => {
    const section = searchParams.get('section')
    if (section) setActiveSection(section)
  }, [searchParams])

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    const params = new URLSearchParams(searchParams.toString())
    params.set('section', section)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Sidebar - Fixed width on desktop */}
      <aside className="w-full lg:w-64 shrink-0">
        <SettingsSidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange} 
          isAdmin={isAdmin}
        />
        
        {profile.requires_password_change && (
          <div className="mt-8 p-4 bg-status-danger/10 border border-status-danger/20 rounded-xl animate-pulse">
            <div className="flex items-center gap-2 mb-2 text-status-danger">
              <ShieldAlert size={16} />
              <span className="text-xs font-bold uppercase">Ação Necessária</span>
            </div>
            <p className="text-xs text-text-primary font-medium">
              Por segurança, altere sua senha temporária na aba "Segurança".
            </p>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeSection === 'profile' && <ProfileSection profile={profile} />}
        {activeSection === 'users' && isAdmin && <UsersSection users={users} />}
        {activeSection === 'security' && <SecuritySection />}
        {activeSection === 'invitations' && isAdmin && (
          <InvitationsSection clients={clients} invitations={invitations} />
        )}
      </main>
    </div>
  )
}

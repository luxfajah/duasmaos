'use client'

import { cn } from '@/lib/utils'
import { User, Users, Shield, Mail, ChevronRight } from 'lucide-react'

interface SettingsSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isAdmin: boolean
}

const SECTIONS = [
  { id: 'profile', label: 'Perfil', icon: User, adminOnly: false },
  { id: 'users', label: 'Usuários', icon: Users, adminOnly: true },
  { id: 'security', label: 'Segurança', icon: Shield, adminOnly: false },
  { id: 'invitations', label: 'Convites', icon: Mail, adminOnly: true },
]

export function SettingsSidebar({ activeSection, onSectionChange, isAdmin }: SettingsSidebarProps) {
  return (
    <nav className="flex flex-col gap-2">
      {SECTIONS.map((section) => {
        if (section.adminOnly && !isAdmin) return null

        const isActive = activeSection === section.id
        const Icon = section.icon

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium",
              isActive 
                ? "bg-brand-primary text-text-inverse shadow-brand" 
                : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
            )}
          >
            <Icon size={18} />
            <span>{section.label}</span>
            {isActive && <ChevronRight size={14} className="ml-auto animate-in slide-in-from-left-2" />}
          </button>
        )
      })}
    </nav>
  )
}

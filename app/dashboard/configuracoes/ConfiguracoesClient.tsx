'use client'

import { useState } from 'react'
import { UsersSection } from '@/components/settings/sections/UsersSection'
import { InvitationsSection } from '@/components/settings/sections/InvitationsSection'
import { savePortalSettings } from './actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Mail, 
  Settings2, 
  Instagram, 
  Link2, 
  Eye, 
  EyeOff, 
  Sparkles,
  Lock,
  Palette
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface PortalSetting {
  client_id: string
  slug: string
  logo_url: string | null
  wallpaper_url: string | null
  theme_color_primary: string
  theme_color_secondary: string
  ig_username: string
  ig_name: string
  ig_bio: string | null
  ig_avatar_url: string | null
  ig_stats_posts: number
  ig_stats_followers: string
  ig_stats_following: string
  ig_highlights: any
  portal_user: string | null
  portal_password: string | null
  focus_of_month: string | null
  planning_period: string | null
  deadline_description: string | null
  is_active: boolean
  clients?: {
    name: string
  } | null
}

interface ConfiguracoesClientProps {
  users: any[]
  clients: any[]
  invitations: any[]
  portalSettings: PortalSetting[]
}

export function ConfiguracoesClient({ users, clients, invitations, portalSettings }: ConfiguracoesClientProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'invitations' | 'portals'>('users')
  const [selectedPortal, setSelectedPortal] = useState<PortalSetting | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState<PortalSetting[]>(portalSettings)

  // Portal form states
  const [formSlug, setFormSlug] = useState('')
  const [formUser, setFormUser] = useState('')
  const [formPass, setFormPass] = useState('')
  const [formIgUser, setFormIgUser] = useState('')
  const [formIgName, setFormIgName] = useState('')
  const [formIgBio, setFormIgBio] = useState('')
  const [formIgAvatar, setFormIgAvatar] = useState('')
  const [formPrimaryColor, setFormPrimaryColor] = useState('#BE4B00')
  const [formSecondaryColor, setFormSecondaryColor] = useState('#B4053C')
  const [formLogoUrl, setFormLogoUrl] = useState('')
  const [formWallpaperUrl, setFormWallpaperUrl] = useState('')

  const handleEditPortal = (portal: PortalSetting) => {
    setSelectedPortal(portal)
    setFormSlug(portal.slug || '')
    setFormUser(portal.portal_user || '')
    setFormPass(portal.portal_password || '')
    setFormIgUser(portal.ig_username || '')
    setFormIgName(portal.ig_name || '')
    setFormIgBio(portal.ig_bio || '')
    setFormIgAvatar(portal.ig_avatar_url || '')
    setFormPrimaryColor(portal.theme_color_primary || '#BE4B00')
    setFormSecondaryColor(portal.theme_color_secondary || '#B4053C')
    setFormLogoUrl(portal.logo_url || '')
    setFormWallpaperUrl(portal.wallpaper_url || '')
  }

  const handleCreateSettingsForClient = (client: { id: string, name: string }) => {
    const newSettings: PortalSetting = {
      client_id: client.id,
      slug: client.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      logo_url: '',
      wallpaper_url: '',
      theme_color_primary: '#BE4B00',
      theme_color_secondary: '#B4053C',
      ig_username: client.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      ig_name: client.name,
      ig_bio: '',
      ig_avatar_url: '',
      ig_stats_posts: 0,
      ig_stats_followers: '0',
      ig_stats_following: '0',
      ig_highlights: [],
      portal_user: client.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      portal_password: '123',
      focus_of_month: '',
      planning_period: '',
      deadline_description: '',
      is_active: true,
      clients: { name: client.name }
    }
    handleEditPortal(newSettings)
  }

  const handleSavePortal = async () => {
    if (!selectedPortal) return

    if (!formSlug.trim()) {
      toast.error('O slug do portal é obrigatório.')
      return
    }

    if (!formUser.trim()) {
      toast.error('O usuário do portal é obrigatório.')
      return
    }

    if (!formPass.trim()) {
      toast.error('A senha do portal é obrigatória.')
      return
    }

    setIsSaving(true)
    try {
      const updated = {
        client_id: selectedPortal.client_id,
        slug: formSlug.trim(),
        portal_user: formUser.trim(),
        portal_password: formPass.trim(),
        ig_username: formIgUser.trim(),
        ig_name: formIgName.trim(),
        ig_bio: formIgBio.trim() || null,
        ig_avatar_url: formIgAvatar.trim() || null,
        theme_color_primary: formPrimaryColor,
        theme_color_secondary: formSecondaryColor,
        logo_url: formLogoUrl.trim() || null,
        wallpaper_url: formWallpaperUrl.trim() || null,
        is_active: true
      }

      await savePortalSettings(updated)
      toast.success('Configurações do portal salvas!')

      // Update local state list
      setLocalSettings(prev => {
        const exists = prev.some(p => p.client_id === selectedPortal.client_id)
        if (exists) {
          return prev.map(p => p.client_id === selectedPortal.client_id ? { ...p, ...updated } : p)
        } else {
          return [...prev, { ...selectedPortal, ...updated }]
        }
      })

      setSelectedPortal(null)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar portal')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Navigation tabs */}
      <div className="flex border-b border-border bg-surface rounded-xl p-1.5 gap-1.5 w-full md:w-max">
        {[
          { id: 'users', label: 'Equipe & Cargos', icon: Users },
          { id: 'invitations', label: 'Links de Convite', icon: Mail },
          { id: 'portals', label: 'Portais de Clientes', icon: Settings2 }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-primary text-white shadow-brand'
                  : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 2. Tabs Contents */}
      <div className="space-y-6">
        
        {activeTab === 'users' && (
          <UsersSection users={users} clients={clients} />
        )}

        {activeTab === 'invitations' && (
          <InvitationsSection clients={clients} invitations={invitations} />
        )}

        {activeTab === 'portals' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map(client => {
                const settings = localSettings.find(p => p.client_id === client.id)
                const isConfigured = !!settings

                return (
                  <Card key={client.id} className="p-6 flex flex-col justify-between border border-border bg-surface group hover:border-brand-primary/20 transition-all">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <h4 className="font-bold text-text-primary text-md truncate">{client.name}</h4>
                        {isConfigured ? (
                          <Badge variant="success" className="text-[9px] font-bold uppercase tracking-wider">Ativo</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider">Inativo</Badge>
                        )}
                      </div>

                      {isConfigured ? (
                        <div className="space-y-2 mt-4 text-xs text-text-secondary">
                          <p className="flex items-center gap-1.5">
                            <Instagram size={13} className="text-text-muted" />
                            <span>Username: <b>@{settings.ig_username}</b></span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Link2 size={13} className="text-text-muted" />
                            <span>Slug: <code>/aprovacao/{settings.slug}</code></span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Lock size={13} className="text-text-muted" />
                            <span>Usuário: <b>{settings.portal_user || 'Livre'}</b></span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-text-muted italic mt-4">Nenhuma configuração de portal criada para este cliente.</p>
                      )}
                    </div>

                    <div className="mt-6 flex gap-2">
                      {isConfigured ? (
                        <>
                          <Button 
                            onClick={() => handleEditPortal(settings)} 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 rounded-xl text-xs font-bold"
                          >
                            Configurar
                          </Button>
                          <Link href={`/aprovacao/${settings.slug}`} target="_blank" className="flex-1">
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="w-full rounded-xl text-xs bg-brand-primary hover:bg-brand-secondary font-bold gap-1"
                            >
                              Ver Portal
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <Button 
                          onClick={() => handleCreateSettingsForClient(client)} 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-dashed rounded-xl text-xs text-brand-primary border-brand-primary/20 hover:border-brand-primary/50 hover:bg-brand-primary/5 font-bold"
                        >
                          + Ativar Portal
                        </Button>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* 3. Portal Editing Slide-over Modal */}
      {selectedPortal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end animate-in fade-in duration-300">
          <div className="bg-surface border-l border-border h-full max-w-xl w-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-border bg-surface-muted/20 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-md font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-primary animate-pulse" /> Ajustar Portal de Aprovação
                </h3>
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mt-1">
                  Cliente: {selectedPortal.clients?.name}
                </p>
              </div>
              <button 
                onClick={() => setSelectedPortal(null)} 
                className="text-text-muted hover:text-text-primary transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Access Settings */}
              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary flex items-center gap-1.5">
                  <Lock size={14} /> Credenciais & Acesso
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Slug do Link *</label>
                    <Input 
                      type="text" 
                      value={formSlug} 
                      onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="slug-do-portal"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Usuário do Portal *</label>
                    <Input 
                      type="text" 
                      value={formUser} 
                      onChange={(e) => setFormUser(e.target.value)}
                      placeholder="usuario"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Senha do Portal *</label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      value={formPass} 
                      onChange={(e) => setFormPass(e.target.value)}
                      placeholder="senha"
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </section>

              <hr className="border-border" />

              {/* Instagram Simulation settings */}
              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary flex items-center gap-1.5">
                  <Instagram size={14} /> Feed Instagram simulado
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Username (@) *</label>
                    <Input 
                      type="text" 
                      value={formIgUser} 
                      onChange={(e) => setFormIgUser(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                      placeholder="username"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Nome do Perfil *</label>
                    <Input 
                      type="text" 
                      value={formIgName} 
                      onChange={(e) => setFormIgName(e.target.value)}
                      placeholder="Nome Sobrenome"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Biografia (Suporta HTML &lt;br/&gt;)</label>
                  <textarea
                    value={formIgBio}
                    onChange={(e) => setFormIgBio(e.target.value)}
                    placeholder="| Detalhe 1&#10;| Detalhe 2"
                    rows={3}
                    className="w-full text-sm glass-panel rounded-xl px-3 py-2 outline-none focus:border-brand-primary/40 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Foto de Perfil (URL)</label>
                  <Input 
                    type="url" 
                    value={formIgAvatar} 
                    onChange={(e) => setFormIgAvatar(e.target.value)}
                    placeholder="https://..."
                    className="h-10"
                  />
                </div>
              </section>

              <hr className="border-border" />

              {/* Theme colors & styling */}
              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary flex items-center gap-1.5">
                  <Palette size={14} /> Identidade Visual & Design
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Cor Primária</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={formPrimaryColor} 
                        onChange={(e) => setFormPrimaryColor(e.target.value)}
                        className="h-10 w-10 p-0 border border-border rounded-lg cursor-pointer"
                      />
                      <Input 
                        type="text" 
                        value={formPrimaryColor} 
                        onChange={(e) => setFormPrimaryColor(e.target.value)}
                        className="h-10 flex-1 font-mono uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Cor Secundária</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={formSecondaryColor} 
                        onChange={(e) => setFormSecondaryColor(e.target.value)}
                        className="h-10 w-10 p-0 border border-border rounded-lg cursor-pointer"
                      />
                      <Input 
                        type="text" 
                        value={formSecondaryColor} 
                        onChange={(e) => setFormSecondaryColor(e.target.value)}
                        className="h-10 flex-1 font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Logo da Agência/Empresa (URL)</label>
                  <Input 
                    type="url" 
                    value={formLogoUrl} 
                    onChange={(e) => setFormLogoUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Wallpaper de Fundo (URL)</label>
                  <Input 
                    type="url" 
                    value={formWallpaperUrl} 
                    onChange={(e) => setFormWallpaperUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-10"
                  />
                </div>
              </section>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-surface-muted/20 border-t border-border flex justify-end gap-3 shrink-0">
              <Button 
                variant="outline" 
                onClick={() => setSelectedPortal(null)}
                disabled={isSaving}
                className="rounded-xl text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSavePortal}
                disabled={isSaving}
                className="rounded-xl text-xs bg-brand-primary hover:bg-brand-secondary shadow-brand font-bold"
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

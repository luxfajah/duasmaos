'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Globe, Plus, Trash2, Key, MessageSquare, RefreshCw, Copy, Search, Instagram } from 'lucide-react'
import { upsertClientPortalSettings, fetchInstagramData } from '@/app/dashboard/clients/actions'
import { PortalImageUpload } from './PortalImageUpload'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ClientPortalSettings } from '@/types/database'
import { format, parseISO } from 'date-fns'

interface PortalConfigModalProps {
  clientId: string
  clientName: string
  existingSettings?: ClientPortalSettings | null
}

export function PortalConfigModal({ clientId, clientName, existingSettings }: PortalConfigModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  
  const [formData, setFormData] = useState({
    slug: existingSettings?.slug || clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    theme_color_primary: existingSettings?.theme_color_primary || '#BE4B00',
    theme_color_secondary: existingSettings?.theme_color_secondary || '#B4053C',
    ig_username: existingSettings?.ig_username || clientName.toLowerCase().replace(/\s/g, ''),
    ig_name: existingSettings?.ig_name || clientName,
    ig_bio: existingSettings?.ig_bio || '',
    ig_stats_posts: existingSettings?.ig_stats_posts || 0,
    ig_stats_followers: existingSettings?.ig_stats_followers || '0',
    ig_stats_following: existingSettings?.ig_stats_following || '0',
    logo_url: existingSettings?.logo_url || '',
    wallpaper_url: existingSettings?.wallpaper_url || '',
    ig_avatar_url: existingSettings?.ig_avatar_url || '',
    portal_user: existingSettings?.portal_user || clientName.toLowerCase().replace(/\s/g, '.'),
    portal_password: existingSettings?.portal_password || '',
    focus_of_month: existingSettings?.focus_of_month || 'Apresentação da marca, autoridade e engajamento.',
    planning_period: existingSettings?.planning_period || '',
    deadline_description: existingSettings?.deadline_description || ''
  })

  const [highlights, setHighlights] = useState<{title: string, image_url: string}[]>(
    existingSettings?.ig_highlights || []
  )

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+'
    let pass = ''
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, portal_password: pass })
  }

  const handleExtractIG = async () => {
    if (!formData.ig_username) {
      toast.error('Informe o @ ou link do perfil para extrair.')
      return
    }

    try {
      setExtracting(true)
      toast.loading('Extraindo dados do Instagram...', { id: 'ig-extract' })
      const res = await fetchInstagramData(formData.ig_username)
      
      if (res.success) {
        const d = res.data
        setFormData(prev => ({
          ...prev,
          ig_username: d.username,
          ig_name: d.full_name,
          ig_bio: d.biography,
          ig_stats_posts: d.edge_owner_to_timeline_media.count,
          ig_stats_followers: String(d.edge_followed_by.count),
          ig_stats_following: String(d.edge_follow.count),
          ig_avatar_url: d.profile_pic_url_hd
        }))
        
        if (d.highlights) {
          setHighlights(d.highlights)
        }
        
        toast.success('Dados extraídos com sucesso!', { id: 'ig-extract' })
      }
    } catch (err: any) {
      toast.error(err.message, { id: 'ig-extract' })
    } finally {
      setExtracting(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const payload = {
        client_id: clientId,
        slug: formData.slug,
        theme_color_primary: formData.theme_color_primary,
        theme_color_secondary: formData.theme_color_secondary,
        ig_username: formData.ig_username,
        ig_name: formData.ig_name,
        ig_bio: formData.ig_bio,
        ig_stats_posts: formData.ig_stats_posts,
        ig_stats_followers: formData.ig_stats_followers,
        ig_stats_following: formData.ig_stats_following,
        logo_url: formData.logo_url,
        wallpaper_url: formData.wallpaper_url,
        ig_avatar_url: formData.ig_avatar_url,
        portal_user: formData.portal_user,
        portal_password: formData.portal_password,
        focus_of_month: formData.focus_of_month,
        planning_period: formData.planning_period,
        deadline_description: formData.deadline_description,
        ig_highlights: highlights,
        is_active: true
      }

      await upsertClientPortalSettings(payload)
      toast.success('Portal configurado com sucesso!')
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar portal.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/aprovacao/${formData.slug}`
    navigator.clipboard.writeText(url)
    toast.success('Link do portal copiado!')
  }

  const generateShareMessage = () => {
    const url = `${window.location.origin}/aprovacao/${formData.slug}`
    const msg = `Olá! Seu portal de aprovação está pronto.\n\n` +
                `Acesse por aqui: ${url}\n` +
                `Usuário: ${formData.portal_user}\n` +
                `Senha: ${formData.portal_password || '(Acesso público)'}\n\n` +
                `Qualquer dúvida, estamos à disposição!`
    navigator.clipboard.writeText(msg)
    toast.success('Mensagem de acesso copiada!')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={existingSettings ? "default" : "outline"} size="sm" className="h-9 gap-2">
          <Globe size={14} /> {existingSettings ? 'Configurar Portal' : 'Gerar Portal'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuração do Portal de Aprovação</DialogTitle>
          <p className="text-sm text-text-muted">Personalize o acesso e a identidade visual do portal.</p>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Identificação e Acesso */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-brand-primary flex items-center gap-2">
              <Key size={14} /> Identificação e Acesso
            </h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>URL do Portal (Slug)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted whitespace-nowrap bg-surface-muted px-2 py-2 rounded-lg border border-border">/aprovacao/</span>
                  <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="nome-da-marca" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 p-4 bg-surface-muted/30 rounded-xl border border-dashed border-border">
              <div className="space-y-2">
                <Label>Usuário de Acesso</Label>
                <Input value={formData.portal_user} onChange={e => setFormData({...formData, portal_user: e.target.value})} placeholder="nome.cliente" />
              </div>
              <div className="space-y-2">
                <Label>Senha de Acesso</Label>
                <div className="flex gap-2">
                  <Input value={formData.portal_password} onChange={e => setFormData({...formData, portal_password: e.target.value})} placeholder="Senha forte" />
                  <Button variant="outline" size="icon" onClick={generatePassword} title="Gerar Senha Forte">
                    <RefreshCw size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo do Planejamento */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-brand-primary flex items-center gap-2">
              <MessageSquare size={14} /> Resumo do Planejamento
            </h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Foco do Mês</Label>
                <Input value={formData.focus_of_month} onChange={e => setFormData({...formData, focus_of_month: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Período das Postagens</Label>
                  <Input type="month" value={formData.planning_period} onChange={e => setFormData({...formData, planning_period: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Prazo para Aprovação</Label>
                  <Input type="date" value={formData.deadline_description} onChange={e => setFormData({...formData, deadline_description: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          {/* Perfil Instagram e Automação */}
          <div className="space-y-4 border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-brand-primary flex items-center gap-2">
                <Instagram size={14} /> Simulação Perfil IG
              </h4>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-[10px] gap-2 border-brand-primary/30 text-brand-primary"
                onClick={handleExtractIG}
                disabled={extracting}
              >
                {extracting ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                Extrair do Instagram
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>@ ou Link do Perfil</Label>
                <Input 
                  value={formData.ig_username} 
                  onChange={e => setFormData({...formData, ig_username: e.target.value})} 
                  placeholder="@usuario ou link"
                />
              </div>
              <div className="space-y-2">
                <Label>Nome de Exibição</Label>
                <Input value={formData.ig_name} onChange={e => setFormData({...formData, ig_name: e.target.value})} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Biografia</Label>
              <Textarea rows={3} value={formData.ig_bio} onChange={e => setFormData({...formData, ig_bio: e.target.value})} placeholder="Escreva a bio aqui..." />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Posts</Label>
                <Input type="number" value={formData.ig_stats_posts} onChange={e => setFormData({...formData, ig_stats_posts: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Seguidores</Label>
                <Input value={formData.ig_stats_followers} onChange={e => setFormData({...formData, ig_stats_followers: e.target.value})} placeholder="ex: 10.5K" />
              </div>
              <div className="space-y-2">
                <Label>Seguindo</Label>
                <Input value={formData.ig_stats_following} onChange={e => setFormData({...formData, ig_stats_following: e.target.value})} placeholder="ex: 800" />
              </div>
            </div>
          </div>

          {/* Imagens do Portal */}
          <div className="space-y-4 border-t border-border pt-6">
            <h4 className="text-xs font-bold uppercase text-text-muted">Imagens do Portal</h4>
            <div className="grid grid-cols-2 gap-6">
              <PortalImageUpload 
                clientId={clientId} 
                label="Logo do Cliente" 
                value={formData.logo_url} 
                onChange={(url) => setFormData({...formData, logo_url: url})} 
              />
              <PortalImageUpload 
                clientId={clientId} 
                label="Wallpaper de Fundo" 
                value={formData.wallpaper_url} 
                onChange={(url) => setFormData({...formData, wallpaper_url: url})} 
              />
            </div>
            <div className="grid grid-cols-1 gap-6">
              <PortalImageUpload 
                clientId={clientId} 
                label="Foto de Perfil Instagram" 
                value={formData.ig_avatar_url} 
                onChange={(url) => setFormData({...formData, ig_avatar_url: url})} 
              />
            </div>
          </div>

          {/* Destaques */}
          <div className="space-y-4 border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-text-muted">Destaques (Highlights)</h4>
              <Button type="button" variant="outline" size="sm" onClick={() => setHighlights([...highlights, {title: '', image_url: ''}])}>
                <Plus size={14} className="mr-1" /> Add Destaque
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((h, i) => (
                <div key={i} className="flex gap-2 items-start bg-surface-muted p-3 rounded-xl border border-border">
                  <div className="flex-1 space-y-2">
                    <Input placeholder="Título" value={h.title} onChange={e => {
                      const newH = [...highlights]; newH[i].title = e.target.value; setHighlights(newH)
                    }} className="h-8 text-xs" />
                    <PortalImageUpload 
                      clientId={clientId} 
                      label="Capa do Destaque" 
                      value={h.image_url} 
                      onChange={(url) => {
                        const newH = [...highlights]; newH[i].image_url = url; setHighlights(newH)
                      }} 
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-status-danger h-8 w-8" onClick={() => {
                    setHighlights(highlights.filter((_, idx) => idx !== i))
                  }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
            {highlights.length === 0 && <p className="text-xs text-text-muted italic">Nenhum destaque adicionado.</p>}
          </div>
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyLink} disabled={!existingSettings} className="gap-2">
              <Copy size={14} /> Link
            </Button>
            <Button variant="outline" onClick={generateShareMessage} disabled={!existingSettings} className="gap-2">
              <MessageSquare size={14} /> Mensagem
            </Button>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading} className="px-8">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

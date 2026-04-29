'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Globe, Plus, Trash2 } from 'lucide-react'
import { upsertClientPortalSettings } from '@/app/dashboard/clients/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ClientPortalSettings } from '@/types/database'

interface PortalConfigModalProps {
  clientId: string
  clientName: string
  existingSettings?: ClientPortalSettings | null
}

export function PortalConfigModal({ clientId, clientName, existingSettings }: PortalConfigModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
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
    ig_avatar_url: existingSettings?.ig_avatar_url || ''
  })

  // Highlights state
  const [highlights, setHighlights] = useState<{title: string, image_url: string}[]>(
    existingSettings?.ig_highlights || []
  )

  const handleSave = async () => {
    try {
      setLoading(true)
      await upsertClientPortalSettings({
        client_id: clientId,
        ...formData,
        ig_highlights: highlights,
        is_active: true
      })
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={existingSettings ? "default" : "outline"} size="sm" className="h-9 gap-2">
          <Globe size={14} /> {existingSettings ? 'Configurar Portal' : 'Gerar Portal'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuração do Portal de Aprovação</DialogTitle>
          <p className="text-sm text-text-muted">Preencha as configurações visuais para o portal do cliente.</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Identificação */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-text-muted">Identificação</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>URL do Portal (Slug)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted whitespace-nowrap bg-surface-muted px-3 py-2 rounded-lg border border-border">/aprovacao/</span>
                  <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="nome-da-marca" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cor Primária</Label>
                <div className="flex gap-2">
                  <Input type="color" value={formData.theme_color_primary} onChange={e => setFormData({...formData, theme_color_primary: e.target.value})} className="w-12 p-1" />
                  <Input value={formData.theme_color_primary} onChange={e => setFormData({...formData, theme_color_primary: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input type="color" value={formData.theme_color_secondary} onChange={e => setFormData({...formData, theme_color_secondary: e.target.value})} className="w-12 p-1" />
                  <Input value={formData.theme_color_secondary} onChange={e => setFormData({...formData, theme_color_secondary: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          {/* Imagens */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-text-muted">Identidade Visual (URLs)</h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Logo do Cliente (URL)</Label>
                <Input value={formData.logo_url} onChange={e => setFormData({...formData, logo_url: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Wallpaper de Fundo (URL)</Label>
                <Input value={formData.wallpaper_url} onChange={e => setFormData({...formData, wallpaper_url: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Foto de Perfil IG (URL)</Label>
                <Input value={formData.ig_avatar_url} onChange={e => setFormData({...formData, ig_avatar_url: e.target.value})} placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Perfil Instagram */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-text-muted">Simulação Perfil IG</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username (@)</Label>
                <Input value={formData.ig_username} onChange={e => setFormData({...formData, ig_username: e.target.value})} />
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

          {/* Destaques */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-text-muted">Destaques (Highlights)</h4>
              <Button type="button" variant="outline" size="sm" onClick={() => setHighlights([...highlights, {title: '', image_url: ''}])}>
                <Plus size={14} className="mr-1" /> Add Destaque
              </Button>
            </div>
            <div className="space-y-3">
              {highlights.map((h, i) => (
                <div key={i} className="flex gap-2 items-start bg-surface-muted p-2 rounded-lg border border-border">
                  <div className="flex-1 space-y-2">
                    <Input placeholder="Título (ex: Comece Aqui)" value={h.title} onChange={e => {
                      const newH = [...highlights]; newH[i].title = e.target.value; setHighlights(newH)
                    }} />
                    <Input placeholder="Capa URL (https://...)" value={h.image_url} onChange={e => {
                      const newH = [...highlights]; newH[i].image_url = e.target.value; setHighlights(newH)
                    }} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-status-danger" onClick={() => {
                    setHighlights(highlights.filter((_, idx) => idx !== i))
                  }}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              {highlights.length === 0 && <p className="text-xs text-text-muted">Nenhum destaque adicionado.</p>}
            </div>
          </div>

        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={handleCopyLink} disabled={!existingSettings}>
            Copiar Link
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar Configurações'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

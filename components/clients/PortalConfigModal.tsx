'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Globe, Plus, Trash2, Key, MessageSquare, RefreshCw, Copy, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { upsertClientPortalSettings } from '@/app/dashboard/clients/actions'
import { PortalImageUpload } from './PortalImageUpload'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ClientPortalSettings } from '@/types/database'

interface PortalConfigModalProps {
  clientId: string
  clientName: string
  existingSettings?: ClientPortalSettings | null
}

// ── Month/Year Picker ────────────────────────────────────────────────────────
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function MonthYearPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const now = new Date()
  const [year, setYear] = useState(() => {
    if (value) {
      const parts = value.split(' de ')
      return parts[1] ? parseInt(parts[1]) : now.getFullYear()
    }
    return now.getFullYear()
  })

  const selectedMonth = value ? MONTHS.indexOf(value.split(' de ')[0]) : -1

  return (
    <div className="border border-border rounded-xl p-3 bg-surface-muted/30 space-y-3">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setYear(y => y - 1)} className="p-1 hover:bg-surface-muted rounded">
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-semibold text-text-primary">{year}</span>
        <button type="button" onClick={() => setYear(y => y + 1)} className="p-1 hover:bg-surface-muted rounded">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {MONTHS.map((m, i) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(`${m} de ${year}`)}
            className={`text-xs py-1.5 px-2 rounded-lg transition-all font-medium ${
              i === selectedMonth && value.includes(String(year))
                ? 'bg-brand-primary text-white shadow-sm'
                : 'hover:bg-surface-muted text-text-secondary'
            }`}
          >
            {m.slice(0, 3)}
          </button>
        ))}
      </div>
      {value && (
        <p className="text-[11px] text-center text-brand-primary font-semibold">{value}</p>
      )}
    </div>
  )
}

// ── Date Picker (simple) ─────────────────────────────────────────────────────
function SimpleDatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-surface text-text-primary focus:border-brand-primary focus:outline-none transition-colors"
      />
      {value && (
        <p className="text-[11px] text-center text-brand-primary font-semibold">
          Prazo: {new Date(value + 'T12:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}

// ── Main Modal ───────────────────────────────────────────────────────────────
export function PortalConfigModal({ clientId, clientName, existingSettings }: PortalConfigModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [igHandle, setIgHandle] = useState('')
  const [igLoading, setIgLoading] = useState(false)
  
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
    portal_password: existingSettings?.portal_password || '123',
    focus_of_month: existingSettings?.focus_of_month || 'Apresentação da marca, autoridade e engajamento.',
    planning_period: existingSettings?.planning_period || '',
    deadline_description: existingSettings?.deadline_description || '',
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
    setFormData(prev => ({ ...prev, portal_password: pass }))
  }

  // ── Instagram profile fetch via server-side scraper ───────────────────────
  const extractIgProfile = async () => {
    const handle = igHandle.replace('@', '').replace(/.*instagram\.com\//, '').split('/')[0].trim()
    if (!handle) { toast.error('Informe um @ ou link válido.'); return }

    try {
      setIgLoading(true)
      toast.loading('Buscando perfil @' + handle + '...', { id: 'ig-fetch' })

      const res = await fetch(`/api/ig-scrape?handle=${encodeURIComponent(handle)}`)
      const data = await res.json()

      if (!res.ok || data.error) {
        toast.error(data.error || 'Perfil não encontrado.', { id: 'ig-fetch' })
        return
      }

      // Apply scraped fields
      setFormData(prev => ({
        ...prev,
        ig_username: data.username || handle,
        ig_name: data.name || prev.ig_name,
        ig_bio: data.bio || prev.ig_bio,
        ig_stats_posts: parseInt(data.posts) || prev.ig_stats_posts,
        ig_stats_followers: data.followers || prev.ig_stats_followers,
        ig_stats_following: data.following || prev.ig_stats_following,
      }))

      // Auto-upload avatar if found
      if (data.avatar_url) {
        toast.loading('Salvando foto de perfil...', { id: 'ig-fetch' })
        try {
          const proxyRes = await fetch(`/api/ig-proxy?url=${encodeURIComponent(data.avatar_url)}`)
          if (proxyRes.ok) {
            const blob = await proxyRes.blob()
            const { convertToWebP } = await import('@/utils/image-utils')
            const { uploadPortalImage } = await import('@/app/dashboard/clients/actions')
            const webpBlob = await convertToWebP(blob as File)
            const fd = new FormData()
            fd.append('file', webpBlob, `${handle}_avatar.webp`)
            fd.append('clientId', clientId)
            const avatarUrl = await uploadPortalImage(fd)
            setFormData(prev => ({ ...prev, ig_avatar_url: avatarUrl }))
          }
        } catch { /* skip avatar upload silently */ }
      }

      // Auto-import highlights if found
      if (data.highlights?.length > 0) {
        setHighlights(prev => data.highlights.length > 0 ? data.highlights : prev)
      }

      toast.success(`Perfil @${handle} importado com sucesso!`, { id: 'ig-fetch' })
    } catch (err: any) {
      toast.error('Erro: ' + err.message, { id: 'ig-fetch' })
    } finally {
      setIgLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.portal_user.trim()) {
      toast.error('O usuário de acesso do portal é obrigatório.')
      return
    }
    if (!formData.portal_password.trim()) {
      toast.error('A senha de acesso do portal é obrigatória.')
      return
    }
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
        ig_stats_posts: Number(formData.ig_stats_posts) || 0,
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
    const deadline = formData.deadline_description
      ? `Prazo de aprovação: ${new Date(formData.deadline_description + 'T12:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}\n`
      : ''
    const msg = `Olá! Seu portal de aprovação está pronto.\n\n` +
                `Acesse por aqui: ${url}\n` +
                `Usuário: ${formData.portal_user}\n` +
                `Senha: ${formData.portal_password}\n` +
                deadline +
                `\nQualquer dúvida, estamos à disposição!`
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
      <DialogContent className="sm:max-w-[780px] max-h-[90vh] overflow-y-auto glass depth-modal border border-border/50 shadow-xl rounded-[28px] p-0">
        <DialogHeader>
          <DialogTitle>Configuração do Portal de Aprovação</DialogTitle>
          <p className="text-sm text-text-muted">Personalize o acesso e a identidade visual do portal.</p>
        </DialogHeader>

        <div className="space-y-8 py-4">

          {/* ── Acesso ── */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-brand-primary flex items-center gap-2">
              <Key size={14} /> Identificação e Acesso
            </h4>
            <div className="space-y-2">
              <Label>URL do Portal (Slug)</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted whitespace-nowrap bg-surface-muted px-2 py-2 rounded-lg border border-border">/aprovacao/</span>
                <Input value={formData.slug} onChange={e => setFormData(p => ({...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')}))} placeholder="nome-da-marca" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 p-4 bg-surface-muted/30 rounded-xl border border-dashed border-border">
              <div className="space-y-2">
                <Label>Usuário de Acesso *</Label>
                <Input value={formData.portal_user} onChange={e => setFormData(p => ({...p, portal_user: e.target.value}))} placeholder="nome.cliente" />
              </div>
              <div className="space-y-2">
                <Label>Senha de Acesso *</Label>
                <div className="flex gap-2">
                  <Input value={formData.portal_password} onChange={e => setFormData(p => ({...p, portal_password: e.target.value}))} placeholder="Senha forte" />
                  <Button variant="outline" size="icon" onClick={generatePassword} title="Gerar Senha Forte" type="button">
                    <RefreshCw size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Planejamento ── */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-brand-primary flex items-center gap-2">
              <MessageSquare size={14} /> Resumo do Planejamento
            </h4>
            <div className="space-y-2">
              <Label>Foco do Mês</Label>
              <Input value={formData.focus_of_month} onChange={e => setFormData(p => ({...p, focus_of_month: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Período das Postagens</Label>
                <MonthYearPicker
                  value={formData.planning_period}
                  onChange={v => setFormData(p => ({...p, planning_period: v}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Prazo de Aprovação</Label>
                <SimpleDatePicker
                  value={formData.deadline_description}
                  onChange={v => setFormData(p => ({...p, deadline_description: v}))}
                />
              </div>
            </div>
          </div>

          {/* ── Cores ── */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-text-muted">Cores e Identidade</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Cor Primária</Label>
                <div className="flex gap-2">
                  <Input type="color" value={formData.theme_color_primary} onChange={e => setFormData(p => ({...p, theme_color_primary: e.target.value}))} className="w-12 p-1 h-10" />
                  <Input value={formData.theme_color_primary} onChange={e => setFormData(p => ({...p, theme_color_primary: e.target.value}))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input type="color" value={formData.theme_color_secondary} onChange={e => setFormData(p => ({...p, theme_color_secondary: e.target.value}))} className="w-12 p-1 h-10" />
                  <Input value={formData.theme_color_secondary} onChange={e => setFormData(p => ({...p, theme_color_secondary: e.target.value}))} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Imagens ── */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-text-muted">Imagens do Portal</h4>
            <div className="grid grid-cols-2 gap-6">
              <PortalImageUpload clientId={clientId} label="Logo do Cliente" value={formData.logo_url} onChange={url => setFormData(p => ({...p, logo_url: url}))} />
              <PortalImageUpload clientId={clientId} label="Wallpaper de Fundo" value={formData.wallpaper_url} onChange={url => setFormData(p => ({...p, wallpaper_url: url}))} convertWebP />
            </div>
          </div>

          {/* ── Perfil Instagram ── */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-text-muted">Simulação Perfil IG</h4>

            {/* IG Extractor */}
            <div className="p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 border border-border rounded-xl space-y-2">
              <Label className="text-xs">Importar dados do Instagram</Label>
              <div className="flex gap-2">
                <Input
                  value={igHandle}
                  onChange={e => setIgHandle(e.target.value)}
                  placeholder="@usuario ou link do perfil"
                  onKeyDown={e => e.key === 'Enter' && extractIgProfile()}
                />
                <Button type="button" variant="outline" onClick={extractIgProfile} disabled={igLoading} className="gap-2 shrink-0">
                  {igLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Importar
                </Button>
              </div>
              <p className="text-[10px] text-text-muted">Importa o nome e foto. Bio e stats devem ser preenchidos manualmente.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username (@)</Label>
                <Input value={formData.ig_username} onChange={e => setFormData(p => ({...p, ig_username: e.target.value.replace('@','')}))} />
              </div>
              <div className="space-y-2">
                <Label>Nome de Exibição</Label>
                <Input value={formData.ig_name} onChange={e => setFormData(p => ({...p, ig_name: e.target.value}))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Biografia</Label>
              <Textarea rows={3} value={formData.ig_bio} onChange={e => setFormData(p => ({...p, ig_bio: e.target.value}))} placeholder="Escreva a bio aqui..." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Posts</Label>
                <Input type="number" value={formData.ig_stats_posts} onChange={e => setFormData(p => ({...p, ig_stats_posts: parseInt(e.target.value) || 0}))} />
              </div>
              <div className="space-y-2">
                <Label>Seguidores</Label>
                <Input value={formData.ig_stats_followers} onChange={e => setFormData(p => ({...p, ig_stats_followers: e.target.value}))} placeholder="ex: 10.5K" />
              </div>
              <div className="space-y-2">
                <Label>Seguindo</Label>
                <Input value={formData.ig_stats_following} onChange={e => setFormData(p => ({...p, ig_stats_following: e.target.value}))} placeholder="ex: 800" />
              </div>
            </div>

            {/* Avatar Upload */}
            <PortalImageUpload clientId={clientId} label="Foto de Perfil Instagram" value={formData.ig_avatar_url} onChange={url => setFormData(p => ({...p, ig_avatar_url: url}))} />
          </div>

          {/* ── Destaques ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-text-muted">Destaques (Highlights)</h4>
              <Button type="button" variant="outline" size="sm" onClick={() => setHighlights(h => [...h, {title: '', image_url: ''}])}>
                <Plus size={14} className="mr-1" /> Add Destaque
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((h, i) => (
                <div key={i} className="flex gap-2 items-start bg-surface-muted p-3 rounded-xl border border-border">
                  <div className="flex-1 space-y-2">
                    <Input placeholder="Título" value={h.title} onChange={e => {
                      const n = [...highlights]; n[i] = {...n[i], title: e.target.value}; setHighlights(n)
                    }} className="h-8 text-xs" />
                    <PortalImageUpload
                      clientId={clientId}
                      label="Capa do Destaque"
                      value={h.image_url}
                      onChange={url => {
                        const n = [...highlights]; n[i] = {...n[i], image_url: url}; setHighlights(n)
                      }}
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-status-danger h-8 w-8 shrink-0" onClick={() => setHighlights(h => h.filter((_, idx) => idx !== i))}>
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

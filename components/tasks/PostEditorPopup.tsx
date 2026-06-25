'use client'

import React, { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { V2SocialPost, PostStatusV2, PostTypeV2, V2PostMedia } from '@/types/database'
import { 
  Type, 
  ImageIcon, 
  Settings, 
  CheckSquare, 
  Save, 
  Send, 
  XCircle, 
  CheckCircle2, 
  History,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Video
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { updateSocialPost, submitPostForReview, approvePost, rejectPost, upsertPostMedia } from '@/app/dashboard/v2/task-actions'
import { HashtagInput } from '@/components/ui/HashtagInput'
import { createClient } from '@/utils/supabase/client'

interface PostEditorPopupProps {
  post: V2SocialPost
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function PostEditorPopup({ post, isOpen, onClose, onUpdate }: PostEditorPopupProps) {
  const [activeTab, setActiveTab] = useState('copy')
  const [formData, setFormData] = useState<Partial<V2SocialPost>>(post)
  const [isSaving, setIsSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setFormData(post)
  }, [post])

  const isLocked = post.status === 'awaiting_review' || post.status === 'approved'
  const isRejected = post.status === 'rejected'

  const handleSave = async () => {
    if (isLocked) return
    setIsSaving(true)
    try {
      await updateSocialPost(post.id, {
        caption: formData.caption,
        art_text: formData.art_text,
        script: formData.script,
        hashtags: formData.hashtags,
        post_type: formData.post_type,
        carousel_slides: formData.carousel_slides || 1,
        status: post.status === 'rejected' ? 'in_production' : post.status
      })
      onUpdate()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleHandleUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetIndex?: number) => {
    if (isLocked) return
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const newMedia: any[] = []
      for (const file of Array.from(files)) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
        const filePath = `posts/${post.id}/${Date.now()}_${cleanName}`
        const { data, error } = await supabase.storage.from('tasks').upload(filePath, file)
        
        if (error) throw error
        
        const { data: { publicUrl } } = supabase.storage.from('tasks').getPublicUrl(filePath)
        
        newMedia.push({
          storage_provider: 'supabase',
          file_path: filePath,
          public_url: publicUrl,
          media_type: file.type.startsWith('video') ? 'video' : 'image'
        })
      }
      
      let combinedMedia = [...(post.media || [])]
      if (targetIndex !== undefined) {
         // Replace the specific slot
         combinedMedia[targetIndex] = newMedia[0]
      } else {
         combinedMedia = [...combinedMedia, ...newMedia]
      }
      
      await upsertPostMedia(post.id, combinedMedia)
      onUpdate()
    } catch (err: any) {
      alert('Erro ao subir arquivo: ' + err.message)
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleAddDriveLink = async () => {
    const url = prompt('Cole o link do Google Drive:')
    if (!url) return
    
    const mediaItem = {
      storage_provider: 'drive',
      public_url: url,
      media_type: 'video' // Drive is mostly used for videos in this workflow
    }
    
    await upsertPostMedia(post.id, [...(post.media || []), mediaItem])
    onUpdate()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col bg-surface border-border shadow-2xl">
        
        {/* Header Section */}
        <DialogHeader className="p-6 border-b border-border bg-surface-muted/20 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-3 h-3 rounded-full animate-pulse",
              post.status === 'approved' ? 'bg-emerald-500' :
              post.status === 'awaiting_review' ? 'bg-amber-500' :
              post.status === 'rejected' ? 'bg-rose-500' : 'bg-slate-400'
            )} />
            <div>
              <DialogTitle className="text-xl font-serif font-bold text-text-primary">
                Post #{post.order + 1}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">
                  {post.post_type}
                </Badge>
                <span className="text-xs text-text-muted font-medium">
                   Status: <span className="text-text-primary font-bold">{post.status.toUpperCase()}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isLocked && (
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 glass-panel rounded-lg text-sm font-bold hover:border-brand-primary transition-all disabled:opacity-50"
              >
                {isSaving ? <History className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-brand-primary" />}
                Salvar Rascunho
              </button>
            )}
            
            {post.status === 'draft' || post.status === 'rejected' || post.status === 'in_production' ? (
              <button 
                onClick={async () => { await submitPostForReview(post.id); onUpdate(); }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-secondary transition-all shadow-brand"
              >
                <Send className="w-4 h-4" /> Enviar para Revisão
              </button>
            ) : null}

            {post.status === 'awaiting_review' && (
              <div className="flex gap-2">
                <button 
                  onClick={async () => { await rejectPost(post.id); onUpdate(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-bold hover:bg-rose-600 transition-all"
                >
                  <XCircle className="w-4 h-4" /> Rejeitar
                </button>
                <button 
                  onClick={async () => { await approvePost(post.id); onUpdate(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Aprovar
                </button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Content Tabs area */}
        <div className="flex-1 flex overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
            <div className="px-6 border-b border-border bg-surface flex justify-between items-center shrink-0">
               <TabsList className="bg-transparent h-12 gap-6">
                <TabsTrigger value="copy" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none h-full px-0 flex gap-2">
                  <Type className="w-4 h-4" /> Copy
                </TabsTrigger>
                <TabsTrigger value="media" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none h-full px-0 flex gap-2">
                  <ImageIcon className="w-4 h-4" /> Mídia
                </TabsTrigger>
                <TabsTrigger value="config" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none h-full px-0 flex gap-2">
                  <Settings className="w-4 h-4" /> Config
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none h-full px-0 flex gap-2">
                  <History className="w-4 h-4" /> Histórico
                </TabsTrigger>
              </TabsList>
              
              {isLocked && (
                 <div className="flex items-center gap-2 text-amber-600 text-xs font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5" /> Edição Desabilitada (Em Revisão/Aprovado)
                 </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-surface/30">
              
              {/* COPY TAB */}
              <TabsContent value="copy" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                      <Type className="w-4 h-4 text-brand-primary" /> Legenda do Post
                    </label>
                    <textarea 
                      disabled={isLocked}
                      value={formData.caption || ''}
                      onChange={e => setFormData(p => ({ ...p, caption: e.target.value }))}
                      className="w-full min-h-[300px] p-6 rounded-2xl bg-surface-muted/50 border border-border focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none text-base resize-none disabled:opacity-50"
                      placeholder="Sua legenda persuasiva aqui..."
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-text-muted">Texto da Arte</label>
                      <textarea 
                        disabled={isLocked}
                        value={formData.art_text || ''}
                        onChange={e => setFormData(p => ({ ...p, art_text: e.target.value }))}
                        className="w-full h-24 p-4 rounded-xl bg-surface-muted/30 border border-border outline-none text-sm resize-none disabled:opacity-50"
                        placeholder="Textos que devem aparecer na imagem/vídeo..."
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-text-muted">Roteiro sugerido (Opcional)</label>
                      <textarea 
                        disabled={isLocked}
                        value={formData.script || ''}
                        onChange={e => setFormData(p => ({ ...p, script: e.target.value }))}
                        className="w-full h-32 p-4 rounded-xl bg-surface-muted/30 border border-border outline-none text-sm resize-none disabled:opacity-50"
                        placeholder="Instruções de cena, áudio ou narração..."
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-text-muted">Hashtags</label>
                      <HashtagInput 
                        disabled={isLocked}
                        hashtags={formData.hashtags || []}
                        onChange={tags => setFormData(p => ({ ...p, hashtags: tags }))}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* MEDIA TAB */}
              <TabsContent value="media" className="m-0 animate-in fade-in slide-in-from-bottom-2">
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <div>
                          <h3 className="text-sm font-bold text-text-primary">Ativos do Conteúdo</h3>
                          <p className="text-xs text-text-muted">Gerencie imagens e vídeos para este post.</p>
                       </div>
                       {!isLocked && (
                         <div className="flex gap-2">
                            <button 
                              onClick={handleAddDriveLink}
                              className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg text-xs font-bold hover:bg-slate-50 transition-all"
                            >
                               <ExternalLink className="w-3.5 h-3.5 text-blue-500" /> Link Drive
                            </button>
                            <label className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-brand-secondary transition-all">
                               {uploading ? <History className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Upload Imagem
                               <input type="file" multiple className="hidden" onChange={(e) => handleHandleUpload(e)} disabled={uploading} />
                            </label>
                         </div>
                       )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                       {Array.from({ length: formData.post_type === 'carousel' ? (formData.carousel_slides || 1) : Math.max(1, (post.media?.length || 1)) }).map((_, idx) => {
                         const m = post.media?.[idx]
                         
                         return (
                           <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden bg-surface-muted/50 border border-border shadow-sm flex flex-col items-center justify-center">
                              {m ? (
                                <>
                                  {m.media_type === 'video' ? (
                                     <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/10 gap-2">
                                        <VideoIcon size={24} className="text-text-muted" />
                                        <span className="text-[10px] uppercase font-black text-text-muted">Vídeo</span>
                                     </div>
                                  ) : (
                                     <img src={m.public_url} className="w-full h-full object-cover" alt="Midia" />
                                  )}
                                  
                                  <div className="absolute top-1.5 right-1.5 flex gap-1 transform translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                     <a href={m.public_url} target="_blank" className="p-1 px-2 bg-white/90 rounded text-[10px] font-bold shadow-sm">Abrir</a>
                                     {!isLocked && (
                                       <button 
                                         onClick={async () => {
                                            const filtered = [...(post.media || [])]
                                            filtered[idx] = null as any // Remove it
                                            const cleaned = filtered.filter(Boolean)
                                            await upsertPostMedia(post.id, cleaned)
                                            onUpdate()
                                         }}
                                         className="p-1 bg-rose-500 text-white rounded shadow-sm hover:bg-rose-600"
                                       >
                                         <Trash2 className="w-3 h-3" />
                                       </button>
                                     )}
                                  </div>
                                  
                                  <div className="absolute bottom-0 inset-x-0 p-1 bg-black/40 backdrop-blur-sm text-[8px] text-white font-black uppercase text-center tracking-widest flex justify-between px-2">
                                     <span>{formData.post_type === 'carousel' ? `Lauda ${idx + 1}` : 'Conteúdo'}</span>
                                     <span>{m.storage_provider === 'drive' ? 'External' : 'Server'}</span>
                                  </div>
                                </>
                              ) : (
                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-surface-muted/90 group p-4 text-center">
                                  <div className="w-8 h-8 rounded-full glass-panel shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Plus className="w-4 h-4 text-brand-primary" />
                                  </div>
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted group-hover:text-text-primary">
                                    {formData.post_type === 'carousel' ? `Lauda ${idx + 1}` : 'Adicionar Mídia'}
                                  </span>
                                  <input type="file" disabled={uploading || isLocked} className="hidden" onChange={(e) => handleHandleUpload(e, idx)} />
                                </label>
                              )}
                           </div>
                         )
                       })}
                    </div>

                    {post.post_type === 'carousel' && (
                       <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                          <p className="text-xs text-blue-700 leading-relaxed">
                            No modo **Carousel**, a copy acima é compartilhada entre todas as imagens. Você pode reordenar os slides arrastando (em breve).
                          </p>
                       </div>
                    )}
                 </div>
              </TabsContent>

              {/* CONFIG TAB */}
              <TabsContent value="config" className="m-0 animate-in fade-in slide-in-from-bottom-2">
                 <div className="max-w-md space-y-8">
                    <div className="space-y-4">
                       <label className="text-xs font-black uppercase tracking-widest text-text-muted">Tipo de Post</label>
                       <div className="grid grid-cols-1 gap-2">
                          {(['image', 'carousel', 'video'] as PostTypeV2[]).map(t => (
                            <button
                              key={t}
                              disabled={isLocked}
                              onClick={() => setFormData(p => ({ ...p, post_type: t }))}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-xl text-sm font-bold transition-all disabled:opacity-50",
                                formData.post_type === t 
                                  ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20 ring-4 ring-brand-primary/10 border-transparent transform scale-[1.02]" 
                                  : "glass-panel text-text-muted hover:border-text-secondary hover:bg-surface-muted/30"
                              )}
                            >
                               <span className="capitalize">{t}</span>
                               {formData.post_type === t && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </button>
                          ))}
                       </div>
                    </div>

                    {formData.post_type === 'carousel' && (
                       <div className="space-y-4 animate-in fade-in slide-in-from-top-2 p-6 bg-surface-muted/20 border border-border rounded-xl">
                          <label className="text-xs font-black uppercase tracking-widest text-text-primary flex items-center justify-between">
                            <span>Quantidade de Laudas (Slides)</span>
                            <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{formData.carousel_slides || 1}</span>
                          </label>
                          <div className="flex gap-2 items-center">
                            <input 
                              type="range" 
                              min="2" 
                              max="10" 
                              disabled={isLocked}
                              value={formData.carousel_slides || 2} 
                              onChange={(e) => setFormData(p => ({ ...p, carousel_slides: parseInt(e.target.value) }))}
                              className="w-full accent-brand-primary"
                            />
                          </div>
                          <p className="text-[10px] text-text-muted">
                            Defina o total de slides deste carrossel. As vagas correspondentes aparecerão na aba <b>Mídia</b> para aprovação em sequência.
                          </p>
                       </div>
                    )}
                 </div>
              </TabsContent>

              {/* HISTORY TAB */}
              <TabsContent value="history" className="m-0 animate-in fade-in slide-in-from-bottom-2">
                 <div className="space-y-6">
                    <h3 className="text-sm font-bold text-text-primary">Registro de Versões</h3>
                    <div className="flex flex-col gap-4">
                       <div className="p-4 rounded-xl border border-brand-primary bg-brand-primary/5 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">A</div>
                             <div>
                                <p className="text-sm font-bold">Versão Atual</p>
                                <p className="text-xs text-text-muted">Editando agora...</p>
                             </div>
                          </div>
                          <Badge className="bg-brand-primary">Ativa</Badge>
                       </div>

                       {/* Mocked/Fetched Versions here */}
                       <div className="text-center py-12 text-text-muted space-y-2">
                          <History size={32} className="mx-auto opacity-20" />
                          <p className="text-sm font-medium">As versões serão listadas aqui após o primeiro envio para revisão.</p>
                       </div>
                    </div>
                 </div>
              </TabsContent>

            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function VideoIcon({ size, className }: { size: number, className?: string }) {
  return <Video size={size} className={className} />
}

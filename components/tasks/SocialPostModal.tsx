'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { V2SocialPost, PostTypeV2, ApprovalStatusV2, PostStatusV2 } from '@/types/database'
import { updateSocialPost } from '@/app/dashboard/v2/task-actions'
import { createClient } from '@/utils/supabase/client'
import { 
  X, ChevronLeft, ChevronRight, Save, Loader2, 
  Type, Hash, AlignLeft, Image as ImageIcon, 
  Upload, Trash2, CheckCircle2, AlertCircle, Play
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { HashtagInput } from '@/components/ui/HashtagInput'

interface SocialPostModalProps {
  posts: V2SocialPost[]
  initialIndex: number
  taskId: string
  taskType: 'social_copy' | 'social_design'
  onClose: () => void
}

export function SocialPostModal({ posts, initialIndex, taskId, taskType, onClose }: SocialPostModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isSaving, setIsSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Local form state
  const [formData, setFormData] = useState<Partial<V2SocialPost>>(posts[initialIndex])

  useEffect(() => {
    setFormData(posts[currentIndex])
  }, [currentIndex, posts])

  const post = posts[currentIndex]
  const supabase = createClient()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Auto status logic
      let status = formData.status
      if (taskType === 'social_copy') {
        if (formData.caption && status === 'pending') status = 'in_progress'
      } else {
        if (formData.media && formData.media.length > 0 && status === 'pending') status = 'in_progress'
      }

      await updateSocialPost(post.id, {
        ...formData,
        status
      })
      
      // If navigating to next is desired on save, we could, but let's just keep it simple
    } catch (err) {
      console.error('Erro ao salvar post:', err)
      alert('Erro ao salvar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const newMedia = [...(formData.media || [])]

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${taskId}/posts/${post.id}/${fileName}`

        const { data, error: uploadError } = await supabase.storage
          .from('tasks')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('tasks')
          .getPublicUrl(filePath)

        newMedia.push({
          url: publicUrl,
          type: file.type.startsWith('video') ? 'video' : 'image',
          name: file.name,
          version: 1,
          created_at: new Date().toISOString()
        })
      }

      setFormData(prev => ({ ...prev, media: newMedia }))
      // Update DB immediately for media
      await updateSocialPost(post.id, { 
        media: newMedia,
        status: newMedia.length > 0 ? 'in_progress' : 'pending' 
      })
    } catch (err) {
      console.error('Upload error:', err)
      alert('Erro no upload')
    } finally {
      setUploading(false)
    }
  }

  const removeMedia = async (index: number) => {
    const newMedia = formData.media?.filter((_, i) => i !== index) || []
    setFormData(prev => ({ ...prev, media: newMedia }))
    await updateSocialPost(post.id, { media: newMedia })
  }

  const canMarkDone = () => {
    if (taskType === 'social_copy') return !!formData.caption
    return formData.media && formData.media.length > 0
  }

  return (
    <Modal open={true} onClose={onClose}>
      <ModalContent size="lg" className="overflow-hidden bg-gradient-to-br from-surface to-background/50 dark:from-surface dark:to-background/90 shadow-3xl">
        <ModalHeader showClose={false} className="p-6 border-b border-sand-dark/10">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button 
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(i => i - 1)}
                  className="p-2 rounded-lg hover:bg-surface-muted disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-black uppercase tracking-widest text-text-primary px-2">
                  Post {currentIndex + 1} de {posts.length}
                </span>
                <button 
                  disabled={currentIndex === posts.length - 1}
                  onClick={() => setCurrentIndex(i => i + 1)}
                  className="p-2 rounded-lg hover:bg-surface-muted disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl border border-sand-dark/20 hover:bg-surface-muted transition-colors">
              <X size={20} className="text-text-muted" />
            </button>
          </div>
        </ModalHeader>

        <ModalBody className="p-0 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Main Production Area */}
            <div className="lg:col-span-8 p-8 space-y-8">
              {taskType === 'social_copy' ? (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                       <Type size={12} className="text-brand-primary" /> Legenda (Caption)
                    </label>
                    <textarea 
                      value={formData.caption || ''}
                      onChange={e => setFormData(p => ({ ...p, caption: e.target.value }))}
                      className="glass-input w-full p-6 rounded-2xl text-base min-h-[300px] resize-none leading-relaxed focus:shadow-xl transition-all"
                      placeholder="Escreva a legenda encantadora aqui..."
                    />
                    <div className="flex justify-end pr-2">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        (formData.caption?.length || 0) > 2000 ? "text-rose-500" : "text-text-muted"
                      )}>
                        {formData.caption?.length || 0} / 2200 caracteres
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                       <Hash size={12} className="text-brand-primary" /> Hashtags Estratégicas
                    </label>
                    <HashtagInput 
                      hashtags={formData.hashtags || []} 
                      onChange={tags => setFormData(p => ({ ...p, hashtags: tags }))} 
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                       <AlignLeft size={12} className="text-brand-primary" /> Observações / Referências
                    </label>
                    <textarea 
                      value={formData.optional_text || ''}
                      onChange={e => setFormData(p => ({ ...p, optional_text: e.target.value }))}
                      className="glass-input w-full p-6 rounded-2xl text-sm min-h-[100px] resize-none opacity-80"
                      placeholder="Diretrizes específicas para o design ou cliente..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                       <ImageIcon size={12} className="text-brand-primary" /> Ativos de Design
                    </label>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {formData.media?.map((file, idx) => (
                        <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden bg-black/10 border border-sand-dark/10 shadow-sm">
                          {file.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                              <Play size={24} className="text-white/50" />
                            </div>
                          ) : (
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button onClick={() => removeMedia(idx)} className="p-2 rounded-full bg-rose-500 text-white hover:scale-110 transition-transform">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <label className={cn(
                        "aspect-square rounded-2xl border-2 border-dashed border-sand-dark/20 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-brand-primary/5 hover:border-brand-primary/40 group",
                        uploading && "opacity-50 pointer-events-none"
                      )}>
                        <input type="file" multiple className="hidden" onChange={handleUpload} />
                        {uploading ? <Loader2 size={24} className="animate-spin text-brand-primary" /> : <Upload size={24} className="text-text-muted group-hover:text-brand-primary transition-colors" />}
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Upload</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
                     <AlertCircle size={20} className="text-amber-500 shrink-0" />
                     <div className="space-y-1">
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-amber-500">Requisito do Post</h5>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Para posts em carrosel, selecione o tipo "Carousel" na aba lateral e envie de 2 a 10 imagens/vídeos.
                        </p>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Config Sidebar */}
            <div className="lg:col-span-4 bg-sand-light/10 dark:bg-slate-950/20 p-8 border-l border-sand-dark/10 space-y-10">
              <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Formato do Post</label>
                   <select 
                     value={formData.type}
                     onChange={e => setFormData(p => ({ ...p, type: e.target.value as PostTypeV2 }))}
                     className="glass-input w-full p-4 rounded-xl text-xs font-black uppercase tracking-widest"
                   >
                     <option value="feed">Feed (1:1)</option>
                     <option value="story">Story (9:16)</option>
                     <option value="carousel">Carousel</option>
                     <option value="reels">Reels</option>
                     <option value="video_story">Video Story</option>
                   </select>
                </div>

                {formData.type === 'carousel' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Slides (1-10)</label>
                    <input 
                      type="number" 
                      min="1" max="10"
                      value={formData.carousel_slides || 1}
                      onChange={e => setFormData(p => ({ ...p, carousel_slides: parseInt(e.target.value) || 1 }))}
                      className="glass-input w-full p-4 rounded-xl text-sm font-black"
                    />
                  </div>
                )}

                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Status de Produção</label>
                   <div className="grid grid-cols-2 gap-2">
                      {(['pending', 'in_progress', 'done'] as PostStatusV2[]).map(s => (
                        <button
                          key={s}
                          onClick={() => setFormData(p => ({ ...p, status: s }))}
                          disabled={s === 'done' && !canMarkDone()}
                          className={cn(
                            "py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                            formData.status === s 
                              ? "bg-brand-primary text-white shadow-brand" 
                              : "bg-white/50 dark:bg-white/5 border border-sand-dark/10 text-text-muted hover:bg-white/80",
                            s === 'done' && !canMarkDone() && "opacity-30 cursor-not-allowed"
                          )}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Aprovação</label>
                   <div className="grid grid-cols-3 gap-2">
                      {(['pending', 'approved', 'rejected'] as ApprovalStatusV2[]).map(s => (
                        <button
                          key={s}
                          onClick={() => setFormData(p => ({ ...p, approval_status: s }))}
                          className={cn(
                            "py-3 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all px-1",
                            formData.approval_status === s 
                              ? (s === 'approved' ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]" : "bg-brand-primary text-white") 
                              : "bg-white/50 dark:bg-white/5 border border-sand-dark/10 text-text-muted"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              <div className="pt-10 border-t border-sand-dark/10">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-4.5 rounded-[20px] bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-brand hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Sincronizar Produção
                </button>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

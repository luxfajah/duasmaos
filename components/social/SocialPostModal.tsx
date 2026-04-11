'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { V2SocialPost, PostTypeV2, PostStatusV2 } from '@/types/database'
import { 
  X, ChevronLeft, ChevronRight, Hash, Type, 
  Image as ImageIcon, Layers, CheckCircle2, 
  Upload, Trash2, Replace
} from 'lucide-react'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AutoExpandingTextarea } from '@/components/ui/AutoExpandingTextarea'
import { HashtagInput } from '@/components/ui/HashtagInput'
import { updateSocialPost } from '@/app/dashboard/tasks/social-actions'
import { cn } from '@/lib/utils'
import './SocialStyles.css'

interface SocialPostModalProps {
  post: V2SocialPost
  allPosts: V2SocialPost[]
  onClose: () => void
  onNavigate: (post: V2SocialPost) => void
  onUpdate: () => void
  isReadOnly?: boolean
}

export function SocialPostModal({ 
  post, 
  allPosts, 
  onClose, 
  onNavigate, 
  onUpdate,
  isReadOnly 
}: SocialPostModalProps) {
  const [formData, setFormData] = useState<V2SocialPost>(post)
  const [isPending, startTransition] = useTransition()

  // Sync state with post prop
  useEffect(() => {
    setFormData(post)
  }, [post])

  const currentIndex = allPosts.findIndex(p => p.id === post.id)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < allPosts.length - 1

  const handleUpdate = async (updates: Partial<V2SocialPost>) => {
    if (isReadOnly) return
    const newDoc = { ...formData, ...updates }
    setFormData(newDoc)
    
    // Autosave logic (simplified here, in production use debounced logic)
    startTransition(async () => {
      await updateSocialPost(post.id, updates as any)
      onUpdate()
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl social-glass-modal border-none p-0 overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-white/40 tracking-widest uppercase">
              Post {String(post.order + 1).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" size="icon" 
                disabled={!hasPrev} 
                onClick={() => onNavigate(allPosts[currentIndex - 1])}
                className="hover:bg-white/10 text-white/60 disabled:opacity-20"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" size="icon" 
                disabled={!hasNext} 
                onClick={() => onNavigate(allPosts[currentIndex + 1])}
                className="hover:bg-white/10 text-white/60 disabled:opacity-20"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 text-white/60">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Section: Type & Configuration */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Tipo de Post</label>
              <select
                value={formData.type}
                onChange={(e) => handleUpdate({ type: e.target.value as PostTypeV2 })}
                disabled={isReadOnly}
                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-white/20 transition-colors cursor-pointer"
              >
                <option value="feed">Feed (Image/Carousel)</option>
                <option value="story">Story</option>
                <option value="reels">Reels / TikTok</option>
                <option value="carousel">Carousel (Extended)</option>
                <option value="video_story">Video Story</option>
              </select>
            </div>
            
            {formData.type === 'carousel' && (
              <div className="space-y-3 animate-fade-in">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Slides (1-10)</label>
                <input
                  type="number"
                  min={1} max={10}
                  value={formData.carousel_slides}
                  onChange={(e) => handleUpdate({ carousel_slides: parseInt(e.target.value) || 1 })}
                  disabled={isReadOnly}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Section: Content (Conditional based on deliverable type of task could be added here, but general UI works) */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-white/30" />
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Legenda / Caption</label>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 focus-within:border-white/20 transition-colors">
                <AutoExpandingTextarea
                  value={formData.caption || ''}
                  onChange={(e) => handleUpdate({ caption: e.target.value })}
                  placeholder="Escreva a legenda aqui..."
                  className="text-white text-sm"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-white/30" />
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Hashtags</label>
              </div>
              <HashtagInput 
                hashtags={formData.hashtags} 
                onChange={(tags) => handleUpdate({ hashtags: tags })}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Observações / Texto na Imagem</label>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 focus-within:border-white/20 transition-colors">
                <AutoExpandingTextarea
                  value={formData.optional_text || ''}
                  onChange={(e) => handleUpdate({ optional_text: e.target.value })}
                  placeholder="Informações adicionais para o designer..."
                  className="text-white/60 text-sm"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          {/* Section: Design */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-white/30" />
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Design Assets</label>
            </div>
            
            <div className="upload-zone group">
              <Upload className="w-8 h-8 text-white/20 mx-auto mb-3 group-hover:text-white/40 transition-colors" />
              <p className="text-sm text-white/40">Arraste ou clique para enviar arquivos</p>
              <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">JPG, PNG, MP4 até 50MB</p>
            </div>

            {formData.media.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {formData.media.map((file: any, i: number) => (
                  <div key={i} className="group relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                    <img src={file.url} alt={`Asset ${i}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-white/20"><Replace className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-danger/20 text-danger"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer: Status & Approval */}
        <div className="p-6 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <div className={cn("w-2 h-2 rounded-full", {
                "bg-draft": formData.status === 'pending',
                "bg-amber-500": formData.status === 'in_progress',
                "bg-success": formData.status === 'done'
              })} />
              <select
                value={formData.status}
                onChange={(e) => handleUpdate({ status: e.target.value as PostStatusV2 })}
                disabled={isReadOnly}
                className="bg-transparent border-none text-xs text-white/80 focus:ring-0 p-0 cursor-pointer"
              >
                <option value="pending">Pendente</option>
                <option value="in_progress">Em andamento</option>
                <option value="done">Concluído</option>
              </select>
            </div>
          </div>

          <Button 
            variant="ghost" 
            className={cn(
              "rounded-full px-6 gap-2 border border-white/10",
              formData.approval_status === 'approved' ? "bg-success/20 text-success border-success/30 hover:bg-success/30" : "bg-white/5 text-white/40 hover:bg-white/10"
            )}
            onClick={() => handleUpdate({ approval_status: formData.approval_status === 'approved' ? 'pending' : 'approved' })}
            disabled={isReadOnly}
          >
            <CheckCircle2 className="w-4 h-4" />
            {formData.approval_status === 'approved' ? 'Aprovado' : 'Aprovar Post'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

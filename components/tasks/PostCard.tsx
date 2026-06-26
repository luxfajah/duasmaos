'use client'

import React from 'react'
import { V2SocialPost, PostStatusV2 } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileImage, 
  Layers, 
  Video, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Edit2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: V2SocialPost
  onClick: (post: V2SocialPost) => void
  onDuplicate?: (post: V2SocialPost) => void
  onDelete?: (post: V2SocialPost) => void
}

export function PostCard({ post, onClick, onDuplicate, onDelete }: PostCardProps) {
  const mainMedia = post.media?.[0]
  const versionCount = post.versions?.length || 0
  
  const getStatusConfig = (status: PostStatusV2) => {
    switch (status) {
      case 'draft': return { label: 'Rascunho', color: 'bg-slate-400', icon: Clock }
      case 'in_production': return { label: 'Produção', color: 'bg-blue-500', icon: Clock }
      case 'awaiting_review': return { label: 'Revisão', color: 'bg-amber-500', icon: AlertCircle }
      case 'approved': return { label: 'Aprovado', color: 'bg-emerald-500', icon: CheckCircle2 }
      case 'rejected': return { label: 'Rejeitado', color: 'bg-rose-500', icon: AlertCircle }
      default: return { label: status, color: 'bg-slate-400', icon: Clock }
    }
  }

  const { label, color, icon: StatusIcon } = getStatusConfig(post.status)

  const getTypeIcon = () => {
    switch (post.post_type) {
      case 'carousel': return <Layers className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      default: return <FileImage className="w-4 h-4" />
    }
  }

  return (
    <Card 
      onClick={() => onClick(post)}
      className="group relative overflow-hidden bg-white dark:bg-surface-muted/30 border-border/40 hover:border-border/80 transition-all cursor-pointer flex flex-col h-full rounded-2xl shadow-sm hover:shadow-md"
    >
      {/* Thumbnail Area */}
      <div className="aspect-square relative bg-surface-muted/30 dark:bg-black/20 overflow-hidden rounded-t-2xl">
        {mainMedia ? (
          <img 
            src={mainMedia.public_url} 
            alt="Post preview" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-3">
            <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-white/5 flex items-center justify-center shadow-sm">
              {getTypeIcon()}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Sem mídia</span>
          </div>
        )}
        
        {/* Type Badge - Glass Pill */}
        <div className="absolute top-3 left-3 px-2.5 py-1.5 bg-black/30 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-bold flex items-center gap-1.5 uppercase shadow-sm">
          {getTypeIcon()}
          {post.post_type === 'carousel' && post.media?.length ? `${post.media.length}` : post.post_type}
        </div>

        {/* Version Indicator - Glass Pill */}
        {versionCount > 0 && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 dark:bg-black/50 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-full text-text-primary text-[10px] font-bold shadow-sm">
            v{versionCount + 1}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${color} shadow-sm`} />
             <span className="text-[10px] uppercase font-bold tracking-widest text-text-primary">
               {label}
             </span>
          </div>
          
          <div className="flex gap-1 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 hover:text-text-primary hover:bg-surface-muted rounded-full transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
            <button className="p-1.5 hover:text-text-primary hover:bg-surface-muted rounded-full transition-colors"><MoreVertical className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <p className="text-[13px] text-text-secondary line-clamp-2 leading-relaxed mb-4 flex-1 font-medium">
          {post.caption ? `${post.caption}` : <span className="italic opacity-50">Nenhuma legenda definida.</span>}
        </p>

        <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest pt-4 border-t border-border/30">
           <span className="flex items-center gap-1.5">
             <MessageSquare className="w-3.5 h-3.5 opacity-70" /> {post.hashtags?.length || 0} Tags
           </span>
           <span className="flex items-center gap-1.5 text-text-primary bg-surface-muted/50 px-2 py-1 rounded-md">
              Post #{post.order + 1}
           </span>
        </div>
      </div>
    </Card>
  )
}

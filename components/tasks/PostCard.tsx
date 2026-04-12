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
      case 'draft': return { label: 'Rascunho', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: Clock }
      case 'in_production': return { label: 'Produção', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock }
      case 'awaiting_review': return { label: 'Revisão', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: AlertCircle }
      case 'approved': return { label: 'Aprovado', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 }
      case 'rejected': return { label: 'Rejeitado', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: AlertCircle }
      default: return { label: status, color: 'bg-slate-500/10 text-slate-500', icon: Clock }
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
      className="group relative overflow-hidden bg-surface-muted/30 border-border hover:border-brand-primary/50 transition-all cursor-pointer flex flex-col h-full"
    >
      {/* Thumbnail Area */}
      <div className="aspect-square relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
        {mainMedia ? (
          <img 
            src={mainMedia.public_url} 
            alt="Post preview" 
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2">
            {getTypeIcon()}
            <span className="text-[10px] font-bold uppercase tracking-wider">Sem mídia</span>
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-white text-[10px] font-bold flex items-center gap-1.5 uppercase">
          {getTypeIcon()}
          {post.post_type === 'carousel' && post.media?.length ? `${post.media.length}` : post.post_type}
        </div>

        {/* Version Indicator */}
        {versionCount > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-brand-primary/90 backdrop-blur-md rounded-md text-white text-[10px] font-bold">
            v{versionCount + 1}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <Badge className={cn("px-2 py-0.5 text-[10px] uppercase font-black tracking-tight border", color)}>
            <div className="flex items-center gap-1 text-[9px]">
               <StatusIcon className="w-3 h-3" />
               {label}
            </div>
          </Badge>
          
          <div className="flex gap-1 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 hover:text-text-primary"><Edit2 className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:text-text-primary"><MoreVertical className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <p className="text-xs text-text-secondary line-clamp-2 italic mb-3 flex-1">
          {post.caption ? `"${post.caption.substring(0, 60)}..."` : 'Nenhuma legenda definida.'}
        </p>

        <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest pt-3 border-t border-border/50">
           <span className="flex items-center gap-1">
             <MessageSquare className="w-3 h-3" /> {post.hashtags?.length || 0} Tags
           </span>
           <span className="flex items-center gap-1 text-text-primary">
              Post #{post.order_index + 1}
           </span>
        </div>
      </div>
      
      {/* Selection Overlay (Active State) */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  )
}

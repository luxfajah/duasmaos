'use client'

import React from 'react'
import { V2SocialPost, PostStatusV2, PostTypeV2 } from '@/types/database'
import { Hash, Image, Video, Layers, Smartphone, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import './SocialStyles.css'

const POST_TYPE_ICONS: Record<PostTypeV2, any> = {
  feed: Image,
  story: Smartphone,
  carousel: Layers,
  video_story: Video,
  reels: Video
}

const POST_TYPE_LABELS: Record<PostTypeV2, string> = {
  feed: 'Feed',
  story: 'Story',
  carousel: 'Carousel',
  video_story: 'Video Story',
  reels: 'Reels'
}

interface SocialPostCardProps {
  post: V2SocialPost
  onClick: (post: V2SocialPost) => void
}

export function SocialPostCard({ post, onClick }: SocialPostCardProps) {
  const Icon = POST_TYPE_ICONS[post.type] || Image

  return (
    <div 
      className="post-card group"
      onClick={() => onClick(post)}
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
          Post {String(post.order + 1).padStart(2, '0')}
        </span>
        <div className={cn("status-dot", {
          "status-pending": post.status === 'pending',
          "status-in_progress": post.status === 'in_progress',
          "status-done": post.status === 'done'
        })} />
      </div>

      <div className="flex flex-col items-center justify-center gap-2 py-4">
        <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
          <Icon className="w-6 h-6 text-white/70" />
        </div>
        <span className="text-xs font-medium text-white/80">
          {POST_TYPE_LABELS[post.type]}
        </span>
      </div>

      <div className="flex justify-between items-center mt-auto">
        {post.is_approved && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-success/20 text-[10px] font-bold text-success uppercase">
            <CheckCircle2 className="w-3 h-3" />
            Aprovado
          </div>
        )}
        <div className="text-[10px] text-white/30 ml-auto">
          {post.carousel_slides > 1 && `${post.carousel_slides} slides`}
        </div>
      </div>
    </div>
  )
}

interface SocialPostGridProps {
  posts: V2SocialPost[]
  onPostClick: (post: V2SocialPost) => void
}

export function SocialPostGrid({ posts, onPostClick }: SocialPostGridProps) {
  if (posts.length === 0) return null

  return (
    <div className="social-grid">
      {posts.map((post) => (
        <SocialPostCard 
          key={post.id} 
          post={post} 
          onClick={onPostClick} 
        />
      ))}
    </div>
  )
}

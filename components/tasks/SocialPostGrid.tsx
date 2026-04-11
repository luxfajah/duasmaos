'use client'

import React, { useState, useEffect } from 'react'
import { V2SocialPost, PostTypeV2, ApprovalStatusV2, PostStatusV2 } from '@/types/database'
import { getSocialPosts } from '@/app/dashboard/v2/task-actions'
import { cn } from '@/lib/utils'
import { FileText, Image as ImageIcon, CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react'
import { SocialPostModal } from './SocialPostModal'

interface SocialPostGridProps {
  taskId: string
  taskType: 'social_copy' | 'social_design' | string
  isEditable?: boolean
}

export function SocialPostGrid({ taskId, taskType, isEditable = true }: SocialPostGridProps) {
  const [posts, setPosts] = useState<V2SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await getSocialPosts(taskId)
      setPosts(data)
    } catch (err) {
      console.error('Erro ao carregar posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (taskId) {
      fetchPosts()
    }
  }, [taskId])

  const getStatusIcon = (status: PostStatusV2) => {
    switch (status) {
      case 'done': return <CheckCircle2 size={14} className="text-emerald-500" />
      case 'in_progress': return <Clock size={14} className="text-amber-500" />
      default: return <Clock size={14} className="text-slate-400" />
    }
  }

  const getApprovalBadge = (status: ApprovalStatusV2) => {
    switch (status) {
      case 'approved': return <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">Aprovado</span>
      case 'rejected': return <span className="text-[8px] font-black bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">Ajustar</span>
      default: return <span className="text-[8px] font-black bg-slate-500/10 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">Pendente</span>
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse border border-white/5" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {posts.map((post, index) => (
          <button
            key={post.id}
            onClick={() => isEditable && setSelectedPostIndex(index)}
            className={cn(
              "group relative flex flex-col aspect-square rounded-[24px] border transition-all duration-300 overflow-hidden text-left",
              "bg-white/40 dark:bg-white/5 border-sand-dark/10 hover:border-brand-primary/40 hover:shadow-xl hover:-translate-y-1 active:scale-95",
              post.status === 'done' && "border-emerald-500/20 bg-emerald-500/5"
            )}
          >
            {/* Header Area */}
            <div className="p-4 flex justify-between items-start w-full relative z-10">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Post #{post.order + 1}</span>
              {getStatusIcon(post.status)}
            </div>

            {/* Center Icon */}
            <div className="flex-1 flex items-center justify-center relative z-10">
              {taskType === 'social_copy' ? (
                <FileText size={32} strokeWidth={1.5} className="text-brand-primary/40 group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <ImageIcon size={32} strokeWidth={1.5} className="text-brand-primary/40 group-hover:scale-110 transition-transform duration-500" />
              )}
            </div>

            {/* Footer Area */}
            <div className="p-4 bg-white/20 dark:bg-black/20 backdrop-blur-sm border-t border-sand-dark/5 flex justify-between items-center w-full relative z-10">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-text-primary">{post.type}</span>
                {getApprovalBadge(post.approval_status)}
              </div>
              <ChevronRight size={14} className="text-text-muted group-hover:text-brand-primary transition-colors translate-x-1 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 duration-300" />
            </div>

            {/* Abstract Background Decoration */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br transition-opacity duration-300 opacity-0 group-hover:opacity-10 pointer-events-none",
              taskType === 'social_copy' ? "from-brand-primary to-transparent" : "from-brand-secondary to-transparent"
            )} />
          </button>
        ))}
      </div>

      {selectedPostIndex !== null && (
        <SocialPostModal
          posts={posts}
          initialIndex={selectedPostIndex}
          taskId={taskId}
          taskType={taskType as any}
          onClose={() => {
            setSelectedPostIndex(null)
            fetchPosts()
          }}
        />
      )}
    </div>
  )
}

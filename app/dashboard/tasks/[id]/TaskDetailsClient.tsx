'use client'

import React, { useState } from 'react'
import { V2Task, V2SocialPost, PostStatusV2 } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Save, 
  History, 
  CheckCircle, 
  FileText, 
  LayoutGrid, 
  List,
  ExternalLink,
  Users
} from 'lucide-react'
import { PostCard } from '@/components/tasks/PostCard'
import { PostEditorPopup } from '@/components/tasks/PostEditorPopup'
import { syncSocialPosts } from '@/app/dashboard/v2/task-actions'
import { useRouter } from 'next/navigation'

interface TaskDetailsClientProps {
  task: any // Typed in page.tsx as V2Task + Relations
  currentUser: { id: string, email?: string }
}

export function TaskDetailsClient({ task, currentUser }: TaskDetailsClientProps) {
  const [selectedPost, setSelectedPost] = useState<V2SocialPost | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const router = useRouter()

  const handleSyncPosts = async () => {
    const count = prompt('Deseja sincronizar quantos posts para esta tarefa?', task.social_post_count?.toString() || '0')
    if (count === null) return
    
    await syncSocialPosts(task.id, parseInt(count))
    router.refresh()
  }

  const handleOpenPost = (post: V2SocialPost) => {
    setSelectedPost(post)
    setIsEditorOpen(true)
  }

  const sortedPosts = [...(task.posts || [])].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 px-4 shrink-0">
        <div>
          <div className="flex gap-2 items-center mb-2">
            <Badge variant="muted" className="text-[10px] font-black tracking-widest uppercase">
              {task.task_type || 'CRM'} STUDIO
            </Badge>
            <Badge 
              className={cn(
                "px-2 py-0.5 text-[10px] uppercase font-black tracking-widest border",
                task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                'bg-slate-500/10 text-slate-500 border-slate-500/20'
              )}
            >
              {task.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <h1 className="text-4xl font-serif font-bold text-text-primary tracking-tight">
            {task.title}
          </h1>
          <div className="flex gap-4 mt-2 text-xs text-text-muted font-medium items-center">
            <span className="flex items-center gap-1.5 border-r border-border pr-4">
              <History className="w-3.5 h-3.5" /> Prazo: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Sem prazo'}
            </span>
            <span className="flex items-center gap-1.5 border-r border-border pr-4">
               <span className="font-bold text-text-primary">{task.project?.name}</span>
            </span>
            <span className="flex items-center gap-1.5 capitalize border-r border-border pr-4">
              <FileText className="w-3.5 h-3.5" /> {task.stage?.name || 'Sem Etapa'}
            </span>
            <span className="flex items-center gap-1.5">
               <Users className="w-3.5 h-3.5" /> {task.project?.client?.name}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleSyncPosts}
            className="flex items-center gap-2 px-4 py-2 bg-surface text-text-primary border border-border rounded-lg font-bold text-sm hover:border-text-muted transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-brand-primary" /> Sincronizar Posts
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-bold text-sm hover:bg-brand-secondary transition-all shadow-brand">
            <CheckCircle className="w-4 h-4" /> Finalizar Task
          </button>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="flex flex-1 gap-6 w-full min-h-0 px-4">
        
        {/* Main Production Area (Scrollable Grid) */}
        <div className="flex-1 flex flex-col bg-surface-muted/10 border border-border rounded-2xl overflow-hidden relative">
          <div className="h-14 shrink-0 border-b border-border bg-surface flex items-center px-6 justify-between">
            <div className="flex items-center gap-3">
               <h2 className="text-sm font-black uppercase tracking-widest text-text-primary flex items-center gap-2">
                 <LayoutGrid className="w-4 h-4 text-brand-primary" /> Grade Editorial
               </h2>
               <div className="w-px h-4 bg-border mx-1" />
               <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                 {sortedPosts.length} Posts encontrados
               </span>
            </div>
            
            <div className="flex gap-1.5 bg-surface-muted/50 p-1 rounded-lg border border-border/50">
               <button className="p-1.5 bg-surface rounded-md shadow-sm text-brand-primary"><LayoutGrid size={14}/></button>
               <button className="p-1.5 text-text-muted hover:text-text-primary"><List size={14}/></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedPosts.map(post => (
                 <PostCard 
                   key={post.id} 
                   post={post} 
                   onClick={handleOpenPost} 
                 />
              ))}

              {sortedPosts.length === 0 && (
                 <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-surface border border-border rounded-3xl flex items-center justify-center shadow-sm">
                       <Plus size={32} className="text-text-muted" />
                    </div>
                    <div className="max-w-xs">
                       <h3 className="text-lg font-serif font-bold text-text-primary">Container Editorial Vazio</h3>
                       <p className="text-sm text-text-muted mt-1 leading-relaxed">
                         Esta tarefa ainda não possui posts. Use o botão <b>Sincronizar Posts</b> para gerar a grade base.
                       </p>
                    </div>
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Briefing & Revisions */}
        <div className="w-[340px] shrink-0 space-y-6 flex flex-col min-h-0">
           <Card className="p-6 bg-surface-muted/20 border-border flex flex-col shrink-0">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-primary" /> Briefing da Task
              </h4>
              <div className="text-sm text-text-secondary leading-relaxed line-clamp-6">
                {task.description || 'Nenhuma descrição detalhada providenciada para esta tarefa editorial.'}
              </div>
              <button className="mt-4 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-brand-secondary transition-colors inline-flex items-center gap-1.5">
                 Ler Briefing Completo <ExternalLink size={12} />
              </button>
           </Card>

           <Card className="flex-1 p-0 bg-surface border-border overflow-hidden flex flex-col">
              <div className="p-5 border-b border-border flex justify-between items-center bg-surface-muted/10 shrink-0">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-text-primary">Log de Atividade</h4>
                 <Badge variant="muted" className="text-[10px]">Recent</Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-xs">
                 <div className="space-y-4 opacity-50 italic text-text-muted">
                    <p>O fluxo de aprovação é individual por post.</p>
                    <p>Ao aprovar todos os posts, a tarefa será marcada automaticamente como concluída.</p>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      {/* Editor Modal */}
      {selectedPost && (
         <PostEditorPopup 
           post={selectedPost}
           isOpen={isEditorOpen}
           onClose={() => { setIsEditorOpen(false); setSelectedPost(null); }}
           onUpdate={() => router.refresh()}
         />
      )}
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}

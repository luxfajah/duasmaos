'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Task, TaskComment } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { InteractivePreview } from '@/components/dashboard/InteractivePreview'
import { createTaskComment } from '../comment-actions'
import { History, CheckCircle, FileText, Send, Paperclip, Smile } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type CommentWithProfile = TaskComment & {
  profiles: { full_name: string; avatar_url: string | null } | null
}

interface TaskDetailsClientProps {
  task: any; // Using any for nested relations types to avoid complexity
  initialComments: CommentWithProfile[];
  currentUser: { id: string, email?: string };
}

export function TaskDetailsClient({ task, initialComments, currentUser }: TaskDetailsClientProps) {
  const [comments, setComments] = useState(initialComments)
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)
  
  // New comment state
  const [newCommentBody, setNewCommentBody] = useState('')
  const [pendingHotspot, setPendingHotspot] = useState<{ x: number, y: number } | null>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll logic for right sidebar could be added
  const rightSidebarRef = useRef<HTMLDivElement>(null)

  const handleAddHotspot = (x: number, y: number) => {
    setPendingHotspot({ x, y })
    setActiveCommentId(null)
    if (commentInputRef.current) {
      commentInputRef.current.focus()
    }
  }

  const handleHotspotClick = (id: string) => {
    setActiveCommentId(id)
    setPendingHotspot(null)
    // Scroll the right sidebar to the comment if we had element IDs
    const element = document.getElementById(`comment-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  const handleSubmitComment = async () => {
    if (!newCommentBody.trim()) return

    const tempId = `temp-${Date.now()}`;
    const newComm: CommentWithProfile = {
      id: tempId,
      task_id: task.id,
      user_id: currentUser.id,
      body: newCommentBody,
      pos_x: pendingHotspot ? pendingHotspot.x : null,
      pos_y: pendingHotspot ? pendingHotspot.y : null,
      created_at: new Date().toISOString(),
      profiles: { full_name: currentUser.email?.split('@')[0] || 'Eu', avatar_url: null }
    }

    setComments(prev => [...prev, newComm])
    setActiveCommentId(tempId)
    setNewCommentBody('')
    setPendingHotspot(null)

    try {
      await createTaskComment(task.id, newComm.body, newComm.pos_x, newComm.pos_y)
      // The parent component should refetch if we used router.refresh(), 
      // but for UX we just keep optimistic state. Real app would handle this via realtime subscription.
    } catch (e) {
      console.error(e)
    }
  }

  // Pre-mocked media since we don't have attachments yet
  const mediaUrl = "https://images.unsplash.com/photo-1615592389070-bcc97e0504d3?q=80&w=600&auto=format&fit=crop"; 

  // Mapping existing comments to InteractivePreview array
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pl-4">
        <div>
          <div className="flex gap-2 items-center mb-2">
            <Badge variant="muted">TASK ID: #{task.id.substring(0, 6).toUpperCase()}</Badge>
            <Badge variant="warning">{task.status === 'review' ? 'EM REVISÃO' : task.status.toUpperCase()}</Badge>
          </div>
          <h1 className="text-3xl font-serif font-bold text-text-primary">
            {task.title}
          </h1>
          <div className="flex gap-4 mt-2 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5 border-r border-border pr-4">
              <History className="w-4 h-4" /> Prazo: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Sem prazo'}
            </span>
            <span className="flex items-center gap-1.5">
              <Avatar name="D" className="w-5 h-5 bg-surface text-text-primary border" />
              Responsável: {task.projects?.clients?.name ?? 'Designer'}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface text-text-primary border border-border rounded-lg font-semibold hover:border-text-muted transition-all">
            <History className="w-4 h-4" /> Histórico
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-all">
            <CheckCircle className="w-4 h-4" /> Aprovar Entrega
          </button>
        </div>
      </div>

      {/* 3 Column Layout */}
      <div className="flex flex-1 gap-6 w-full min-h-0">
        
        {/* Column 1: Context */}
        <div className="w-[320px] flex-shrink-0 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <Card className="p-5 bg-surface/50 border-border">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> BRIEFING DA TAREFA
            </h4>
            <div className="text-sm text-text-secondary leading-relaxed">
              <p>{task.description || 'Nenhum briefing providenciado para a tarefa.'}</p>
            </div>
            {/* Mocking keys for visual layout shown in image 3 */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-semibold italic">Palavras-chave: Rústico, Premium, Amanhecer.</p>
            </div>
          </Card>

          <Card className="p-5 bg-surface/50 border-border">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">
              ESPECIFICAÇÕES
            </h4>
            <ul className="text-sm space-y-3">
              <li className="flex justify-between">
                <span className="text-text-muted">Formato</span>
                <span className="font-semibold text-text-primary text-right">1080x1350px (Retrato)</span>
              </li>
              <li className="flex justify-between">
                <span className="text-text-muted">Tipografia</span>
                <span className="font-semibold text-text-primary text-right">Cormorant, Inter</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-text-muted">Cores Ativas</span>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  <div className="w-4 h-4 rounded-full bg-[#1C1C1C]" />
                  <div className="w-4 h-4 rounded-full bg-[#8E3B20]" />
                  <div className="w-4 h-4 rounded-full bg-[#E5D7D0]" />
                </div>
              </li>
            </ul>
          </Card>

          <Card className="p-5 bg-surface/50 border-border">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">
              ARQUIVOS ANEXADOS
            </h4>
            <div className="space-y-2">
              <div className="p-3 border border-border rounded-lg bg-background flex gap-3 items-center">
                <div className="w-8 h-8 bg-status-info/20 rounded flex items-center justify-center text-status-info">IMG</div>
                <span className="text-sm font-semibold">moodboard_v1.jpg</span>
              </div>
              <div className="p-3 border border-border rounded-lg bg-background flex gap-3 items-center">
                <div className="w-8 h-8 bg-status-danger/20 rounded flex items-center justify-center text-status-danger">PDF</div>
                <span className="text-sm font-semibold">brand_guide.pdf</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Column 2: Product (Interactive Preview) */}
        <div className="flex-1 flex flex-col bg-surface-muted/30 border border-border rounded-xl overflow-hidden relative">
          <div className="h-12 border-b border-border bg-surface flex items-center px-4 justify-between shrink-0">
             <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-status-warning" />
                <div className="w-3 h-3 rounded-full bg-status-info" />
                <div className="w-3 h-3 rounded-full bg-status-success" />
             </div>
             <span className="text-xs font-bold tracking-widest text-text-muted uppercase">PREVIEW_V2_FINAL.PNG</span>
             <div className="flex gap-2 text-text-muted">
                <button className="hover:text-text-primary"><History className="w-4 h-4"/></button>
             </div>
          </div>
          
          <div className="flex-1 p-6 flex flex-col w-full h-full items-center justify-center">
            <InteractivePreview 
              mediaUrl={mediaUrl} 
              comments={comments} 
              onAddHotspot={handleAddHotspot}
              activeCommentId={activeCommentId}
              onHotspotClick={handleHotspotClick}
            />
          </div>

          <div className="h-20 border-t border-border bg-surface flex items-center justify-center gap-4 shrink-0">
             <button className="px-6 py-2 bg-surface text-text-primary border border-border rounded-lg text-sm font-bold shadow-sm">
                Versões Anteriores (3)
             </button>
             <button className="px-6 py-2 bg-brand-secondary text-white rounded-lg text-sm font-bold shadow-sm">
                + Adicionar Feedback no Preview
             </button>
          </div>
        </div>

        {/* Column 3: Revisions */}
        <div className="w-[360px] flex-shrink-0 flex flex-col border border-border rounded-xl bg-surface overflow-hidden">
           <div className="p-5 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="font-bold text-text-primary">REVISÕES</h3>
                <p className="text-xs text-text-muted mt-0.5">{comments.length} comentários ativos</p>
              </div>
              <button className="p-2 border border-border rounded-md text-text-muted hover:text-text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
              </button>
           </div>
           
           <div ref={rightSidebarRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-background relative">
              {/* Central connecting line for timeline feel */}
              <div className="absolute left-[38px] top-4 bottom-4 w-px bg-border z-0" />
              
              {comments.map((comment, index) => {
                const isSystem = comment.user_id === null;
                const isSelected = activeCommentId === comment.id;
                
                return (
                  <div id={`comment-${comment.id}`} key={comment.id} className="relative z-10 flex gap-4">
                    <div className={`w-10 h-10 shrink-0 rounded-full border-4 border-background flex items-center justify-center text-sm font-bold shadow-sm ${
                      isSystem ? 'bg-surface text-text-muted' : 'bg-surface-muted text-text-primary'
                    }`}>
                      {comment.profiles?.avatar_url 
                        ? <img src={comment.profiles.avatar_url} alt="Avatar do usuário" className="w-full h-full rounded-full object-cover" />
                        : comment.profiles?.full_name?.substring(0,2).toUpperCase() || 'DM'
                      }
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold text-text-primary">{comment.profiles?.full_name || 'Sistema'}</span>
                        <span className="text-[11px] text-text-muted">{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className={`p-4 rounded-2xl rounded-tl-sm text-sm border transition-colors ${
                        isSelected ? 'border-brand-primary bg-brand-primary/5 text-text-primary shadow-sm' : 'bg-surface border-border text-text-secondary'
                      }`}>
                        {/* If it has a hotspot, show the badge */}
                        {comment.pos_x !== null && (
                          <div className="mb-2">
                             <Badge variant="brand" className="text-[10px] px-2 py-0">📌 NO PREVIEW #{index + 1}</Badge>
                          </div>
                        )}
                        <p>{comment.body}</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              {pendingHotspot && (
                <div className="relative z-10 flex gap-4 opacity-80">
                   <div className="w-10 h-10 shrink-0 rounded-full border-4 border-background bg-brand-primary text-white flex items-center justify-center font-bold">
                    +
                   </div>
                   <div className="flex-1 pt-1">
                     <span className="text-sm font-bold text-brand-primary block mb-1">Novo Feedback no Preview</span>
                     <div className="text-xs text-text-secondary italic">Escreva abaixo...</div>
                   </div>
                </div>
              )}
           </div>

           {/* Input Box */}
           <div className="p-4 border-t border-border bg-surface mt-auto">
              <div className={`border rounded-xl bg-background overflow-hidden flex flex-col transition-colors ${pendingHotspot ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-border focus-within:border-text-secondary'}`}>
                <textarea 
                  ref={commentInputRef}
                  value={newCommentBody}
                  onChange={e => setNewCommentBody(e.target.value)}
                  placeholder={pendingHotspot ? "Adicione feedback no ponto marcado..." : "Escreva seu comentário geral..."}
                  className="w-full bg-transparent resize-none outline-none border-none p-3 text-sm min-h-[80px]"
                />
                <div className="bg-surface-muted/30 px-3 py-2 flex justify-between items-center border-t border-border/50">
                  <div className="flex gap-2">
                    <button className="text-text-muted hover:text-text-primary"><Paperclip className="w-4 h-4" /></button>
                    <button className="text-text-muted hover:text-text-primary"><Smile className="w-4 h-4" /></button>
                  </div>
                  <button 
                    onClick={handleSubmitComment}
                    disabled={!newCommentBody.trim()}
                    className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <Send className="w-4 h-4 block ml-[2px]" />
                  </button>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

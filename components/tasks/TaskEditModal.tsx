import React, { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { TaskStatusV2, TaskPriorityV2, PRIORITY_LABELS, TASK_STATUS_V2_LABELS, DeliverableTypeV2, TaskTypeV2, PostStatusV2, PostTypeV2 } from '@/types/database'
import { 
  updateV2Task, 
  createV2Task, 
  getAllProfiles, 
  syncSocialPosts, 
  getSocialPosts, 
  updateSocialPost, 
  submitPostForReview, 
  approvePost, 
  rejectPost, 
  getPostVersions 
} from '@/app/dashboard/v2/task-actions'
import { X, Save, Loader2, Users, Calendar, AlertCircle, Type, AlignLeft, Image as ImageIcon, Send, CheckCircle2, History, MessageSquare, ChevronRight, Hash, Play, Plus } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { HashtagInput } from '@/components/ui/HashtagInput'

interface TaskEditModalProps {
  task?: any
  open: boolean
  onClose: () => void
  projectId?: string
  projects?: { id: string; name: string }[] // New prop for project list
}

export function TaskEditModal({ task, open, onClose, projectId, projects }: TaskEditModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'workflow' | 'content' | 'history'>('workflow')
  const [profiles, setProfiles] = useState<any[]>([])
  const [versions, setVersions] = useState<any[]>([])
  const [currentPost, setCurrentPost] = useState<any>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    project_id: projectId || '',
    title: '',
    description: '',
    status: 'pending' as TaskStatusV2,
    task_type: 'operational' as TaskTypeV2,
    priority: 'medium' as TaskPriorityV2,
    due_date: '',
    assignees: [] as string[],
    deliverable_type: 'default' as DeliverableTypeV2,
    social_post_count: 0
  })

  // Post State (Content specific)
  const [postData, setPostData] = useState({
    post_type: 'image' as PostTypeV2,
    post_status: 'draft' as PostStatusV2,
    caption: '',
    art_text: '',
    script: '',
    hashtags: [] as string[],
    media: [] as any[]
  })

  useEffect(() => {
    if (open) {
      if (task) {
        setFormData({
          project_id: task.project_id || projectId || '',
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'pending',
          task_type: task.task_type || (task.deliverable_type?.startsWith('social_') ? 'content_post' : 'operational'),
          priority: task.priority || 'medium',
          due_date: task.due_date ? task.due_date.split('T')[0] : '',
          assignees: task.v2_task_assignees?.map((a: any) => a.user_id) || [],
          deliverable_type: task.deliverable_type || 'default',
          social_post_count: task.social_post_count || 0
        })

        // Fetch post content if it's a content post
        if (task.task_type === 'content_post' || task.deliverable_type?.startsWith('social_')) {
          getSocialPosts(task.id).then(posts => {
            if (posts && posts.length > 0) {
              const post = posts[0]
              setCurrentPost(post)
              setPostData({
                post_type: post.post_type || post.type || 'image',
                post_status: post.post_status || post.status || 'draft',
                caption: post.caption || '',
                art_text: post.art_text || '',
                script: post.script || '',
                hashtags: post.hashtags || [],
                media: post.media || []
              })
              
              // Load history
              getPostVersions(post.id).then(setVersions).catch(console.error)
            }
          }).catch(console.error)
        }
      } else {
        // Reset for creation
        setFormData({
          project_id: projectId || '',
          title: '',
          description: '',
          status: 'pending',
          task_type: 'operational',
          priority: 'medium',
          due_date: '',
          assignees: [],
          deliverable_type: 'default',
          social_post_count: 0
        })
        setPostData({
          post_type: 'image',
          post_status: 'draft',
          caption: '',
          art_text: '',
          script: '',
          hashtags: [],
          media: []
        })
        setCurrentPost(null)
      }

      getAllProfiles().then(setProfiles).catch(console.error)
    }
  }, [open, task, projectId])

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    startTransition(async () => {
      try {
        const payload = {
          ...formData,
          due_date: formData.due_date ? new Date(formData.due_date + 'T12:00:00Z').toISOString() : null
        }

        let savedTaskId = task?.id

        if (task?.id) {
          await updateV2Task(task.id, formData.project_id, payload)
          
          if (formData.task_type === 'content_post') {
            await syncSocialPosts(task.id, 1) // Force 1 post for now
            if (currentPost) {
               await updateSocialPost(currentPost.id, postData)
            }
          }
        } else if (formData.project_id) {
          const res = await createV2Task(formData.project_id, payload)
          savedTaskId = res.id
          
          if (res.id && formData.task_type === 'content_post') {
            await syncSocialPosts(res.id, 1)
            // Need to get the new post ID to update its data
            const posts = await getSocialPosts(res.id)
            if (posts && posts.length > 0) {
              await updateSocialPost(posts[0].id, postData)
            }
          }
        } else {
          alert('ID do projeto é necessário para criar uma nova tarefa.')
          return
        }
        
        router.refresh()
        onClose()
      } catch (err: any) {
        alert('Erro ao salvar: ' + err.message)
      }
    })
  }

  const handleGovernanceAction = async (action: 'submit' | 'approve' | 'reject') => {
    if (!currentPost) return
    
    startTransition(async () => {
      try {
        if (action === 'submit') {
          await updateSocialPost(currentPost.id, postData) // Save first
          await submitPostForReview(currentPost.id)
          setPostData(p => ({ ...p, post_status: 'awaiting_review' }))
        } else if (action === 'approve') {
          await approvePost(currentPost.id)
          setPostData(p => ({ ...p, post_status: 'approved' }))
        } else if (action === 'reject') {
          await rejectPost(currentPost.id)
          setPostData(p => ({ ...p, post_status: 'rejected' }))
        }
        
        // Refresh history
        const updatedVersions = await getPostVersions(currentPost.id)
        setVersions(updatedVersions)
        router.refresh()
      } catch (err: any) {
        alert('Erro na governança: ' + err.message)
      }
    })
  }

  const isLocked = postData.post_status === 'awaiting_review'

  const toggleAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId]
    }))
  }

  if (!open) return null

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent size="giant" className="overflow-hidden bg-[#FAFAFA] dark:bg-slate-950 shadow-3xl border-none">
        <ModalHeader showClose={false} className="p-0 border-b border-border/50">
          <div className="flex flex-col w-full">
            {/* Context Header */}
            <div className="px-8 py-4 bg-surface-muted/30 flex items-center justify-between border-b border-border/40">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Unidade de Entrega Criativa</span>
                 </div>
                 <ChevronRight size={14} className="text-text-muted/30" />
                 <div className="flex bg-surface rounded-full p-0.5 border border-border/50">
                   {(['operational', 'content_post', 'approval', 'document'] as TaskTypeV2[]).map((type) => (
                     <button
                       key={type}
                       type="button"
                       onClick={() => setFormData(p => ({ ...p, task_type: type }))}
                       className={cn(
                         "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all",
                         formData.task_type === type 
                          ? "bg-brand-primary text-white shadow-sm" 
                          : "text-text-muted hover:text-text-primary"
                       )}
                     >
                       {type === 'content_post' ? 'Social Post' : type === 'operational' ? 'Operacional' : type === 'approval' ? 'Aprovação' : 'Documento'}
                     </button>
                   ))}
                 </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-surface-muted rounded-full transition-colors"
              >
                <X size={18} className="text-text-muted" />
              </button>
            </div>

            {/* Main Title Area */}
            <div className="px-10 py-8 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <input 
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-transparent border-none text-3xl xl:text-4xl font-black font-heading tracking-tight text-text-primary focus:outline-none placeholder:text-text-muted/20 p-0"
                  placeholder="Título da Entrega..."
                  required
                />
              </div>
              <div className="flex items-center gap-4 ml-8">
                {formData.task_type === 'content_post' && (
                  <Badge variant="outline" className={cn(
                    "px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] border-2",
                    postData.post_status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    postData.post_status === 'awaiting_review' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    postData.post_status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                    'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  )}>
                    {postData.post_status === 'draft' ? 'Rascunho' : 
                     postData.post_status === 'awaiting_review' ? 'Em Revisão' :
                     postData.post_status === 'approved' ? 'Aprovado' : 'Ajuste Solicitado'}
                  </Badge>
                )}
                <div className="h-10 w-[1px] bg-border/50 mx-2" />
                <button 
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isPending}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-3 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-brand transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={16} />}
                  Salvar
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-10 border-t border-border/30">
              <div className="flex gap-8">
                <button 
                  type="button" 
                  onClick={() => setActiveTab('workflow')}
                  className={cn(
                    "py-4 text-[11px] font-black uppercase tracking-[0.2em] relative transition-colors",
                    activeTab === 'workflow' ? "text-brand-primary" : "text-text-muted hover:text-text-primary"
                  )}
                >
                  Workflow
                  {activeTab === 'workflow' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary" />}
                </button>
                {formData.task_type === 'content_post' && (
                  <>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('content')}
                      className={cn(
                        "py-4 text-[11px] font-black uppercase tracking-[0.2em] relative transition-colors",
                        activeTab === 'content' ? "text-brand-primary" : "text-text-muted hover:text-text-primary"
                      )}
                    >
                      Estúdio de Teores
                      {activeTab === 'content' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary" />}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('history')}
                      className={cn(
                        "py-4 text-[11px] font-black uppercase tracking-[0.2em] relative transition-colors",
                        activeTab === 'history' ? "text-brand-primary" : "text-text-muted hover:text-text-primary"
                      )}
                    >
                      Histórico / Versões
                      {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary" />}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="p-0 flex-1 overflow-hidden min-h-[600px]">
          <div className="flex h-full lg:flex-row flex-col">
            
            {/* Scrollable Main Area */}
            <div className="flex-1 overflow-y-auto p-10 bg-white dark:bg-slate-950/20 custom-scrollbar">
              
              {activeTab === 'workflow' && (
                <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* Basic Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-3xl bg-surface-muted/20 border border-border/40">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-text-muted">
                        <Calendar size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Prazo Final</span>
                      </div>
                      <input 
                        type="date"
                        value={formData.due_date}
                        onChange={e => setFormData(p => ({ ...p, due_date: e.target.value }))}
                        className="w-full bg-surface border border-border/80 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-brand-primary/20 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-text-muted">
                        <AlertCircle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Prioridade</span>
                      </div>
                      <select 
                        value={formData.priority}
                        onChange={e => setFormData(p => ({ ...p, priority: e.target.value as any }))}
                        className="w-full bg-surface border border-border/80 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-brand-primary/20 transition-all outline-none appearance-none"
                      >
                        {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-text-muted">
                        <Send size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Status Workflow</span>
                      </div>
                      <select 
                        value={formData.status}
                        onChange={e => setFormData(p => ({ ...p, status: e.target.value as any }))}
                        className="w-full bg-surface border border-border/80 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-brand-primary/20 transition-all outline-none appearance-none"
                      >
                        {Object.entries(TASK_STATUS_V2_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Operation Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 rounded-full bg-brand-primary" />
                      <h4 className="text-sm font-black text-text-primary uppercase tracking-widest">Diretrizes da Operação</h4>
                    </div>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                      className="w-full bg-surface-muted/10 border border-border/50 rounded-2xl p-6 text-sm leading-relaxed min-h-[200px] outline-none focus:border-brand-primary/40 transition-colors"
                      placeholder="Descreva os objetivos, referências e especificações técnicas..."
                    />
                  </div>

                  {/* Operational Team */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 rounded-full bg-indigo-500" />
                      <h4 className="text-sm font-black text-text-primary uppercase tracking-widest">Equipe Alocada</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {profiles.map(profile => {
                        const isSelected = formData.assignees.includes(profile.id)
                        return (
                          <button
                            key={profile.id}
                            type="button"
                            onClick={() => toggleAssignee(profile.id)}
                            className={cn(
                              "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                              isSelected 
                                ? "bg-white dark:bg-slate-900 border-brand-primary shadow-sm" 
                                : "bg-surface border-transparent hover:border-border/60 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                            )}
                          >
                             <Avatar name={profile.full_name} src={profile.avatar_url} size="lg" className={isSelected ? "ring-2 ring-brand-primary ring-offset-2" : ""} />
                             <div className="text-center">
                               <p className="text-[11px] font-black text-text-primary truncate max-w-[100px] leading-tight">{profile.full_name}</p>
                               <p className="text-[9px] font-black text-brand-primary uppercase mt-1 opacity-70 tracking-tighter">{profile.role || 'Expert'}</p>
                             </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-12 animate-in fade-in zoom-in-95 duration-500">
                  {/* Left: Editor */}
                  <div className="space-y-10">
                    {/* Post Parameters Row */}
                    <div className="flex items-center gap-6 p-6 rounded-2xl bg-surface-muted/30 border border-border/40">
                      <div className="space-y-2 flex-1">
                        <label className="text-[9px] font-black uppercase text-text-muted tracking-widest block">Formato do Conteúdo</label>
                        <div className="flex gap-2">
                          {(['image', 'carousel', 'video'] as PostTypeV2[]).map(type => (
                            <button
                              key={type}
                              type="button"
                              disabled={isLocked}
                              onClick={() => setPostData(p => ({ ...p, post_type: type }))}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                postData.post_type === type 
                                  ? "bg-brand-primary text-white border-brand-primary shadow-md" 
                                  : "bg-surface border-border/50 text-text-muted hover:border-border"
                              )}
                            >
                              {type === 'image' && <ImageIcon size={14} />}
                              {type === 'carousel' && <History size={14} />}
                              {type === 'video' && <Play size={14} />}
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Copy Blocks */}
                    <div className="space-y-8">
                       {/* Art Text */}
                       <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Type size={16} className="text-brand-primary" />
                            <h5 className="text-[11px] font-black uppercase tracking-[0.15em] text-text-primary">Texto Interno (Arte/Card)</h5>
                          </div>
                          <textarea 
                            value={postData.art_text}
                            disabled={isLocked}
                            onChange={e => setPostData(p => ({ ...p, art_text: e.target.value }))}
                            className="w-full bg-surface border border-border/80 rounded-2xl p-5 text-sm font-medium focus:ring-2 ring-brand-primary/10 outline-none transition-all min-h-[100px] resize-none"
                            placeholder="Escreva aqui o que deve estar escrito na imagem ou nos slides do carrossel..."
                          />
                       </div>

                       {/* Caption / Script Split */}
                       <div className="grid grid-cols-1 gap-8">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <AlignLeft size={16} className="text-brand-primary" />
                              <h5 className="text-[11px] font-black uppercase tracking-[0.15em] text-text-primary">Legenda Assistida</h5>
                            </div>
                            <textarea 
                              value={postData.caption}
                              disabled={isLocked}
                              onChange={e => setPostData(p => ({ ...p, caption: e.target.value }))}
                              className="w-full bg-surface border border-border/80 rounded-2xl p-5 text-sm font-medium focus:ring-2 ring-brand-primary/10 outline-none transition-all min-h-[180px] leading-relaxed"
                              placeholder="Escreva a legenda completa aqui..."
                            />
                          </div>

                          {postData.post_type === 'video' && (
                            <div className="space-y-4 animate-in slide-in-from-left duration-300">
                              <div className="flex items-center gap-2">
                                <Play size={16} className="text-rose-500" />
                                <h5 className="text-[11px] font-black uppercase tracking-[0.15em] text-text-primary">Roteiro / Voice-over</h5>
                              </div>
                              <textarea 
                                value={postData.script}
                                disabled={isLocked}
                                onChange={e => setPostData(p => ({ ...p, script: e.target.value }))}
                                className="w-full bg-rose-50/10 dark:bg-rose-950/10 border border-rose-200/50 dark:border-rose-800/20 rounded-2xl p-5 text-sm font-medium italic focus:ring-2 ring-rose-500/10 outline-none transition-all min-h-[120px]"
                                placeholder="Indicações de cena, falas e trilha sonora..."
                              />
                            </div>
                          )}
                       </div>

                       {/* Hashtags */}
                       <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Hash size={16} className="text-brand-primary" />
                            <h5 className="text-[11px] font-black uppercase tracking-[0.15em] text-text-primary">Ecosfera (#hashtags)</h5>
                          </div>
                          <HashtagInput 
                            hashtags={postData.hashtags} 
                            onChange={tags => setPostData(p => ({ ...p, hashtags: tags }))}
                            disabled={isLocked}
                          />
                       </div>
                    </div>
                  </div>

                  {/* Right: Media & Preview */}
                  <div className="space-y-8">
                    <div className="sticky top-0 space-y-8">
                      {/* Media Assets */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ImageIcon size={16} className="text-brand-primary" />
                            <h5 className="text-[11px] font-black uppercase tracking-[0.15em] text-text-primary">Acervo de Mídia</h5>
                          </div>
                          <button 
                             disabled={isLocked}
                             className="p-2 bg-surface hover:bg-surface-muted border border-border/50 rounded-lg text-brand-primary transition-colors disabled:opacity-30"
                             onClick={() => {
                               const url = prompt('Cole aqui a URL da imagem ou vídeo:')
                               if (url) {
                                 setPostData(p => ({
                                   ...p,
                                   media: [...p.media, { url, type: url.includes('mp4') ? 'video' : 'image', order: p.media.length }]
                                 }))
                               }
                             }}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {postData.media.map((item, idx) => (
                            <div key={idx} className="aspect-square rounded-xl bg-surface-muted border border-border/40 overflow-hidden group relative">
                              {item.type === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-black/10">
                                   <Play className="text-white drop-shadow-md" size={24} />
                                </div>
                              ) : (
                                <img src={item.url} alt="media" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                              )}
                              <button 
                                disabled={isLocked}
                                onClick={() => setPostData(p => ({ ...p, media: p.media.filter((_, i) => i !== idx) }))}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 disabled:hidden"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {postData.media.length === 0 && (
                            <div className="col-span-2 aspect-video rounded-2xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-2 text-text-muted">
                               <ImageIcon size={32} className="opacity-20" />
                               <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Nenhuma Mídia</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Preview Card Mockup */}
                      <div className="p-4 rounded-[32px] bg-white dark:bg-slate-900 shadow-2xl border border-border/30 overflow-hidden transform scale-95 origin-top">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                               <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center font-black text-brand-primary text-[10px]">DM</div>
                               <span className="text-xs font-black tracking-tight">duasmaos.estudio</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-black uppercase text-text-muted">Preview</Badge>
                         </div>
                         <div className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center relative border border-border/20">
                            {postData.media?.[0]?.url ? (
                               <img src={postData.media[0].url} alt="Mídia" className="w-full h-full object-cover" />
                            ) : (
                               <ImageIcon size={48} className="text-text-muted opacity-20" />
                            )}
                            {postData.art_text && (
                               <div className="absolute inset-0 p-8 flex items-center justify-center text-center">
                                  <p className="text-white font-black text-2xl drop-shadow-2xl leading-none uppercase tracking-tighter mix-blend-difference">{postData.art_text}</p>
                               </div>
                            )}
                         </div>
                         <div className="mt-4 p-2 space-y-2">
                            <p className="text-xs leading-relaxed line-clamp-2">
                               <span className="font-bold mr-2">duasmaos.estudio</span>
                               {postData.caption || 'Preview da legenda aparecerá aqui...'}
                            </p>
                            <p className="text-[10px] text-brand-primary font-bold">
                               {postData.hashtags.map(h => `#${h}`).join(' ')}
                            </p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3">
                    <History size={20} className="text-brand-primary" />
                    <h4 className="text-sm font-black text-text-primary uppercase tracking-widest">Evolução do Conteúdo</h4>
                  </div>
                  
                  <div className="space-y-6">
                    {versions.map((version, idx) => (
                      <div key={version.id} className="p-8 rounded-3xl bg-surface border border-border/40 hover:border-brand-primary/30 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4">
                           <Badge variant="outline" className="font-black text-[10px] uppercase">v{version.version_number}</Badge>
                        </div>
                        <div className="grid grid-cols-[120px,1fr] gap-8">
                           <div className="aspect-square rounded-2xl bg-surface-muted overflow-hidden border border-border/30">
                              {version.media_snapshot?.[0]?.url && (
                                <img src={version.media_snapshot[0].url} alt={`Versão ${version.version_number}`} className="w-full h-full object-cover" />
                              )}
                           </div>
                           <div className="space-y-4">
                              <div className="flex items-center gap-2 text-text-muted text-[10px] font-bold">
                                <Calendar size={12} />
                                {new Date(version.created_at).toLocaleString('pt-BR')}
                              </div>
                              <p className="text-sm leading-relaxed text-text-secondary line-clamp-3 italic">
                                &quot;{version.copy_snapshot?.caption || 'Sem legenda nesta versão'}&quot;
                              </p>
                              {version.copy_snapshot?.art_text && (
                                <div className="flex items-center gap-2">
                                   <Badge className="bg-sand-light text-text-primary text-[9px] uppercase hover:bg-sand-light">Texto Arte: {version.copy_snapshot.art_text}</Badge>
                                </div>
                              )}
                              <button 
                                onClick={() => {
                                  setPostData(p => ({
                                    ...p,
                                    caption: version.copy_snapshot.caption || '',
                                    art_text: version.copy_snapshot.art_text || '',
                                    script: version.copy_snapshot.script || '',
                                    hashtags: version.copy_snapshot.hashtags || [],
                                    media: version.media_snapshot || []
                                  }))
                                  setActiveTab('content')
                                }}
                                className="text-[10px] font-black uppercase tracking-widest text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"
                              >
                                Restaurar Versão <ChevronRight size={12} />
                              </button>
                           </div>
                        </div>
                      </div>
                    ))}
                    {versions.length === 0 && (
                      <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border/40 rounded-[40px] gap-4 text-text-muted">
                        <History size={48} className="opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Nenhum snapshot arquivado</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Right Panel: Governance (Integrated Control) */}
            {formData.task_type === 'content_post' && (
              <div className="w-full lg:w-[400px] border-l border-border/30 bg-surface-muted/10 p-10 flex flex-col gap-10">
                
                {/* Visual Status Header */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Ciclo de Entrega</h4>
                  <div className={cn(
                    "p-8 rounded-[40px] flex flex-col items-center justify-center gap-4 border-2 shadow-2xl transition-all animate-in fade-in zoom-in duration-700",
                    postData.post_status === 'approved' ? 'bg-emerald-500 text-white border-white/20' :
                    postData.post_status === 'awaiting_review' ? 'bg-amber-500 text-white border-white/20' :
                    postData.post_status === 'rejected' ? 'bg-rose-600 text-white border-white/20' :
                    'bg-slate-950 text-white border-white/10 shadow-slate-900/50'
                  )}>
                    {postData.post_status === 'approved' ? <CheckCircle2 size={48} className="animate-bounce" /> :
                     postData.post_status === 'awaiting_review' ? <MessageSquare size={48} className="animate-pulse" /> :
                     postData.post_status === 'rejected' ? <AlertCircle size={48} /> : <ImageIcon size={48} className="opacity-20" />}
                    
                    <div className="text-center">
                      <p className="text-lg font-black tracking-tight leading-none uppercase">
                        {postData.post_status === 'draft' ? 'Em Produção' : 
                         postData.post_status === 'awaiting_review' ? 'Em Auditoria' :
                         postData.post_status === 'approved' ? 'Aprovado' : 'Ação Necessária'}
                      </p>
                      <p className="text-[10px] font-black uppercase opacity-60 mt-1 tracking-widest">
                        {postData.post_status === 'draft' ? 'Aguardando envio' : 
                         postData.post_status === 'awaiting_review' ? 'Pendente de aprovação' :
                         postData.post_status === 'approved' ? 'Pronto para publicação' : 'Ajustes solicitados'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Governance Actions list */}
                <div className="space-y-4 flex-1">
                  <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Governança</h4>
                  
                  {postData.post_status === 'draft' && (
                    <button
                      onClick={() => handleGovernanceAction('submit')}
                      disabled={isPending}
                      className="w-full flex items-center justify-between p-6 rounded-3xl bg-white dark:bg-slate-900 border border-border/50 hover:border-brand-primary group transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                          <Send size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black uppercase tracking-widest text-text-primary">Enviar p/ Revisão</p>
                          <p className="text-[10px] text-text-muted font-bold">Notifica o estrategista</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-text-muted group-hover:text-brand-primary" />
                    </button>
                  )}

                  {postData.post_status === 'awaiting_review' && (
                    <div className="grid grid-cols-1 gap-4">
                      <button
                        onClick={() => handleGovernanceAction('approve')}
                        disabled={isPending}
                        className="w-full flex items-center justify-between p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 text-emerald-600 hover:text-white group transition-all"
                      >
                         <div className="flex items-center gap-4">
                            <CheckCircle2 size={24} />
                            <div className="text-left">
                               <p className="text-xs font-black uppercase tracking-widest">Aprovar Conteúdo</p>
                               <p className="text-[10px] opacity-70 font-bold">Bloqueia edições e finaliza</p>
                            </div>
                         </div>
                      </button>
                      <button
                        onClick={() => handleGovernanceAction('reject')}
                        disabled={isPending}
                        className="w-full flex items-center justify-between p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500 text-rose-600 hover:text-white group transition-all"
                      >
                         <div className="flex items-center gap-4">
                            <AlertCircle size={24} />
                            <div className="text-left">
                               <p className="text-xs font-black uppercase tracking-widest">Solicitar Ajuste</p>
                               <p className="text-[10px] opacity-70 font-bold">Retorna para &apos;Ajuste&apos;</p>
                            </div>
                         </div>
                      </button>
                    </div>
                  )}

                  {postData.post_status === 'rejected' && (
                     <button
                        onClick={() => handleGovernanceAction('submit')}
                        disabled={isPending}
                        className="w-full flex items-center justify-between p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500 text-amber-600 hover:text-white group transition-all"
                      >
                         <div className="flex items-center gap-4">
                            <Send size={24} />
                            <div className="text-left">
                               <p className="text-xs font-black uppercase tracking-widest">Re-enviar p/ Revisão</p>
                               <p className="text-[10px] opacity-70 font-bold">Nova versão arquivada</p>
                            </div>
                         </div>
                      </button>
                  )}

                  {postData.post_status === 'approved' && (
                     <div className="p-8 rounded-[40px] bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-500/20 text-center space-y-4">
                        <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Entrega Concluída</p>
                        <p className="text-[10px] font-medium text-emerald-600/70 dark:text-emerald-400/50">Este conteúdo está selado e pronto para o agendamento em redes sociais.</p>
                     </div>
                  )}
                </div>

                {/* Audit Tip */}
                <div className="mt-auto p-6 rounded-[32px] bg-white dark:bg-slate-900 border border-border/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-2 flex items-center gap-2">
                    <AlertCircle size={10} /> Dica de Governança
                  </p>
                  <p className="text-[11px] font-medium text-text-secondary leading-relaxed opacity-80">
                    A aprovação final impossibilita edições retroativas nesta versão para manter a integridade editorial.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>

  )
}

'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
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
import { TaskDeliveryFileUploader } from '@/components/tasks/TaskDeliveryFileUploader'
import { syncSocialPosts, updateV2Task, getTaskFiles } from '@/app/dashboard/v2/task-actions'
import { updateTaskStatus } from '@/app/dashboard/tasks/actions'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface TaskDetailsClientProps {
  task: any // Typed in page.tsx as V2Task + Relations
  currentUser: { id: string, email?: string }
}

export function TaskDetailsClient({ task, currentUser }: TaskDetailsClientProps) {
  const [selectedPost, setSelectedPost] = useState<V2SocialPost | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isEditingBriefing, setIsEditingBriefing] = useState(false)
  const [briefingContent, setBriefingContent] = useState(task.html_content || '')
  const [isSavingBriefing, setIsSavingBriefing] = useState(false)

  // Delivery State
  const [taskFiles, setTaskFiles] = useState<any[]>([])
  const [deliveryContent, setDeliveryContent] = useState(task.delivery_content || '')
  const [deliveryLink, setDeliveryLink] = useState(task.delivery_link || '')
  const [isSavingDelivery, setIsSavingDelivery] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  const router = useRouter()

  React.useEffect(() => {
    getTaskFiles(task.id).then(files => setTaskFiles(files || [])).catch(console.error)
  }, [task.id])

  const handleAddPost = async () => {
    // Simply add one more post to the current list
    await syncSocialPosts(task.id, sortedPosts.length + 1)
    router.refresh()
  }

  const handleOpenPost = (post: V2SocialPost) => {
    setSelectedPost(post)
    setIsEditorOpen(true)
  }

  const handleSaveBriefing = async () => {
    setIsSavingBriefing(true)
    try {
      await updateV2Task(task.id, task.project_id, { html_content: briefingContent })
      setIsEditingBriefing(false)
      router.refresh()
    } catch (err: any) {
      alert('Erro ao salvar briefing: ' + err.message)
    } finally {
      setIsSavingBriefing(false)
    }
  }

  const handleSaveDelivery = async () => {
    setIsSavingDelivery(true)
    try {
      await updateV2Task(task.id, task.project_id, { 
        delivery_content: deliveryContent,
        delivery_link: deliveryLink 
      })
      router.refresh()
    } catch (err: any) {
      alert('Erro ao salvar entrega: ' + err.message)
    } finally {
      setIsSavingDelivery(false)
    }
  }

  const reloadFiles = async () => {
    try {
      const files = await getTaskFiles(task.id)
      setTaskFiles(files || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleFinalizeTask = async () => {
    setIsFinalizing(true)
    try {
      await updateTaskStatus(task.id, 'done')
      router.refresh()
    } catch (err: any) {
      alert('Erro ao finalizar tarefa: ' + err.message)
    } finally {
      setIsFinalizing(false)
    }
  }

  const sortedPosts = [...(task.posts || [])].sort((a, b) => a.order - b.order)

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
            onClick={handleAddPost}
            className="flex items-center gap-2 px-4 py-2 bg-surface text-text-primary border border-border rounded-lg font-bold text-sm hover:border-text-muted transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-brand-primary" /> Adicionar Posts
          </button>
          {task.status !== 'done' && (
            <button 
              onClick={handleFinalizeTask}
              disabled={isFinalizing}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-bold text-sm hover:bg-brand-secondary transition-all shadow-brand disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" /> {isFinalizing ? 'Finalizando...' : 'Finalizar Task'}
            </button>
          )}
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="flex flex-1 gap-6 w-full min-h-0 px-4 pb-6">
        
        {/* Main Production Area (Scrollable parent) */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          
          {/* Entrega Module */}
          <div className="shrink-0 bg-surface border border-border rounded-2xl overflow-hidden flex flex-col max-w-full">
            <div className="px-6 py-4 border-b border-border bg-surface-muted/10 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-text-primary flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Entrega da Tarefa
              </h2>
              <button 
                onClick={handleSaveDelivery}
                disabled={isSavingDelivery}
                className="px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-md hover:bg-emerald-600 transition-colors shadow-sm"
              >
                {isSavingDelivery ? 'Salvando...' : 'Salvar Entrega'}
              </button>
            </div>
            
            <div className="p-6 flex flex-col xl:flex-row gap-6">
              <div className="flex-1 flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-900 border border-border/80 rounded-xl overflow-hidden w-full max-w-full shrink">
                  <ReactQuill 
                    theme="snow" 
                    value={deliveryContent} 
                    onChange={setDeliveryContent}
                    placeholder="Escreva os detalhes, direcionamentos e considerações finais da entrega..."
                    className="min-h-[120px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 block">Link Externo (Drive, Figma, Trello, etc)</label>
                  <input 
                    type="url"
                    value={deliveryLink}
                    onChange={(e) => setDeliveryLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-surface-muted/10 border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-brand-primary/40 outline-none transition-colors"
                  />
                </div>
              </div>
              
              <div className="w-full xl:w-[350px] shrink-0 flex flex-col gap-4 border-t xl:border-t-0 xl:border-l border-border pt-4 xl:pt-0 xl:pl-6">
                <TaskDeliveryFileUploader 
                  taskId={task.id}
                  projectId={task.project_id}
                  clientId={task.project?.client_id}
                  currentUser={currentUser}
                  onUploadComplete={reloadFiles}
                />
                
                {taskFiles.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Arquivos Anexados</h5>
                    <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                      {taskFiles.map(f => (
                        <a 
                          key={f.id} 
                          href={f.public_url || '#'} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          className="flex items-center justify-between p-2 rounded-lg border border-border bg-surface-muted/20 hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-colors group text-xs text-text-secondary"
                        >
                          <span className="truncate flex-1 font-medium group-hover:text-brand-primary transition-colors">{f.name}</span>
                          <span className="text-[10px] text-text-muted ml-2 opacity-50 group-hover:opacity-100 uppercase font-bold">{f.file_type?.split('/').pop()}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col bg-surface-muted/10 border border-border rounded-2xl overflow-hidden relative shrink-0">
            <div className="h-14 py-3 shrink-0 border-b border-border bg-surface flex items-center px-6 justify-between">
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
                         Esta tarefa ainda não possui posts. Use o botão <b>Adicionar Posts</b> para gerar a grade base.
                       </p>
                    </div>
                 </div>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Sidebar: Briefing & Revisions */}
        <div className="w-[340px] shrink-0 space-y-6 flex flex-col min-h-0 h-full overflow-y-auto custom-scrollbar pb-6 pr-2">
           <Card className="p-6 bg-surface-muted/20 border-border flex flex-col shrink-0">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-primary" /> Briefing da Task
              </h4>
              
              {isEditingBriefing ? (
                <div className="flex flex-col gap-3">
                  <div className="bg-white dark:bg-slate-900 rounded-md overflow-hidden border border-border/80">
                     <ReactQuill 
                       theme="snow" 
                       value={briefingContent} 
                       onChange={setBriefingContent}
                       placeholder="Escreva livremente aqui..."
                       className="min-h-[150px]"
                     />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSaveBriefing}
                      disabled={isSavingBriefing}
                      className="px-3 py-1.5 bg-brand-primary text-white text-xs font-bold rounded-md hover:bg-brand-secondary transition-colors"
                    >
                      {isSavingBriefing ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button 
                      onClick={() => {
                        setBriefingContent(task.html_content || '')
                        setIsEditingBriefing(false)
                      }}
                      className="px-3 py-1.5 bg-surface text-text-primary text-xs font-bold rounded-md border border-border hover:bg-surface-muted transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  {(task.html_content || task.description) ? (
                    <div 
                      className="text-sm text-text-secondary leading-relaxed custom-scrollbar prose prose-sm dark:prose-invert max-w-none p-1 rounded-lg transition-colors"
                    >
                      {task.html_content ? (
                        <div dangerouslySetInnerHTML={{ __html: task.html_content }} />
                      ) : (
                        <p className="whitespace-pre-wrap">{task.description}</p>
                      )}
                    </div>
                  ) : (
                    <div 
                      onClick={() => setIsEditingBriefing(true)}
                      className="w-full flex-col cursor-pointer border-2 border-dashed border-border/60 hover:border-brand-primary/40 hover:bg-brand-primary/5 rounded-xl p-6 flex items-center justify-center text-center transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileText size={16} className="text-text-muted group-hover:text-brand-primary" />
                      </div>
                      <p className="text-xs font-bold text-text-primary">Adicionar Descrição</p>
                      <p className="text-[10px] text-text-muted mt-1 max-w-[200px]">Use o editor de texto rico para detalhar a tarefa.</p>
                    </div>
                  )}

                  {(task.html_content || task.description) && (
                    <button 
                      onClick={() => setIsEditingBriefing(true)}
                      className="absolute -top-11 right-0 opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 bg-surface border border-border rounded-md text-[10px] font-bold text-text-primary hover:text-brand-primary shadow-sm flex items-center gap-1.5"
                    >
                      <FileText size={12} /> Editar
                    </button>
                  )}
                </div>
              )}
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


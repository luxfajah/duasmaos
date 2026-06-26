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
  finalPaymentConfirmed?: boolean
  isClient?: boolean
}

export function TaskDetailsClient({ task, currentUser, finalPaymentConfirmed = true, isClient = false }: TaskDetailsClientProps) {
  const isEditorialGrid = task.project?.workflow_type !== 'social_media'
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
      <div className="flex justify-between items-start mb-6 px-4 shrink-0 mt-2">
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <Badge variant="outline" className="text-[10px] font-bold tracking-widest uppercase bg-surface border-border text-text-secondary">
              {task.task_type || 'CRM'} STUDIO
            </Badge>
            <Badge 
              variant="outline"
              className={cn(
                "px-2 py-0.5 text-[9px] uppercase font-bold tracking-widest border-transparent",
                task.status === 'done' ? 'bg-success/10 text-success' : 
                task.status === 'in_progress' ? 'bg-brand-primary/10 text-brand-primary' : 
                'bg-surface-muted text-text-muted'
              )}
            >
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-text-primary heading-editorial">
            {task.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-[11px] font-medium text-text-secondary items-center pt-1">
            <div className="flex items-center gap-1.5 bg-surface-muted/50 px-2 py-1 rounded-md">
              <History className="w-3.5 h-3.5 opacity-70" /> 
              <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Sem prazo'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-primary/5 px-2 py-1 rounded-md text-brand-primary">
               <LayoutGrid className="w-3.5 h-3.5 opacity-70" />
               <span className="font-bold">{task.project?.name}</span>
            </div>
            <div className="flex items-center gap-1.5 capitalize text-text-muted">
              <FileText className="w-3.5 h-3.5 opacity-70" /> 
              <span>{task.stage?.name || 'Sem Etapa'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted">
               <Users className="w-3.5 h-3.5 opacity-70" /> 
               <span>{task.project?.client?.name}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {isEditorialGrid && (
            <button 
              onClick={handleAddPost}
              className="flex items-center gap-2 px-4 py-2 bg-surface text-brand-primary border border-border rounded-xl font-bold text-xs hover:bg-brand-primary/5 hover:border-brand-primary/30 transition-all shadow-sm h-9"
            >
              <Plus className="w-4 h-4" /> Adicionar Posts
            </button>
          )}
          {task.status !== 'done' && (
            <button 
              onClick={handleFinalizeTask}
              disabled={isFinalizing}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl font-bold text-xs hover:bg-brand-primary/90 transition-all shadow-brand disabled:opacity-50 disabled:cursor-not-allowed h-9"
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
          <div className={cn(
            "glass-panel rounded-3xl overflow-hidden flex flex-col max-w-full border border-border shadow-sm bg-white dark:bg-surface/30 backdrop-blur-xl relative",
            isEditorialGrid ? "shrink-0" : "flex-1 min-h-0"
          )}>
            <div className="px-6 py-5 border-b border-border/30 bg-surface-muted/10 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-text-primary">
                  Módulo de Entrega
                </h2>
              </div>
              <button 
                onClick={handleSaveDelivery}
                disabled={isSavingDelivery}
                className="px-5 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingDelivery ? 'Salvando...' : 'Salvar Arquivos e Link'}
              </button>
            </div>
            
            <div className="flex flex-col xl:flex-row relative z-10">
              <div className="flex-1 flex flex-col">
                <div className="w-full flex-1 flex flex-col focus-within:bg-surface-muted/5 transition-colors">
                  <ReactQuill 
                    theme="snow" 
                    value={deliveryContent} 
                    onChange={setDeliveryContent}
                    placeholder="Escreva os detalhes, direcionamentos e considerações finais da entrega..."
                    className="custom-quill-editor-seamless flex-1 flex flex-col min-h-[250px]"
                  />
                </div>
                <div className="p-6 md:p-8 pt-4 border-t border-border/30 bg-surface-muted/5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1 block mb-2">Link Externo (Drive, Figma, Trello)</label>
                  {isClient && !finalPaymentConfirmed && deliveryLink ? (
                    <div className="w-full bg-red-500/5 border border-red-500/20 text-red-500 rounded-xl px-4 py-3 text-sm flex items-center justify-between cursor-not-allowed">
                      <span className="opacity-50">••••••••••••••••••••••••••••</span>
                      <span className="text-[9px] bg-red-500/10 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Aguardando Pagamento</span>
                    </div>
                  ) : (
                    <div className="relative flex items-center">
                      <ExternalLink className="absolute left-3 w-4 h-4 text-text-muted" />
                      <input 
                        type="url"
                        value={deliveryLink}
                        onChange={(e) => setDeliveryLink(e.target.value)}
                        placeholder="https://..."
                        disabled={isClient}
                        className="w-full bg-surface-muted/30 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-5 border-t xl:border-t-0 xl:border-l border-border/50 bg-white/40 dark:bg-black/20 p-6 md:p-8">
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
                      {taskFiles.map(f => {
                        const ext = f.name.split('.').pop()?.toLowerCase() || ''
                        const editableExtensions = ['psd', 'ai', 'indd', 'fig', 'sketch', 'zip', 'rar', 'cdr', 'pdf', 'eps']
                        const isBlocked = isClient && editableExtensions.includes(ext) && !finalPaymentConfirmed
                        
                        if (isBlocked) {
                          return (
                            <div 
                              key={f.id} 
                              className="flex items-center justify-between p-2 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-500/80 cursor-not-allowed"
                              title="Download bloqueado até a confirmação do pagamento final"
                            >
                              <span className="truncate flex-1 font-medium">{f.name} (Bloqueado)</span>
                              <span className="text-[9px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Sem Pagamento Final</span>
                            </div>
                          )
                        }

                        return (
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
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isEditorialGrid && (
            <div className="flex flex-col bg-white dark:bg-surface/30 border border-border/50 rounded-3xl overflow-hidden relative shrink-0 shadow-sm">
              <div className="h-14 py-3 shrink-0 border-b border-border/50 bg-surface-muted/30 flex items-center px-6 justify-between">
                <div className="flex items-center gap-3">
                   <h2 className="text-[11px] font-bold uppercase tracking-widest text-text-primary flex items-center gap-2">
                     <LayoutGrid className="w-4 h-4 text-brand-primary" /> Grade Editorial
                   </h2>
                   <div className="w-px h-4 bg-border mx-1" />
                   <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                     {sortedPosts.length} Posts encontrados
                   </span>
                </div>
                
                <div className="flex gap-1 bg-surface-muted/50 p-1 rounded-xl border border-border/50">
                   <button className="p-1.5 bg-white dark:bg-surface rounded-lg shadow-sm text-brand-primary transition-all"><LayoutGrid size={14}/></button>
                   <button className="p-1.5 text-text-muted hover:text-text-primary transition-colors"><List size={14}/></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedPosts.map(post => (
                     <PostCard 
                       key={post.id} 
                       post={post} 
                       onClick={handleOpenPost} 
                     />
                  ))}

                  {sortedPosts.length === 0 && (
                     <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 bg-surface-muted rounded-full flex items-center justify-center mb-2">
                           <LayoutGrid size={32} className="text-text-muted/50" />
                        </div>
                        <div className="max-w-xs">
                           <h3 className="text-sm font-bold text-text-primary">Container Editorial Vazio</h3>
                           <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
                             Esta tarefa ainda não possui posts. Use o botão <b>Adicionar Posts</b> para gerar a grade base.
                           </p>
                        </div>
                     </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Briefing & Revisions */}
        <div className="w-[340px] shrink-0 flex flex-col gap-6 min-h-0 h-full overflow-y-auto custom-scrollbar pb-6 pr-2">
           <div className="p-5 bg-surface-muted/10 border border-border rounded-3xl flex flex-col shrink-0 relative overflow-hidden">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-primary" /> Briefing
              </h4>
              
              {isEditingBriefing ? (
                <div className="flex flex-col gap-3 relative z-10 w-full h-full flex-1">
                  <div className="bg-white/50 dark:bg-black/20 rounded-2xl overflow-hidden border border-border/30 focus-within:ring-2 focus-within:ring-brand-primary/20 transition-shadow flex-1 flex flex-col">
                     <ReactQuill 
                       theme="snow" 
                       value={briefingContent} 
                       onChange={setBriefingContent}
                       placeholder="Escreva livremente aqui..."
                       className="custom-quill-editor-seamless flex-1 flex flex-col min-h-[200px]"
                     />
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <button 
                      onClick={() => {
                        setBriefingContent(task.html_content || '')
                        setIsEditingBriefing(false)
                      }}
                      className="px-4 py-2 bg-transparent text-text-secondary text-xs font-bold rounded-xl hover:bg-surface-muted transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSaveBriefing}
                      disabled={isSavingBriefing}
                      className="px-5 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-secondary transition-colors shadow-sm active:scale-95"
                    >
                      {isSavingBriefing ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group relative z-10 flex-1">
                  {(task.html_content || task.description) ? (
                    <div 
                      className="text-sm text-text-secondary leading-relaxed custom-scrollbar prose prose-sm dark:prose-invert max-w-none p-4 rounded-2xl transition-colors bg-white/60 dark:bg-black/10 border border-white/50 dark:border-white/5 shadow-sm"
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
                      className="w-full flex-col cursor-pointer bg-white/40 dark:bg-black/10 hover:bg-white/80 dark:hover:bg-black/30 border border-white/60 dark:border-white/5 shadow-sm rounded-3xl p-8 flex items-center justify-center text-center transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand-primary/20 transition-all duration-300">
                        <FileText size={18} className="text-brand-primary" />
                      </div>
                      <p className="text-[13px] font-bold text-text-primary">Definir o Briefing</p>
                      <p className="text-[11px] text-text-muted mt-2 leading-relaxed px-2">
                        Clique para documentar os detalhes, links e guias da tarefa.
                      </p>
                    </div>
                  )}

                  {(task.html_content || task.description) && (
                    <button 
                      onClick={() => setIsEditingBriefing(true)}
                      className="absolute -top-10 right-0 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-surface rounded-lg text-[10px] font-bold text-text-primary hover:text-brand-primary border border-border/50 shadow-sm flex items-center gap-1.5"
                    >
                      <FileText size={12} /> Editar
                    </button>
                  )}
                </div>
              )}
           </div>

           <div className="flex-1 bg-surface-elevated/50 border border-border rounded-3xl overflow-hidden flex flex-col relative shadow-inner">
              <div className="p-5 flex justify-between items-center shrink-0 relative z-10">
                 <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">Histórico</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar text-xs relative z-10 flex flex-col items-center justify-center text-center">
                 <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center mb-3">
                    <History size={16} className="text-text-muted opacity-50" />
                 </div>
                 <h5 className="font-semibold text-text-primary mb-1">Sem Histórico</h5>
                 <p className="text-text-muted leading-relaxed max-w-[200px]">
                    Nenhuma atividade foi registrada nesta tarefa ainda. (O fluxo de aprovação é por post).
                 </p>
              </div>
           </div>
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


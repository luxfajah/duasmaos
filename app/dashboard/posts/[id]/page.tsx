import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from "next/link";
import { EditorialHeader } from "@/components/brand/EditorialHeader";
import { ApprovalTimeline } from "@/components/brand/ApprovalTimeline";
import { CommentBlock } from "@/components/brand/CommentBlock";
import { StatusPill } from "@/components/brand/StatusPill";
import { Button } from "@/components/ui/button";
import { getPostDetail, getPostComments } from "../../actions";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  let post;
  let comments: any[] = [];

  try {
    post = await getPostDetail(params.id);
    comments = await getPostComments(params.id);
  } catch (e) {
    notFound();
  }

  return (
    <div className="space-y-16 animate-in fade-in-50 duration-500 pb-32">
      <div>
         <Link href="/dashboard/posts" className="text-xs uppercase tracking-widest text-text-muted font-bold hover:text-text-primary mb-4 inline-block">
           ← Voltar ao índice de pautas
         </Link>
         <EditorialHeader 
           title={post.title} 
           context={`${post.clients?.name} • Pauta Operacional`}
         />
      </div>
      
      <div className="flex flex-col lg:flex-row gap-16">
        <div className="lg:w-2/3 space-y-24">
          <section>
            <div className="flex items-center justify-between mb-8 pb-4">
               <h3 className="font-sans font-semibold text-text-primary uppercase tracking-widest text-xs">Bloco Estratégico (Copy)</h3>
               <StatusPill status={post.status} />
            </div>
            
            <div className="bg-surface relative pt-8 pb-12 px-8 md:px-12 border-y border-border">
              <div className="absolute top-0 left-0 w-full h-px bg-border/50"></div>
              <div className="font-serif text-xl leading-relaxed text-text-primary space-y-6 whitespace-pre-wrap">
                {post.copy_content || "Nenhum conteúdo de copy definido para esta pauta ainda."}
              </div>
            </div>

            <div className="mt-8">
              {comments.filter(c => c.stage === 'copy').map((comment: any) => (
                <CommentBlock 
                  key={comment.id}
                  author={comment.profiles?.full_name || 'Usuário'} 
                  role={comment.profiles?.role} 
                  stage="Revisão Verbal" 
                  date={new Date(comment.created_at).toLocaleDateString('pt-BR')} 
                  content={comment.text} 
                />
              ))}
              {comments.filter(c => c.stage === 'copy').length === 0 && (
                <p className="text-sm text-text-muted italic">Nenhum comentário na revisão verbal.</p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8 pb-4">
               <h3 className="font-sans font-semibold text-text-primary uppercase tracking-widest text-xs">Aprovação Visual (Design)</h3>
               <StatusPill status={post.status} />
            </div>
            <div className="bg-surface-muted min-h-[500px] border border-border flex items-center justify-center p-12 relative overflow-hidden group">
               {post.design_url ? (
                 <img src={post.design_url} alt="Design Preview" className="max-w-full h-auto shadow-lg z-10" />
               ) : (
                 <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-white border border-border/50 shadow-md flex items-center justify-center text-text-muted transition-transform duration-700 ease-out z-10 group-hover:scale-[1.02]">
                   <span className="font-serif text-2xl tracking-tight text-border-strong">Aguardando Design</span>
                 </div>
               )}
               <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--border)) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            </div>

            <div className="mt-8">
              {comments.filter(c => c.stage === 'design').map((comment: any) => (
                <CommentBlock 
                  key={comment.id}
                  author={comment.profiles?.full_name || 'Usuário'} 
                  role={comment.profiles?.role} 
                  stage="Revisão Visual" 
                  date={new Date(comment.created_at).toLocaleDateString('pt-BR')} 
                  content={comment.text} 
                />
              ))}
            </div>
          </section>
        </div>

        <div className="lg:w-1/3">
          <div className="sticky top-28 space-y-12">
            
            <ApprovalTimeline status={post.status} />
            
            <div className="bg-surface border border-border p-8 space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary mb-2">Decisão de Pauta</p>
                <p className="text-xs text-text-muted">A aprovação sela o arquivo final e envia para a área de publicação.</p>
              </div>
              <div className="space-y-3">
                <Button variant="primary" className="w-full h-12 shadow-sm font-semibold">
                  Aprovar Versão
                </Button>
                <Button variant="outline" className="w-full h-12 text-danger hover:bg-danger/5 hover:text-danger hover:border-danger/30 font-medium">
                  Solicitar Ajustes
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getV2AllTasks } from '../../v2/actions'
import { EditorialHeader } from '@/components/brand/EditorialHeader'
import { ArrowLeft, Clock, CheckCircle2, User } from 'lucide-react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'

export default async function TaskLogPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const allTasks = await getV2AllTasks()
  const completedTasks = allTasks
    .filter(t => t.status === 'done')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto pb-32">
      <div className="flex flex-col gap-8 h-full">
        {/* Back Button */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface hover:bg-surface-muted text-text-muted hover:text-text-primary transition-colors border border-border shadow-sm text-sm font-bold tracking-wide uppercase"
          >
            <ArrowLeft size={16} />
            Voltar ao Dashboard
          </Link>
        </div>

        <EditorialHeader 
          title="Log de Atividades" 
          subtitle="Histórico completo de tarefas concluídas pela agência" 
        />

        <div className="flex flex-col gap-4">
          {completedTasks.length === 0 ? (
            <div className="glass rounded-[32px] p-12 text-center border border-border">
               <Clock size={48} className="mx-auto text-text-muted mb-4 opacity-20" />
               <p className="text-text-muted font-medium">Nenhuma tarefa concluída encontrada no sistema.</p>
            </div>
          ) : (
            completedTasks.map((task) => (
              <div 
                key={task.id} 
                className="glass rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-border/50 hover:border-brand-primary/30 transition-all"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="truncate">
                    <h3 className="text-lg font-bold text-text-primary truncate">{task.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-text-muted font-medium mt-1">
                       <span className="px-2 py-0.5 rounded-full bg-surface-muted border border-border font-black uppercase tracking-widest text-[8px]">
                         {task.v2_projects?.name || 'Projeto Geral'}
                       </span>
                       <span>•</span>
                       <span>Concluído em: {new Date(task.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                       <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-0.5">Responsável</p>
                       <p className="text-sm font-bold text-text-primary leading-none capitalize">{task.profiles?.full_name || 'IA'}</p>
                    </div>
                    <Avatar 
                      name={task.profiles?.full_name || 'IA'} 
                      src={task.profiles?.avatar_url || undefined} 
                      size="md"
                      className="ring-2 ring-brand-primary/10"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

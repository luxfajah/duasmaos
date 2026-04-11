import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getV2ProjectById, getV2AllProjects } from '@/app/dashboard/v2/actions'
import { EditorialHeader } from '@/components/brand/EditorialHeader'
import { DeadlinesEditorClient } from '@/components/projects/DeadlinesEditorClient'
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: { id: string }
}

export default async function ProjectDeadlinesPage({ params }: Props) {
  const supabase = createClient()

  // Protect route
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch V2 Project Data (already includes stages and tasks)
  const [project, allProjects] = await Promise.all([
    getV2ProjectById(params.id),
    getV2AllProjects()
  ])

  if (!project) notFound()

  // In V2, project object returns 'stages' and 'tasks' directly
  const stages = project.stages || []
  const tasks = project.tasks || []

  // Filter tasks to only include the ones that are not strictly archived
  const validTasks = tasks.filter((t: any) => t.status !== 'archived')

  // Fetch user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'client'

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-8">
        {/* Back Button */}
        <div>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface hover:bg-surface-muted text-text-muted hover:text-text-primary transition-colors border border-border shadow-sm text-sm font-bold tracking-wide uppercase"
          >
            <ArrowLeftIcon size={16} />
            Voltar ao Projeto
          </Link>
        </div>

        <EditorialHeader 
          title="Gestão de Prazos e Equipes" 
          subtitle="Ajuste os prazos das entregas e gerencie a equipe deste projeto" 
        />

        {/* Project Name Context */}
        <div className="bg-sand-light/10 dark:bg-slate-900/40 p-6 rounded-[28px] border border-sand-dark/10">
          <p className="text-sm text-text-muted font-bold uppercase tracking-widest mb-1">Pipeline Ativo</p>
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-black font-heading text-text-primary tracking-tight">{project.name}</h2>
            <div className="px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-widest">
              Acesso: {userRole}
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <DeadlinesEditorClient 
          projectId={project.id}
          stages={stages}
          tasks={validTasks}
          userRole={userRole}
          projectData={project}
          allProjects={allProjects}
        />
      </div>
    </div>
  )
}

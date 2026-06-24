'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown'
import { ChevronDown, FolderKanban, Check, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectSelectorProps {
  currentProjectId: string
  projects: any[]
}

export function ProjectSelector({ currentProjectId, projects }: ProjectSelectorProps) {
  const router = useRouter()
  const currentProject = projects.find(p => p.id === currentProjectId)

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-surface hover:bg-surface-muted border border-border transition-all group shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
              <FolderKanban size={18} />
            </div>
            <div className="flex flex-col items-start translate-y-[1px]">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted leading-none mb-1">Projeto Selecionado</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-primary truncate max-w-[200px]">
                  {currentProject?.name || 'Selecionar Projeto'}
                </span>
                <ChevronDown size={14} className="text-text-muted group-data-[state=open]:rotate-180 transition-transform" />
              </div>
            </div>
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-[300px] p-2 glass">
          <DropdownMenuLabel>Seus Projetos Ativos</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-[300px] overflow-y-auto">
            {projects.map((project) => (
              <DropdownMenuItem 
                key={project.id}
                onClick={() => router.push(`/dashboard/projects/${project.id}/deadlines`)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors",
                  project.id === currentProjectId ? "bg-brand-primary/10 text-brand-primary" : "hover:bg-surface-muted"
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold">{project.name}</span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">
                    {project.status || 'Ativo'} • {project.progress}% concluído
                  </span>
                </div>
                {project.id === currentProjectId && <Check size={16} />}
              </DropdownMenuItem>
            ))}
          </div>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => router.push('/dashboard/projects?new=true')}
            className="flex items-center gap-2 p-3 text-brand-primary font-bold text-xs uppercase tracking-widest hover:bg-brand-primary/5 cursor-pointer rounded-xl"
          >
            <Plus size={16} />
            Novo Projeto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

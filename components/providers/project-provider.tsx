'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Using minimal typing corresponding to ExtendedProject
type BaseProject = {
  id: string
  name: string
  client_id?: string
  status?: string
}

interface ProjectContextType {
  projects: BaseProject[]
  selectedProject: BaseProject | null
  setSelectedProject: (project: BaseProject | null) => void
  setProjects: (projects: BaseProject[]) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<BaseProject[]>([])
  const [selectedProject, setSelectedProjectState] = useState<BaseProject | null>(null)

  // Initialization & Hydration logic
  useEffect(() => {
    if (projects.length === 0) return

    const storedId = localStorage.getItem('duasmaos_last_project')
    
    // priority: match stored id -> else first active project -> else first project
    let initialProject = null
    
    if (storedId) {
      initialProject = projects.find(p => p.id === storedId)
    }

    if (!initialProject) {
      initialProject = projects.find(p => p.status !== 'completed' && p.status !== 'delayed') || projects[0]
    }
    
    if (initialProject && (!selectedProject || selectedProject.id !== initialProject.id)) {
      setSelectedProjectState(initialProject)
    }
  }, [projects]) // run when projects are safely loaded

  const setSelectedProject = (project: BaseProject | null) => {
    setSelectedProjectState(project)
    if (project) {
      localStorage.setItem('duasmaos_last_project', project.id)
    } else {
      localStorage.removeItem('duasmaos_last_project')
    }
  }

  return (
    <ProjectContext.Provider value={{ projects, selectedProject, setSelectedProject, setProjects }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjectContext() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider')
  }
  return context
}

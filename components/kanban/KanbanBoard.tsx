'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Project, ProjectStatus } from '@/types/database'
import { KanbanCard } from './KanbanCard'
import { updateProjectStatus } from '@/app/dashboard/projects/actions'

type KanbanProject = Project & {
  clients: { name: string }
  profiles: { full_name: string } | null
}

const COLUMNS: { id: string; label: string; color: string }[] = [
  { id: 'active', label: 'Ativos', color: 'bg-status-info/10 text-status-info' },
  { id: 'paused', label: 'Pausados', color: 'bg-status-warning/10 text-status-warning' },
  { id: 'completed', label: 'Finalizados', color: 'bg-status-success/10 text-status-success' },
  { id: 'archived', label: 'Arquivados', color: 'bg-surface-muted text-text-muted' },
]

interface KanbanBoardProps {
  initialProjects: KanbanProject[]
}

export function KanbanBoard({ initialProjects }: KanbanBoardProps) {
  const [projects, setProjects] = useState<KanbanProject[]>(initialProjects)

  function getColumnProjects(status: ProjectStatus) {
    return projects.filter((p) => p.status === status)
  }

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return

    const newStatus = destination.droppableId as ProjectStatus

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) =>
        p.id === draggableId ? { ...p, status: newStatus } : p
      )
    )

    try {
      await updateProjectStatus(draggableId, newStatus)
    } catch {
      // Revert on error
      setProjects(initialProjects)
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]">
        {COLUMNS.map((col) => {
          const colProjects = getColumnProjects(col.id)
          return (
            <div key={col.id} className="flex-shrink-0 w-72">
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${col.color}`}>
                    {col.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-text-muted bg-surface-muted rounded-full px-2 py-0.5">
                  {colProjects.length}
                </span>
              </div>

              {/* Drop zone */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      min-h-[200px] rounded-xl p-3 transition-colors duration-150
                      ${snapshot.isDraggingOver
                        ? 'bg-brand-primary/5 border-2 border-dashed border-brand-primary/30'
                        : 'bg-surface-muted/40 border border-border/50'
                      }
                    `}
                  >
                    <div className="space-y-2.5">
                      {colProjects.map((project, index) => (
                        <Draggable key={project.id} draggableId={project.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.85 : 1,
                              }}
                            >
                              <KanbanCard project={project} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    {provided.placeholder}

                    {colProjects.length === 0 && !snapshot.isDraggingOver && (
                      <p className="text-xs text-text-muted text-center py-8">
                        Arraste projetos aqui
                      </p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}

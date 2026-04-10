'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Client, PipelineStage } from '@/types/database'
import { PipelineCard } from './PipelineCard'
import { updateClientPipelineStage } from '@/app/dashboard/clients/actions'

const PIPELINE_COLUMNS: { id: PipelineStage; label: string; color: string }[] = [
  { id: 'Lead', label: 'OPORTUNIDADE', color: 'bg-status-info/20 text-status-info' },
  { id: 'Diagnóstico', label: 'DIAGNÓSTICO', color: 'bg-brand-highlight/20 text-brand-highlight' },
  { id: 'Proposta', label: 'PROPOSTA', color: 'bg-status-warning/20 text-status-warning' },
  { id: 'Negociação', label: 'NEGOCIAÇÃO', color: 'bg-status-danger/20 text-status-danger' },
  { id: 'Fechado', label: 'FECHADO', color: 'bg-status-success/20 text-status-success' },
  { id: 'Onboarding', label: 'INTEGRAÇÃO', color: 'bg-brand-secondary/20 text-brand-secondary' },
];

interface PipelineBoardProps {
  initialClients: Client[]
}

export function PipelineBoard({ initialClients }: PipelineBoardProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)

  function getColumnClients(stage: PipelineStage) {
    return clients.filter((c) => c.pipeline_stage === stage)
  }

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return

    const newStage = destination.droppableId as PipelineStage

    // Optimistic update
    setClients((prev) =>
      prev.map((c) =>
        c.id === draggableId ? { ...c, pipeline_stage: newStage } : c
      )
    )

    try {
      await updateClientPipelineStage(draggableId, newStage)
    } catch {
      // Revert on error
      setClients(initialClients)
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4 min-h-[calc(100vh-320px)]">
        {PIPELINE_COLUMNS.map((col) => {
          const colClients = getColumnClients(col.id)
          return (
            <div key={col.id} className="flex-shrink-0 w-[320px]">
              {/* Column header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-2 h-2 rounded-full ${col.color.split(' ')[0]}`} />
                <h3 className="text-sm font-bold tracking-widest text-text-primary uppercase">
                  {col.label}
                </h3>
                <span className="text-xs font-bold text-text-muted bg-surface-muted rounded-full px-2.5 py-0.5 ml-auto">
                  {colClients.length < 10 ? `0${colClients.length}` : colClients.length}
                </span>
              </div>

              {/* Drop zone */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      min-h-[200px] rounded-xl transition-colors duration-150
                      ${snapshot.isDraggingOver
                        ? 'bg-brand-highlight/5 rounded-xl border-2 border-dashed border-brand-highlight/30'
                        : 'bg-transparent'
                      }
                    `}
                  >
                    <div className="space-y-4">
                      {colClients.map((client, index) => (
                        <Draggable key={client.id} draggableId={client.id} index={index}>
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
                              <PipelineCard client={client} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    {provided.placeholder}

                    {colClients.length === 0 && !snapshot.isDraggingOver && (
                      <div className="border border-dashed border-border rounded-xl h-24 flex items-center justify-center mt-2">
                        <p className="text-xs text-text-muted">
                          Solte um lead aqui
                        </p>
                      </div>
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

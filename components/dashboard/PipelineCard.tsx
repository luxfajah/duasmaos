import React from 'react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Client, PipelineStage } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, User } from 'lucide-react'

interface PipelineCardProps {
  client: Client;
}

export function PipelineCard({ client }: PipelineCardProps) {
  // Mocking values for visual demonstration
  const ticketValue = Math.floor(Math.random() * 40000 + 5000);
  const formattedTicket = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ticketValue);
  
  const sector = client.sector || 'Geral';
  const displayContact = client.contacts && client.contacts.length > 0 
    ? client.contacts[0].name 
    : 'Responsável não definido';

  return (
    <Card className="p-4 bg-surface border-border hover:border-brand-primary/50 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">
      <div className="flex justify-between items-start mb-3">
        <Badge variant="muted">{sector.toUpperCase()}</Badge>
        <span className="text-sm font-semibold text-text-primary">{formattedTicket}</span>
      </div>
      
      <h4 className="font-bold text-lg text-text-primary mb-1">{client.name}</h4>
      
      <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
        <User className="w-4 h-4" />
        <span className="truncate">{displayContact}</span>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <Avatar 
          fallback={client.name.substring(0, 2).toUpperCase()} 
          className="w-6 h-6 border bg-brand-primary text-white text-[10px]"
        />
        <span className="text-xs text-text-muted">Atualizado há 2h</span>
      </div>
    </Card>
  )
}

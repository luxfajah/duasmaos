import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ClientIdentityCardProps {
  name: string;
  currentMonth: string;
  totalPosts: number;
  pendingPosts: number;
  manager: string;
  onViewDetails?: () => void;
}

export function ClientIdentityCard({ name, currentMonth, totalPosts, pendingPosts, manager, onViewDetails }: ClientIdentityCardProps) {
  return (
    <Card variant="client" className="flex flex-col justify-between">
      <CardHeader>
        <CardDescription className="uppercase tracking-widest text-xs font-bold text-brand-secondary">
          {currentMonth}
        </CardDescription>
        <CardTitle className="font-serif text-2xl">{name}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 border-y border-border py-4 mt-2">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Aprovações pendentes</p>
            <p className="text-3xl font-medium text-text-primary">{pendingPosts}</p>
          </div>
          <div className="border-l border-border pl-4">
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Total de peças</p>
            <p className="text-xl font-medium text-text-secondary mt-1">{totalPosts}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
             <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Ponto de Contato</p>
             <p className="text-sm font-medium text-text-primary">{manager}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            Plano Editorial
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

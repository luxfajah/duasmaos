import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill, type ProjectStatus } from "./StatusPill";

interface PostOfDayCardProps {
  title: string;
  client: string;
  channel: string;
  format: string;
  status: ProjectStatus;
  cta: {
    label: string;
    onClick: () => void;
  };
  imageUrl?: string;
}

export function PostOfDayCard({ title, client, channel, format, status, cta, imageUrl }: PostOfDayCardProps) {
  return (
    <Card variant="editorial" className="overflow-hidden md:flex flex-row p-0 min-h-[400px]">
      <div className="md:w-1/2 bg-surface-muted flex items-center justify-center relative overflow-hidden border-r border-border min-h-[250px] md:min-h-full">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="max-w-[80%] max-h-[80%] object-contain shadow-sm" />
        ) : (
          <div className="w-16 h-16 border-2 border-dashed border-border flex items-center justify-center">
            <span className="text-text-muted font-sans text-xs">Visual</span>
          </div>
        )}
      </div>
      <CardContent className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-2 items-center text-sm font-medium text-text-muted uppercase tracking-wider">
              <span>{channel}</span>
              <span className="w-1 h-1 bg-border rounded-full" />
              <span>{format}</span>
            </div>
            <StatusPill status={status} />
          </div>
          
          <h2 className="font-serif text-3xl font-medium text-text-primary leading-tight mb-4">
            {title}
          </h2>
          <p className="text-brand-secondary font-medium">{client}</p>
        </div>
        
        <div className="mt-12">
          <Button onClick={cta.onClick} variant="editorial" size="lg" className="w-full">
            {cta.label}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

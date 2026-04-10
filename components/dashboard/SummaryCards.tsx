import React from 'react'
import { ExtendedProject } from '@/app/dashboard/projects/actions'

export function SummaryCards({ projects }: { projects: ExtendedProject[] }) {
  // Compute timeline health logic (percentage of healthy projects vs overall)
  const total = projects.length;
  const healthyCount = projects.filter(p => p.health_score >= 80).length;
  const timelineHealth = total > 0 ? Math.round((healthyCount / total) * 100) : 100;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card 1: Timeline Health */}
      <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col justify-between shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">Timeline Health</h3>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-4xl font-bold text-text-primary tracking-tight">{timelineHealth}%</span>
            <span className="text-text-success text-sm mb-1 font-medium">Healthy</span>
          </div>
        </div>
        <p className="text-sm text-text-secondary mt-6">
          {timelineHealth >= 80 
            ? 'Most projects are hitting milestones early and running smoothly.' 
            : timelineHealth >= 50 
              ? 'Several projects require attention to meet upcoming milestones.'
              : 'Critical attention needed across multiple project timelines.'}
        </p>
      </div>

      {/* Card 2: Monthly Creative Review */}
      <div className="bg-brand-primary text-surface rounded-2xl border border-brand-primary/20 p-6 flex flex-col justify-between shadow-sm shadow-brand-primary/10 relative overflow-hidden group">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 blur-3xl rounded-full group-hover:scale-110 transition-transform duration-700"></div>
        <div className="relative z-10">
          <h3 className="text-sm font-bold text-surface/80 uppercase tracking-wider">Monthly Creative Review</h3>
          <p className="text-lg font-medium text-surface mt-4 leading-tight max-w-[240px]">
            Generate a detailed report of team throughput and asset deliveries.
          </p>
        </div>
        <div className="mt-6 relative z-10">
          <button className="bg-surface text-brand-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-surface/90 transition-colors shadow-sm">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  )
}

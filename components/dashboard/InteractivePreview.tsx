import React from 'react'
import Image from 'next/image'

interface InteractivePreviewProps {
  mediaUrl: string;
  comments: any[];
  onAddHotspot: (x: number, y: number) => void;
  activeCommentId: string | null;
  onHotspotClick: (id: string) => void;
}

export function InteractivePreview({ 
  mediaUrl, 
  comments, 
  onAddHotspot, 
  activeCommentId, 
  onHotspotClick 
}: InteractivePreviewProps) {
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only allow adding if we click the actual image box or container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onAddHotspot(x, y);
  };

  return (
    <div className="relative w-full rounded-lg bg-black flex items-center justify-center overflow-hidden h-[500px]" onClick={handleImageClick}>
      {/* Fake image representation for demo - ideally we use Next Image or regular img */}
      <img 
        src={mediaUrl} 
        alt="Preview" 
        className="max-w-full max-h-full object-contain pointer-events-none" 
      />

      {/* Hotspots */}
      {comments.map((c, idx) => {
        if (c.pos_x === null || c.pos_y === null) return null;
        const isActive = activeCommentId === c.id;
        
        return (
          <button
            key={c.id}
            onClick={(e) => {
              e.stopPropagation();
              onHotspotClick(c.id);
            }}
            className={`absolute flex items-center justify-center rounded-full w-6 h-6 text-xs font-bold text-white transition-all transform -translate-x-1/2 -translate-y-1/2 cursor-pointer shadow-md ${
              isActive 
                ? 'bg-brand-primary scale-110 z-20 ring-4 ring-brand-primary/30' 
                : 'bg-brand-secondary/90 hover:bg-brand-primary hover:scale-105 z-10'
            }`}
            style={{ left: `${c.pos_x}%`, top: `${c.pos_y}%` }}
          >
            {idx + 1}
          </button>
        )
      })}
    </div>
  )
}

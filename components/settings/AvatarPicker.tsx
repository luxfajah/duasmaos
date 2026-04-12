'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Camera, Check, Upload, Loader2, X } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'

const LIBRARY_AVATARS = [
  '/avatars/Clipped.svg',
  '/avatars/Clipped-1.svg',
  '/avatars/Clipped-2.svg',
  '/avatars/Clipped-3.svg',
  '/avatars/Clipped-4.svg',
  '/avatars/Clipped-5.svg',
  '/avatars/Clipped-6.svg',
  '/avatars/Clipped-7.svg',
  '/avatars/Clipped-8.svg',
  '/avatars/Clipped-9.svg',
  '/avatars/Clipped-10.svg',
]

interface AvatarPickerProps {
  currentUrl?: string
  onSelect: (url: string) => void
  onUpload?: (file: File) => Promise<string>
  uploading?: boolean
}

export function AvatarPicker({ currentUrl, onSelect, onUpload, uploading }: AvatarPickerProps) {
  const [showLibrary, setShowLibrary] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onUpload) {
      const url = await onUpload(file)
      onSelect(url)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Avatar 
            name="Avatar" 
            src={currentUrl} 
            size="xl" 
            variant="brand" 
            className="ring-4 ring-brand-primary/10 shadow-lg" 
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white" size={24} />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button 
              type="button" 
              variant="primary" 
              size="sm" 
              onClick={() => setShowLibrary(true)}
              className="h-9 px-4 text-xs font-bold uppercase tracking-wider"
            >
              Biblioteca
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-9 px-4 text-xs font-bold uppercase tracking-wider border-border/50"
            >
              {uploading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Upload size={14} className="mr-2" />}
              Fazer Upload
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*" 
            />
          </div>
          <p className="text-xs text-text-muted">
            Escolha um avatar da nossa coleção ou envie uma foto personalizada.
          </p>
        </div>
      </div>

      {showLibrary && (
        <div className="p-4 glass border border-brand-primary/20 rounded-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">Escolha um Avatar</h4>
            <button 
              type="button" 
              onClick={() => setShowLibrary(false)}
              className="p-1 hover:bg-surface-muted rounded-full text-text-muted transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {LIBRARY_AVATARS.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => {
                  onSelect(url)
                  setShowLibrary(false)
                }}
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95",
                  currentUrl === url 
                    ? "border-brand-primary ring-2 ring-brand-primary/20" 
                    : "border-border/40 hover:border-brand-primary/40 bg-white"
                )}
              >
                <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
                {currentUrl === url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-primary/20">
                    <Check size={16} className="text-brand-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

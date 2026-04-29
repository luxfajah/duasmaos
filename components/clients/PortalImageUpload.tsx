'use client'

import { useState } from 'react'
import { X, Link as LinkIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  clientId: string
  label: string
  value: string
  onChange: (url: string) => void
  convertWebP?: boolean // Kept for compatibility, but not used for links
}

export function PortalImageUpload({ label, value, onChange }: Props) {
  const [linkInput, setLinkInput] = useState('')

  const handleLinkAdd = () => {
    if (!linkInput.trim()) {
      toast.error('Cole um link válido.')
      return
    }
    
    let finalUrl = linkInput.trim()
    
    // Integração com Google Drive: converte link de compartilhamento em link direto de imagem
    // Exemplo: https://drive.google.com/file/d/1XYZ.../view?usp=sharing -> https://drive.google.com/uc?export=view&id=1XYZ...
    const driveMatch = finalUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (driveMatch && driveMatch[1]) {
      finalUrl = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`
      toast.success('Link do Google Drive convertido com sucesso!')
    } else if (finalUrl.includes('drive.google.com')) {
      // Tenta extrair ID de outro formato de link do Drive
      const idMatch = finalUrl.match(/id=([a-zA-Z0-9_-]+)/)
      if (idMatch && idMatch[1]) {
        finalUrl = `https://drive.google.com/uc?export=view&id=${idMatch[1]}`
        toast.success('Link do Google Drive convertido com sucesso!')
      }
    }

    onChange(finalUrl)
    setLinkInput('')
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-text-muted">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] text-status-danger flex items-center gap-1 hover:underline"
          >
            <X size={10} /> Remover
          </button>
        )}
      </div>

      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-border bg-surface-muted aspect-video flex items-center justify-center">
          <img src={value} alt={label} className="max-w-full max-h-full object-contain" />
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-3 border border-border rounded-xl bg-surface-muted/30">
          <div className="flex gap-2">
            <Input 
              placeholder="Cole o link do Google Drive..." 
              value={linkInput}
              onChange={e => setLinkInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleLinkAdd())}
              className="text-xs h-8"
            />
            <Button type="button" onClick={handleLinkAdd} size="sm" variant="secondary" className="h-8 px-3 gap-1 shrink-0">
              <LinkIcon size={14} /> Add
            </Button>
          </div>
          <p className="text-[10px] text-text-muted leading-tight">
            Cole o link de compartilhamento do <strong>Google Drive</strong> (precisa estar "Qualquer pessoa com o link").
          </p>
        </div>
      )}
    </div>
  )
}

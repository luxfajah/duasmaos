'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { convertToWebP } from '@/utils/image-utils'
import { uploadPortalImage } from '@/app/dashboard/clients/actions'
import { toast } from 'sonner'

interface Props {
  clientId: string
  label: string
  value: string
  onChange: (url: string) => void
  aspect?: 'square' | 'any'
}

export function PortalImageUpload({ clientId, label, value, onChange, aspect = 'any' }: Props) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      toast.loading('Convertendo para WebP...', { id: 'upload-img' })
      
      const webpBlob = await convertToWebP(file)
      
      toast.loading('Enviando...', { id: 'upload-img' })
      const publicUrl = await uploadPortalImage(clientId, webpBlob, file.name)
      
      onChange(publicUrl)
      toast.success('Imagem enviada!', { id: 'upload-img' })
    } catch (err: any) {
      toast.error('Erro no upload: ' + err.message, { id: 'upload-img' })
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-text-muted">{label}</label>
        {value && (
          <button 
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
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <label className="cursor-pointer bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium border border-white/30 hover:bg-white/30 transition-all">
              Alterar
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            </label>
          </div>
        </div>
      ) : (
        <label className={`
          flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-4 
          hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all cursor-pointer
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          {uploading ? (
            <Loader2 className="animate-spin text-brand-primary" size={20} />
          ) : (
            <Upload className="text-text-muted" size={20} />
          )}
          <div className="text-center">
            <p className="text-xs font-medium text-text-primary">
              {uploading ? 'Processando...' : 'Clique para subir'}
            </p>
            <p className="text-[10px] text-text-muted">WebP automático</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        </label>
      )}
    </div>
  )
}

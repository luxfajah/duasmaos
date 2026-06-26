'use client'

import React, { useState } from 'react'
import { registerProjectFile } from '@/app/dashboard/files/actions'
import { createClient } from '@/utils/supabase/client'
import { UploadCloud, Loader2, File, Paperclip } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TaskDeliveryFileUploaderProps {
  taskId: string
  projectId: string
  clientId?: string
  currentUser: { id: string }
  onUploadComplete?: () => void
}

export function TaskDeliveryFileUploader({ taskId, projectId, clientId, currentUser, onUploadComplete }: TaskDeliveryFileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const filePath = `deliveries/${projectId}/${taskId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`

      const { error: uploadError } = await supabase.storage
        .from('project_files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      await registerProjectFile({
        project_id: projectId,
        task_id: taskId,
        client_id: clientId,
        name: file.name,
        file_path: filePath,
        file_type: file.type || ext,
        file_size: file.size,
        uploaded_by: currentUser.id,
        category: 'deliverable',
        description: 'Arquivo de Entrega'
      })

      if (onUploadComplete) onUploadComplete()
      router.refresh()
    } catch (err: any) {
      alert('Erro ao fazer upload: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`relative rounded-[20px] p-6 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer w-full max-w-[350px] shrink-0 overflow-hidden group 
        ${dragActive ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-surface-muted/30 hover:bg-surface-muted/50 border-white/50 dark:border-white/5'} 
        border shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]`}
    >
      <div className={`absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 pointer-events-none transition-opacity ${dragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
      
      <label className="cursor-pointer flex flex-col items-center w-full h-full space-y-3 relative z-10">
        <input 
          type="file" 
          className="hidden" 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleUpload(e.target.files[0])
            }
          }}
          disabled={isUploading}
        />
        
        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
          ${dragActive || isUploading ? 'bg-brand-primary text-white scale-110' : 'bg-white dark:bg-black/20 text-text-muted group-hover:text-brand-primary group-hover:scale-105'}`}
        >
          {isUploading ? (
             <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
             <UploadCloud className="w-6 h-6" />
          )}
        </div>
        
        <div className="text-center mt-2">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-primary mb-1">
            {isUploading ? 'Enviando Arquivo...' : 'Anexar Arquivo'}
          </h4>
          <p className="text-[11px] text-text-muted leading-relaxed max-w-[200px]">
            Arraste pacotes finais, fontes ou referências para cá.
          </p>
        </div>
      </label>
    </div>
  )
}

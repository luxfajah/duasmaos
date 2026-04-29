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
      className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors cursor-pointer w-full max-w-[300px] bg-surface-muted/10 shrink-0 ${dragActive ? 'border-brand-primary bg-brand-primary/5' : 'border-border hover:border-text-muted hover:bg-surface-muted/30'}`}
    >
      <label className="cursor-pointer flex flex-col items-center w-full h-full space-y-2">
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
        {isUploading ? (
           <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
        ) : (
           <UploadCloud className="w-6 h-6 text-text-muted transition-colors" />
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-primary text-center">
          {isUploading ? 'Enviando...' : 'Arraste ou Clique'}
        </span>
        <span className="text-[10px] text-text-muted text-center max-w-[200px]">
          Upload rápido de pacote final ou arquivo fonte
        </span>
      </label>
    </div>
  )
}

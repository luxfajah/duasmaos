'use client'

import { useState, useRef, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'
import { registerProjectFile } from '@/app/dashboard/files/actions'
import { Button } from '@/components/ui/button'
import { UploadCloud, X, FileText, Image, Film, File } from 'lucide-react'

interface FileUploaderProps {
  projectId: string
  userId: string
  onUploadComplete?: () => void
}

interface FilePreview {
  file: File
  id: string
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image
  if (type.startsWith('video/')) return Film
  if (type === 'application/pdf') return FileText
  return File
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUploader({ projectId, userId, onUploadComplete }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [queue, setQueue] = useState<FilePreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, 'pending' | 'done' | 'error'>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    const previews: FilePreview[] = arr.map((f) => ({
      file: f,
      id: `${f.name}-${Date.now()}-${Math.random()}`,
    }))
    setQueue((prev) => [...prev, ...previews])
  }

  function removeFile(id: string) {
    setQueue((prev) => prev.filter((f) => f.id !== id))
  }

  async function handleUpload() {
    if (queue.length === 0 || uploading) return
    setUploading(true)

    const supabase = createClient()

    for (const item of queue) {
      const { file, id } = item
      const ext = file.name.split('.').pop()
      const path = `${projectId}/${Date.now()}-${file.name}`

      try {
        const { error: storageError } = await supabase.storage
          .from('project_files')
          .upload(path, file, { upsert: false })

        if (storageError) throw storageError

        await registerProjectFile({
          project_id: projectId,
          name: file.name,
          file_path: path,
          file_type: file.type || undefined,
          file_size: file.size,
          uploaded_by: userId,
        })

        setUploadProgress((prev) => ({ ...prev, [id]: 'done' }))
      } catch {
        setUploadProgress((prev) => ({ ...prev, [id]: 'error' }))
      }
    }

    setUploading(false)
    setTimeout(() => {
      setQueue([])
      setUploadProgress({})
      onUploadComplete?.()
    }, 1500)
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Área de upload de arquivos"
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragging
            ? 'border-brand-primary bg-brand-primary/5 scale-[1.01]'
            : 'border-border hover:border-border-strong hover:bg-surface-muted/30'
          }
        `}
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          accept="image/*,application/pdf,video/mp4,video/quicktime"
        />
        <UploadCloud
          size={36}
          className={`mx-auto mb-3 transition-colors ${isDragging ? 'text-brand-primary' : 'text-text-muted'}`}
        />
        <p className="text-sm font-medium text-text-secondary">
          Arraste arquivos aqui ou{' '}
          <span className="text-brand-primary underline underline-offset-2">clique para selecionar</span>
        </p>
        <p className="text-xs text-text-muted mt-1">
          Imagens, PDFs, vídeos — máx. 50 MB por arquivo
        </p>
      </div>

      {/* File queue */}
      {queue.length > 0 && (
        <div className="space-y-2">
          {queue.map((item) => {
            const Icon = getFileIcon(item.file.type)
            const progress = uploadProgress[item.id]
            return (
              <div
                key={item.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border text-sm
                  ${progress === 'done' ? 'border-status-success/40 bg-status-success/5' : ''}
                  ${progress === 'error' ? 'border-status-danger/40 bg-status-danger/5' : ''}
                  ${!progress ? 'border-border bg-surface' : ''}
                `}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-surface-muted flex items-center justify-center">
                  <Icon size={16} className="text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{item.file.name}</p>
                  <p className="text-xs text-text-muted">{formatBytes(item.file.size)}</p>
                </div>
                {progress === 'done' && <span className="text-status-success text-xs font-semibold">✓ Enviado</span>}
                {progress === 'error' && <span className="text-status-danger text-xs font-semibold">✗ Erro</span>}
                {!progress && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(item.id) }}
                    className="flex-shrink-0 text-text-muted hover:text-status-danger transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )
          })}

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading
              ? 'Enviando...'
              : `Enviar ${queue.length} arquivo${queue.length > 1 ? 's' : ''}`
            }
          </Button>
        </div>
      )}
    </div>
  )
}

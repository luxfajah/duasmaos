'use client'

import { useState } from 'react'
import { ProjectFile } from '@/types/database'
import { deleteProjectFile } from './actions'
import { FileUploader } from '@/components/files/FileUploader'
import { Button } from '@/components/ui/button'
import { FileText, Image, Film, File, Trash2, Download, Plus, X } from 'lucide-react'

type FileWithRelations = ProjectFile & {
  profiles: { full_name: string } | null
  projects: { name: string; clients: { name: string } | null } | null
}

interface FilesPageClientProps {
  files: FileWithRelations[]
  userId: string
  projects: { id: string; name: string }[]
}

function getFileIcon(type: string | null) {
  if (!type) return File
  if (type.startsWith('image/')) return Image
  if (type.startsWith('video/')) return Film
  if (type === 'application/pdf') return FileText
  return File
}

function formatBytes(bytes: number | null) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FilesPageClient({ files, userId, projects }: FilesPageClientProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id ?? '')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')

  const filteredFiles = filter === 'all'
    ? files
    : files.filter((f) => f.project_id === filter)

  async function handleDelete(id: string, filePath: string) {
    if (!confirm('Excluir arquivo definitivamente?')) return
    setDeletingId(id)
    try {
      await deleteProjectFile(id, filePath)
    } catch {
      alert('Erro ao excluir arquivo.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-10 px-3 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none flex-1"
          id="files-project-filter"
          aria-label="Filtrar por projeto"
        >
          <option value="all">Todos os projetos</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <Button onClick={() => setShowUpload(!showUpload)} className="flex items-center gap-2">
          {showUpload ? <X size={16} /> : <Plus size={16} />}
          {showUpload ? 'Fechar upload' : 'Enviar arquivo'}
        </Button>
      </div>

      {showUpload && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-text-primary">Projeto destino:</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="h-9 px-3 text-sm rounded-md border border-border bg-surface text-text-primary focus:outline-none"
              id="upload-project-select"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {selectedProject && (
            <FileUploader
              projectId={selectedProject}
              userId={userId}
              onUploadComplete={() => setShowUpload(false)}
            />
          )}
        </div>
      )}

      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-4">
            <span className="text-2xl">📁</span>
          </div>
          <p className="text-text-secondary font-medium">Nenhum arquivo encontrado</p>
          <p className="text-text-muted text-sm mt-1">Use o botão acima para enviar arquivos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => {
            const Icon = getFileIcon(file.file_type)
            const isImage = file.file_type?.startsWith('image/')
            return (
              <div
                key={file.id}
                className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-border-strong hover:shadow-sm transition-all duration-200"
              >
                {/* Preview area */}
                <div className="h-36 bg-surface-muted flex items-center justify-center relative">
                  <Icon size={40} className="text-text-muted opacity-40" />
                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      asChild
                    >
                      <a
                        href={`/api/files/download?path=${encodeURIComponent(file.file_path)}`}
                        download={file.name}
                        title="Baixar"
                      >
                        <Download size={16} />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-status-danger hover:text-status-danger hover:bg-status-danger/10"
                      onClick={() => handleDelete(file.id, file.file_path)}
                      disabled={deletingId === file.id}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="font-medium text-text-primary text-sm truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {file.projects?.name ?? '—'} · {formatBytes(file.file_size)}
                  </p>
                  {file.profiles?.full_name && (
                    <p className="text-xs text-text-muted mt-0.5">
                      por {file.profiles.full_name}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

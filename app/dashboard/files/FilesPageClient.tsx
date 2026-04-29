'use client'

import { useState } from 'react'
import { Plus, Library } from 'lucide-react'
import { FileLibraryGrid } from '@/components/files/FileLibraryGrid'
import { FileUploadModal } from '@/components/files/FileUploadModal'
import { Button } from '@/components/ui/button'

type LibraryFile = {
  id: string
  name: string
  file_path: string
  file_type?: string | null
  file_size?: number | null
  created_at: string
  category?: string | null
  description?: string | null
  external_url?: string | null
  file_source?: string | null
  profiles?: { full_name: string } | null
  projects?: { name: string; clients?: { name: string } | null } | null
}

interface FilesPageClientProps {
  files: LibraryFile[]
  userId: string
  projects: { id: string; name: string }[]
  clients: { id: string; name: string }[]
}

export function FilesPageClient({ files, userId, projects, clients }: FilesPageClientProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
            <Library size={20} className="text-brand-primary" />
          </div>
          <div>
            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Biblioteca</p>
            <p className="text-sm font-semibold text-text-primary">{files.length} {files.length === 1 ? 'item' : 'itens'} armazenados</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Adicionar
        </Button>
      </div>

      <FileLibraryGrid files={files} projects={projects} />

      <FileUploadModal
        open={showModal}
        onClose={() => setShowModal(false)}
        userId={userId}
        projects={projects}
        clients={clients}
      />
    </>
  )
}

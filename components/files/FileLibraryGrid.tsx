'use client'

import { useState, useTransition } from 'react'
import {
  FileText, Image as ImageIcon, Film, Archive, FileCheck, FolderOpen, Link as LinkIcon,
  Trash2, Download, ExternalLink, Presentation, Search, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteProjectFile } from '@/app/dashboard/files/actions'
import { useRouter } from 'next/navigation'

const CATEGORIES: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  contract:       { label: 'Contratos',         icon: FileCheck,    color: 'text-blue-600',   bg: 'bg-blue-500/10' },
  invoice:        { label: 'Notas Fiscais',      icon: FileText,     color: 'text-green-600',  bg: 'bg-green-500/10' },
  brand_identity: { label: 'Identidade Visual',  icon: Archive,      color: 'text-purple-600', bg: 'bg-purple-500/10' },
  post:           { label: 'Posts / Redes',      icon: ImageIcon,        color: 'text-pink-600',   bg: 'bg-pink-500/10' },
  video:          { label: 'Vídeos',             icon: Film,         color: 'text-rose-600',   bg: 'bg-rose-500/10' },
  presentation:   { label: 'Apresentações',      icon: Presentation, color: 'text-amber-600',  bg: 'bg-amber-500/10' },
  briefing:       { label: 'Briefings',          icon: FileText,     color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
  drive_link:     { label: 'Links Drive',        icon: LinkIcon,     color: 'text-cyan-600',   bg: 'bg-cyan-500/10' },
  other:          { label: 'Outros',             icon: FolderOpen,   color: 'text-text-muted', bg: 'bg-surface-muted' },
}

function formatBytes(bytes: number | null) {
  if (!bytes) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileExtension(name: string) {
  return name.split('.').pop()?.toUpperCase() ?? ''
}

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

interface FileLibraryGridProps {
  files: LibraryFile[]
  projects: { id: string; name: string }[]
}

export function FileLibraryGrid({ files, projects }: FileLibraryGridProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = files.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (f.projects?.name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || (f.category ?? 'other') === categoryFilter
    const matchProj = projectFilter === 'all' || (f.projects as any)?.id === projectFilter
    return matchSearch && matchCat && matchProj
  })

  // Group by category
  const grouped = Object.entries(CATEGORIES)
    .map(([key, meta]) => ({
      key, meta,
      items: filtered.filter(f => (f.category ?? 'other') === key)
    }))
    .filter(g => g.items.length > 0)

  async function handleDelete(id: string, filePath: string) {
    if (!confirm('Excluir definitivamente?')) return
    setDeletingId(id)
    try {
      await deleteProjectFile(id, filePath)
      router.refresh()
    } catch { alert('Erro ao excluir.') }
    finally { setDeletingId(null) }
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, descrição ou projeto..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-surface outline-none focus:ring-2 ring-brand-primary/20"
          />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 text-sm border border-border rounded-xl bg-surface outline-none focus:ring-2 ring-brand-primary/20">
          <option value="all">Todas as categorias</option>
          {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-text-muted">
          <FolderOpen size={48} className="opacity-20" />
          <p className="text-sm font-medium">Nenhum arquivo encontrado</p>
          <p className="text-xs opacity-60">Utilize o botão &quot;Adicionar&quot; para enviar arquivos ou links.</p>
        </div>
      )}

      {/* Grouped sections */}
      {grouped.map(({ key, meta, items }) => {
        const Icon = meta.icon
        return (
          <div key={key} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', meta.bg)}>
                <Icon size={16} className={meta.color} />
              </div>
              <h3 className="font-bold font-heading text-text-primary">{meta.label}</h3>
              <span className="text-xs text-text-muted font-medium">({items.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(file => {
                const isDrive = file.file_source === 'drive'
                const CatIcon = CATEGORIES[file.category ?? 'other']?.icon ?? FolderOpen
                return (
                  <div key={file.id} className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-brand-primary/30 hover:shadow-md transition-all duration-200">
                    {/* Preview */}
                    <div className={cn('h-32 flex flex-col items-center justify-center relative', meta.bg, 'bg-opacity-30')}>
                      {isDrive ? (
                        <LinkIcon size={32} className={cn('opacity-60', meta.color)} />
                      ) : file.file_type?.startsWith('image/') ? (
                        <ImageIcon size={32} className={cn('opacity-60', meta.color)} />
                      ) : file.file_type?.startsWith('video/') ? (
                        <Film size={32} className={cn('opacity-60', meta.color)} />
                      ) : (
                        <CatIcon size={32} className={cn('opacity-60', meta.color)} />
                      )}
                      {!isDrive && <span className={cn('mt-2 text-[10px] font-black uppercase tracking-wider opacity-50', meta.color)}>{getFileExtension(file.name)}</span>}
                      {isDrive && <span className={cn('mt-2 text-[10px] font-black uppercase tracking-wider opacity-50', meta.color)}>Drive</span>}

                      {/* Hover actions */}
                      <div className="absolute inset-0 bg-surface/85 backdrop-blur-[2px] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isDrive ? (
                          <a href={file.external_url!} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
                            <ExternalLink size={13} /> Abrir Drive
                          </a>
                        ) : (
                          <a href={`/api/files/download?path=${encodeURIComponent(file.file_path)}`} download={file.name}
                            className="flex items-center gap-1.5 px-3 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
                            <Download size={13} /> Baixar
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(file.id, file.file_path)}
                          disabled={deletingId === file.id}
                          className="p-2 bg-status-danger/10 text-status-danger rounded-lg hover:bg-status-danger hover:text-white transition-all disabled:opacity-50"
                          title="Excluir"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 space-y-1">
                      <p className="font-semibold text-sm text-text-primary truncate" title={file.name}>{file.name}</p>
                      {file.description && (
                        <p className="text-[11px] text-text-muted line-clamp-1">{file.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {file.projects?.name && (
                          <span className="text-[10px] px-2 py-0.5 bg-surface-muted rounded-full text-text-muted font-medium truncate max-w-[120px]">
                            {file.projects.clients?.name ?? file.projects.name}
                          </span>
                        )}
                        {file.file_size && (
                          <span className="text-[10px] text-text-muted ml-auto">{formatBytes(file.file_size)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

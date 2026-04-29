'use client'

import { useState, useTransition } from 'react'
import { X, Upload, Link as LinkIcon, FileText, Image, Film, Archive, FileCheck, Presentation, Loader2, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { registerDriveLink } from '@/app/dashboard/files/actions'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { value: 'contract', label: 'Contrato', icon: FileCheck, color: 'text-blue-500 bg-blue-500/10' },
  { value: 'invoice', label: 'Nota Fiscal', icon: FileText, color: 'text-green-500 bg-green-500/10' },
  { value: 'brand_identity', label: 'Identidade Visual', icon: Archive, color: 'text-purple-500 bg-purple-500/10' },
  { value: 'post', label: 'Post / Redes', icon: Image, color: 'text-pink-500 bg-pink-500/10' },
  { value: 'video', label: 'Vídeo', icon: Film, color: 'text-rose-500 bg-rose-500/10' },
  { value: 'presentation', label: 'Apresentação', icon: Presentation, color: 'text-amber-500 bg-amber-500/10' },
  { value: 'briefing', label: 'Briefing', icon: FileText, color: 'text-indigo-500 bg-indigo-500/10' },
  { value: 'drive_link', label: 'Link Drive', icon: LinkIcon, color: 'text-cyan-500 bg-cyan-500/10' },
  { value: 'other', label: 'Outro', icon: FolderOpen, color: 'text-text-muted bg-surface-muted' },
]

interface FileUploadModalProps {
  open: boolean
  onClose: () => void
  userId: string
  projects: { id: string; name: string }[]
  clients: { id: string; name: string }[]
  defaultProjectId?: string
}

export function FileUploadModal({ open, onClose, userId, projects, clients, defaultProjectId }: FileUploadModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<'upload' | 'drive'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [driveUrl, setDriveUrl] = useState('')
  const [form, setForm] = useState({
    name: '',
    category: 'other',
    description: '',
    project_id: defaultProjectId ?? '',
    client_id: '',
  })
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      setFile(dropped)
      if (!form.name) setForm(f => ({ ...f, name: dropped.name }))
      // Auto-detect category
      if (dropped.type.startsWith('video/')) setForm(f => ({ ...f, category: 'video' }))
      else if (dropped.type.startsWith('image/')) setForm(f => ({ ...f, category: 'post' }))
      else if (dropped.type === 'application/pdf') setForm(f => ({ ...f, category: 'other' }))
      else if (dropped.name.endsWith('.zip') || dropped.name.endsWith('.rar')) setForm(f => ({ ...f, category: 'brand_identity' }))
    }
  }

  async function handleSave() {
    setError('')
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }

    if (mode === 'drive') {
      if (!driveUrl.trim()) { setError('URL do Drive é obrigatória.'); return }
      startTransition(async () => {
        try {
          await registerDriveLink({ ...form, external_url: driveUrl, uploaded_by: userId })
          router.refresh()
          onClose()
        } catch (e: any) { setError(e.message) }
      })
    } else {
      if (!file) { setError('Selecione um arquivo.'); return }
      if (!form.project_id) { setError('Selecione um projeto.'); return }

      startTransition(async () => {
        try {
          const { createClient } = await import('@/utils/supabase/client')
          const supabase = createClient()
          const ext = file.name.split('.').pop()
          const path = `${form.project_id}/${Date.now()}-${file.name}`
          const { error: upErr } = await supabase.storage.from('project_files').upload(path, file)
          if (upErr) throw upErr

          const { registerProjectFile } = await import('@/app/dashboard/files/actions')
          await registerProjectFile({
            project_id: form.project_id,
            name: form.name,
            file_path: path,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: userId,
            category: form.category,
            description: form.description,
            client_id: form.client_id || undefined,
          })
          router.refresh()
          onClose()
        } catch (e: any) { setError(e.message) }
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border">
          <h2 className="font-bold font-heading text-text-primary text-lg">Adicionar à Biblioteca</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-muted rounded-xl transition-colors">
            <X size={18} className="text-text-muted" />
          </button>
        </div>

        <div className="p-7 space-y-6">
          {/* Mode Toggle */}
          <div className="flex bg-surface-muted rounded-xl p-1 gap-1">
            {[
              { id: 'upload', label: 'Enviar arquivo', icon: Upload },
              { id: 'drive', label: 'Link Google Drive', icon: LinkIcon },
            ].map(m => {
              const Icon = m.icon
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as 'upload' | 'drive')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
                    mode === m.id ? 'bg-surface shadow text-text-primary' : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  <Icon size={15} />
                  {m.label}
                </button>
              )
            })}
          </div>

          {/* Upload zone or Drive URL */}
          {mode === 'upload' ? (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                isDragging ? 'border-brand-primary bg-brand-primary/5' : 'border-border hover:border-brand-primary/50 hover:bg-surface-muted/50'
              )}
            >
              <input id="file-input" type="file" className="hidden" onChange={e => {
                const f = e.target.files?.[0]
                if (f) { setFile(f); if (!form.name) setForm(x => ({ ...x, name: f.name })) }
              }} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                    <Upload size={18} className="text-brand-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-text-primary text-sm">{file.name}</p>
                    <p className="text-xs text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={28} className="mx-auto text-text-muted opacity-30 mb-3" />
                  <p className="text-sm font-medium text-text-secondary">Arraste ou clique para selecionar</p>
                  <p className="text-xs text-text-muted mt-1">PDF, ZIP, imagens, vídeos, documentos</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">URL do Google Drive / Dropbox</label>
              <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3 focus-within:ring-2 ring-brand-primary/20">
                <LinkIcon size={16} className="text-text-muted shrink-0" />
                <input
                  type="url"
                  value={driveUrl}
                  onChange={e => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/..."
                  className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-muted"
                />
              </div>
            </div>
          )}

          {/* Meta fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Nome do arquivo *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Identidade Visual – Cliente ABC"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none bg-surface focus:ring-2 ring-brand-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Categoria</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none bg-surface focus:ring-2 ring-brand-primary/20">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Projeto (opcional)</label>
              <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none bg-surface focus:ring-2 ring-brand-primary/20">
                <option value="">Nenhum</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Descrição (opcional)</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descreva o conteúdo, versão, ou qualquer contexto relevante..."
                rows={2}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none bg-surface focus:ring-2 ring-brand-primary/20 resize-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-status-danger font-medium">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface-muted transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex-1 py-3 bg-brand-primary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : mode === 'drive' ? <>Salvar Link</> : <>Enviar Arquivo</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

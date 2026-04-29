'use client'

import { useState } from 'react'
import { Link, X, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Props {
  label: string
  value: string
  onChange: (url: string) => void
  hint?: string
}

/**
 * Extracts the Google Drive file ID from various link formats:
 *   - https://drive.google.com/file/d/FILE_ID/view?...
 *   - https://drive.google.com/open?id=FILE_ID
 *   - https://drive.google.com/uc?id=FILE_ID&export=view
 *   - https://drive.google.com/thumbnail?id=FILE_ID
 */
function extractDriveId(input: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{20,})/,
    /[?&]id=([a-zA-Z0-9_-]{20,})/,
    /\/d\/([a-zA-Z0-9_-]{20,})/,
  ]
  for (const re of patterns) {
    const m = input.match(re)
    if (m?.[1]) return m[1]
  }
  return null
}

/**
 * Converts any Drive share/view link into a direct image URL.
 * Works as long as the file is shared as "Anyone with the link".
 */
function toDriveDirectUrl(input: string): string | null {
  // If it's already a direct drive URL, return it
  if (input.includes('drive.google.com/uc') || input.includes('lh3.googleusercontent.com')) {
    return input
  }
  const id = extractDriveId(input)
  if (!id) return null
  return `https://drive.google.com/uc?export=view&id=${id}`
}

export function DriveImageField({ label, value, onChange, hint }: Props) {
  const [input, setInput] = useState('')
  const [preview, setPreview] = useState(value || '')
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')

  const handlePaste = (raw: string) => {
    setInput(raw)
    if (!raw.trim()) {
      setStatus('idle')
      return
    }
    const direct = toDriveDirectUrl(raw.trim())
    if (direct) {
      setPreview(direct)
      onChange(direct)
      setStatus('ok')
    } else if (raw.startsWith('http')) {
      // Not a Drive link — use as-is (e.g. direct CDN URL)
      setPreview(raw.trim())
      onChange(raw.trim())
      setStatus('ok')
    } else {
      setStatus('error')
    }
  }

  const handleClear = () => {
    setInput('')
    setPreview('')
    onChange('')
    setStatus('idle')
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-text-muted flex items-center gap-1">
          <Link size={11} /> {label}
        </label>
        {preview && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] text-status-danger flex items-center gap-1 hover:underline"
          >
            <X size={10} /> Remover
          </button>
        )}
      </div>

      {/* Link input */}
      <div className="relative">
        <Input
          value={input || (preview ? (value.includes('drive.google') ? `ID: ${extractDriveId(value) || value}` : value) : '')}
          onChange={e => handlePaste(e.target.value)}
          onPaste={e => {
            // Handle paste event immediately
            const pasted = e.clipboardData.getData('text')
            setTimeout(() => handlePaste(pasted), 0)
          }}
          placeholder="Cole o link do Google Drive ou URL direta..."
          className="pr-8 text-xs"
        />
        {status === 'ok' && (
          <CheckCircle size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500" />
        )}
        {status === 'error' && (
          <AlertCircle size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-500" />
        )}
      </div>

      {status === 'error' && (
        <p className="text-[10px] text-status-danger">Link inválido. Cole um link do Google Drive com acesso público.</p>
      )}

      {/* Drive tip */}
      {!preview && (
        <p className="text-[10px] text-text-muted">
          Abra o arquivo no Drive → Compartilhar → "Qualquer pessoa com o link" → copie e cole aqui.
        </p>
      )}

      {/* Image preview */}
      {preview && (
        <div className="relative group rounded-lg overflow-hidden border border-border bg-surface-muted aspect-video flex items-center justify-center">
          <img
            src={preview}
            alt={label}
            className="max-w-full max-h-full object-contain"
            onLoad={() => setStatus('ok')}
            onError={() => {
              setStatus('error')
            }}
          />
          <a
            href={preview}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="Abrir imagem"
          >
            <ExternalLink size={11} />
          </a>
        </div>
      )}

      {hint && <p className="text-[10px] text-text-muted italic">{hint}</p>}
    </div>
  )
}

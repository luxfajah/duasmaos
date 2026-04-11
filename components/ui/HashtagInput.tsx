'use client'

import React, { useState } from 'react'
import { X, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HashtagInputProps {
  hashtags: string[]
  onChange: (hashtags: string[]) => void
  disabled?: boolean
}

export function HashtagInput({ hashtags, onChange, disabled }: HashtagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const tag = inputValue.trim().replace(/^#/, '')
      if (tag && !hashtags.includes(tag)) {
        onChange([...hashtags, tag])
        setInputValue('')
      }
    } else if (e.key === 'Backspace' && !inputValue && hashtags.length > 0) {
      onChange(hashtags.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(hashtags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className={cn(
      "flex flex-wrap gap-2 p-2 min-h-[44px] rounded-lg bg-white/5 border border-white/10 focus-within:border-white/20 transition-colors",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      {hashtags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 text-xs text-white/90">
          <Hash className="w-3 h-3 text-white/40" />
          {tag}
          {!disabled && (
            <button
              onClick={() => removeTag(tag)}
              className="p-0.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      ))}
      <input
        type="text"
        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-white/20 min-w-[120px]"
        placeholder={hashtags.length === 0 ? "Adicionar hashtags..." : ""}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
    </div>
  )
}

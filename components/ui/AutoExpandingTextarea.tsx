'use client'

import React, { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface AutoExpandingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function AutoExpandingTextarea({ className, value, onChange, ...props }: AutoExpandingTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      className={cn(
        "w-full bg-transparent border-none focus:ring-0 resize-none overflow-hidden min-h-[40px] px-0 py-2",
        className
      )}
      value={value}
      onChange={(e) => {
        onChange?.(e)
        adjustHeight()
      }}
      rows={1}
      {...props}
    />
  )
}

'use client'

/**
 * SlIcon — Componente que carrega ícones Streamline Freehand do diretório /icons/
 * Substitui fill="black" e stroke="black" por currentColor para herdar a cor do CSS.
 * Suporta coloração temática via className (ex: text-brand-highlight, text-text-secondary).
 */

import React, { useEffect, useState } from 'react'

interface SlIconProps {
  /** Nome do arquivo sem extensão (ex: "dashboard", "projects") */
  name: string
  size?: number
  className?: string
}

const cache: Record<string, string> = {}

export function SlIcon({ name, size = 22, className = '' }: SlIconProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null)

  useEffect(() => {
    const key = name
    if (cache[key]) {
      setSvgContent(cache[key])
      return
    }
    fetch(`/icons/${name}.svg`)
      .then((r) => r.text())
      .then((raw) => {
        // Substitui fills e strokes hardcoded por currentColor
        const processed = raw
          .replace(/fill="black"/g, 'fill="currentColor"')
          .replace(/fill="#000000"/g, 'fill="currentColor"')
          .replace(/fill="#000"/g, 'fill="currentColor"')
          .replace(/stroke="black"/g, 'stroke="currentColor"')
          .replace(/stroke="#000000"/g, 'stroke="currentColor"')
          // Remove width/height fixo do SVG raiz (vamos controlar via size)
          .replace(/(<svg[^>]*)\s+width="[^"]*"/, '$1')
          .replace(/(<svg[^>]*)\s+height="[^"]*"/, '$1')
        cache[key] = processed
        setSvgContent(processed)
      })
      .catch(() => setSvgContent(''))
  }, [name])

  if (!svgContent) {
    // Placeholder com as mesmas dimensões enquanto carrega
    return <span style={{ width: size, height: size, display: 'inline-block' }} />
  }

  return (
    <span
      className={className}
      style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
      dangerouslySetInnerHTML={{
        __html: svgContent.replace(/<svg/, `<svg width="${size}" height="${size}"`),
      }}
    />
  )
}

/**
 * Design Tokens – Colors
 * Duas Mãos · Brand Color System
 *
 * Espelho programático das CSS variables definidas em app/globals.css.
 * Use estes tokens em utilitários, scripts de tema e documentação.
 */

export const colors = {
  /** Superfícies e fundos */
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  surface: {
    DEFAULT: 'hsl(var(--surface))',
    muted: 'hsl(var(--surface-muted))',
  },

  /** Bordas */
  border: {
    DEFAULT: 'hsl(var(--border))',
    strong: 'hsl(var(--border-strong))',
  },

  /** Marca */
  brand: {
    primary: 'hsl(var(--brand-primary))',
    primaryHover: 'hsl(var(--brand-primary-hover))',
    secondary: 'hsl(var(--brand-secondary))',
    accent: 'hsl(var(--brand-accent))',
  },

  /** Texto */
  text: {
    primary: 'hsl(var(--text-primary))',
    secondary: 'hsl(var(--text-secondary))',
    muted: 'hsl(var(--text-muted))',
    inverse: 'hsl(var(--text-inverse))',
  },

  /** Estados semânticos */
  status: {
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
    danger: 'hsl(var(--danger))',
    info: 'hsl(var(--info))',
    pending: 'hsl(var(--pending))',
    draft: 'hsl(var(--draft))',
  },

  /** Estilos editoriais */
  editorial: {
    highlight: 'hsl(var(--editorial-highlight))',
    note: 'hsl(var(--editorial-note))',
    quote: 'hsl(var(--editorial-quote))',
    frame: 'hsl(var(--editorial-frame))',
  },
} as const

export type ColorToken = typeof colors

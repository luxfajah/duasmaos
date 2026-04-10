/**
 * Design Tokens – Typography
 * Duas Mãos · Type System
 */

export const typography = {
  fontFamily: {
    sans: 'var(--font-inter), system-ui, sans-serif',
    serif: 'var(--font-playfair), Georgia, serif',
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
    sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0em' }],
    base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0em' }],
    lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
    xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
    '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
    '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
  },

  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  letterSpacing: {
    tighter: '-0.04em',
    tight: '-0.02em',
    normal: '0em',
    wide: '0.05em',
    wider: '0.1em',
    widest: '0.15em',
  },

  /** Estilos de texto pré-compostos */
  styles: {
    /** Títulos editoriais em serif */
    displaySerif: {
      fontFamily: 'var(--font-playfair)',
      fontSize: '3rem',
      fontWeight: '500',
      lineHeight: '1.1',
      letterSpacing: '-0.04em',
    },
    /** Rótulos de seção uppercase */
    label: {
      fontFamily: 'var(--font-inter)',
      fontSize: '0.625rem',
      fontWeight: '700',
      lineHeight: '1rem',
      letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
    },
    /** Valores numéricos de métricas */
    metric: {
      fontFamily: 'var(--font-inter)',
      fontSize: '1.875rem',
      fontWeight: '700',
      lineHeight: '1',
      letterSpacing: '-0.02em',
      fontVariantNumeric: 'tabular-nums',
    },
  },
} as const

export type TypographyToken = typeof typography

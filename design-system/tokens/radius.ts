/**
 * Design Tokens – Border Radius
 * Duas Mãos · Radius Scale
 */

export const radius = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const

/** Mapeamento de radius por tipo de componente */
export const componentRadius = {
  button: 'var(--radius-sm)',
  card: 'var(--radius-lg)',
  badge: 'var(--radius-full)',
  input: 'var(--radius-sm)',
  modal: 'var(--radius-xl)',
  avatar: 'var(--radius-full)',
  tag: 'var(--radius-xs)',
  tooltip: 'var(--radius-xs)',
  dropdown: 'var(--radius-md)',
} as const

export type RadiusToken = typeof radius

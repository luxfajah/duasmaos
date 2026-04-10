/**
 * Design Tokens – Spacing
 * Duas Mãos · 4px base grid
 */

export const spacing = {
  /** Base unit: 4px */
  0: '0px',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const

/** Espaçamentos semânticos para componentes */
export const componentSpacing = {
  sidebar: {
    width: '256px',
    paddingX: '16px',
    paddingY: '32px',
  },
  header: {
    height: '64px',
    paddingX: '32px',
  },
  card: {
    padding: '24px',
    gap: '16px',
  },
  content: {
    maxWidth: '1400px',
    padding: '32px',
    paddingLg: '48px',
  },
} as const

export type SpacingToken = typeof spacing

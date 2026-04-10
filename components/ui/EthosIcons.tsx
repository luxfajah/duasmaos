import React from 'react'

interface IconProps {
  className?: string
  size?: number
  strokeWidth?: number
}

const D = { size: 24, sw: 1.9 }

/* ─────────────────────────────────────────
   DASHBOARD — grid + trend line + arrow
───────────────────────────────────────── */
export function DoodleDashboard({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Outer border */}
      <rect x="4" y="4" width="40" height="40" rx="1.5" />
      {/* Vertical grid lines */}
      <line x1="4"  y1="17" x2="44" y2="17" />
      <line x1="4"  y1="30" x2="44" y2="30" />
      <line x1="17" y1="4"  x2="17" y2="44" />
      <line x1="30" y1="4"  x2="30" y2="44" />
      {/* Trend line — zigzag going up */}
      <polyline points="6,38 13,28 20,32 28,18 36,22 44,8" strokeWidth={strokeWidth * 2.5} />
      {/* Arrow tip at end */}
      <polyline points="38,6 44,8 42,14" strokeWidth={strokeWidth * 2.2} />
    </svg>
  )
}

/* ─────────────────────────────────────────
   PROJECTS — open folder, 3 papers inside
───────────────────────────────────────── */
export function DoodleProjects({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Back folder flap */}
      <path d="M4 16 Q4 12 8 12 H18 L22 16 H44 Q46 16 46 18" />
      {/* Folder body */}
      <path d="M4 16 H44 Q46 16 46 18 V38 Q46 42 42 42 H6 Q4 42 4 40 V16 Z" />
      {/* Document tabs showing inside */}
      <line x1="4" y1="22" x2="46" y2="22" />
      {/* Papers sticking up inside folder */}
      <rect x="13" y="14" width="8" height="10" rx="1" />
      <rect x="23" y="13" width="8" height="11" rx="1" />
      <rect x="33" y="14" width="8" height="10" rx="1" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   CLIENTS — 2 person silhouettes side by side
   (right person slightly larger, shown more)
───────────────────────────────────────── */
export function DoodleClients({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Left person head */}
      <circle cx="17" cy="13" r="6" />
      {/* Left person body arc */}
      <path d="M4 42 Q4 30 17 30 Q22 30 25 33" />
      {/* Right person head (slightly larger, in front) */}
      <circle cx="31" cy="12" r="7" />
      {/* Right person body arc */}
      <path d="M18 43 Q18 29 31 29 Q44 29 44 43" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   TASKS — checklist: checked box + unchecked box + lines
───────────────────────────────────────── */
export function DoodleTasks({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Top checked box */}
      <rect x="4" y="6" width="14" height="14" rx="1.5" />
      <polyline points="7,13 11,17 18,8" strokeWidth={strokeWidth * 2.2} />
      {/* Top text lines */}
      <line x1="24" y1="10" x2="44" y2="10" />
      <line x1="24" y1="16" x2="38" y2="16" />
      {/* Bottom unchecked box */}
      <rect x="4" y="28" width="14" height="14" rx="1.5" />
      {/* Bottom text lines */}
      <line x1="24" y1="32" x2="44" y2="32" />
      <line x1="24" y1="38" x2="38" y2="38" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   CALENDAR GRID — square calendar with spiral rings, grid, circled 15
───────────────────────────────────────── */
export function DoodleCalendar({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Calendar frame */}
      <rect x="4" y="10" width="40" height="34" rx="1.5" />
      {/* Spiral rings */}
      <line x1="13" y1="6" x2="13" y2="14" strokeWidth={strokeWidth * 2.5} />
      <line x1="24" y1="6" x2="24" y2="14" strokeWidth={strokeWidth * 2.5} />
      <line x1="35" y1="6" x2="35" y2="14" strokeWidth={strokeWidth * 2.5} />
      {/* Header divider */}
      <line x1="4" y1="18" x2="44" y2="18" />
      {/* Grid vertical lines */}
      <line x1="18" y1="18" x2="18" y2="44" strokeWidth={strokeWidth} />
      <line x1="30" y1="18" x2="30" y2="44" strokeWidth={strokeWidth} />
      {/* Grid horizontal lines */}
      <line x1="4" y1="28" x2="44" y2="28" strokeWidth={strokeWidth} />
      <line x1="4" y1="37" x2="44" y2="37" strokeWidth={strokeWidth} />
      {/* Circled "15" — just the circle (number implied by style) */}
      <circle cx="11" cy="23" r="5" />
      {/* "15" text approximated */}
      <line x1="10" y1="20" x2="10" y2="26" strokeWidth={strokeWidth * 1.5} />
      <path d="M10 20 Q13 20 13 22 Q13 24 10 24 Q13 24 13 26" strokeWidth={strokeWidth * 1.3} />
    </svg>
  )
}

/* ─────────────────────────────────────────
   CALENDAR ROUND — rounded calendar with big circled "15"
───────────────────────────────────────── */
export function DoodleCalendarRound({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Rounded calendar frame */}
      <rect x="4" y="10" width="40" height="34" rx="6" />
      {/* Spiral rings */}
      <line x1="14" y1="6" x2="14" y2="14" strokeWidth={strokeWidth * 2.5} />
      <line x1="34" y1="6" x2="34" y2="14" strokeWidth={strokeWidth * 2.5} />
      {/* Header divider */}
      <line x1="4" y1="18" x2="44" y2="18" />
      {/* Large circle for the date */}
      <circle cx="24" cy="31" r="10" />
      {/* "1" of 15 */}
      <path d="M20 27 L20 35" strokeWidth={strokeWidth * 1.8} />
      {/* "5" of 15 */}
      <path d="M23 27 L27 27 L27 31 L23 31 Q23 35 27 35" strokeWidth={strokeWidth * 1.6} />
    </svg>
  )
}

/* ─────────────────────────────────────────
   FILES — document with dog-ear fold, horizontal lines
───────────────────────────────────────── */
export function DoodleFiles({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Document body with folded top-right corner */}
      <path d="M8 4 H32 L40 12 V44 H8 Z" />
      {/* Dog-ear fold */}
      <polyline points="32,4 32,12 40,12" />
      {/* Content lines */}
      <line x1="13" y1="20" x2="35" y2="20" />
      <line x1="13" y1="27" x2="35" y2="27" />
      <line x1="13" y1="34" x2="35" y2="34" />
      <line x1="13" y1="40" x2="26" y2="40" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   CLIP — blank paper with paperclip at top right
───────────────────────────────────────── */
export function DoodleClip({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Paper rectangle */}
      <rect x="6" y="8" width="32" height="38" rx="2" />
      {/* Paperclip — U shape at top right going over edge */}
      <path d="M30 2 Q38 2 38 8 Q38 14 30 14 Q28 14 28 18"
        strokeWidth={strokeWidth * 2}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

/* ─────────────────────────────────────────
   SETTINGS — gear with concentric circles
───────────────────────────────────────── */
export function DoodleSettings({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Gear outer path — 8 teeth */}
      <path d="
        M24 4 L26.5 9 L32 8 L33 14 L38 16 L35 21 L38 26 L33 30 L32 36 L26.5 35
        L24 40 L21.5 35 L16 36 L15 30 L10 26 L13 21 L10 16 L15 14 L16 8 L21.5 9 Z
      " />
      {/* Outer ring */}
      <circle cx="24" cy="24" r="8" />
      {/* Inner circle (the 'eye') */}
      <circle cx="24" cy="24" r="4" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   TEAM — 3 person silhouettes (2 back, 1 front)
───────────────────────────────────────── */
export function DoodleTeam({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Left back person — head */}
      <circle cx="13" cy="14" r="5.5" />
      {/* Left back person — body arc */}
      <path d="M2 42 Q2 30 13 30 Q18 30 21 34" />
      {/* Right back person — head */}
      <circle cx="35" cy="14" r="5.5" />
      {/* Right back person — body arc */}
      <path d="M27 34 Q30 30 35 30 Q46 30 46 42" />
      {/* Front center person — head (larger) */}
      <circle cx="24" cy="13" r="6.5" />
      {/* Front center person — body arc (fuller) */}
      <path d="M10 44 Q10 30 24 30 Q38 30 38 44" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   SUPPORT — speech bubble with question mark + dot
───────────────────────────────────────── */
export function DoodleSupport({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Speech bubble body */}
      <path d="M4 6 Q4 4 6 4 H42 Q44 4 44 6 V30 Q44 32 42 32 H16 L6 44 V32 H6 Q4 32 4 30 V6 Z" />
      {/* Question mark arc */}
      <path d="M19 17 Q19 12 24 12 Q29 12 29 17 Q29 22 24 22 L24 25"
        strokeLinecap="round" strokeWidth={strokeWidth * 2} />
      {/* Question mark dot */}
      <circle cx="24" cy="30" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   ARCHIVE — open box with curved arrow going down in
───────────────────────────────────────── */
export function DoodleArchive({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Box base & sides */}
      <path d="M6 24 L6 44 L42 44 L42 24" />
      {/* Box open flaps — left and right angled */}
      <polyline points="2,18 10,24 20,20 24,24 28,20 38,24 46,18" />
      {/* Curved arrow going down into box */}
      <path d="M32 4 Q40 4 40 14 Q40 20 32 22" strokeLinecap="round" />
      <polyline points="28,18 32,22 36,18" />
      {/* Lines on box front */}
      <line x1="10" y1="34" x2="22" y2="34" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   FINANCIALS — bar chart with up arrow
───────────────────────────────────────── */
export function DoodleFinancials({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <line x1="4" y1="44" x2="44" y2="44" />
      <rect x="6"  y="28" width="8"  height="16" rx="1" />
      <rect x="20" y="18" width="8"  height="26" rx="1" />
      <rect x="34" y="10" width="8"  height="34" rx="1" />
      <polyline points="8,26 8,18 16,18" />
      <line x1="8" y1="18" x2="42" y2="4" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   PLUS — simple hand-drawn plus
───────────────────────────────────────── */
export function DoodlePlus({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 2.8} strokeLinecap="round"
      className={className}>
      <line x1="24" y1="8"  x2="24" y2="40" />
      <line x1="8"  y1="24" x2="40" y2="24" />
    </svg>
  )
}

/* ─────────────────────────────────────────
   LOGOUT — door with arrow
───────────────────────────────────────── */
export function DoodleLogout({ className, size = D.size, strokeWidth = D.sw }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth * 1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M28 6 H40 Q42 6 42 8 V40 Q42 42 40 42 H28" />
      <polyline points="20 34 30 24 20 14" />
      <line x1="30" y1="24" x2="6" y2="24" />
    </svg>
  )
}

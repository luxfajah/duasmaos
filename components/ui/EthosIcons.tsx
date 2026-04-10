import React from 'react'

interface IconProps {
  className?: string
  size?: number
  strokeWidth?: number
}

const defaults = { size: 24, strokeWidth: 1.8 }

export function DoodleDashboard({ className, size = defaults.size, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Grid lines */}
      <rect x="2" y="2" width="20" height="20" rx="1" />
      <line x1="2" y1="7" x2="22" y2="7" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="17" x2="22" y2="17" />
      <line x1="7" y1="2" x2="7" y2="22" />
      {/* Trend line */}
      <polyline points="7,17 11,11 15,14 20,7" strokeWidth={strokeWidth + 0.4} />
      <line x1="19" y1="5" x2="22" y2="5" strokeWidth={strokeWidth + 0.2} />
      <line x1="20" y1="4" x2="20" y2="8" strokeWidth={strokeWidth + 0.2} />
    </svg>
  )
}

export function DoodleProjects({ className, size = defaults.size, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Folder back */}
      <path d="M2 7 Q2 5 4 5 H9 L11 7 H20 Q22 7 22 9 V19 Q22 21 20 21 H4 Q2 21 2 19 Z" />
      {/* Folder front flap */}
      <path d="M2 10 H22" />
      {/* Documents inside */}
      <line x1="8" y1="15" x2="16" y2="15" />
      <line x1="8" y1="17.5" x2="14" y2="17.5" />
    </svg>
  )
}

export function DoodleClients({ className, size = defaults.size, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Person 1 (left) */}
      <circle cx="8" cy="7" r="3" />
      <path d="M2 20 Q2 14 8 14 Q11 14 12.5 16" />
      {/* Person 2 (right, larger/behind) */}
      <circle cx="16" cy="6" r="3.5" />
      <path d="M10 21 Q10.5 14.5 16 14.5 Q22 14.5 22 21" />
    </svg>
  )
}

export function DoodleTasks({ className, size = defaults.size, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Checked box */}
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <polyline points="4.5,6.5 6,8 9,4.5" />
      {/* Unchecked box */}
      <rect x="3" y="14" width="7" height="7" rx="1" />
      {/* Text lines */}
      <line x1="14" y1="6" x2="21" y2="6" />
      <line x1="14" y1="9" x2="19" y2="9" />
      <line x1="14" y1="17" x2="21" y2="17" />
      <line x1="14" y1="20" x2="18" y2="20" />
    </svg>
  )
}

export function DoodleCalendar({ className, size = defaults.size, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Outer frame */}
      <rect x="2" y="3" width="20" height="19" rx="1" />
      {/* Top rings */}
      <line x1="7" y1="1" x2="7" y2="5" />
      <line x1="17" y1="1" x2="17" y2="5" />
      {/* Header divider */}
      <line x1="2" y1="8" x2="22" y2="8" />
      {/* Grid */}
      <line x1="8" y1="8" x2="8" y2="22" strokeWidth={0.8} />
      <line x1="14" y1="8" x2="14" y2="22" strokeWidth={0.8} />
      <line x1="2" y1="13" x2="22" y2="13" strokeWidth={0.8} />
      <line x1="2" y1="18" x2="22" y2="18" strokeWidth={0.8} />
      {/* Circled day */}
      <circle cx="5" cy="10.5" r="1.2" />
    </svg>
  )
}

export function DoodleFiles({ className, size = defaults.size, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Back document */}
      <path d="M7 4 H16 L20 8 V21 H7 Z" />
      <path d="M16 4 V8 H20" />
      {/* Front document */}
      <path d="M4 7 H13 L17 11 V22 H4 Z" />
      <path d="M13 7 V11 H17" />
      {/* Lines on front doc */}
      <line x1="7" y1="15" x2="14" y2="15" />
      <line x1="7" y1="18" x2="12" y2="18" />
    </svg>
  )
}

export function DoodleClip({ className, size = defaults.size, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Paper */}
      <rect x="4" y="4" width="16" height="18" rx="1" />
      {/* Clip */}
      <path d="M14 2 Q18 2 18 5 Q18 8 14 8 L14 10" strokeLinecap="round" />
      {/* Lines on paper */}
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="7" y1="15" x2="17" y2="15" />
      <line x1="7" y1="18" x2="13" y2="18" />
    </svg>
  )
}

export function DoodleSettings({ className, size = defaults.size, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Gear teeth - 8 teeth */}
      <path d="M12 2 L13.5 5 L17 4 L17 7.5 L20 9 L18 12 L20 15 L17 16.5 L17 20 L13.5 19 L12 22 L10.5 19 L7 20 L7 16.5 L4 15 L6 12 L4 9 L7 7.5 L7 4 L10.5 5 Z" />
      {/* Inner circle */}
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  )
}

export function DoodleTeam({ className, size = defaults.size, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Left person */}
      <circle cx="5.5" cy="6.5" r="2.5" />
      <path d="M1 20 Q1 14 5.5 14 Q7.5 14 9 15.5" />
      {/* Right person */}
      <circle cx="18.5" cy="6.5" r="2.5" />
      <path d="M15 15.5 Q16.5 14 18.5 14 Q23 14 23 20" />
      {/* Center person */}
      <circle cx="12" cy="5.5" r="3" />
      <path d="M6 21 Q6 14.5 12 14.5 Q18 14.5 18 21" />
    </svg>
  )
}

export function DoodleSupport({ className, size = defaults.size, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Speech bubble */}
      <path d="M3 4 Q3 2 5 2 H19 Q21 2 21 4 V14 Q21 16 19 16 H8 L3 21 V16 H5 Q3 16 3 14 Z" />
      {/* Question mark */}
      <path d="M10 8 Q10 6 12 6 Q14 6 14 8 Q14 10 12 10 L12 11.5" strokeLinecap="round" />
      <circle cx="12" cy="13.5" r="0.7" fill="currentColor" />
    </svg>
  )
}

export function DoodleArchive({ className, size = defaults.size, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Box base */}
      <path d="M3 12 L3 21 L21 21 L21 12" />
      {/* Box flaps (open) */}
      <path d="M1 9 L5 12 L9 10 L12 12 L15 10 L19 12 L23 9" />
      {/* Arrow going in */}
      <line x1="12" y1="2" x2="12" y2="16" />
      <polyline points="8,12 12,16 16,12" />
      {/* Box side lines */}
      <line x1="3" y1="16" x2="7" y2="16" />
    </svg>
  )
}

export function DoodlePlus({ className, size = defaults.size, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth + 0.5} strokeLinecap="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export function DoodleFinancials({ className, size = defaults.size, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Bar chart */}
      <line x1="3" y1="22" x2="21" y2="22" />
      <rect x="4" y="12" width="4" height="10" rx="0.5" />
      <rect x="10" y="7" width="4" height="15" rx="0.5" />
      <rect x="16" y="4" width="4" height="18" rx="0.5" />
      {/* Arrow up */}
      <polyline points="5,10 5,5 9,5" />
      <line x1="5" y1="5" x2="19" y2="1" />
    </svg>
  )
}

export function DoodleLogout({ className, size = defaults.size, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 3 H19 Q21 3 21 5 V19 Q21 21 19 21 H15" />
      <polyline points="10,17 15,12 10,7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  )
}

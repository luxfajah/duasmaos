'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────
   AVATAR
───────────────────────────────────────── */

const avatarVariants = cva(
  "relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full font-medium select-none",
  {
    variants: {
      size: {
        xs: "size-6 text-[10px]",
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
        xl: "size-16 text-lg",
      },
      variant: {
        default: "bg-brand-primary/10 text-brand-primary ring-2 ring-brand-primary/20",
        brand: "bg-brand-primary text-text-inverse",
        muted: "bg-surface-muted text-text-secondary ring-1 ring-border",
        accent: "bg-brand-accent/20 text-brand-secondary",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

const statusVariants = {
  online: "bg-status-success",
  offline: "bg-border",
  busy: "bg-status-danger",
  away: "bg-status-warning",
} as const

export interface AvatarProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof avatarVariants> {
  /** Texto para gerar as iniciais (ex: "João Silva" → "JS") */
  name?: string
  /** URL da imagem */
  src?: string
  /** Alt da imagem */
  alt?: string
  /** Indicador de status */
  status?: keyof typeof statusVariants
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function Avatar({
  name,
  src,
  alt,
  status,
  size,
  variant,
  className,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)
  const showImage = src && !imgError

  return (
    <div
      data-slot="avatar"
      className={cn(avatarVariants({ size, variant }), className)}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? name ?? "Avatar"}
          className="size-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : name ? (
        <span aria-hidden>{getInitials(name)}</span>
      ) : (
        /* Ícone genérico de usuário */
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="size-[55%]"
          aria-hidden
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}

      {status && (
        <span
          aria-label={`Status: ${status}`}
          className={cn(
            "absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-surface",
            statusVariants[status]
          )}
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   AVATAR GROUP (empilhado)
───────────────────────────────────────── */

interface AvatarGroupProps {
  avatars: Array<{ name?: string; src?: string }>
  max?: number
  size?: VariantProps<typeof avatarVariants>["size"]
  className?: string
}

function AvatarGroup({ avatars, max = 4, size = "sm", className }: AvatarGroupProps) {
  const visible = avatars.slice(0, max)
  const overflow = avatars.length - max

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((a, i) => (
        <Avatar
          key={i}
          name={a.name}
          src={a.src}
          size={size}
          variant="muted"
          className="ring-2 ring-surface"
          title={a.name}
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            avatarVariants({ size, variant: "muted" }),
            "ring-2 ring-surface"
          )}
        >
          <span className="text-[10px] font-bold">+{overflow}</span>
        </div>
      )}
    </div>
  )
}

export { Avatar, AvatarGroup, avatarVariants }

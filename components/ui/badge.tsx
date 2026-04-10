import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-[10px] font-bold tracking-wide whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        // Padrão shadcn
        default: "bg-brand-primary text-text-inverse hover:bg-brand-primary-hover",
        secondary: "bg-surface-muted text-text-primary border-border hover:bg-border",
        muted: "bg-surface-muted/50 text-text-muted border-border hover:bg-surface-muted",
        outline: "border-border text-text-secondary hover:bg-surface-muted",
        ghost: "text-text-secondary hover:bg-surface-muted",

        // Semânticos de domínio
        success: "bg-status-success/15 text-status-success border-status-success/20",
        warning: "bg-status-warning/15 text-status-warning border-status-warning/20",
        danger: "bg-status-danger/15 text-status-danger border-status-danger/20",
        info: "bg-status-info/15 text-status-info border-status-info/20",
        pending: "bg-status-pending/15 text-status-pending border-status-pending/20",
        draft: "bg-status-draft/15 text-status-draft border-status-draft/20",

        // Sólidos (para destaque máximo)
        "success-solid": "bg-status-success text-text-inverse border-transparent",
        "warning-solid": "bg-status-warning text-text-inverse border-transparent",
        "danger-solid": "bg-status-danger text-text-inverse border-transparent",
        "info-solid": "bg-status-info text-text-inverse border-transparent",
        "pending-solid": "bg-status-pending text-text-inverse border-transparent",
        "draft-solid": "bg-status-draft text-text-inverse border-transparent",

        // Editorial / marca
        brand: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
        accent: "bg-brand-accent/20 text-brand-secondary border-brand-accent/30",
        destructive: "bg-status-danger/10 text-status-danger border-status-danger/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

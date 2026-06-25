import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center",
    "gap-1 overflow-hidden rounded-full border border-transparent",
    "px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase whitespace-nowrap",
    "transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "[&>svg]:pointer-events-none [&>svg]:size-3!",
  ].join(" "),
  {
    variants: {
      variant: {
        /* ── Brand palette ── */
        default:
          "bg-brand-primary text-text-inverse hover:bg-brand-primary-hover",
        terracotta:
          "bg-terracotta-soft text-terracotta-dark border-terracotta/20",
        "deep-blue":
          "bg-deep-blue-soft text-deep-blue border-deep-blue/20",
        olive:
          "bg-olive-soft text-olive-dark border-olive/20",
        yellow:
          "bg-yellow-soft text-yellow-dark border-yellow/20",

        /* ── Status variants — Apple HIG Translucent ── */
        success:
          "bg-status-success/15 text-status-success border-transparent",
        warning:
          "bg-status-warning/15 text-status-warning border-transparent",
        danger:
          "bg-status-danger/15 text-status-danger border-transparent",
        info:
          "bg-status-info/15 text-status-info border-transparent",
        pending:
          "bg-status-pending/15 text-status-pending border-transparent",
        draft:
          "bg-black/5 dark:bg-white/10 text-text-secondary border-transparent",

        /* ── Solid status ── */
        "success-solid":
          "bg-olive text-text-inverse border-transparent",
        "warning-solid":
          "bg-yellow text-text-primary border-transparent",
        "danger-solid":
          "bg-terracotta text-text-inverse border-transparent",
        "info-solid":
          "bg-deep-blue text-text-inverse border-transparent",
        "pending-solid":
          "bg-yellow text-text-primary border-transparent",
        "draft-solid":
          "bg-text-muted text-text-inverse border-transparent",

        /* ── Neutral ── */
        secondary:
          "bg-black/5 dark:bg-white/10 text-text-primary border-transparent hover:bg-black/10 dark:hover:bg-white/20",
        muted:
          "bg-surface-muted/50 text-text-muted border-border hover:bg-surface-muted",
        outline:
          "border-border text-text-secondary hover:bg-surface-muted",
        ghost:
          "text-text-secondary hover:bg-surface-muted",

        /* ── Legacy editorial ── */
        brand:
          "bg-terracotta-soft text-terracotta-dark border-terracotta/20",
        accent:
          "bg-yellow-soft text-yellow-dark border-yellow/20",
        destructive:
          "bg-terracotta-soft text-terracotta-dark border-terracotta/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }
>(({ className, variant = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge, badgeVariants }

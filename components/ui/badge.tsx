import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center",
    "gap-1 overflow-hidden rounded-full border border-transparent",
    "px-2 py-0.5 text-[10px] font-bold tracking-wide whitespace-nowrap",
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

        /* ── Status variants — Duas Mãos tones ── */
        success:
          "bg-olive-soft text-olive-dark border-olive/20",
        warning:
          "bg-yellow-soft text-yellow-dark border-yellow/20",
        danger:
          "bg-terracotta-soft text-terracotta-dark border-terracotta/20",
        info:
          "bg-deep-blue-soft text-deep-blue border-deep-blue/20",
        pending:
          "bg-yellow-soft text-yellow-dark border-yellow/20",
        draft:
          "bg-surface-muted text-text-muted border-border",

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
          "bg-surface-muted text-text-primary border-border hover:bg-border",
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

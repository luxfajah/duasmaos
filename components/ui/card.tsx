import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────
   DOIS MÃOS — 4 CARD TYPES
   1. sand     — Level 0: calm, background-near
   2. default  — Level 1: light surface
   3. elevated — Level 2: stronger shadow
   4. terracotta — Level 3a: highlight block
   5. deep-blue  — Level 3b: immersive block
───────────────────────────────────────── */

const cardVariants = cva(
  [
    "group/card flex flex-col gap-4 overflow-hidden rounded-2xl py-4 text-sm",
    "ring-0", // Remove global ring
    "has-data-[slot=card-footer]:pb-0",
    "has-[>img:first-child]:pt-0",
    "data-[size=sm]:gap-3 data-[size=sm]:py-3",
    "data-[size=sm]:has-data-[slot=card-footer]:pb-0",
    "*:[img:first-child]:rounded-t-2xl *:[img:last-child]:rounded-b-2xl",
    "transition-all duration-200",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Level 0 — Sand, calming background surface */
        sand:
          "bg-sand text-text-primary border border-sand-dark/50 shadow-xs hover:-translate-y-0.5 hover:shadow-md",

        /* Level 1 — Default light surface on white/near-white */
        default:
          "glass glass-reflection text-text-primary hover:-translate-y-1 hover:shadow-card-hover",

        /* Level 2 — Elevated, stronger shadow */
        elevated:
          "glass glass-reflection text-text-primary shadow-md hover:-translate-y-1.5 hover:shadow-card-hover",

        /* Level 3a — Terracotta: energy and expression */
        terracotta:
          "card-terracotta text-text-inverse ring-0 hover:-translate-y-1.5",

        /* Level 3b — Deep Blue: trust and immersion */
        "deep-blue":
          "card-deep-blue text-text-inverse ring-0 hover:-translate-y-1.5",

        /* ── Specialty variants ── */
        muted:
          "bg-surface-muted text-text-primary ring-0 border-none shadow-none",
        editorial:
          "bg-editorial-frame border-l-4 border-l-brand-primary text-text-primary rounded-none ring-0",
        status:
          "bg-surface border-l-4 border-l-pending text-text-primary shadow-sm",
        client:
          "bg-surface border border-border shadow-sm text-text-primary",
        highlight:
          "bg-editorial-highlight text-brand-primary border border-brand-accent/40 shadow-sm", // Keep solid

        /* Legacy aliases */
        graphite:
          "card-deep-blue text-text-inverse ring-0",
        brand:
          "card-terracotta text-text-inverse ring-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Card({
  className,
  size = "default",
  variant,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1",
        "rounded-t-2xl px-5 group-data-[size=sm]/card:px-4",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        "has-data-[slot=card-description]:grid-rows-[auto_auto]",
        "[.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-semibold",
        "group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-text-secondary", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 group-data-[size=sm]/card:px-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-2xl border-t bg-surface-muted/50 p-5",
        "group-data-[size=sm]/card:p-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

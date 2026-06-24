import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center",
    "rounded-md border border-transparent bg-clip-padding",
    "text-sm font-bold whitespace-nowrap",
    "transition-all duration-300 ease-apple outline-none select-none",
    "active:scale-[0.97]",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    "active:not-aria-[haspopup]:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
    "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Terracotta — primary energy, strong presence */
        default:
          "bg-brand-primary text-text-inverse shadow-xs hover:bg-brand-primary-hover hover:shadow-sm",
        primary:
          "bg-brand-primary text-text-inverse shadow-xs hover:bg-brand-primary-hover hover:shadow-sm",

        /* Sand/neutral — secondary, no strong presence */
        secondary:
          "bg-surface border border-border text-text-primary shadow-xs hover:bg-surface-muted hover:shadow-sm",

        /* Deep Blue — immersive, trust */
        "deep-blue":
          "bg-brand-deep-blue text-text-inverse shadow-xs hover:bg-brand-deep-blue-light hover:shadow-sm",

        /* Ghost — no background, terracotta text */
        ghost:
          "text-brand-primary hover:bg-brand-primary/8 hover:text-brand-primary",

        /* Outline — border only */
        outline:
          "border border-border bg-transparent text-text-primary hover:bg-surface-muted",

        /* Danger */
        danger:
          "bg-status-danger text-text-inverse hover:bg-status-danger/90",

        /* Olive — secondary brand */
        olive:
          "bg-brand-secondary text-text-inverse shadow-xs hover:bg-brand-secondary-light",

        /* Editorial — styled accent */
        editorial:
          "font-subheading text-lg bg-editorial-highlight text-brand-primary hover:bg-editorial-quote border border-brand-primary/20",
      },
      size: {
        default:
          "h-9 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs:
          "h-6 gap-1 rounded-sm px-2.5 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm:
          "h-7 gap-1.5 rounded-md px-3 text-[0.8rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg:
          "h-10 gap-2 px-5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xl:
          "h-12 gap-2.5 px-6 text-base rounded-lg has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon:      "size-9",
        "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
    }
>(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }

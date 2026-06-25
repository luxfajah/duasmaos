import * as React from "react"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────
   INPUT WRAPPER (com label, hint, error)
───────────────────────────────────────── */

export interface InputFieldProps extends React.ComponentProps<"input"> {
  label?: string
  hint?: string
  error?: string
  /** Ícone antes do input */
  leftIcon?: React.ReactNode
  /** Ícone/elemento depois do input */
  rightElement?: React.ReactNode
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, label, hint, error, leftIcon, rightElement, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-bold font-heading text-text-primary leading-none"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-brand-primary" aria-hidden>*</span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 flex items-center text-text-muted [&>svg]:size-4">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={cn(
              /* base */
              "h-10 w-full rounded-xl border-transparent bg-black/5 dark:bg-white/5 px-4 py-2.5 hover:bg-black/[0.07] dark:hover:bg-white/[0.07]",
              "text-[15px] font-medium text-text-primary placeholder:text-text-muted",
              "shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]",
              "transition-all duration-300 ease-apple outline-none",
              /* focus — Terracotta ring */
              "focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/20",
              /* disabled */
              "disabled:cursor-not-allowed disabled:opacity-50",
              /* error state */
              "aria-invalid:border-brand-primary aria-invalid:ring-2 aria-invalid:ring-brand-primary/20",
              /* icon offsets */
              leftIcon && "pl-10",
              rightElement && "pr-10",
              className
            )}
            {...props}
          />

          {rightElement && (
            <span className="absolute right-3.5 flex items-center text-text-muted [&>svg]:size-4">
              {rightElement}
            </span>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-brand-primary flex items-center gap-1 font-medium"
          >
            <svg viewBox="0 0 16 16" className="size-3 shrink-0" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6.5a.875.875 0 110-1.75.875.875 0 010 1.75z" />
            </svg>
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-text-muted">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
InputField.displayName = "InputField"

/* ─────────────────────────────────────────
   INPUT PRIMITIVO (compatível com shadcn)
───────────────────────────────────────── */

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-xl border-transparent bg-black/5 dark:bg-white/5 px-4 py-2.5 hover:bg-black/[0.07] dark:hover:bg-white/[0.07]",
          "text-[15px] font-medium text-text-primary placeholder:text-text-muted",
          "shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]",
          "transition-all duration-300 ease-apple outline-none",
          "focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-brand-primary aria-invalid:ring-2 aria-invalid:ring-brand-primary/20",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

/* ─────────────────────────────────────────
   TEXTAREA WRAPPER
───────────────────────────────────────── */

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[100px] w-full rounded-xl border-transparent bg-black/5 dark:bg-white/5 px-4 py-3 hover:bg-black/[0.07] dark:hover:bg-white/[0.07]",
          "text-[15px] font-medium text-text-primary placeholder:text-text-muted",
          "transition-all duration-200 outline-none resize-none",
          "focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Input, InputField, Textarea }

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

function InputField({
  className,
  label,
  hint,
  error,
  leftIcon,
  rightElement,
  id,
  ...props
}: InputFieldProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary leading-none"
        >
          {label}
          {props.required && (
            <span className="ml-0.5 text-status-danger" aria-hidden>*</span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 flex items-center text-text-muted [&>svg]:size-4">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={cn(
            "h-9 w-full rounded-sm border border-border bg-surface px-3 py-2",
            "text-sm text-text-primary placeholder:text-text-muted",
            "transition-all duration-normal outline-none",
            "focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "aria-invalid:border-status-danger aria-invalid:ring-2 aria-invalid:ring-status-danger/20",
            leftIcon && "pl-9",
            rightElement && "pr-9",
            className
          )}
          {...props}
        />

        {rightElement && (
          <span className="absolute right-3 flex items-center text-text-muted [&>svg]:size-4">
            {rightElement}
          </span>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs text-status-danger flex items-center gap-1"
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

/* ─────────────────────────────────────────
   INPUT PRIMITIVO (compatível com shadcn)
───────────────────────────────────────── */

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-sm border border-border bg-surface px-3 py-2",
        "text-sm text-text-primary placeholder:text-text-muted",
        "transition-all duration-normal outline-none",
        "focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-status-danger aria-invalid:ring-2 aria-invalid:ring-status-danger/20",
        className
      )}
      {...props}
    />
  )
}

export { Input, InputField }

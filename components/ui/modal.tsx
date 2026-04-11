'use client'

import * as React from "react"
import * as ReactDOM from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────
   PORTAL COMPONENT
───────────────────────────────────────── */

interface PortalProps {
  children: React.ReactNode
}

function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return ReactDOM.createPortal(children, document.body)
}

/* ─────────────────────────────────────────
   MODAL CONTEXT
───────────────────────────────────────── */

interface ModalContextValue {
  open: boolean
  onClose: () => void
}

const ModalContext = React.createContext<ModalContextValue>({
  open: false,
  onClose: () => {},
})

/* ─────────────────────────────────────────
   MODAL ROOT
───────────────────────────────────────── */

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

function Modal({ open, onClose, children }: ModalProps) {
  // Fecha com ESC
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Bloqueia scroll do body
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    <ModalContext.Provider value={{ open, onClose }}>
      <Portal>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl animate-fade-in transition-opacity"
            onClick={onClose}
            aria-hidden
          />
          {children}
        </div>
      </Portal>
    </ModalContext.Provider>
  )
}

/* ─────────────────────────────────────────
   MODAL CONTENT
───────────────────────────────────────── */

interface ModalContentProps extends React.ComponentProps<"div"> {
  size?: "sm" | "md" | "lg" | "xl" | "full" | "giant"
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-5xl",
  giant: "max-w-[85vw] h-[85vh]",
}

function ModalContent({ className, size = "md", children, ...props }: ModalContentProps) {
  return (
    <div
      className={cn(
        "relative z-[10000] w-full bg-surface border border-border/50 shadow-2xl animate-scale-in flex flex-col overflow-hidden",
        sizeMap[size],
        size === "full" ? "h-[100dvh] rounded-none sm:rounded-xl sm:h-auto" : "rounded-[32px] m-4 sm:m-0",
        size === "giant" && "max-h-[85vh]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────
   MODAL HEADER
───────────────────────────────────────── */

interface ModalHeaderProps extends React.ComponentProps<"div"> {
  /** Exibe botão de fechar no header */
  showClose?: boolean
}

function ModalHeader({ className, showClose = true, children, ...props }: ModalHeaderProps) {
  const { onClose } = React.useContext(ModalContext)

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border px-6 py-5",
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {showClose && (
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors"
          aria-label="Fechar modal"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   MODAL TITLE
───────────────────────────────────────── */

function ModalTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-lg font-semibold text-text-primary leading-tight", className)}
      {...props}
    />
  )
}

function ModalDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-text-muted mt-0.5", className)} {...props} />
  )
}

/* ─────────────────────────────────────────
   MODAL BODY
───────────────────────────────────────── */

function ModalBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("px-6 py-5", className)} {...props} />
  )
}

/* ─────────────────────────────────────────
   MODAL FOOTER
───────────────────────────────────────── */

function ModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 border-t border-border px-6 py-4",
        "bg-surface-muted/50 rounded-b-xl",
        className
      )}
      {...props}
    />
  )
}

/* ─────────────────────────────────────────
   MODAL HOOK
───────────────────────────────────────── */

export function useModal(initialState = false) {
  const [open, setOpen] = React.useState(initialState)
  return {
    open,
    onOpen: () => setOpen(true),
    onClose: () => setOpen(false),
    toggle: () => setOpen((s) => !s),
  }
}

export {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
}

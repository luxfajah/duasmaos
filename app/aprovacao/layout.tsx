import React from 'react'
import Link from 'next/link'

export default function AprovacaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Minimal branded header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-sm group-hover:shadow-brand transition-shadow">
              <span className="text-white font-bold text-sm">DM</span>
            </div>
            <span className="font-heading font-bold text-text-primary text-sm tracking-tight">
              Duas Mãos
            </span>
          </Link>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted">
            Portal de Aprovação
          </span>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {children}
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-border py-8 mt-20">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Duas Mãos · Planejamento Criativo
          </p>
          <p className="text-xs text-text-muted">
            Acesso seguro via link único
          </p>
        </div>
      </footer>
    </div>
  )
}

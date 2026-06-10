import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { PopupHashDetector } from '@/components/auth/PopupHashDetector'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default async function Page() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const portalUrl = user ? "/dashboard" : "/login"

  return (
    <div className="min-h-screen bg-background relative flex flex-col justify-between overflow-hidden">
      {/* Supabase OAuth Popup Redirect Detector */}
      <PopupHashDetector />

      {/* Repeating subtle background patterns */}
      <div className="absolute inset-0 bg-[url('/brand/patterns-02.webp')] bg-[size:280px_auto] bg-repeat opacity-[0.03] pointer-events-none z-0 dark:hidden" />
      <div className="absolute inset-0 bg-[url('/brand/patterns-02-dark.png')] bg-[size:280px_auto] bg-repeat opacity-[0.15] pointer-events-none z-0 hidden dark:block" />

      {/* Atmospheric organic background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] rounded-full bg-brand-primary/10 dark:bg-brand-primary/5 blur-[100px] sm:blur-[130px] pointer-events-none z-0 animate-blob-drift" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full bg-brand-secondary/15 dark:bg-brand-deep-blue/10 blur-[120px] sm:blur-[150px] pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between z-50 relative animate-fade-in">
        <Link href="/" className="transition-transform duration-200 hover:scale-[1.02] focus:outline-none">
          <img
            src="/brand/logos/logotipo-primary.png"
            alt="Duas Mãos Logo"
            className="h-7 sm:h-8 w-auto dark:hidden select-none"
          />
          <img
            src="/brand/logos/logotipo-light.png"
            alt="Duas Mãos Logo"
            className="h-7 sm:h-8 w-auto hidden dark:block select-none"
          />
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href={portalUrl}
            className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold tracking-wide text-white bg-brand-primary hover:bg-brand-primary-hover shadow-brand hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            Acessar Portal
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 relative z-10 max-w-4xl mx-auto">
        {/* The two SVG badges/stickers */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-10 sm:mb-12 animate-fade-in-up">
          <div className="relative group transition-transform duration-300 hover:scale-105 hover:-rotate-1 cursor-default">
            <img
              src="/brand/Expandindo-ideias-1.svg"
              alt="Expandindo ideias"
              className="h-8 sm:h-9 w-auto select-none drop-shadow-sm"
            />
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-brand-primary/30" />
          <div className="relative group transition-transform duration-300 hover:scale-105 hover:rotate-1 cursor-default">
            <img
              src="/brand/Unindo-saberes.svg"
              alt="Unindo saberes"
              className="h-8 sm:h-9 w-auto select-none drop-shadow-sm"
            />
          </div>
        </div>

        {/* Brand Text Info */}
        <div className="space-y-6 max-w-2xl mx-auto">
          <h1 className="font-heading heading-editorial text-text-primary text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight animate-fade-in-up [animation-delay:150ms]">
            Como você viu, <br className="sm:hidden" /> a Duas Mãos{" "}
            <span className="text-brand-primary relative inline-block">
              mudou.
              <span className="absolute left-0 right-0 -bottom-1 h-[2px] sm:h-[3px] bg-brand-accent/60 rounded-full" />
            </span>
          </h1>

          <p className="font-body text-text-secondary text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto animate-fade-in-up [animation-delay:300ms] font-light">
            Por isso, o nosso site está sendo repaginado. Em breve, você verá ele com uma nova cara ❤
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-6 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 relative border-t border-border/10 text-center text-xs text-text-muted/65 font-body">
        <div>
          © {new Date().getFullYear()} Duas Mãos. Todos os direitos reservados.
        </div>
        <div className="flex items-center gap-6">
          <a href="mailto:contato@duasmaos.com.br" className="hover:text-brand-primary transition-colors duration-200">
            contato@duasmaos.com.br
          </a>
          <a href="https://wa.me/5551980388402" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors duration-200">
            WhatsApp: (51) 98038-8402
          </a>
        </div>
      </footer>
    </div>
  )
}

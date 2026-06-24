import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { PopupHashDetector } from '@/components/auth/PopupHashDetector'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default async function Page() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const portalUrl = user ? "/dashboard" : "/login"

  return (
    <div className="min-h-screen bg-background relative flex flex-col justify-between overflow-x-hidden">
      {/* Supabase OAuth Popup Redirect Detector */}
      <PopupHashDetector />

      {/* Repeating subtle background patterns */}
      <div className="absolute inset-0 bg-[url('/brand/patterns-02.webp')] bg-[size:280px_auto] bg-repeat opacity-[0.02] pointer-events-none z-0 dark:hidden" />
      <div className="absolute inset-0 bg-[url('/brand/patterns-02-dark.png')] bg-[size:280px_auto] bg-repeat opacity-[0.10] pointer-events-none z-0 hidden dark:block" />

      {/* Apple-style smooth gradient blur background */}
      <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-brand-primary/[0.04] dark:bg-brand-primary/[0.02] blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-brand-secondary/[0.06] dark:bg-brand-deep-blue/[0.04] blur-[180px] pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="sticky top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.06] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="transition-transform duration-200 hover:scale-[1.01] focus:outline-none">
            <img
              src="/brand/logos/logotipo-primary.png"
              alt="Duas Mãos Logo"
              className="h-6 sm:h-7 w-auto dark:hidden select-none"
            />
            <img
              src="/brand/logos/logotipo-light.png"
              alt="Duas Mãos Logo"
              className="h-6 sm:h-7 w-auto hidden dark:block select-none"
            />
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle className="text-text-secondary hover:text-text-primary transition-colors" />
            <Link
              href={portalUrl}
              className="inline-flex items-center justify-center px-5 py-2 rounded-full text-xs font-semibold tracking-wide text-white bg-brand-primary hover:bg-brand-primary-hover shadow-apple-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Acessar Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-24 relative z-10 max-w-5xl mx-auto w-full">
        {/* SVG badges/stickers */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-8 animate-fade-in-up">
          <div className="relative group transition-transform duration-300 hover:scale-105 hover:-rotate-1 cursor-default">
            <img
              src="/brand/Expandindo-ideias-1.svg"
              alt="Expandindo ideias"
              className="h-7 sm:h-8 w-auto select-none opacity-85"
            />
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-text-muted/40" />
          <div className="relative group transition-transform duration-300 hover:scale-105 hover:rotate-1 cursor-default">
            <img
              src="/brand/Unindo-saberes.svg"
              alt="Unindo saberes"
              className="h-7 sm:h-8 w-auto select-none opacity-85"
            />
          </div>
        </div>

        {/* Brand Text Info */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <h1 className="text-text-primary text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] animate-fade-in-up [animation-delay:150ms]">
            Como você viu, <br /> a Duas Mãos{" "}
            <span className="text-brand-primary relative inline-block">
              mudou.
              <span className="absolute left-0 right-0 -bottom-1 h-[2px] bg-brand-accent/50 rounded-full" />
            </span>
          </h1>

          <p className="text-text-secondary text-base sm:text-xl leading-relaxed max-w-xl mx-auto animate-fade-in-up [animation-delay:300ms] font-light">
            Por isso, o nosso site está sendo repaginado. Em breve, você verá ele com uma nova cara ❤
          </p>
        </div>

        {/* Premium macOS Mockup Window */}
        <div className="w-full max-w-3xl mt-12 sm:mt-16 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/[0.6] dark:bg-black/[0.6] backdrop-blur-2xl shadow-apple-xl overflow-hidden animate-fade-in-up [animation-delay:450ms]">
          {/* Titlebar */}
          <div className="h-10 border-b border-black/[0.05] dark:border-white/[0.05] flex items-center px-4 gap-2 bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] opacity-90" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] opacity-90" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] opacity-90" />
            </div>
            <div className="mx-auto text-[11px] font-medium text-text-secondary/70 select-none">
              Duas Mãos — Portal de Aprovação
            </div>
          </div>
          {/* Mock Content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left select-none">
            <div className="bg-white/80 dark:bg-zinc-900/80 rounded-xl p-4 border border-black/[0.03] dark:border-white/[0.03] shadow-apple-xs">
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Status de Projetos</div>
              <div className="text-2xl font-bold text-text-primary">12 Ativos</div>
              <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-brand-primary h-full w-2/3 rounded-full" />
              </div>
            </div>
            <div className="bg-white/80 dark:bg-zinc-900/80 rounded-xl p-4 border border-black/[0.03] dark:border-white/[0.03] shadow-apple-xs">
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Aprovações Pendentes</div>
              <div className="text-2xl font-bold text-brand-primary">4 Itens</div>
              <span className="text-[10px] text-text-muted block mt-2">Aguardando feedback do cliente</span>
            </div>
            <div className="bg-white/80 dark:bg-zinc-900/80 rounded-xl p-4 border border-black/[0.03] dark:border-white/[0.03] shadow-apple-xs">
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Taxa de Conclusão</div>
              <div className="text-2xl font-bold text-text-primary">94.2%</div>
              <span className="text-[10px] text-[#27C93F] block mt-2">▲ 3.5% esta semana</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-8 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 relative border-t border-black/[0.04] dark:border-white/[0.06] text-center text-xs text-text-muted/80 font-body">
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

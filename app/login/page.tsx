import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#0A0A0C] relative flex flex-col justify-between items-center p-6 overflow-hidden">
      {/* Repeating subtle background patterns */}
      <div className="absolute inset-0 bg-[url('/brand/patterns-02.webp')] bg-[size:280px_auto] bg-repeat opacity-[0.015] pointer-events-none z-0 dark:hidden" />
      <div className="absolute inset-0 bg-[url('/brand/patterns-02-dark.png')] bg-[size:280px_auto] bg-repeat opacity-[0.08] pointer-events-none z-0 hidden dark:block" />

      {/* Atmospheric organic background blobs (subtle & diffused) */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-brand-primary/[0.03] dark:bg-brand-primary/[0.015] blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-brand-secondary/[0.04] dark:bg-brand-deep-blue/[0.02] blur-[150px] pointer-events-none z-0" />

      {/* Theme Toggle - Top Right */}
      <div className="w-full max-w-5xl flex justify-between items-center z-10 relative py-2">
        <Link href="/" className="transition-transform duration-200 hover:scale-[1.01]">
          <img
            src="/brand/logos/logotipo-primary.png"
            alt="Duas Mãos Logo"
            className="h-6 w-auto dark:hidden select-none"
          />
          <img
            src="/brand/logos/logotipo-light.png"
            alt="Duas Mãos Logo"
            className="h-6 w-auto hidden dark:block select-none"
          />
        </Link>
        <ThemeToggle className="text-text-secondary hover:text-text-primary transition-colors" />
      </div>

      {/* Centered iOS/macOS Style Card Sheet */}
      <main className="flex-1 flex items-center justify-center w-full z-10 py-10">
        <div className="w-full max-w-[420px] bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.06] rounded-3xl shadow-apple-xl p-8 sm:p-10 space-y-8 animate-fade-in-up">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">Acesso</h2>
            <p className="text-text-secondary text-sm font-light">Insira suas credenciais para continuar.</p>
          </div>

          <form action={login} method="POST" className="space-y-5">
            <div className="space-y-1.5 text-left font-body">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary pl-1">E-mail</label>
              <Input
                name="email"
                type="email"
                required
                className="w-full px-3.5 py-2.5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-text-primary placeholder:text-text-muted/40 text-sm"
                placeholder="voce@duasmaos.com"
              />
            </div>

            <div className="space-y-1.5 text-left font-body">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Senha</label>
                <span className="text-[10px] text-text-muted hover:text-brand-primary cursor-pointer transition-colors font-medium">
                  Esqueceu?
                </span>
              </div>
              <Input
                name="password"
                type="password"
                required
                className="w-full px-3.5 py-2.5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-text-primary placeholder:text-text-muted/40 text-sm"
                placeholder="••••••••"
              />
            </div>

            {searchParams?.message && (
              <p className="text-danger text-sm font-medium p-3 bg-danger/5 border border-danger/10 rounded-xl text-center">
                {searchParams.message}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-11 bg-brand-primary hover:bg-brand-primary-hover shadow-apple-sm text-white font-semibold rounded-full tracking-wide hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
            >
              Entrar na plataforma
            </Button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/[0.06] dark:border-white/[0.06]"></div>
            </div>
            <div className="relative bg-transparent text-[10px] uppercase tracking-widest font-bold text-text-muted px-4 select-none">
              Ou
            </div>
          </div>

          <GoogleLoginButton />

          <div className="text-center">
            <p className="text-sm text-text-muted">
              Não tem uma conta?{' '}
              <Link href="/signup" className="font-semibold text-brand-primary hover:underline transition-all">
                Solicitar conta
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Copyright Footer */}
      <footer className="w-full text-center text-[10px] uppercase tracking-widest font-bold text-text-muted/50 font-body py-4 z-10">
        &copy; {new Date().getFullYear()} Agência Duas Mãos
      </footer>
    </div>
  )
}

import { login } from './actions'
import { Button } from '@/components/ui/button'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className="min-h-screen bg-background relative flex flex-col justify-between overflow-hidden md:grid md:grid-cols-12">
      {/* Repeating subtle background patterns */}
      <div className="absolute inset-0 bg-[url('/brand/patterns-02.webp')] bg-[size:280px_auto] bg-repeat opacity-[0.03] pointer-events-none z-0 dark:hidden" />
      <div className="absolute inset-0 bg-[url('/brand/patterns-02-dark.png')] bg-[size:280px_auto] bg-repeat opacity-[0.15] pointer-events-none z-0 hidden dark:block" />

      {/* Atmospheric organic background blobs */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] rounded-full bg-brand-primary/10 dark:bg-brand-primary/5 blur-[100px] sm:blur-[130px] pointer-events-none z-0 animate-blob-drift" />
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full bg-brand-secondary/15 dark:bg-brand-deep-blue/10 blur-[120px] sm:blur-[150px] pointer-events-none z-0" />

      {/* Theme Toggle - Fixed Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Left Column: Brand Intro (Hidden on mobile) */}
      <div className="hidden md:flex md:col-span-6 flex-col justify-between p-12 lg:p-16 relative z-10 border-r border-border/10">
        <div>
          <Link href="/" className="transition-transform duration-200 hover:scale-[1.02] inline-block">
            <img
              src="/brand/logos/logotipo-primary.png"
              alt="Duas Mãos Logo"
              className="h-8 w-auto dark:hidden select-none"
            />
            <img
              src="/brand/logos/logotipo-light.png"
              alt="Duas Mãos Logo"
              className="h-8 w-auto hidden dark:block select-none"
            />
          </Link>
        </div>

        <div className="max-w-lg my-auto pr-6 space-y-6">
          <h1 className="font-heading heading-editorial text-text-primary text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight animate-fade-in-up">
            O ambiente seguro <br />
            para a{" "}
            <span className="text-brand-primary relative inline-block">
              expressão
              <span className="absolute left-0 right-0 -bottom-1 h-[2px] lg:h-[3px] bg-brand-accent/60 rounded-full" />
            </span>{" "}
            de marcas.
          </h1>
          <p className="font-body text-text-secondary text-base lg:text-lg leading-relaxed animate-fade-in-up [animation-delay:150ms] font-light">
            Acesso interno restrito à equipe Duas Mãos e clientes convidados.
          </p>
        </div>

        <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted/65 font-body">
          &copy; {new Date().getFullYear()} Agência Duas Mãos
        </div>
      </div>

      {/* Right Column: Login Card Container */}
      <div className="flex-1 md:col-span-6 flex flex-col justify-center items-center px-6 py-12 relative z-10">
        {/* Mobile Header (Shown only on small screens) */}
        <div className="md:hidden mb-8 self-center">
          <Link href="/">
            <img
              src="/brand/logos/logotipo-primary.png"
              alt="Duas Mãos Logo"
              className="h-8 w-auto dark:hidden select-none"
            />
            <img
              src="/brand/logos/logotipo-light.png"
              alt="Duas Mãos Logo"
              className="h-7 w-auto hidden dark:block select-none"
            />
          </Link>
        </div>

        {/* Login Glass Card */}
        <div className="w-full max-w-sm mx-auto glass p-8 sm:p-10 rounded-2xl border-border/40 shadow-glass space-y-8 animate-fade-in-up">
          <div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-2">Acesso</h2>
            <p className="text-text-muted text-sm font-body">Insira suas credenciais corporativas.</p>
          </div>

          <form action={login} method="POST" className="space-y-6">
            <div className="space-y-2 font-body">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">E-mail</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-3 py-2.5 bg-surface-muted/50 border border-border/60 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-background transition-all text-text-primary placeholder:text-text-muted/40 text-sm"
                placeholder="voce@duasmaos.com"
              />
            </div>

            <div className="space-y-2 font-body">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Senha</label>
                <span className="text-[10px] text-text-muted hover:text-brand-primary cursor-pointer transition-colors font-medium">
                  Esqueceu?
                </span>
              </div>
              <input
                name="password"
                type="password"
                required
                className="w-full px-3 py-2.5 bg-surface-muted/50 border border-border/60 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-background transition-all text-text-primary placeholder:text-text-muted/40 text-sm"
                placeholder="••••••••"
              />
            </div>

            {searchParams?.message && (
              <p className="text-danger text-sm font-medium p-3 bg-danger/5 border border-danger/20 rounded-lg">
                {searchParams.message}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full py-6 mt-2 bg-brand-primary hover:bg-brand-primary-hover shadow-brand text-white font-semibold rounded-lg tracking-wide hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              Entrar na plataforma
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold font-body">
              <span className="bg-transparent px-4 text-text-muted">Ou</span>
            </div>
          </div>

          <GoogleLoginButton />
        </div>

        {/* Mobile Copyright Footer */}
        <div className="md:hidden mt-8 text-[10px] uppercase tracking-widest font-bold text-text-muted/65 font-body">
          &copy; {new Date().getFullYear()} Agência Duas Mãos
        </div>
      </div>
    </div>
  )
}

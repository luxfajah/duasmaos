import { signup } from '@/app/login/actions'
import Link from 'next/link'

export default function SignupPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
      {/* Left side - Decorative/Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-zinc-900 text-zinc-50 p-12 relative overflow-hidden">
        {/* Subtle animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black opacity-80 z-0"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-zinc-700/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">
              <div className="w-4 h-4 bg-zinc-900 rounded-sm"></div>
            </div>
            <span className="text-xl font-bold tracking-tight">Duas Mãos</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h2 className="text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1]">
            Plataforma exclusiva da agência.
          </h2>
          <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
            Acesso restrito a colaboradores e clientes da agência Duas Mãos.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-zinc-500 font-medium">
          <span>&copy; {new Date().getFullYear()} Agência Duas Mãos. Todos os direitos reservados.</span>
          <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
          <span>Plataforma Interna de Aprovação</span>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 relative">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center">
             <div className="w-4 h-4 bg-zinc-50 dark:bg-zinc-900 rounded-sm"></div>
           </div>
           <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Duas Mãos</span>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Solicitar Conta
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Preencha seus dados para receber acesso à plataforma.
            </p>
          </div>

          <form action={signup} className="space-y-5">
            <div className="space-y-2 group">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors" htmlFor="fullName">
                Nome completo
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                placeholder="Seu nome"
                className="w-full h-11 px-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-sm"
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors" htmlFor="email">
                E-mail profissional
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="exemplo@agencia.com"
                className="w-full h-11 px-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full h-11 px-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-sm"
              />
            </div>

            {searchParams?.message && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {searchParams.message}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-sm text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-offset-zinc-950 active:scale-[0.98]"
            >
              Criar conta
            </button>
            <div className="text-center mt-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Já possui uma conta?{' '}
                <Link href="/login" className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline">
                  Faça login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

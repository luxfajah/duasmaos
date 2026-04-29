import { login } from './actions'
import { Button } from '@/components/ui/button'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className="flex min-h-screen bg-surface md:grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-surface-muted border-r border-border p-12">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 bg-brand-primary"></div>
           <span className="font-serif font-bold text-xl tracking-tight text-text-primary">Duas Mãos</span>
        </div>
        <div className="max-w-lg mb-24">
          <h1 className="font-serif text-5xl text-text-primary leading-[1.1] mb-6">
            O ambiente seguro para a expressão de marcas.
          </h1>
          <p className="text-text-secondary text-lg">
            Acesso interno restrito à equipe Duas Mãos e clientes convidados.
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
          &copy; {new Date().getFullYear()} Agência Duas Mãos
        </div>
      </div>

      <div className="flex flex-col justify-center px-8 lg:px-24">
        <div className="w-full max-w-sm mx-auto space-y-12">
          <div>
            <h2 className="text-3xl font-serif text-text-primary mb-2">Acesso</h2>
            <p className="text-text-muted text-sm">Insira suas credenciais corporativas.</p>
          </div>
          
          <form action={login} method="POST" className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">E-mail</label>
              <input name="email" type="email" required className="w-full px-0 py-2 bg-transparent border-b border-border focus:outline-none focus:border-brand-primary transition-colors text-text-primary placeholder:text-text-muted/50" placeholder="voce@duasmaos.com" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Senha</label>
                 <span className="text-[10px] text-text-muted hover:text-brand-primary cursor-pointer transition-colors">Esqueceu?</span>
              </div>
              <input name="password" type="password" required className="w-full px-0 py-2 bg-transparent border-b border-border focus:outline-none focus:border-brand-primary transition-colors text-text-primary placeholder:text-text-muted/50" placeholder="••••••••" />
            </div>

            {searchParams?.message && (
              <p className="text-danger text-sm font-medium p-3 bg-danger/5 border border-danger/20">{searchParams.message}</p>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full py-6 mt-4">
              Entrar na plataforma
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-surface px-4 text-text-muted">Ou</span>
            </div>
          </div>

          <GoogleLoginButton />
        </div>
      </div>
    </div>
  )
}

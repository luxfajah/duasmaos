import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { PopupHashDetector } from '@/components/auth/PopupHashDetector'

export default async function Page() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <PopupHashDetector />
      <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in duration-500">
        <h1 className="font-playfair text-4xl md:text-5xl font-semibold tracking-tight text-text-primary">
          Duas Mãos
        </h1>
        <p className="text-text-secondary text-lg">
          Plataforma de colaboração de conteúdo para social media.
        </p>
        
        <div className="pt-8">
          {user ? (
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-sm font-medium rounded-md text-surface-muted bg-brand-primary hover:bg-brand-secondary transition-colors duration-200"
            >
              Ir para o Dashboard
            </Link>
          ) : (
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
              <Link 
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-sm font-medium rounded-md text-surface-muted bg-brand-primary hover:bg-brand-secondary transition-colors duration-200"
              >
                Entrar
              </Link>
              <Link 
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-border text-sm font-medium rounded-md text-text-primary bg-transparent hover:bg-surface-muted/50 transition-colors duration-200"
              >
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

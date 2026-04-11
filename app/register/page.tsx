import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { RegistrationForm } from '@/components/auth/RegistrationForm'
import { ShieldAlert, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token

  if (!token) {
    return <InvalidInvite message="Token de convite não fornecido." />
  }

  const supabase = createClient()
  
  // Validate token
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*, clients(name)')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (error || !invitation) {
    return <InvalidInvite message="Este convite é inválido ou já foi utilizado." />
  }

  // Check expiration
  if (new Date(invitation.expires_at) < new Date()) {
    return <InvalidInvite message="Este convite expirou. Solicite um novo acesso ao administrador." />
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-zinc-900 text-zinc-50 p-12 relative overflow-hidden">
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
          <Badge text={invitation.role === 'client' ? 'Acesso do Cliente' : 'Acesso da Equipe'} />
          <h2 className="text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1]">
            Seja bem-vindo à nossa plataforma.
          </h2>
          <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
            {invitation.role === 'client' 
              ? `Você foi convidado para acessar o painel do cliente${invitation.clients ? ` para a empresa ${invitation.clients.name}` : ''}.`
              : `Você foi convidado para se juntar à equipe da Agência Duas Mãos como ${invitation.role}.`
            }
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-zinc-500 font-medium">
          <span>&copy; {new Date().getFullYear()} Agência Duas Mãos.</span>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 relative">
        <RegistrationForm invitation={invitation} />
      </div>
    </div>
  )
}

function InvalidInvite({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-md w-full glass p-10 rounded-2xl border border-border text-center space-y-6">
        <div className="size-16 bg-status-danger/10 text-status-danger rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-primary">Convite Inválido</h1>
          <p className="text-text-secondary">{message}</p>
        </div>
        <div className="pt-4">
          <Link href="/login">
            <button className="w-full h-11 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-all">
              Voltar ao Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-bold uppercase tracking-widest">
      {text}
    </span>
  )
}

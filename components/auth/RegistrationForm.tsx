'use client'

import React, { useState, useEffect } from 'react'
import { InputField } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Check, ShieldCheck, Mail, User, Key } from 'lucide-react'
import { acceptInvitation } from '@/app/register/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface RegistrationFormProps {
  invitation: {
    id: string
    token: string
    role: string
    email?: string
    client_id?: string
    clients?: { name: string }
  }
}

export function RegistrationForm({ invitation }: RegistrationFormProps) {
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState(invitation.email || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const isClient = invitation.role === 'client'

  // Dynamic email generation: firstname.lastname@duasmaos.com.br
  useEffect(() => {
    if (firstName && lastName) {
      const prefix = `${firstName.toLowerCase().trim().replace(/\s+/g, '')}.${lastName.toLowerCase().trim().replace(/\s+/g, '')}`
      setEmail(`${prefix}@duasmaos.com.br`)
    }
  }, [firstName, lastName])

  const validations = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  }

  const allValid = Object.values(validations).every(v => v)
  const passwordsMatch = password && password === confirmPassword
  const canSubmit = firstName && lastName && email && allValid && passwordsMatch

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    // Add the generated email for clients if needed, though it's in the input
    try {
      await acceptInvitation(formData, invitation.token)
      toast.success('Conta criada com sucesso! Redirecionando...')
      // Action handles redirect
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-10 animate-in fade-in-up duration-500">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Criar sua conta
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          {isClient 
            ? 'Complete seus dados para acessar o painel de cliente.' 
            : 'Preencha seus dados para começar a colaborar com a equipe.'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Primeiro Nome"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder="João"
          />
          <InputField
            label="Sobrenome"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            placeholder="Silva"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            E-mail de Acesso
          </label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-primary transition-colors" size={16} />
            <input
              name="email"
              type="email"
              readOnly
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="exemplo@email.com"
              className={cn(
                "w-full h-11 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none transition-all text-brand-primary dark:text-brand-primary font-medium cursor-not-allowed border-brand-primary/20 placeholder:text-zinc-400"
              )}
            />
          </div>
          <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider mt-1 px-1">
            E-mail gerado automaticamente pela agência
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <InputField
            label="Senha"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <InputField
            label="Confirmar Senha"
            name="confirm_password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="new-password"
            error={confirmPassword && !passwordsMatch ? "As senhas não coincidem" : undefined}
          />
        </div>

        <div className="p-4 bg-surface-muted/50 rounded-lg border border-border space-y-2">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <ValidationItem label="8+ caracteres" valid={validations.length} />
            <ValidationItem label="1 Maiúscula" valid={validations.upper} />
            <ValidationItem label="1 Minúscula" valid={validations.lower} />
            <ValidationItem label="1 Número" valid={validations.number} />
          </ul>
        </div>

        <Button 
          type="submit" 
          disabled={loading || !canSubmit} 
          className="w-full h-12 text-md shadow-brand"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" size={20} />}
          Concluir Cadastro
        </Button>
      </form>
    </div>
  )
}

function ValidationItem({ label, valid }: { label: string; valid: boolean }) {
  return (
    <li className="flex items-center gap-2 text-[11px] transition-all duration-300">
      <span className={cn(
        "flex-shrink-0 size-3.5 rounded-full flex items-center justify-center transition-colors border",
        valid ? "bg-status-success border-status-success text-white" : "bg-transparent border-border text-text-muted"
      )}>
        {valid ? <Check size={8} strokeWidth={4} /> : null}
      </span>
      <span className={cn(
        "transition-colors",
        valid ? "text-text-primary font-medium" : "text-text-muted"
      )}>
        {label}
      </span>
    </li>
  )
}

'use client'

import React, { useState } from 'react'
import { InputField } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Check, X, ShieldCheck, ShieldAlert } from 'lucide-react'
import { changePassword } from '../actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function SecuritySection() {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const validations = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  }

  const allValid = Object.values(validations).every(v => v)
  const passwordsMatch = password && password === confirmPassword

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!allValid || !passwordsMatch) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await changePassword(formData)
      toast.success('Senha alterada com sucesso!')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-up duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold font-heading text-text-primary">Segurança</h2>
        <p className="text-text-secondary">Atualize sua senha e configure proteções de segurança.</p>
      </div>

      <div className="p-6 glass rounded-xl space-y-6">
        <div className="flex items-center gap-3 p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-lg">
          <ShieldCheck className="text-brand-primary" size={20} />
          <p className="text-sm text-text-primary">
            Utilize uma senha forte para proteger sua conta. Não utilize datas de nascimento ou nomes comuns.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InputField
                label="Nova Senha"
                name="new_password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <InputField
                label="Confirmar Nova Senha"
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

            <div className="p-5 bg-surface-muted/50 rounded-lg border border-border h-fit space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Requisitos de Senha</h4>
              <ul className="space-y-2">
                <ValidationItem label="Mínimo 8 caracteres" valid={validations.length} />
                <ValidationItem label="Pelo menos 1 letra maiúscula" valid={validations.upper} />
                <ValidationItem label="Pelo menos 1 letra minúscula" valid={validations.lower} />
                <ValidationItem label="Pelo menos 1 número" valid={validations.number} />
              </ul>
              <p className="text-[10px] text-text-muted mt-4 italic font-medium">
                * Símbolos especiais não são obrigatórios, mas recomendados.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button 
              type="submit" 
              disabled={loading || !allValid || !passwordsMatch} 
              variant="default"
              className="w-full md:w-auto"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              {allValid && passwordsMatch ? (
                <>Atualizar Senha</>
              ) : (
                <>Senha Incompleta</>
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="p-6 depth-card rounded-xl space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-text-muted" />
          <h3 className="font-bold text-text-primary">Sessões Ativas</h3>
        </div>
        <p className="text-sm text-text-secondary">
          Atualmente, sessões ativas são gerenciadas automaticamente pelo sistema. Em breve, você poderá visualizar e encerrar sessões em outros dispositivos.
        </p>
      </div>
    </div>
  )
}

function ValidationItem({ label, valid }: { label: string; valid: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm transition-all duration-300">
      <span className={cn(
        "flex-shrink-0 size-4 rounded-full flex items-center justify-center transition-colors",
        valid ? "bg-status-success text-white" : "bg-surface-muted text-text-muted border border-border"
      )}>
        {valid ? <Check size={10} strokeWidth={4} /> : <div className="size-1 bg-current rounded-full" />}
      </span>
      <span className={cn(
        "transition-colors",
        valid ? "text-text-primary" : "text-text-muted"
      )}>
        {label}
      </span>
    </li>
  )
}

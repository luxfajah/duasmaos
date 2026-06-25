'use client'

import React, { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/input'
import { createNewUser } from '@/app/dashboard/settings/actions'
import { toast } from 'sonner'
import { Loader2, UserPlus, Shield, Briefcase, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AvatarPicker } from './AvatarPicker'
import { createClient } from '@/utils/supabase/client'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  clients: any[]
}

export function CreateUserModal({ isOpen, onClose, onSuccess, clients }: CreateUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [type, setType] = useState<'team' | 'client'>('team')
  const [avatarUrl, setAvatarUrl] = useState('/avatars/Clipped.svg')
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  async function handleAvatarUpload(file: File) {
    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Não autorizado')
      setUploading(false)
      return ''
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `temp/${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      toast.error('Erro ao fazer upload')
      setUploading(false)
      return ''
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    setUploading(false)
    return publicUrl
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const role = (type === 'client' ? 'client' : formData.get('role')) as any
    const clientId = type === 'client' ? (formData.get('client_id') as string) : undefined

    try {
      const result = await createNewUser({
        email,
        firstName,
        lastName,
        role,
        clientId,
        avatarUrl
      })

      if (result.success) {
        setTempPassword(result.tempPassword!)
        toast.success('Usuário criado com sucesso!')
        // We don't close yet if we want to show the password
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleDone = () => {
    setTempPassword(null)
    onSuccess()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={tempPassword ? undefined : onClose}>
      <DialogContent className="max-w-2xl glass border-border shadow-2xl overflow-hidden p-0">
        <div className="bg-brand-primary/5 p-6 border-b border-border/50">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="size-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <UserPlus size={20} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-heading">Criar Novo Usuário</DialogTitle>
                <DialogDescription className="text-text-muted">
                  Adicione um novo membro à equipe ou um acesso para cliente.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {!tempPassword ? (
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Type Selector */}
            <div className="flex bg-surface-muted p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setType('team')}
                className={cn(
                  "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                  type === 'team' ? "bg-white text-brand-primary shadow-sm ring-1 ring-border/20" : "text-text-muted hover:text-text-primary"
                )}
              >
                <Shield size={14} /> EQUIPE
              </button>
              <button
                type="button"
                onClick={() => setType('client')}
                className={cn(
                  "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                  type === 'client' ? "bg-white text-brand-primary shadow-sm ring-1 ring-border/20" : "text-text-muted hover:text-text-primary"
                )}
              >
                <Briefcase size={14} /> CLIENTE
              </button>
            </div>

            <div className="space-y-6">
              <AvatarPicker 
                currentUrl={avatarUrl} 
                onSelect={setAvatarUrl} 
                onUpload={handleAvatarUpload}
                uploading={uploading}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Nome"
                  name="first_name"
                  required
                  placeholder="Ex: Ana"
                />
                <InputField
                  label="Sobrenome"
                  name="last_name"
                  required
                  placeholder="Ex: Silva"
                />
                <div className="md:col-span-2">
                  <InputField
                    label="E-mail"
                    name="email"
                    type="email"
                    required
                    placeholder="exemplo@duasmaos.com.br"
                    leftIcon={<Mail size={16} />}
                  />
                </div>

                {type === 'team' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase">Função na Equipe</label>
                    <select 
                      name="role"
                      className="w-full h-11 px-4 glass-panel rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                      required
                    >
                      <option value="writer">Redator</option>
                      <option value="designer">Designer</option>
                      <option value="gestor">Gestor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase">Vincular a Cliente</label>
                    <select 
                      name="client_id"
                      className="w-full h-11 px-4 glass-panel rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                      required
                    >
                      <option value="">Selecione um cliente...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || uploading} className="shadow-lg shadow-brand-primary/20">
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <UserPlus size={16} className="mr-2" />}
                Criar Usuário
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="p-12 text-center space-y-6">
            <div className="size-16 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-text-primary">Usuário Criado com Sucesso!</h3>
              <p className="text-sm text-text-muted max-w-sm mx-auto">
                Uma senha temporária foi gerada. O usuário deverá alterá-la no primeiro acesso.
              </p>
            </div>
            
            <div className="bg-surface-muted p-4 rounded-xl border border-border flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Senha Temporária</span>
              <code className="text-2xl font-mono font-bold text-brand-primary tracking-wider">{tempPassword}</code>
            </div>

            <Button onClick={handleDone} className="w-full">
              Concluído
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

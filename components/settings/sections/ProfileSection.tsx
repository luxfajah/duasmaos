'use client'

import React, { useState, useRef } from 'react'
import { InputField } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, Loader2, Calendar } from 'lucide-react'
import { updateProfile } from '@/app/dashboard/settings/actions'
import { createClient } from '@/utils/supabase/client'
import { AvatarPicker } from '@/components/settings/AvatarPicker'
import { toast } from 'sonner'

interface ProfileSectionProps {
  profile: any
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Use a ref or state for avatar URL to allow immediate preview
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')

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
    const filePath = `${user.id}/${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      toast.error('Erro ao fazer upload da imagem')
      setUploading(false)
      return ''
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    setUploading(false)
    toast.success('Avatar carregado com sucesso!')
    return publicUrl
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.set('avatar_url', avatarUrl || '')
    
    try {
      await updateProfile(formData)
      toast.success('Perfil atualizado com sucesso!')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-up duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold font-heading text-text-primary">Perfil</h2>
        <p className="text-text-secondary">Gerencie suas informações pessoais e avatar.</p>
      </div>

      <div className="p-6 glass rounded-xl">
        <AvatarPicker 
          currentUrl={avatarUrl} 
          onSelect={setAvatarUrl} 
          onUpload={handleAvatarUpload}
          uploading={uploading}
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 glass rounded-xl">
        <InputField
          label="Nome"
          name="first_name"
          defaultValue={profile?.first_name || ''}
          required
          placeholder="Ex: João"
        />
        <InputField
          label="Sobrenome"
          name="last_name"
          defaultValue={profile?.last_name || ''}
          required
          placeholder="Ex: Silva"
        />
        <InputField
          label="Data de Nascimento"
          name="birth_date"
          type="date"
          defaultValue={profile?.birth_date || ''}
          max={new Date().toISOString().split('T')[0]} // No future dates
          placeholder="dd/mm/aaaa"
          leftIcon={<Calendar size={16} />}
          hint="Formato: dd/mm/aaaa"
        />
        
        <div className="md:col-span-2 flex justify-end pt-4">
          <Button type="submit" disabled={loading} variant="default" className="w-full md:w-auto">
            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { HardDrive, Loader2, CheckCircle2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { UserIdentity } from '@supabase/supabase-js'

export function GoogleDriveLink() {
  const [loading, setLoading] = useState(false)
  const [isLinked, setIsLinked] = useState(false)
  const [googleIdentity, setGoogleIdentity] = useState<UserIdentity | null>(null)
  const [fetchingStatus, setFetchingStatus] = useState(true)

  useEffect(() => {
    checkLinkedStatus()
  }, [])

  const checkLinkedStatus = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const googleId = user.identities?.find(id => id.provider === 'google')
      
      // Verifica se temos o token no banco para garantir que a integração está funcional
      const { data: integration } = await supabase
        .from('user_integrations')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (googleId && integration) {
        setIsLinked(true)
        setGoogleIdentity(googleId)
      } else {
        setIsLinked(false)
        setGoogleIdentity(googleId || null) // Mantém a identidade para o desvincular se necessário
      }
    }
    setFetchingStatus(false)
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data === 'auth-success') {
        checkLinkedStatus()
        setLoading(false)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleLinkGoogle = async () => {
    setLoading(true)
    const supabase = createClient()
    
    const redirectUrl = new URL('/auth/callback', window.location.origin)
    redirectUrl.searchParams.set('next', '/auth/close-popup')

    const { data, error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        redirectTo: redirectUrl.toString(),
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes: 'https://www.googleapis.com/auth/drive.readonly'
      }
    })

    if (error) {
      toast.error('Erro ao iniciar vinculação: ' + error.message)
      setLoading(false)
      return
    }

    if (data?.url) {
      const width = 600
      const height = 700
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      window.open(data.url, 'google-auth', `width=${width},height=${height},left=${left},top=${top}`)
    }
  }

  const handleUnlinkGoogle = async () => {
    if (!googleIdentity) return
    setLoading(true)
    const supabase = createClient()

    try {
      // Unlink identity in Supabase Auth
      const { error: unlinkError } = await supabase.auth.unlinkIdentity(googleIdentity)
      if (unlinkError) throw unlinkError

      // Remove refresh token from our database
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error: dbError } = await supabase
          .from('user_integrations')
          .delete()
          .eq('user_id', user.id)

        if (dbError) throw dbError
      }

      toast.success('Conta do Google desvinculada com sucesso!')
      await checkLinkedStatus()
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao desvincular conta: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 glass rounded-xl space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-bold flex items-center gap-2">
            <HardDrive size={18} className="text-brand-primary" />
            Integração Google Drive
          </h3>
          <p className="text-sm text-text-secondary">
            Vincule sua conta do Google para selecionar Logos e Wallpapers diretamente do seu Drive de forma permanente.
          </p>
        </div>
        
        {isLinked && (
          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20">
            <CheckCircle2 size={14} />
            Vinculado
          </div>
        )}
      </div>

      <div className="pt-2">
        {fetchingStatus ? (
          <Button variant="outline" disabled className="w-full sm:w-auto">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verificando status...
          </Button>
        ) : googleIdentity ? (
          <div className="space-y-3">
            {!isLinked && (
              <p className="text-xs text-amber-500 font-medium">
                ⚠️ A conta está vinculada mas o acesso ao Drive não foi autorizado corretamente. 
                Por favor, desvincule e vincule novamente.
              </p>
            )}
            <Button 
              variant="danger" 
              onClick={handleUnlinkGoogle} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Desvincular Conta
            </Button>
            
            {!isLinked && (
              <Button 
                variant="primary" 
                onClick={handleLinkGoogle} 
                disabled={loading}
                className="w-full sm:w-auto ml-0 sm:ml-2"
              >
                Tentar Vincular Novamente
              </Button>
            )}
          </div>
        ) : (
          <Button 
            variant="outline" 
            onClick={handleLinkGoogle} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Vincular Conta Google
          </Button>
        )}
      </div>
    </div>
  )
}

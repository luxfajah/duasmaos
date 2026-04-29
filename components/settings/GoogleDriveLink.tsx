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
    
    if (user && user.identities) {
      const googleId = user.identities.find(id => id.provider === 'google')
      if (googleId) {
        setIsLinked(true)
        setGoogleIdentity(googleId)
      } else {
        setIsLinked(false)
        setGoogleIdentity(null)
      }
    }
    setFetchingStatus(false)
  }

  const handleLinkGoogle = async () => {
    setLoading(true)
    const supabase = createClient()
    
    const redirectUrl = new URL('/auth/callback', window.location.origin)
    redirectUrl.searchParams.set('next', '/dashboard/settings?section=profile')

    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        redirectTo: redirectUrl.toString(),
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
      const { error: dbError } = await supabase
        .from('user_integrations')
        .delete()
        .eq('provider', 'google')

      if (dbError) throw dbError

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
        ) : isLinked ? (
          <Button 
            variant="danger" 
            onClick={handleUnlinkGoogle} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Desvincular Conta
          </Button>
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

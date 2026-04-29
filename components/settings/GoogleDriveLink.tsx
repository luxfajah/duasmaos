'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { HardDrive, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function GoogleDriveLink() {
  const [loading, setLoading] = useState(false)

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
      </div>

      <Button 
        variant="outline" 
        onClick={handleLinkGoogle} 
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Vincular Conta Google
      </Button>
    </div>
  )
}

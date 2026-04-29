'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { Loader2, HardDrive, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

declare global {
  interface Window {
    gapi: any
    google: any
  }
}

interface Props {
  onPick: (url: string) => void
  label?: string
}

export function GoogleDrivePicker({ onPick, label = 'Google Drive' }: Props) {
  const [gapiLoaded, setGapiLoaded] = useState(false)
  const [gisLoaded, setGisLoaded] = useState(false)
  const [tokenClient, setTokenClient] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isLinked, setIsLinked] = useState(false)
  const [checkingLink, setCheckingLink] = useState(true)

  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
  const APP_ID = process.env.NEXT_PUBLIC_GOOGLE_APP_ID

  const isConfigured = !!(CLIENT_ID && API_KEY && APP_ID && CLIENT_ID !== 'PREENCHER_AQUI')

  useEffect(() => {
    checkLinkedStatus()
  }, [])

  const checkLinkedStatus = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user && user.identities) {
      const googleId = user.identities.find(id => id.provider === 'google')
      setIsLinked(!!googleId)
    }
    setCheckingLink(false)
  }

  // Initialize gapi.client
  const gapiLoad = () => {
    if (window.gapi) {
      window.gapi.load('picker', { callback: () => setGapiLoaded(true) })
    }
  }

  // Initialize Google Identity Services
  const gisLoad = () => {
    if (!CLIENT_ID || CLIENT_ID === 'PREENCHER_AQUI') return
    if (window.google) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (tokenResponse: any) => {
          if (tokenResponse.error !== undefined) {
            toast.error('Erro na autenticação do Google.')
            setLoading(false)
            throw tokenResponse
          }
          createPicker(tokenResponse.access_token)
        },
      })
      setTokenClient(client)
      setGisLoaded(true)
    }
  }

  const handleLinkGoogle = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Redirect back to current page
    const redirectUrl = new URL('/auth/callback', window.location.origin)
    redirectUrl.searchParams.set('next', window.location.pathname + window.location.search)

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

  const handleAuthClick = async () => {
    if (!isConfigured) {
      toast.error('Faltam credenciais do Google Cloud (.env.local).')
      return
    }

    if (!isLinked) {
      return handleLinkGoogle()
    }

    if (!gapiLoaded) {
      toast.error('Scripts do Google ainda carregando...')
      return
    }
    setLoading(true)

    try {
      // 1. Tentar buscar o token silencioso via nossa API (Contas Vinculadas)
      const res = await fetch('/api/google/token')
      if (res.ok) {
        const data = await res.json()
        if (data.access_token) {
          createPicker(data.access_token)
          return
        }
      }

      // 2. Fallback: Se não tem conta vinculada no banco (mas está no auth), pede o login nativo do navegador
      if (!gisLoaded || !tokenClient) {
        toast.error('Módulo de login do Google não carregado.')
        setLoading(false)
        return
      }
      tokenClient.requestAccessToken({ prompt: '' })
    } catch (err) {
      console.error(err)
      toast.error('Erro ao inicializar o Google Drive')
      setLoading(false)
    }
  }

  const createPicker = (accessToken: string) => {
    if (!APP_ID || !API_KEY) return

    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
    view.setMimeTypes('image/png,image/jpeg,image/webp,image/gif')
    
    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .setAppId(APP_ID)
      .setOAuthToken(accessToken)
      .addView(view)
      .addView(new window.google.picker.DocsUploadView()) // Permite fazer upload direto do PC pro Drive na hora
      .setDeveloperKey(API_KEY)
      .setCallback(pickerCallback)
      .build()
      
    picker.setVisible(true)
  }

  const pickerCallback = (data: any) => {
    if (data.action === window.google.picker.Action.PICKED) {
      setLoading(false)
      const doc = data.docs[0]
      const fileId = doc.id
      // Convert to direct URL format supported by img tags and background-image
      const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`
      onPick(directUrl)
    } else if (data.action === window.google.picker.Action.CANCEL) {
      setLoading(false)
    }
  }

  return (
    <>
      <Script src="https://apis.google.com/js/api.js" onLoad={gapiLoad} />
      <Script src="https://accounts.google.com/gsi/client" onLoad={gisLoad} />

      <Button 
        type="button" 
        onClick={handleAuthClick} 
        disabled={loading || !isConfigured || checkingLink}
        variant={!isLinked ? "primary" : "outline"} 
        className={`w-full flex gap-2 items-center justify-center h-8 text-xs font-medium ${
          isLinked 
            ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
            : 'shadow-lg shadow-brand-primary/20'
        }`}
      >
        {loading || checkingLink ? (
          <Loader2 className="animate-spin" size={14} />
        ) : isLinked ? (
          <HardDrive size={14} className="text-[#4285F4]" />
        ) : (
          <LinkIcon size={14} />
        )}
        
        {!isConfigured 
          ? 'Google API não configurada' 
          : checkingLink 
            ? 'Verificando...' 
            : isLinked 
              ? label 
              : 'Vincular ao Google Drive'}
      </Button>
    </>
  )
}

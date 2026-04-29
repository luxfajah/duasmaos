'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { Loader2, HardDrive } from 'lucide-react'
import { toast } from 'sonner'

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

  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
  const APP_ID = process.env.NEXT_PUBLIC_GOOGLE_APP_ID

  const isConfigured = !!(CLIENT_ID && API_KEY && APP_ID && CLIENT_ID !== 'PREENCHER_AQUI')

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

  const handleAuthClick = () => {
    if (!isConfigured) {
      toast.error('Faltam credenciais do Google Cloud (.env.local).')
      return
    }
    if (!gapiLoaded || !gisLoaded || !tokenClient) {
      toast.error('Scripts do Google ainda carregando...')
      return
    }
    setLoading(true)
    // Request access token (prompts user if not already authorized)
    tokenClient.requestAccessToken({ prompt: '' })
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
        disabled={loading || !isConfigured}
        variant="outline" 
        className="w-full flex gap-2 items-center justify-center bg-white border-gray-300 text-gray-700 hover:bg-gray-50 h-8 text-xs font-medium"
      >
        {loading ? <Loader2 className="animate-spin" size={14} /> : <HardDrive size={14} className="text-[#4285F4]" />}
        {isConfigured ? label : 'Google API não configurada'}
      </Button>
    </>
  )
}

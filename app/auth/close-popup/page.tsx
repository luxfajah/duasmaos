'use client'

import { useEffect } from 'react'

export default function ClosePopupPage() {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage('auth-success', window.location.origin)
      setTimeout(() => {
        window.close()
      }, 500)
    } else {
      // Fallback se não for popup
      window.location.href = '/dashboard/settings?section=profile'
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-serif text-text-primary">Vinculação concluída</h1>
        <p className="text-text-secondary">Você pode fechar esta janela agora.</p>
      </div>
    </div>
  )
}

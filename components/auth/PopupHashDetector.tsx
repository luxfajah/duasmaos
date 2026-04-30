'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Detects if this page loaded inside a popup with an OAuth error hash
 * (e.g. /?#error=identity_already_exists) and redirects to the close-popup
 * handler so the popup can cleanly notify the parent window and close.
 */
export function PopupHashDetector() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    const hashParams = new URLSearchParams(hash.replace('#', ''))
    const error = hashParams.get('error') || hashParams.get('error_code')

    // If we're in a popup context and there's an error, redirect to our handler
    if (window.opener) {
      const params = new URLSearchParams()
      if (error) {
        params.set('error', error)
        const desc = hashParams.get('error_description')
        if (desc) params.set('description', desc)
      }
      router.replace(`/auth/close-popup?${params.toString()}`)
    }
  }, [])

  return null
}

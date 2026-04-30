'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * This page is the target for Google OAuth popup redirects.
 * It detects success or error from URL params/hash, sends a postMessage
 * to the opener window, then closes itself.
 *
 * Also handles the case where Supabase redirects to the root (/) with
 * error params in the hash — the root page re-routes to this page.
 */
export default function ClosePopupPage() {
  useEffect(() => {
    // Check both query params and URL hash (Supabase uses hash for some errors)
    const searchParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))

    const error = searchParams.get('error') || hashParams.get('error') || hashParams.get('error_code')
    const errorDescription = searchParams.get('description') || hashParams.get('error_description')

    const sendAndClose = () => {
      if (window.opener) {
        if (error) {
          window.opener.postMessage(
            { type: 'auth-error', error, description: errorDescription },
            window.location.origin
          )
        } else {
          window.opener.postMessage({ type: 'auth-success' }, window.location.origin)
        }

        setTimeout(() => {
          window.close()
        }, 300)
      } else {
        // Not a popup — redirect to settings
        window.location.href = '/dashboard/settings?section=profile'
      }
    }

    sendAndClose()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface gap-4">
      <Loader2 className="animate-spin text-brand-primary" size={32} />
      <p className="text-text-secondary text-sm">Finalizando vinculação...</p>
    </div>
  )
}

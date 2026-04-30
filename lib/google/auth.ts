/**
 * Google Service Account authentication helper.
 * Uses a Google Cloud Service Account to authenticate server-side calls to
 * the Google Drive and Calendar APIs without requiring individual user OAuth.
 */
import { google } from 'googleapis'

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/calendar',
]

/**
 * Returns an authenticated Google Auth client using Service Account credentials.
 * Environment variables required:
 *  - GOOGLE_SERVICE_ACCOUNT_EMAIL
 *  - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY  (with \\n replaced)
 */
export function getServiceAccountAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!email || !privateKey) {
    throw new Error(
      'Credenciais da Service Account não configuradas. Adicione GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY no .env.local'
    )
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: SCOPES,
  })

  return auth
}

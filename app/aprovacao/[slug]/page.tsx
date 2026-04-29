import { notFound } from 'next/navigation'
import { validatePortalSlug, getClientApprovalPosts } from './actions'
import { ClientPortalUI } from './ClientPortalUI'
import { PortalLoginForm } from './PortalLoginForm'
import '../portal.css'

interface Props {
  params: { slug: string }
}

export default async function ApprovalPortalPage({ params }: Props) {
  // Validate slug and get client info + settings
  const portalSession = await validatePortalSlug(params.slug)
  
  if (!portalSession) {
    notFound()
  }

  // Check if session is valid
  const { checkPortalSession } = await import('./actions')
  const isAuthorized = await checkPortalSession(params.slug)

  if (!isAuthorized) {
    return (
      <PortalLoginForm 
        slug={params.slug} 
        logoUrl={portalSession.settings.logo_url} 
        wallpaperUrl={portalSession.settings.wallpaper_url} 
      />
    )
  }

  // Fetch all posts for this client that need approval or are approved/rejected
  const posts = await getClientApprovalPosts(portalSession.clientId)

  return (
    <ClientPortalUI 
      clientName={portalSession.clientName}
      settings={portalSession.settings}
      posts={posts}
      slug={params.slug}
    />
  )
}

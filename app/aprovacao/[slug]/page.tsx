import { notFound } from 'next/navigation'
import { validatePortalSlug, getClientApprovalPosts } from './actions'
import { ClientPortalUI } from './ClientPortalUI'
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

  // Fetch all posts for this client that need approval or are approved/rejected
  // Note: getClientApprovalPosts fetches all `v2_social_posts` linked to projects of this client.
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

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

  // Verify final payment status for the client
  const { createAdminClient } = await import('@/utils/supabase/admin')
  const adminSupabase = createAdminClient()
  
  let finalPaymentConfirmed = true
  if (portalSession.clientId) {
    const { data: finalPaymentTasks } = await adminSupabase
      .from('v2_tasks')
      .select('status, project_id, v2_projects!inner(client_id)')
      .eq('v2_projects.client_id', portalSession.clientId)
      .ilike('title', '%pagamento final%')

    if (finalPaymentTasks && finalPaymentTasks.length > 0) {
      finalPaymentConfirmed = finalPaymentTasks.every(t => t.status === 'done' || t.status === 'approved')
    }
  }

  return (
    <ClientPortalUI 
      clientName={portalSession.clientName}
      settings={portalSession.settings}
      posts={posts}
      slug={params.slug}
      finalPaymentConfirmed={finalPaymentConfirmed}
    />
  )
}

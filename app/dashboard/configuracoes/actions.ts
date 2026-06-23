'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function savePortalSettings(settings: {
  client_id: string
  slug: string
  logo_url?: string | null
  wallpaper_url?: string | null
  theme_color_primary?: string
  theme_color_secondary?: string
  ig_username: string
  ig_name: string
  ig_bio?: string | null
  ig_avatar_url?: string | null
  ig_stats_posts?: number
  ig_stats_followers?: string
  ig_stats_following?: string
  ig_highlights?: any
  portal_user?: string | null
  portal_password?: string | null
  focus_of_month?: string | null
  planning_period?: string | null
  deadline_description?: string | null
  is_active?: boolean
}) {
  const supabase = createClient()

  const { error } = await supabase
    .from('client_portal_settings')
    .upsert({
      ...settings,
      updated_at: new Date().toISOString()
    })

  if (error) {
    throw new Error('Erro ao salvar configurações do portal: ' + error.message)
  }

  revalidatePath('/dashboard/configuracoes')
  revalidatePath(`/aprovacao/${settings.slug}`)
  return { success: true }
}

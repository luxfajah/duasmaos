'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function acceptInvitation(formData: FormData, token: string) {
  const supabase = createClient()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = `${firstName} ${lastName}`.trim()

  // 1. Verify token one last time
  const { data: invitation, error: tokenError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (tokenError || !invitation) {
    throw new Error('Convite inválido ou já utilizado.')
  }

  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Este convite expirou.')
  }

  // 2. Sign up the user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: invitation.role,
        client_id: invitation.client_id
      }
    }
  })

  if (signUpError) {
    throw new Error(`Erro ao criar conta: ${signUpError.message}`)
  }

  if (!signUpData.user) {
    throw new Error('Falha ao criar conta. Tente novamente.')
  }

  // 3. Update invitation status
  const { error: updateError } = await supabase
    .from('invitations')
    .update({ 
      status: 'accepted',
      email: email // Store the actual email used
    })
    .eq('id', invitation.id)

  if (updateError) {
    console.error('Error updating invitation:', updateError)
    // Non-fatal, but good to log
  }

  // 4. Force login (Supabase might require confirmation depending on settings, 
  // but usually for internal apps we auto-confirm or use the session from signUp)
  
  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

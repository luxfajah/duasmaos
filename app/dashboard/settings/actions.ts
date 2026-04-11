'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'

/**
 * 1. Update Profile
 */
export async function updateProfile(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const birthDate = formData.get('birth_date') as string
  const avatarUrl = formData.get('avatar_url') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate || null,
      avatar_url: avatarUrl,
      full_name: `${firstName} ${lastName}`.trim()
    })
    .eq('id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/settings')
  return { success: true }
}

/**
 * 2. Change Password
 */
const COMMON_PASSWORDS = ['123456', 'password', '12345678', 'qwerty']

export async function changePassword(formData: FormData) {
  const supabase = createClient()
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (newPassword !== confirmPassword) {
    throw new Error('As senhas não coincidem.')
  }

  // Real-time validation logic should also be in UI, but here is the final check
  const hasUpper = /[A-Z]/.test(newPassword)
  const hasLower = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const isLongEnough = newPassword.length >= 8

  if (!isLongEnough || !hasUpper || !hasLower || !hasNumber) {
    throw new Error('A senha não cumpre as regras de segurança.')
  }

  if (COMMON_PASSWORDS.includes(newPassword.toLowerCase())) {
    throw new Error('Esta senha é muito comum. Por favor, escolha outra.')
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error

  // Reset forced password change flag
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('profiles').update({ requires_password_change: false }).eq('id', user.id)
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

/**
 * 3. User Management (Admin Only)
 */
async function checkAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

export async function resetUserPassword(userId: string) {
  if (!await checkAdmin()) throw new Error('Unauthorized')
  
  const supabase = createClient()
  // Generate a temporary password
  const tempPassword = randomBytes(4).toString('hex') // e.g., "a1b2c3d4"

  // In a real app, you might use Supabase Admin API to reset password or send reset email
  // Here we can set the flag so the user is forced to change it on next login
  // Note: For resetting auth password directly, we need service_role or specific flow.
  // For MVP, we will assume we use the reset link or temporary password logic.
  
  await supabase.from('profiles')
    .update({ requires_password_change: true })
    .eq('id', userId)

  revalidatePath('/dashboard/settings')
  return { success: true, tempPassword }
}

export async function toggleUserStatus(userId: string, active: boolean) {
  if (!await checkAdmin()) throw new Error('Unauthorized')
  const supabase = createClient()
  
  // Logic would involve Supabase Auth Admin API to ban/unban user
  // For now, we update the profile status if we had one, or just revalidate
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function deleteUser(userId: string) {
  if (!await checkAdmin()) throw new Error('Unauthorized')
  const supabase = createClient()
  
  const { error } = await supabase.from('profiles').delete().eq('id', userId)
  if (error) throw error
  
  revalidatePath('/dashboard/settings')
  return { success: true }
}

/**
 * 4. Invitations
 */
export async function createInvitation(data: {
  email?: string,
  role: 'admin' | 'gestor' | 'designer' | 'writer' | 'client',
  client_id?: string,
  expiresInDays: number
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + data.expiresInDays)

  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      email: data.email,
      role: data.role,
      client_id: data.client_id,
      token,
      expires_at: expiresAt.toISOString(),
      created_by: user.id,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/settings')
  return { success: true, token }
}

export async function invalidateInvitation(invitationId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('invitations')
    .update({ status: 'invalidated' })
    .eq('id', invitationId)

  if (error) throw error

  revalidatePath('/dashboard/settings')
  return { success: true }
}

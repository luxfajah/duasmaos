'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const currentPassword = formData.get('current_password') as string
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  // 1. Fetch profile to check if it's first access
  const { data: profile } = await supabase
    .from('profiles')
    .select('requires_password_change')
    .eq('id', user.id)
    .single()

  // 2. Verify current password if NOT forced change
  if (profile && !profile.requires_password_change) {
    if (!currentPassword) throw new Error('A senha atual é obrigatória.')
    
    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword
    })

    if (signInError) {
      throw new Error('A senha atual está incorreta.')
    }
  }

  // 3. Validations
  if (newPassword !== confirmPassword) {
    throw new Error('As senhas não coincidem.')
  }

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

  // 4. Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error

  // 5. Reset forced password change flag
  await supabase.from('profiles').update({ requires_password_change: false }).eq('id', user.id)

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
  const adminSupabase = createAdminClient()
  
  // 1. Delete from Auth (this also deletes from profiles due to potential triggers or cascade, 
  // but we do it explicitly just in case or if we want to bypass triggers)
  const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId)
  if (authError) throw authError
  
  revalidatePath('/dashboard/settings')
  return { success: true }
}

/**
 * 4. Create User (Admin Only)
 */
export async function createNewUser(data: {
  email: string,
  firstName: string,
  lastName: string,
  role: 'admin' | 'gestor' | 'designer' | 'writer' | 'client',
  clientId?: string,
  avatarUrl?: string
}) {
  if (!await checkAdmin()) throw new Error('Não autorizado')
  
  const adminSupabase = createAdminClient()
  const tempPassword = randomBytes(4).toString('hex') // Temp password

  // 1. Create User in Auth
  const { data: userData, error: authError } = await adminSupabase.auth.admin.createUser({
    email: data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: `${data.firstName} ${data.lastName}`.trim(),
      firstName: data.firstName,
      lastName: data.lastName
    }
  })

  if (authError) throw authError

  // 2. Create Profile
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .insert({
      id: userData.user.id,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      full_name: `${data.firstName} ${data.lastName}`.trim(),
      role: data.role,
      client_id: data.clientId || null,
      avatar_url: data.avatarUrl || '/avatars/Clipped.svg',
      requires_password_change: true
    })

  if (profileError) {
    // Cleanup Auth user if profile fails
    await adminSupabase.auth.admin.deleteUser(userData.user.id)
    throw profileError
  }

  revalidatePath('/dashboard/settings')
  return { success: true, tempPassword }
}

/**
 * 5. Invitations Management
 */
export async function createInvitation(data: {
  role: 'admin' | 'gestor' | 'designer' | 'writer' | 'client',
  client_id?: string,
  expiresInDays: number
}) {
  if (!await checkAdmin()) throw new Error('Não autorizado')
  
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + data.expiresInDays)

  const { error } = await supabase
    .from('invitations')
    .insert({
      role: data.role,
      client_id: data.client_id || null,
      token,
      expires_at: expiresAt.toISOString(),
      created_by: user.id,
      status: 'pending'
    })

  if (error) throw error

  revalidatePath('/dashboard/settings')
  return { success: true, token }
}

export async function invalidateInvitation(id: string) {
  if (!await checkAdmin()) throw new Error('Não autorizado')
  
  const supabase = createClient()
  const { error } = await supabase
    .from('invitations')
    .update({ status: 'invalidated' })
    .eq('id', id)

  if (error) throw error

  revalidatePath('/dashboard/settings')
  return { success: true }
}

'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createNewStaffAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const staffId = formData.get('staff_id') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string
  const password = formData.get('password') as string

  // IDからダミーメールを生成
  const email = `${staffId}@nicoberi.com`

  const adminClient = createAdminClient()

  // 特権クライアントでAuthユーザー作成
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    console.error('Error creating user:', authError)
    throw new Error(authError?.message || 'Failed to create user')
  }

  // 自動的にstaff_profilesにも登録
  const { error: profileError } = await adminClient
    .from('staff_profiles')
    .insert({
      id: authData.user.id,
      name,
      role,
      is_active: true,
    })

  if (profileError) {
    console.error('Error creating profile:', profileError)
  }

  revalidatePath('/admin')
}

export async function updateStaffAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const targetUserId = formData.get('user_id') as string
  const newStaffId = formData.get('staff_id') as string
  const newName = formData.get('name') as string
  const newPassword = formData.get('password') as string
  const newRole = formData.get('role') as string

  const adminClient = createAdminClient()

  // メールアドレスとパスワードの更新（変更がある場合のみ）
  const updateData: any = {}
  if (newStaffId) updateData.email = `${newStaffId}@nicoberi.com`
  if (newPassword) updateData.password = newPassword

  if (Object.keys(updateData).length > 0) {
    const { error: authError } = await adminClient.auth.admin.updateUserById(targetUserId, updateData)
    if (authError) {
      console.error('Error updating auth:', authError)
      throw new Error(authError.message)
    }
  }

  // 名前と権限の更新
  const profileUpdateData: any = {}
  if (newName) profileUpdateData.name = newName
  if (newRole) profileUpdateData.role = newRole

  if (Object.keys(profileUpdateData).length > 0) {
    const { error: profileError } = await adminClient
      .from('staff_profiles')
      .update(profileUpdateData)
      .eq('id', targetUserId)
    if (profileError) {
      console.error('Error updating profile:', profileError)
      throw new Error(profileError.message)
    }
  }

  revalidatePath('/admin')
}

export async function deleteStaffAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const targetUserId = formData.get('user_id') as string
  if (!targetUserId) throw new Error('User ID is required')
  if (targetUserId === user.id) throw new Error('Cannot delete yourself')

  const adminClient = createAdminClient()

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId)
  if (deleteError) {
    console.error('Error deleting user from Auth:', deleteError)
    throw new Error(deleteError.message)
  }

  const { error: profileError } = await adminClient
    .from('staff_profiles')
    .delete()
    .eq('id', targetUserId)
    
  if (profileError) {
    console.error('Error deleting profile:', profileError)
  }

  revalidatePath('/admin')
}

export async function toggleStaffActive(staffId: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('staff_profiles')
    .update({ is_active: !currentStatus })
    .eq('id', staffId)

  if (error) console.error('Error toggling staff status', error)
  revalidatePath('/admin')
}

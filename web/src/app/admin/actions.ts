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

export async function resetStaffPassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const targetUserId = formData.get('user_id') as string
  const newPassword = formData.get('new_password') as string

  const adminClient = createAdminClient()

  // ユーザーのパスワードを強制リセット
  const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
    password: newPassword
  })

  if (error) {
    console.error('Error updating password:', error)
    throw new Error(error.message)
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

// 児童情報の追加・更新
export async function upsertChild(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const first_name = formData.get('first_name') as string
  const last_name = formData.get('last_name') as string
  const sei = formData.get('sei') as string
  const mei = formData.get('mei') as string
  const gender = formData.get('gender') as string
  const recipient_number = formData.get('recipient_number') as string
  const disability_level = parseInt(formData.get('disability_level') as string) || 3
  const medical_notes = formData.get('medical_notes') as string
  const notes = formData.get('notes') as string

  if (!first_name || !last_name) return

  const payload = {
    first_name,
    last_name,
    sei,
    mei,
    gender,
    recipient_number,
    disability_level,
    medical_notes,
    notes,
    active: true
  }

  if (id) {
    // 既存の更新
    await supabase.from('children').update(payload).eq('id', id)
  } else {
    // 新規作成
    await supabase.from('children').insert(payload)
  }
  
  revalidatePath('/admin')
}

// 児童の削除（論理削除ではなく物理削除）
export async function deleteChild(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const childId = formData.get('childId') as string
  if (!childId) return

  // 関連するスケジュールも削除
  await supabase.from('daily_schedules').delete().eq('child_id', childId)
  await supabase.from('children').delete().eq('id', childId)

  revalidatePath('/admin')
}

// 来所予定の追加
export async function addSchedule(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const childId = formData.get('childId') as string
  const date = formData.get('date') as string

  if (!childId || !date) return

  // 同じ日に同じ児童の予定が既にあれば追加しない
  const { data: existing } = await supabase
    .from('daily_schedules')
    .select('id')
    .eq('child_id', childId)
    .eq('date', date)
    .maybeSingle()

  if (existing) return // 重複防止

  await supabase.from('daily_schedules').insert({
    child_id: childId,
    date,
    status: 'scheduled',
  })

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

// 来所予定の削除
export async function removeSchedule(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const scheduleId = formData.get('scheduleId') as string
  if (!scheduleId) return

  await supabase.from('daily_schedules').delete().eq('id', scheduleId)

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

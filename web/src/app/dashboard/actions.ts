'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function markAsArrived(scheduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // 到着時間の打刻（日時更新）とステータスを'present'にする
  const { error } = await supabase
    .from('daily_schedules')
    .update({ 
      clock_in: new Date().toISOString(),
      status: 'present',
      updated_by: user.id
    })
    .eq('id', scheduleId)

  if (error) {
    console.error('Error clocking in:', error)
    return
  }

  revalidatePath('/dashboard')
}

export async function markAsDeparted(scheduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // 退出時間の打刻（日時更新）
  const { error } = await supabase
    .from('daily_schedules')
    .update({ 
      clock_out: new Date().toISOString(),
      updated_by: user.id
    })
    .eq('id', scheduleId)

  if (error) {
    console.error('Error clocking out:', error)
    return
  }

  revalidatePath('/dashboard')
}

// 送迎フラグのトグル
export async function toggleTransport(scheduleId: string, field: 'pickup' | 'dropoff', currentValue: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('daily_schedules')
    .update({ [field]: !currentValue })
    .eq('id', scheduleId)

  if (error) {
    console.error(`Error toggling ${field}:`, error)
    return
  }
  revalidatePath('/dashboard')
}

// 児童の備考欄の更新
export async function updateChildNotes(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const childId = formData.get('childId') as string
  const notes = formData.get('notes') as string

  if (!childId) return

  const { error } = await supabase
    .from('children')
    .update({ notes })
    .eq('id', childId)

  if (error) {
    console.error('Error updating notes:', error)
    return
  }
  revalidatePath('/dashboard')
}

// admin権限チェックのヘルパー
async function requireAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return profile?.role === 'admin'
}

// 管理者用: 打刻時刻の修正
export async function updateScheduleTime(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const isAdmin = await requireAdmin(supabase, user.id)
  if (!isAdmin) return

  const scheduleId = formData.get('scheduleId') as string
  const fieldName = formData.get('fieldName') as 'clock_in' | 'clock_out'
  const timeValue = formData.get('timeValue') as string

  if (!scheduleId || !fieldName) return

  const { data: schedule } = await supabase
    .from('daily_schedules')
    .select('date')
    .eq('id', scheduleId)
    .single()
  if (!schedule) return

  let isoDateTime = null
  if (timeValue) {
    const [hh, mm] = timeValue.split(':')
    const tDate = new Date(`${schedule.date}T00:00:00`)
    tDate.setHours(parseInt(hh, 10))
    tDate.setMinutes(parseInt(mm, 10))
    isoDateTime = tDate.toISOString()
  }

  await supabase
    .from('daily_schedules')
    .update({
      [fieldName]: isoDateTime,
      status: 'present'
    })
    .eq('id', scheduleId)

  revalidatePath('/dashboard')
}

// 管理者用: 送迎フラグのトグル
export async function updateScheduleTransport(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const isAdmin = await requireAdmin(supabase, user.id)
  if (!isAdmin) return

  const scheduleId = formData.get('scheduleId') as string
  const field = formData.get('field') as 'pickup' | 'dropoff'
  const currentValue = formData.get('currentValue') === 'true'

  if (!scheduleId || !field) return

  const { error } = await supabase
    .from('daily_schedules')
    .update({ [field]: !currentValue })
    .eq('id', scheduleId)

  if (error) {
    console.error(`Error toggling ${field}:`, error)
  }
  revalidatePath('/dashboard')
}

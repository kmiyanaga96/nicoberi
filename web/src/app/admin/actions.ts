'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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

export async function updateScheduleTime(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const scheduleId = formData.get('scheduleId') as string
  const fieldName = formData.get('fieldName') as string
  const timeString = formData.get('timeValue') as string

  // Parse time: "HH:mm" -> today's date + "T" + HH:mm:00.000Z
  let newValue: string | null = null
  if (timeString) {
    // 既存の日付を取得する必要があるためscheduleIdで引っ張るか、todayStrを使う
    const dateStr = new Date().toISOString().split('T')[0]
    // タイムゾーンがJSTであることを前提にするなら、Asia/Tokyoで解釈させるなどが望ましいが
    // 簡略化のため、指定日時のローカル時間として扱いISOに変換
    const localDate = new Date(`${dateStr}T${timeString}:00+09:00`)
    newValue = localDate.toISOString()
  }

  const updateData = {
    [fieldName]: newValue,
    updated_by: user.id
  }

  const { error } = await supabase
    .from('daily_schedules')
    .update(updateData)
    .eq('id', scheduleId)

  if (error) console.error('Error updating schedule time', error)
  revalidatePath('/admin')
}

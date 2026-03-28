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

  if (!user) return { error: 'Not authenticated' }

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
    return { error: '到着の打刻に失敗しました' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function markAsDeparted(scheduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

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
    return { error: '退出の打刻に失敗しました' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

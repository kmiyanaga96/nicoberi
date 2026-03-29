import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, CalendarClock, ArrowLeft, ShieldCheck, Power, AlertTriangle, Clock } from 'lucide-react'
import { toggleStaffActive, updateScheduleTime } from './actions'

function extractTime(isoString: string | null) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit' }).format(date)
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // セッション・権限確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || profile.is_active === false || profile.role !== 'admin') {
    redirect('/dashboard') // 管理者以外は追い出す
  }

  // スタッフ一覧を取得
  const { data: staffList } = await supabase
    .from('staff_profiles')
    .select('*')
    .order('created_at', { ascending: true })

  // 本日のスケジュール一覧
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: schedules } = await supabase
    .from('daily_schedules')
    .select(`
      id,
      status,
      clock_in,
      clock_out,
      children ( id, first_name, last_name )
    `)
    .eq('date', todayStr)
    .order('created_at', { ascending: true })

  const typedStaffList = (staffList as any[]) || []
  const typedSchedules = (schedules as any[]) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      {/* Decorative */}
      <div className="fixed top-20 right-1/4 w-[400px] h-[400px] bg-red-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-400">
                管理者パネル
              </h1>
            </div>
            <p className="text-slate-400 text-sm">ユーザーの権限管理と打刻データの修正を行います。</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            ダッシュボードに戻る
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 左カラム: スタッフ管理 */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-white/10 pb-3">
              <Users className="w-5 h-5 text-indigo-400" />
              スタッフアカウント管理
            </h2>
            <div className="space-y-3">
              {typedStaffList.map((staff) => (
                <div key={staff.id} className={`p-4 rounded-2xl border transition-all ${staff.is_active ? 'bg-white/5 border-white/10' : 'bg-red-950/30 border-red-500/30 opacity-70'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{staff.name || '名称未設定'}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${staff.role === 'admin' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700 text-slate-300'}`}>
                          {staff.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        {staff.is_active ? (
                          <span className="text-green-400">● アクティブ</span>
                        ) : (
                          <span className="text-red-400"><AlertTriangle className="w-3 h-3 inline mr-1"/>凍結済み</span>
                        )}
                      </p>
                    </div>
                    {/* 自分自身は凍結不可 */}
                    {staff.id !== user.id && staff.role !== 'admin' && (
                      <form action={toggleStaffActive.bind(null, staff.id, staff.is_active)}>
                        <button type="submit" className={`p-2 rounded-xl transition-all shadow-md ${staff.is_active ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'}`}>
                          <Power className="w-5 h-5" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右カラム: 打刻データ修正 */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-white/10 pb-3">
              <CalendarClock className="w-5 h-5 text-indigo-400" />
              本日の打刻データ修正
            </h2>
            <div className="space-y-4">
              {typedSchedules.length === 0 ? (
                <p className="text-slate-500 text-sm">本日のスケジュールはありません。</p>
              ) : (
                typedSchedules.map((schedule) => (
                  <div key={schedule.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                    <h3 className="font-bold text-lg mb-4">{schedule.children?.last_name} {schedule.children?.first_name}</h3>
                    
                    <div className="flex flex-col gap-4">
                      {/* 到着時刻の編集フォーム */}
                      <form action={updateScheduleTime} className="flex items-center justify-between gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                        <input type="hidden" name="scheduleId" value={schedule.id} />
                        <input type="hidden" name="fieldName" value="clock_in" />
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-400 uppercase w-10">到着</span>
                          <input 
                            type="time" 
                            name="timeValue" 
                            defaultValue={extractTime(schedule.clock_in)} 
                            className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          />
                        </div>
                        <button type="submit" className="text-xs font-medium bg-indigo-600 hover:bg-indigo-500 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1">
                          更新
                        </button>
                      </form>

                      {/* 退出時刻の編集フォーム */}
                      <form action={updateScheduleTime} className="flex items-center justify-between gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                        <input type="hidden" name="scheduleId" value={schedule.id} />
                        <input type="hidden" name="fieldName" value="clock_out" />
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-400 uppercase w-10">退出</span>
                          <input 
                            type="time" 
                            name="timeValue" 
                            defaultValue={extractTime(schedule.clock_out)} 
                            className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          />
                        </div>
                        <button type="submit" className="text-xs font-medium bg-indigo-600 hover:bg-indigo-500 transition-colors px-3 py-1.5 rounded-lg">
                          更新
                        </button>
                      </form>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

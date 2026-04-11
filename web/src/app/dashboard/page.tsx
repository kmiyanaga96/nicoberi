import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from './actions'
import { User, CalendarDays, Settings, History, Users, ChevronDown } from 'lucide-react'

import { ScheduleView } from './_components/ScheduleView'
import { HistoryView } from './_components/HistoryView'
import { RegisterView } from './_components/RegisterView'
import { ChildrenView } from './_components/ChildrenView'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<any>
}) {
  const resolvedParams = await searchParams
  const activeTab = resolvedParams?.tab || 'schedule'
  const subTab = resolvedParams?.sub || 'today'
  const supabase = await createClient()

  // セッションの確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // スタッフプロフィールの取得
  const { data: staffProfile } = await supabase
    .from('staff_profiles')
    .select('name, role, is_active')
    .eq('id', user.id)
    .single()

  if (staffProfile && staffProfile.is_active === false) redirect('/?error=inactive')
  const isAdmin = staffProfile?.role === 'admin'

  // 日付算出
  const today = new Date()
  const targetDate = new Date()
  if (activeTab === 'schedule' && subTab === 'tomorrow') targetDate.setDate(targetDate.getDate() + 1)
  const targetDateStr = targetDate.toISOString().split('T')[0]
  const displayDateStr = targetDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })

  // ====== データフェッチ（Promise.all による並列化） ======
  let typedSchedules: any[] = []
  let typedChildren: any[] = []
  let typedFacilities: any[] = []
  const dateSuggestions: { value: string; label: string }[] = []
  const schedulesByDate: Record<string, any[]> = {}
  let historyByDate: Record<string, any[]> = {}

  if (activeTab === 'schedule' && (subTab === 'today' || subTab === 'tomorrow')) {
    const { data: schedules } = await supabase
      .from('daily_schedules')
      .select(`
        id, status, clock_in, clock_out, pickup, dropoff,
        children (
          id, first_name, last_name, sei,
          medical_notes, notes, gender, recipient_number,
          disability_level, home_address,
          facilities ( name, address )
        )
      `)
      .eq('date', targetDateStr)
      .order('created_at', { ascending: true })

    typedSchedules = ((schedules as any[]) || []).sort((a, b) => {
      const seiA = a.children?.sei || a.children?.last_name || ''
      const seiB = b.children?.sei || b.children?.last_name || ''
      return seiA.localeCompare(seiB, 'ja')
    })

  } else if (activeTab === 'schedule' && subTab === 'register') {
    const todayDate = new Date()
    for (let i = 0; i <= 30; i++) {
      const d = new Date(todayDate); d.setDate(d.getDate() + i)
      const val = d.toISOString().split('T')[0]
      const dow = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
      dateSuggestions.push({ value: val, label: `${d.getMonth() + 1}/${d.getDate()} (${dow})` })
    }
    const rangeStart = todayDate.toISOString().split('T')[0]
    const endD = new Date(todayDate); endD.setDate(endD.getDate() + 30)

    const [facilitiesRes, childrenRes, schedulesRes] = await Promise.all([
      supabase.from('facilities').select('*').order('name', { ascending: true }),
      supabase.from('children').select('*, facilities(*)').order('sei', { ascending: true }),
      supabase.from('daily_schedules')
        .select('id, date, status, children ( id, first_name, last_name, sei )')
        .gte('date', rangeStart).lte('date', endD.toISOString().split('T')[0])
        .order('date', { ascending: true }),
    ])
    typedFacilities = (facilitiesRes.data as any[]) || []
    typedChildren = (childrenRes.data as any[]) || []
    for (const s of (schedulesRes.data as any[]) || []) {
      if (!schedulesByDate[s.date]) schedulesByDate[s.date] = []
      schedulesByDate[s.date].push(s)
    }

  } else if (activeTab === 'children') {
    const [facilitiesRes, childrenRes] = await Promise.all([
      supabase.from('facilities').select('*').order('name', { ascending: true }),
      supabase.from('children').select('*, facilities(*)').order('sei', { ascending: true }),
    ])
    typedFacilities = (facilitiesRes.data as any[]) || []
    typedChildren = (childrenRes.data as any[]) || []

  } else if (activeTab === 'history') {
    const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    if (yesterdayStr >= monthStart) {
      const { data: historyData } = await supabase
        .from('daily_schedules')
        .select('id, date, status, clock_in, clock_out, pickup, dropoff, children ( id, first_name, last_name, sei )')
        .gte('date', monthStart).lte('date', yesterdayStr)
        .order('date', { ascending: false })
      for (const s of (historyData as any[]) || []) {
        if (!historyByDate[s.date]) historyByDate[s.date] = []
        historyByDate[s.date].push(s)
      }
      for (const date of Object.keys(historyByDate)) {
        historyByDate[date].sort((a: any, b: any) => (a.children?.sei || '').localeCompare(b.children?.sei || '', 'ja'))
      }
    }
  }

  const monthLabel = `${today.getFullYear()}年${today.getMonth() + 1}月`

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background text-foreground p-4 md:p-8">
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10 animate-slide-up">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">ダッシュボード</h1>
            <p className="flex items-center text-muted-foreground text-sm font-medium">
              <CalendarDays className="w-4 h-4 mr-2" />
              {activeTab === 'history' ? `${monthLabel}の打刻履歴` : activeTab === 'children' ? '児童名簿・情報管理' : displayDateStr}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 bg-white/50 dark:bg-black/50 px-3 md:px-4 py-2 rounded-2xl border border-white/20 shadow-sm backdrop-blur-sm mt-2 md:mt-0 w-full md:w-auto overflow-x-auto no-scrollbar">
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-primary hover:text-primary/80 font-bold transition-colors whitespace-nowrap">
                <Settings className="w-3.5 h-3.5 md:w-4 md:h-4" /> 管理者パネル
              </Link>
            )}
            <button className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 py-1 px-2 rounded-lg transition-colors cursor-pointer group whitespace-nowrap" title="勤務予定・給与情報 (準備中)">
              <User className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:text-primary transition-colors" />
              <span className="truncate max-w-[100px] md:max-w-[120px] font-bold group-hover:text-foreground transition-colors">{staffProfile?.name}</span>
            </button>
            <form action={logout} className="ml-auto md:ml-0">
              <button type="submit" className="text-xs md:text-sm px-3 md:px-4 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors whitespace-nowrap">ログアウト</button>
            </form>
          </div>
        </header>

        {/* Tabs */}
        {activeTab === 'schedule' && (
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            <Link href="/dashboard?tab=schedule&sub=today" className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${subTab === 'today' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary text-foreground'}`}>今日</Link>
            <Link href="/dashboard?tab=schedule&sub=tomorrow" className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${subTab === 'tomorrow' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary text-foreground'}`}>明日</Link>
            <Link href="/dashboard?tab=schedule&sub=register" className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${subTab === 'register' ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary text-foreground'}`}>予定登録・キャンセル</Link>
          </div>
        )}

        <div className="flex overflow-x-auto no-scrollbar bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl w-full max-w-full md:w-fit mb-4 shadow-inner border border-black/5 dark:border-white/5">
          <Link href="/dashboard?tab=schedule&sub=today" className={`px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all duration-300 flex flex-shrink-0 items-center gap-1.5 ${activeTab === 'schedule' ? 'bg-primary text-primary-foreground shadow-sm scale-105' : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}>
            <CalendarDays className="w-3.5 h-3.5" /> 予定
          </Link>
          <Link href="/dashboard?tab=history" className={`px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all duration-300 flex flex-shrink-0 items-center gap-1.5 ${activeTab === 'history' ? 'bg-primary text-primary-foreground shadow-sm scale-105' : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}>
            <History className="w-3.5 h-3.5" /> 月次履歴
          </Link>
          <Link href="/dashboard?tab=children" className={`px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all duration-300 flex flex-shrink-0 items-center gap-1.5 ${activeTab === 'children' ? 'bg-primary text-primary-foreground shadow-sm scale-105' : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}>
            <Users className="w-3.5 h-3.5" /> 児童・住所
          </Link>
        </div>

        {/* Tab Content — 各ビューコンポーネントに委譲 */}
        {activeTab === 'schedule' && (subTab === 'today' || subTab === 'tomorrow') && (
          <ScheduleView schedules={typedSchedules} isAdmin={isAdmin} />
        )}
        {activeTab === 'history' && (
          <HistoryView historyByDate={historyByDate} isAdmin={isAdmin} />
        )}
        {activeTab === 'schedule' && subTab === 'register' && (
          <RegisterView typedChildren={typedChildren} dateSuggestions={dateSuggestions} schedulesByDate={schedulesByDate} />
        )}
        {activeTab === 'children' && (
          <ChildrenView typedChildren={typedChildren} typedFacilities={typedFacilities} />
        )}

      </div>
    </div>
  )
}

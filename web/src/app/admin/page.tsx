import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, ArrowLeft, ShieldCheck } from 'lucide-react'

import { StaffView } from './_components/StaffView'
import { AccountingView } from './_components/AccountingView'

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<any>
}) {
  const resolvedParams = await searchParams
  const activeTab = resolvedParams?.tab || 'staff'
  const targetMonthStr = new Date().toISOString().substring(0, 7)

  const supabase = await createClient()

  // セッション・権限確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || profile.is_active === false || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  // スタッフ一覧を取得
  const { data: staffList } = await supabase
    .from('staff_profiles')
    .select('*')
    .order('name', { ascending: true })

  const typedStaffList = (staffList as any[]) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="fixed top-20 right-1/4 w-[400px] h-[400px] bg-red-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-8 h-8 text-teal-400" />
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">管理者パネル</h1>
            </div>
            <p className="text-slate-400 text-sm">スタッフ管理と事務を行います。</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> ダッシュボードに戻る
          </Link>
        </header>

        {/* Tabs */}
        <div className="flex bg-black/20 p-1.5 rounded-2xl w-fit mb-8 shadow-inner border border-white/5">
          <Link href="/admin?tab=staff" className={`px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-1.5 ${activeTab === 'staff' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm scale-105 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Users className="w-4 h-4" /> スタッフ管理
          </Link>
          <Link href="/admin?tab=accounting" className={`px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-1.5 ${activeTab === 'accounting' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm scale-105 border border-cyan-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <span className="font-serif">¥</span> 財務
          </Link>
        </div>

        {/* Tab Content */}
        <div className="w-full space-y-12">
          {activeTab === 'staff' && (
            <StaffView staffList={typedStaffList} currentUserId={user.id} targetMonthStr={targetMonthStr} />
          )}
          {activeTab === 'accounting' && <AccountingView />}
        </div>
      </div>
    </div>
  )
}

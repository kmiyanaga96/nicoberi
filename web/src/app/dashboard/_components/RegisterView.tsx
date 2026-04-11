import { CalendarDays, Plus, X } from 'lucide-react'
import { addSchedule, removeSchedule } from '../actions'

export function RegisterView({ typedChildren, dateSuggestions, schedulesByDate }: {
  typedChildren: any[]; dateSuggestions: { value: string; label: string }[]; schedulesByDate: Record<string, any[]>
}) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl pb-12">
      {/* 予定追加フォーム */}
      <div className="glass border border-white/20 dark:border-white/10 rounded-3xl p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-primary" /> 新規来所予定の追加
        </h2>
        <form action={addSchedule} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-muted-foreground mb-1.5 font-bold uppercase">児童</label>
            <select name="childId" required className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow">
              <option value="">選択</option>
              {typedChildren.map((c: any) => <option key={c.id} value={c.id}>{c.last_name} {c.first_name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-muted-foreground mb-1.5 font-bold uppercase">日付</label>
            <select name="date" required className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow">
              {dateSuggestions.map(ds => <option key={ds.value} value={ds.value}>{ds.label}</option>)}
            </select>
          </div>
          <button type="submit" className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm h-[42px] px-6 rounded-xl transition-all shadow-md active:scale-95">
            <Plus className="w-4 h-4" /> 予定を追加
          </button>
        </form>
      </div>

      {/* 予定一覧アコーディオン */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-2 ml-2">
          <CalendarDays className="w-5 h-5 text-muted-foreground" />
          確定済みの予定一覧 <span className="text-[11px] font-normal text-muted-foreground ml-2">(今後30日間)</span>
        </h2>
        {dateSuggestions.map(ds => {
          const dayRecords = schedulesByDate[ds.value] || []
          if (dayRecords.length === 0) return null
          const d = new Date(ds.value + 'T00:00:00')
          const isSun = d.getDay() === 0
          const isSat = d.getDay() === 6
          return (
            <details key={ds.value} className="group glass rounded-2xl border border-white/10 dark:border-white/5 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className={`flex items-center justify-between cursor-pointer px-5 py-3.5 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isSun ? 'text-red-500' : isSat ? 'text-blue-500' : 'text-foreground'}`}>
                <span>{ds.label}</span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">{dayRecords.length}名</span>
              </summary>
              <div className="border-t border-border/20 divide-y divide-border/20">
                {dayRecords.sort((a: any, b: any) => {
                  const sA = a.children?.sei || a.children?.last_name || ''
                  const sB = b.children?.sei || b.children?.last_name || ''
                  return sA.localeCompare(sB, 'ja')
                }).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3 bg-black/5 dark:bg-black/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {s.children?.last_name?.[0]}{s.children?.first_name?.[0]}
                      </div>
                      <span className="text-sm font-bold">{s.children?.last_name} {s.children?.first_name}</span>
                    </div>
                    <form action={removeSchedule}>
                      <input type="hidden" name="scheduleId" value={s.id} />
                      <button type="submit" className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors" title="予定を削除">
                        <X className="w-3.5 h-3.5" /> キャンセル
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}

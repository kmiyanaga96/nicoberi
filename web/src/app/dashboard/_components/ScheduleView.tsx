import { CalendarDays, AlarmClock, Clock, CheckCircle2, CarTaxiFront, Save, AlertCircle, Trash2 } from 'lucide-react'
import { markAsArrived, markAsDeparted, toggleTransport, updateChildNotes, updateScheduleTime, removeSchedule } from '../actions'
import { AutoCloseDetails } from '@/app/components/AutoCloseDetails'
import { OptimisticClockPanel } from '@/app/components/OptimisticClockPanel'
import { formatTime } from '@/utils/format'

export function ScheduleView({ schedules, isAdmin }: { schedules: any[]; isAdmin: boolean }) {
  return (
    <div className="space-y-4 pb-12">
      {schedules.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center flex flex-col items-center justify-center text-muted-foreground border-dashed border-2 border-border/50">
          <CalendarDays className="w-12 h-12 mb-4 opacity-50" />
          <p>来所予定は登録されていません。</p>
        </div>
      ) : (
        schedules.map((schedule) => {
          const child = schedule.children;
          const isCancelled = schedule.status === 'cancelled';
          const isArrived = !!schedule.clock_in;
          const isDeparted = !!schedule.clock_out;

          return (
            <div key={schedule.id} className={`glass p-5 md:p-6 rounded-3xl border border-white/20 shadow-lg transition-all duration-300 hover:shadow-xl ${isDeparted || isCancelled ? 'opacity-70 bg-secondary/10' : ''}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
                {/* Child Info */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner flex-shrink-0 ${isDeparted || isCancelled ? 'bg-secondary text-secondary-foreground' : isArrived ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                    {child.last_name[0]}{child.first_name[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      {child.last_name} {child.first_name}
                      {isCancelled && (
                        <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium border border-red-200 dark:border-red-800">
                          キャンセル
                        </span>
                      )}
                    </h2>
                    {child.notes && (
                      <div className="mt-2 w-full max-w-md">
                        <AutoCloseDetails
                          className="group [&_summary::-webkit-details-marker]:hidden"
                          summaryClassName="flex items-center gap-1.5 cursor-pointer text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-100/50 dark:bg-orange-950/30 px-3 py-1.5 rounded-lg border border-orange-200/50 dark:border-orange-900/50 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                          summaryContent={<>
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="leading-snug truncate max-w-[200px]">{child.notes}</span>
                            <span className="text-[10px] ml-auto uppercase tracking-wider opacity-60">Edit</span>
                          </>}
                        >
                          <div className="mt-2 p-3 bg-white/50 dark:bg-black/20 border border-orange-200 dark:border-orange-900/30 rounded-xl shadow-sm animate-in slide-in-from-top-1">
                            <form action={updateChildNotes} className="flex flex-col gap-2">
                              <input type="hidden" name="childId" value={child.id} />
                              <textarea name="notes" defaultValue={child.notes || ''} placeholder="スタッフ共有事項" className="w-full text-sm p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-orange-500 min-h-[60px]" />
                              <button type="submit" className="self-end flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-colors">
                                <Save className="w-3.5 h-3.5" /> 保存
                              </button>
                            </form>
                          </div>
                        </AutoCloseDetails>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Controls */}
                {!isCancelled && (
                  <div className="flex flex-col md:flex-row items-end md:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <div className="flex gap-2">
                      <form action={toggleTransport.bind(null, schedule.id, 'pickup', schedule.pickup)}>
                        <button type="submit" className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${schedule.pickup ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10'}`}>
                          <CarTaxiFront className={`w-4 h-4 ${schedule.pickup ? 'text-cyan-500' : 'opacity-50'}`} /> 迎え
                        </button>
                      </form>
                      <form action={toggleTransport.bind(null, schedule.id, 'dropoff', schedule.dropoff)}>
                        <button type="submit" className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${schedule.dropoff ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10'}`}>
                          <CarTaxiFront className={`w-4 h-4 ${schedule.dropoff ? 'text-indigo-500' : 'opacity-50'}`} /> 送り
                        </button>
                      </form>
                    </div>
                    <OptimisticClockPanel
                      scheduleId={schedule.id}
                      initialClockIn={schedule.clock_in}
                      initialClockOut={schedule.clock_out}
                      markAsArrivedAction={markAsArrived}
                      markAsDepartedAction={markAsDeparted}
                    />
                  </div>
                )}
              </div>

              {/* 手動打刻修正 */}
              <div className="mt-4 pt-4 border-t border-border/20 sm:col-span-2">
                <details className="group [&_summary::-webkit-details-marker]:hidden relative">
                  <summary className="cursor-pointer text-[11px] font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-3 py-1.5 rounded-xl text-muted-foreground transition-colors flex items-center justify-center gap-1.5 w-fit ml-auto">
                    <AlarmClock className="w-4 h-4" /> 手動で修正・入力
                  </summary>
                  <div className="mt-3 p-4 bg-background border border-border/50 shadow-sm rounded-2xl flex flex-col gap-3">
                    <form action={updateScheduleTime} className="flex items-center gap-3">
                      <input type="hidden" name="scheduleId" value={schedule.id} />
                      <input type="hidden" name="fieldName" value="clock_in" />
                      <span className="text-xs font-semibold uppercase w-8">到着</span>
                      <input type="time" name="timeValue" defaultValue={formatTime(schedule.clock_in, '')} className="bg-black/5 dark:bg-white/5 border border-border/50 text-foreground rounded flex-1 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary outline-none" />
                      <button type="submit" className="text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors">変更を保存</button>
                    </form>
                    <form action={updateScheduleTime} className="flex items-center gap-3">
                      <input type="hidden" name="scheduleId" value={schedule.id} />
                      <input type="hidden" name="fieldName" value="clock_out" />
                      <span className="text-xs font-semibold uppercase w-8">退出</span>
                      <input type="time" name="timeValue" defaultValue={formatTime(schedule.clock_out, '')} className="bg-black/5 dark:bg-white/5 border border-border/50 text-foreground rounded flex-1 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary outline-none" />
                      <button type="submit" className="text-xs font-bold bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg transition-colors">変更を保存</button>
                    </form>
                    {isAdmin && (
                      <div className="pt-3 mt-1 border-t border-border/20 flex justify-end">
                        <form action={removeSchedule}>
                          <input type="hidden" name="scheduleId" value={schedule.id} />
                          <button type="submit" className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-bold px-2 py-1">
                            <Trash2 className="w-4 h-4" /> この予定を削除
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </div>
          );
        })
      )}
    </div>
  )
}

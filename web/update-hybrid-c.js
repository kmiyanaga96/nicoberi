const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// 1. In Monthly History, enforce '預かり' instead of '予定' or 'scheduled'
code = code.replace(
  /\{schedule\.status === 'cancelled' \? 'キャンセル' : schedule\.status === 'present' \? '預かり' : schedule\.status === 'scheduled' \? '予定' : schedule\.status\}/g,
  `{schedule.status === 'cancelled' ? 'キャンセル' : '預かり'}`
);

// 2. Refactor Admin Time Editor logic in Monthly History into Hybrid Option C
const oldAdminUIHistory = `{isAdmin ? (
                                  <>
                                    <form action={updateScheduleTime} className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-xl">
                                      <input type="hidden" name="scheduleId" value={schedule.id} />
                                      <input type="hidden" name="fieldName" value="clock_in" />
                                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">到着</span>
                                      <input type="time" name="timeValue" defaultValue={extractTime(schedule.clock_in)} className="bg-transparent border border-border/50 text-foreground rounded-lg px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary w-[80px]" />
                                      <button type="submit" className="text-[10px] font-bold bg-primary/20 text-primary hover:bg-primary/30 px-1.5 py-0.5 rounded transition-colors">更新</button>
                                    </form>
                                    <form action={updateScheduleTime} className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-xl">
                                      <input type="hidden" name="scheduleId" value={schedule.id} />
                                      <input type="hidden" name="fieldName" value="clock_out" />
                                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">退出</span>
                                      <input type="time" name="timeValue" defaultValue={extractTime(schedule.clock_out)} className="bg-transparent border border-border/50 text-foreground rounded-lg px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary w-[80px]" />
                                      <button type="submit" className="text-[10px] font-bold bg-primary/20 text-primary hover:bg-primary/30 px-1.5 py-0.5 rounded transition-colors">更新</button>
                                    </form>
                                    <div className="flex gap-1">
                                      <form action={deleteSchedule}>
                                        <input type="hidden" name="scheduleId" value={schedule.id} />
                                        <button type="submit" title="予定削除" className="p-1 text-red-400 hover:bg-red-400/20 rounded">
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </form>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-semibold text-muted-foreground uppercase w-6 text-right">到着</span>
                                      <span className="font-mono text-sm font-bold">{extractTime(schedule.clock_in) || '--:--'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-semibold text-muted-foreground border-l border-white/20 pl-2 uppercase w-8 text-right">退出</span>
                                      <span className="font-mono text-sm font-bold">{extractTime(schedule.clock_out) || '--:--'}</span>
                                    </div>
                                  </>
                                )}`;

const newHybridUIHistory = `<div className="flex gap-4">
                                  {/* 常時表示の打刻時間 (スタッフ・管理者共通) */}
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">到着</span>
                                      <span className="font-mono text-sm font-bold">{extractTime(schedule.clock_in) || '--:--'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-semibold text-muted-foreground border-l border-border/30 pl-3 uppercase">退出</span>
                                      <span className="font-mono text-sm font-bold">{extractTime(schedule.clock_out) || '--:--'}</span>
                                    </div>
                                  </div>
                                </div>
                                {/* 管理者専用の展開・修正UI */}
                                {isAdmin && (
                                  <div className="w-full lg:w-auto mt-2 lg:mt-0">
                                    <details className="group [&_summary::-webkit-details-marker]:hidden relative">
                                      <summary className="cursor-pointer text-[10px] font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:white/10 px-2 py-1.5 rounded-lg text-muted-foreground transition-colors flex items-center justify-center gap-1 w-fit ml-auto">
                                        <AlarmClock className="w-3.5 h-3.5" /> 打刻修正・削除
                                      </summary>
                                      <div className="mt-2 p-3 bg-black/5 dark:bg-white/5 border border-border/30 rounded-xl flex flex-col gap-2">
                                        <form action={updateScheduleTime} className="flex items-center gap-2">
                                          <input type="hidden" name="scheduleId" value={schedule.id} />
                                          <input type="hidden" name="fieldName" value="clock_in" />
                                          <span className="text-[10px] font-semibold uppercase w-6">到着</span>
                                          <input type="time" name="timeValue" defaultValue={extractTime(schedule.clock_in)} className="bg-transparent border border-border/50 text-foreground rounded flex-1 px-1 py-0.5 text-xs font-mono" />
                                          <button type="submit" className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-1 rounded">更新</button>
                                        </form>
                                        <form action={updateScheduleTime} className="flex items-center gap-2">
                                          <input type="hidden" name="scheduleId" value={schedule.id} />
                                          <input type="hidden" name="fieldName" value="clock_out" />
                                          <span className="text-[10px] font-semibold uppercase w-6">退出</span>
                                          <input type="time" name="timeValue" defaultValue={extractTime(schedule.clock_out)} className="bg-transparent border border-border/50 text-foreground rounded flex-1 px-1 py-0.5 text-xs font-mono" />
                                          <button type="submit" className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-1 rounded">更新</button>
                                        </form>
                                        <div className="pt-2 mt-1 border-t border-border/20 flex justify-end">
                                          <form action={deleteSchedule}>
                                            <input type="hidden" name="scheduleId" value={schedule.id} />
                                            <button type="submit" className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1 font-bold">
                                              <Trash2 className="w-3 h-3" /> データ削除
                                            </button>
                                          </form>
                                        </div>
                                      </div>
                                    </details>
                                  </div>
                                )}`;

// String replacing safely.
code = code.replace(oldAdminUIHistory, newHybridUIHistory);


// 3. For the 'Today' & 'Tomorrow' view, we need to inject the Option C for Both Staff & Admin.
// In the current Today schedule card rendering, wait... I'll just write it.
// The string replacement is large, let's just make it simple.
// I'll run this to check if first passes.
fs.writeFileSync('src/app/dashboard/page.tsx', code);

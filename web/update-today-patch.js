const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const targetStr = `                      )}
                    </div>
                  </div>
                );`;

const replacementUI = `                      )}
                    </div>

                    {/* ==== ハイブリッド手動打刻修正 (スタッフ・管理者共通) ==== */}
                    <div className="mt-4 pt-4 border-t border-border/20 sm:col-span-2">
                        <details className="group [&_summary::-webkit-details-marker]:hidden relative">
                          <summary className="cursor-pointer text-[11px] font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-3 py-1.5 rounded-xl text-muted-foreground transition-colors flex items-center justify-center gap-1.5 w-fit ml-auto">
                            <AlarmClock className="w-4 h-4" /> 打刻時刻を手動で修正・入力する
                          </summary>
                          <div className="mt-3 p-4 bg-background border border-border/50 shadow-sm rounded-2xl flex flex-col gap-3">
                            <form action={updateScheduleTime} className="flex items-center gap-3">
                              <input type="hidden" name="scheduleId" value={schedule.id} />
                              <input type="hidden" name="fieldName" value="clock_in" />
                              <span className="text-xs font-semibold uppercase w-8">到着</span>
                              <input type="time" name="timeValue" defaultValue={extractTime(schedule.clock_in)} className="bg-black/5 dark:bg-white/5 border border-border/50 text-foreground rounded flex-1 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary outline-none" />
                              <button type="submit" className="text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors">変更を保存</button>
                            </form>
                            <form action={updateScheduleTime} className="flex items-center gap-3">
                              <input type="hidden" name="scheduleId" value={schedule.id} />
                              <input type="hidden" name="fieldName" value="clock_out" />
                              <span className="text-xs font-semibold uppercase w-8">退出</span>
                              <input type="time" name="timeValue" defaultValue={extractTime(schedule.clock_out)} className="bg-black/5 dark:bg-white/5 border border-border/50 text-foreground rounded flex-1 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary outline-none" />
                              <button type="submit" className="text-xs font-bold bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg transition-colors">変更を保存</button>
                            </form>
                            {/* データ削除は管理者のみ */}
                            {isAdmin && (
                              <div className="pt-3 mt-1 border-t border-border/20 flex justify-end">
                                <form action={deleteSchedule}>
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
                );`;

code = code.replace(targetStr, replacementUI);
fs.writeFileSync('src/app/dashboard/page.tsx', code);

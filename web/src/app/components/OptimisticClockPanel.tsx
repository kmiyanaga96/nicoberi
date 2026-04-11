'use client'

import { useOptimistic, useTransition } from 'react'
import { Clock, CheckCircle2 } from 'lucide-react'

type ClockState = {
  clockIn: string | null
  clockOut: string | null
}

function formatTimeJST(isoString: string | null) {
  if (!isoString) return '--:--'
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }).format(date)
}

export function OptimisticClockPanel({
  scheduleId,
  initialClockIn,
  initialClockOut,
  markAsArrivedAction,
  markAsDepartedAction,
}: {
  scheduleId: string
  initialClockIn: string | null
  initialClockOut: string | null
  markAsArrivedAction: (scheduleId: string) => Promise<void>
  markAsDepartedAction: (scheduleId: string) => Promise<void>
}) {
  const [isPending, startTransition] = useTransition()
  const [optimisticClock, setOptimisticClock] = useOptimistic<ClockState>(
    { clockIn: initialClockIn, clockOut: initialClockOut }
  )

  const isArrived = !!optimisticClock.clockIn
  const isDeparted = !!optimisticClock.clockOut

  function handleArrival() {
    const now = new Date().toISOString()
    startTransition(async () => {
      setOptimisticClock({ ...optimisticClock, clockIn: now })
      await markAsArrivedAction(scheduleId)
    })
  }

  function handleDeparture() {
    const now = new Date().toISOString()
    startTransition(async () => {
      setOptimisticClock({ ...optimisticClock, clockOut: now })
      await markAsDepartedAction(scheduleId)
    })
  }

  return (
    <div className={`flex flex-row items-center bg-black/5 dark:bg-white/5 p-2 rounded-2xl w-full md:w-auto ${isPending ? 'opacity-70' : ''} transition-opacity`}>
      {/* 到着 */}
      <div className="flex-1 md:flex-initial flex items-center justify-between md:justify-start gap-4 px-3 py-1 border-r border-border/50">
        <div className="flex flex-col">
          <span className="text-[11px] text-muted-foreground font-semibold mb-0.5 tracking-wider uppercase">到着</span>
          <span className="font-mono text-xl md:text-2xl font-bold tracking-tight">{formatTimeJST(optimisticClock.clockIn)}</span>
        </div>
        {!isArrived && (
          <button
            type="button"
            onClick={handleArrival}
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Clock className="w-5 h-5" />
          </button>
        )}
        {isArrived && <CheckCircle2 className="w-7 h-7 text-green-500 filter drop-shadow-sm" />}
      </div>

      {/* 退出 */}
      <div className="flex-1 md:flex-initial flex items-center justify-between md:justify-start gap-4 px-3 py-1">
        <div className="flex flex-col">
          <span className="text-[11px] text-muted-foreground font-semibold mb-0.5 tracking-wider uppercase">退出</span>
          <span className="font-mono text-xl md:text-2xl font-bold tracking-tight">{formatTimeJST(optimisticClock.clockOut)}</span>
        </div>
        {isArrived && !isDeparted && (
          <button
            type="button"
            onClick={handleDeparture}
            disabled={isPending}
            className="bg-accent hover:bg-accent/90 text-accent-foreground p-3 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Clock className="w-5 h-5" />
          </button>
        )}
        {!isArrived && !isDeparted && (
          <div className="w-[44px] h-[44px]"></div>
        )}
        {isDeparted && <CheckCircle2 className="w-7 h-7 text-green-500 filter drop-shadow-sm" />}
      </div>
    </div>
  )
}

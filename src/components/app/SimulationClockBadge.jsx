import { useEffect, useState } from 'react'
import { Clock, Pause, Play } from 'lucide-react'
import { getSimNow, useSimulationClockStore } from '../../stores/simulationClockStore'

export default function SimulationClockBadge() {
  const enabled = useSimulationClockStore((s) => s.enabled)
  const paused = useSimulationClockStore((s) => s.paused)
  const speed = useSimulationClockStore((s) => s.speed)
  const lastIso = useSimulationClockStore((s) => s.lastIso)
  const [displayTime, setDisplayTime] = useState(() => getSimNow())

  useEffect(() => {
    if (!enabled) return
    setDisplayTime(getSimNow())
    const timer = setInterval(() => {
      setDisplayTime(getSimNow())
    }, 1000)
    return () => clearInterval(timer)
  }, [enabled, paused, speed, lastIso])

  if (!enabled) return null

  const formatted = displayTime.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <div
      data-testid="simulation-clock-banner"
      className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 shadow-xs dark:border-amber-700/70 dark:bg-amber-950/50 dark:text-amber-200"
    >
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-amber-600 dark:text-amber-400" />
        <span className="uppercase tracking-wider text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
          SIMULATION CLOCK
        </span>
        <span className="tabular-nums font-black">{formatted} WIB</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 text-[11px] font-extrabold text-amber-900 border border-amber-200 dark:bg-slate-900/80 dark:text-amber-200 dark:border-amber-800">
          {paused ? <Pause className="size-3" /> : <Play className="size-3" />}
          {paused ? 'PAUSED' : `${speed}x`}
        </span>
      </div>
    </div>
  )
}


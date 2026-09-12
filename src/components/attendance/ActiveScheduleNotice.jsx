import { useEffect, useState } from 'react'
import { AlarmClock, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { lmsPresensiService } from '../../services/lmsPresensiService'
import { useAuthStore } from '../../stores/authStore'

export default function ActiveScheduleNotice() {
  const navigate = useNavigate()
  const roles = useAuthStore((state) => state.user?.roles || [])
  const [data, setData] = useState(null)
  const eligible = roles.includes('Guru') || roles.includes('Wali Kelas')

  useEffect(() => {
    if (!eligible) return undefined
    let alive = true
    const load = () => lmsPresensiService.getActiveSchedules()
      .then((response) => alive && setData(response?.data || null))
      .catch(() => alive && setData(null))
    load()
    const timer = window.setInterval(load, 60_000)
    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [eligible])

  if (!eligible || !data?.schedules?.length) return null

  return (
    <section className="mb-3.5 space-y-2" aria-label="Jadwal pelajaran aktif">
      {data.schedules.map((schedule) => {
        const done = ['final', 'locked'].includes(schedule.attendance_status)
        const className = schedule.kelas?.nama_kelas || schedule.school_class?.name || 'Kelas'
        return (
          <article
            key={schedule.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 rounded-xl border border-emerald-500/25 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-emerald-50/80 px-3.5 py-2.5 shadow-xs transition hover:border-emerald-500/40 dark:border-emerald-800/40 dark:bg-emerald-950/30"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`grid h-8.5 w-8.5 shrink-0 place-items-center rounded-lg text-white shadow-xs ${
                done ? 'bg-slate-600 dark:bg-slate-700' : 'bg-gradient-to-br from-emerald-600 to-teal-700'
              }`}>
                {done ? <CheckCircle2 size={16} /> : <AlarmClock size={16} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    {!done && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                    {done ? 'Presensi Selesai' : 'Jam Pelajaran Aktif'}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-900/80 dark:text-emerald-200/90 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">
                    {String(schedule.time_start).slice(0, 5)}–{String(schedule.time_end).slice(0, 5)} WIB
                  </span>
                </div>
                <div className="flex items-center gap-1.5 truncate mt-0.5">
                  <h4 className="truncate text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {schedule.subject?.name || 'Mata Pelajaran'} · {className}
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                    ({schedule.requires_substitute_reason ? 'Wali kelas/pengganti' : 'Jadwal Anda'})
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={done}
              onClick={() => navigate(`/absensi/presensi?schedule_id=${schedule.id}&date=${data.date}`)}
              className={`inline-flex shrink-0 h-8 items-center justify-center rounded-lg px-3.5 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 ${
                done
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/20'
              }`}
            >
              {done ? 'Sudah Final' : schedule.attendance_status === 'draft' ? 'Lanjutkan Absen' : 'Ambil Presensi'}
            </button>
          </article>
        )
      })}
    </section>
  )
}

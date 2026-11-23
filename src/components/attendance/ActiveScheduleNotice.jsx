import { useEffect, useMemo, useState } from 'react'
import { AlarmClock, CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { lmsPresensiService } from '../../services/lmsPresensiService'
import { useAuthStore } from '../../stores/authStore'
import { getUserRoleLevel, ROLE_LEVELS } from '../../auth/portalResolver'

export default function ActiveScheduleNotice() {
 const navigate = useNavigate()
 const user = useAuthStore((state) => state.user)
 const [data, setData] = useState(null)
 const [isExpanded, setIsExpanded] = useState(false)
 const eligible = getUserRoleLevel(user) === ROLE_LEVELS.GURU // Level 6 (Tenaga Pendidik)

 useEffect(() => {
 if (!eligible) return undefined
 let alive = true
 const load = () =>
 lmsPresensiService
 .getActiveSchedules()
 .then((response) => alive && setData(response?.data || null))
 .catch(() => alive && setData(null))
 load()
 const timer = window.setInterval(load, 60_000)
 return () => {
 alive = false
 window.clearInterval(timer)
 }
 }, [eligible])

 // Helper untuk konversi waktu HH:MM ke menit total dalam hari
 const toMinutes = (timeStr) => {
 if (!timeStr) return 0
 const parts = String(timeStr).split(':')
 return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10)
 }

 // Hitung waktu sekarang berdasarkan server_time backend atau waktu lokal
 const currentMinutes = (() => {
 if (data?.server_time) {
 const sDate = new Date(data.server_time)
 if (!isNaN(sDate.getTime())) {
 return sDate.getHours() * 60 + sDate.getMinutes()
 }
 }
 const lDate = new Date()
 return lDate.getHours() * 60 + lDate.getMinutes()
 })()

 // Deduplikasi jadwal berdasarkan subjek, kelas, dan rentang waktu (mencegah duplikasi data ganda semester/seeder)
 const uniqueSchedules = useMemo(() => {
 if (!data?.schedules?.length) return []
 const seen = new Set()
 return data.schedules.filter((s) => {
 const key = `${s.subject?.name || s.subject_id}-${s.kelas?.nama_kelas || s.school_class?.name || s.kelas_id}-${s.time_start}-${s.time_end}`
 if (seen.has(key)) return false
 seen.add(key)
 return true
 })
 }, [data?.schedules])

 if (!eligible || !uniqueSchedules.length) return null

 // Cek apakah ada jadwal yang sedang benar-benar berjalan di jam ini
 const hasCurrentOngoing = uniqueSchedules.some((s) => {
 const sMin = toMinutes(s.time_start)
 const eMin = toMinutes(s.time_end)
 return currentMinutes >= sMin && currentMinutes <= eMin
 })

 const totalSchedules = uniqueSchedules.length
 const displayedSchedules = isExpanded ? uniqueSchedules : uniqueSchedules.slice(0, 2)

 return (
 <section className="mb-3.5 space-y-2.5" aria-label="Jadwal pelajaran aktif">
 {displayedSchedules.map((schedule, idx) => {
 const done = ['final', 'locked'].includes(schedule.attendance_status)
 const className = schedule.kelas?.nama_kelas || schedule.school_class?.name || 'Kelas'
 const sMin = toMinutes(schedule.time_start)
 const eMin = toMinutes(schedule.time_end)

 // Penentuan status: Pelajaran Sekarang vs Pelajaran Berikutnya (Ketat hanya aktif pada jam KBM)
 const isCurrent = currentMinutes >= sMin && currentMinutes <= eMin
 const isUpcoming = currentMinutes < sMin
 const isPast = currentMinutes > eMin

 return (
 <article
 key={schedule.id}
 className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 rounded-xl border px-4 py-3 shadow-xs transition ${
 done
 ? 'border-emerald-200/80 bg-slate-50/90 dark:border-emerald-800/60 dark:bg-slate-900/40'
 : isCurrent
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/30'
 : isUpcoming
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-800/60 dark:bg-amber-950/25'
 : 'border-emerald-200/80 bg-slate-50/70 dark:border-emerald-800/60 dark:bg-slate-900/40'
 }`}
 >
 <div className="flex items-center gap-3 min-w-0">
 <div
 className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white shadow-xs ${
 done
 ? 'bg-slate-600 dark:bg-slate-700'
 : isCurrent
 ? 'bg-white dark:bg-[#1B2433] shadow-sm'
 : isUpcoming
 ? 'bg-white dark:bg-[#1B2433] shadow-sm'
 : 'bg-slate-500 dark:bg-slate-700'
 }`}
 >
 {done ? (
 <CheckCircle2 size={18} />
 ) : isCurrent ? (
 <AlarmClock size={18} />
 ) : (
 <Clock size={18} />
 )}
 </div>

 <div className="min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span
 className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${
 done
 ? 'text-slate-600 dark:text-slate-400'
 : isCurrent
 ? 'text-emerald-800 dark:text-emerald-300'
 : isUpcoming
 ? 'text-amber-900 dark:text-amber-300'
 : 'text-slate-500 dark:text-slate-400'
 }`}
 >
 {!done && isCurrent && (
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
 </span>
 )}
 {!done && isUpcoming && (
 <span className="relative flex h-2 w-2">
 <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
 </span>
 )}
 {done
 ? 'Presensi Selesai'
 : isCurrent
 ? 'Jam Pelajaran Sekarang (KBM Aktif)'
 : isUpcoming
 ? 'Pelajaran Berikutnya'
 : 'Jam Pelajaran Berakhir'}
 </span>

 <span
 className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
 done
 ? 'bg-slate-200/80 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300'
 : isCurrent
 ? 'bg-emerald-100/90 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200'
 : isUpcoming
 ? 'bg-amber-100/90 text-amber-950 dark:bg-amber-900/60 dark:text-amber-200'
 : 'bg-slate-200/60 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300'
 }`}
 >
 {String(schedule.time_start).slice(0, 5)}–{String(schedule.time_end).slice(0, 5)} WIB
 </span>
 </div>

 <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
 <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
 {schedule.subject?.name || 'Mata Pelajaran'} · {className}
 </h4>
 <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
 ({schedule.requires_substitute_reason ? 'Wali kelas/pengganti' : 'Jadwal Anda'})
 </span>
 </div>
 </div>
 </div>

 {/* BUTTON / STATUS AREA: Tombol presensi HANYA AKTIF saat jam KBM berlangsung */}
 {isCurrent ? (
 <button
 type="button"
 disabled={done}
 onClick={() => {
 const classId = schedule.kelas_id || schedule.class_id || schedule.kelas?.id || schedule.class?.id || ''
 navigate(`/portal-guru/workspace?tab=presensi&schedule_id=${schedule.id}&class_id=${classId}&date=${data.date || ''}`)
 }}
 className={`inline-flex shrink-0 h-8 items-center justify-center rounded-xl px-4 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 ${
 done
 ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-sky-950/60 dark:text-sky-300'
 : 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white hover:from-emerald-700 hover:to-teal-700 shadow-sm'
 }`}
 >
 {done
 ? 'Sudah Final'
 : schedule.attendance_status === 'draft'
 ? 'Lanjutkan Absen'
 : 'Ambil Presensi'}
 </button>
 ) : isUpcoming ? (
 <div className="flex items-center gap-1.5 shrink-0">
 <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1.5 text-xs font-extrabold shadow-2xs">
 <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
 <span>Belum Mulai (Presensi Nonaktif)</span>
 </span>
 </div>
 ) : (
 <div className="flex items-center gap-1.5 shrink-0">
 <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 px-3 py-1.5 text-xs font-bold shadow-2xs">
 <Clock className="size-3.5 text-slate-400" />
 <span>Di Luar Jam KBM</span>
 </span>
 </div>
 )}
 </article>
 )
 })}
 {totalSchedules > 2 && (
 <div className="flex justify-center pt-0.5">
 <button
 type="button"
 onClick={() => setIsExpanded(!isExpanded)}
 className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/90 px-3.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/70 dark:text-emerald-300 transition shadow-2xs cursor-pointer active:scale-95"
 >
 {isExpanded ? (
 <>
 <ChevronUp className="size-3.5" />
 <span>Ciutkan Jadwal ({totalSchedules} Total)</span>
 </>
 ) : (
 <>
 <ChevronDown className="size-3.5" />
 <span>Tampilkan {totalSchedules - 2} Jadwal Lainnya</span>
 </>
 )}
 </button>
 </div>
 )}
 </section>
 )
}
